import asyncio
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from core.model_client import ModelClient
from core.prompt_engine import PromptEngine
from evaluation.base import CapabilityEvaluator
from scoring.deterministic import calculate_domain_scores
from regression.detector import compute_regression_status, calculate_overall_metrics
from regression.weights import SENTIMENT_DOMAIN_WEIGHTS, get_weighted_score
from schemas.models import AuditRun, DomainResult, EvaluationCase, Diagnostic, ModelResult, ModelConfig
from diagnostics.explainer import DiagnosticExplainer

class AuditOrchestrator:
    def __init__(self, hf_token: str, groq_api_key: Optional[str] = None):
        self.model_client = ModelClient(hf_token)
        self.prompt_engine = PromptEngine()
        self.evaluator = CapabilityEvaluator(groq_api_key)
        self.explainer = DiagnosticExplainer(groq_api_key) if groq_api_key else None
        self.audit_registry: Dict[str, AuditRun] = {}

    async def run_audit(
        self, 
        models: List[ModelConfig], 
        dataset_description: str,
        domains: Optional[List[str]] = None
    ) -> AuditRun:
        """
        Executes the multi-model audit pipeline.
        """
        audit_id = str(uuid.uuid4())
        
        # Identify baseline
        baseline_config = next((m for m in models if m.is_baseline), models[0])
        baseline_id = baseline_config.model_id

        # Initialize AuditRun
        report = AuditRun(
            id=audit_id,
            models=models,
            dataset_description=dataset_description,
            status="running",
            progress=0.0,
            overall_scores={},
            overall_delta=0.0,
            domain_results=[],
            health_status="Pending",
            summary="Multi-model audit initialized."
        )
        self.audit_registry[audit_id] = report

        try:
            # 1. Load & Filter Prompts
            all_prompts = self.prompt_engine.load_prompts()
            prompts = [p for p in all_prompts if p.get("domain") in domains] if domains else all_prompts

            if not prompts:
                report.status = "failed"
                report.summary = "No prompts found."
                return report

            report.progress = 0.05
            report.summary = f"Loaded {len(prompts)} prompts. Starting inference for {len(models)} models."

            # 2. Multi-Model Inference (Parallel)
            inference_tasks = {
                model_cfg.model_id: self.model_client.batch_query(model_cfg, prompts)
                for model_cfg in models
            }
            inference_results = await asyncio.gather(*inference_tasks.values())
            model_responses_by_id = dict(zip(inference_tasks.keys(), inference_results))
            
            report.progress = 0.5
            report.summary = "Inference complete for all models. Starting forensic evaluation."
            
            # 3. Evaluation Layer (Parallel across models and prompts)
            case_results_by_prompt: Dict[str, Dict[str, ModelResult]] = {p["id"]: {} for p in prompts}
            
            eval_tasks = []
            eval_metadata = [] # (model_id, prompt_id)
            
            for model_cfg in models:
                m_id = model_cfg.model_id
                responses = model_responses_by_id[m_id]
                for p in prompts:
                    eval_tasks.append(self.evaluator.evaluate(p, responses[p["id"]], responses[p["id"]]))
                    eval_metadata.append((m_id, p["id"]))
            
            eval_results = await asyncio.gather(*eval_tasks)
            
            for (m_id, p_id), res in zip(eval_metadata, eval_results):
                case_results_by_prompt[p_id][m_id] = ModelResult(
                    model_id=m_id,
                    response=model_responses_by_id[m_id][p_id],
                    score=res["ft_score"],
                    correct=res.get("ft_correct")
                )
            
            report.progress = 0.8
            report.summary = "Evaluation complete. Aggregating results."

            # 4. Aggregation
            domain_map: Dict[str, List[EvaluationCase]] = {}
            for p in prompts:
                domain = p["domain"]
                if domain not in domain_map:
                    domain_map[domain] = []
                
                case = EvaluationCase(
                    prompt_id=p["id"],
                    prompt_text=p["prompt_text"],
                    domain=domain,
                    model_responses=case_results_by_prompt[p["id"]],
                    evaluation_method="llm_judge" # Defaulting for now
                )
                domain_map[domain].append(case)

            # 5. Regression Detection (Multi-model relative to Baseline)
            domain_results: List[DomainResult] = []
            diagnostics: List[Diagnostic] = []
            
            for domain, cases in domain_map.items():
                m_scores = {m.model_id: 0.0 for m in models}
                for case in cases:
                    for m_id, res in case.model_responses.items():
                        m_scores[m_id] += res.score
                
                # Mean scores
                for m_id in m_scores:
                    m_scores[m_id] = round((m_scores[m_id] / len(cases)) * 10, 2) # normalize to 100 if scores were 0-10
                
                # Calculate status based on baseline
                b_score = m_scores[baseline_id]
                # Status is determined by the "worst" regression among non-baseline models? 
                # Or we just track it. Let's use the first non-baseline for status for now.
                other_models = [m.model_id for m in models if m.model_id != baseline_id]
                target_id = other_models[0] if other_models else baseline_id
                t_score = m_scores[target_id]
                
                status = compute_regression_status(b_score, t_score)
                
                domain_results.append(DomainResult(
                    domain=domain,
                    model_scores=m_scores,
                    status=status,
                    cases=cases
                ))

                if status == "REGRESSED" and self.explainer:
                    examples = [] # Extract examples where regression occurred
                    diagnostic = await self.explainer.explain_regression(
                        domain, b_score, t_score, examples, dataset_description
                    )
                    diagnostics.append(diagnostic)

            # 6. Overall Metrics
            final_scores = {m.model_id: 0.0 for m in models}
            for dr in domain_results:
                for m_id, score in dr.model_scores.items():
                    final_scores[m_id] += score
            
            for m_id in final_scores:
                final_scores[m_id] = round(final_scores[m_id] / len(domain_results), 2)

            report.overall_scores = final_scores
            report.overall_delta = round(final_scores.get(target_id, 0) - final_scores[baseline_id], 2)
            report.domain_results = domain_results
            report.diagnostics = diagnostics
            report.health_status = self._derive_health(final_scores[baseline_id])
            report.status = "completed"
            report.progress = 1.0
            report.summary = f"Audit completed for {len(models)} models. Baseline: {baseline_id}."

            return report

        except Exception as e:
            report.status = "failed"
            report.summary = f"Error: {str(e)}"
            import traceback
            print(traceback.format_exc())
            return report

        except Exception as e:
            report.status = "failed"
            report.summary = f"Error: {str(e)}"
            return report

    def _derive_health(self, score: float) -> str:
        # Assuming score is now 0-100 percentage
        if score > 85: return "Excellent"
        if score > 70: return "Good"
        if score > 50: return "Fair"
        return "Poor"

    def _derive_health(self, score: float) -> str:
        if score > 85: return "Excellent"
        if score > 70: return "Good"
        if score > 50: return "Fair"
        return "Poor"

    def get_audit(self, audit_id: str) -> Optional[AuditRun]:
        return self.audit_registry.get(audit_id)
