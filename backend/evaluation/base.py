from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import asyncio
from scoring.deterministic import score_keyword_match
from scoring.ensemble import MultiJudgeEnsemble
from scoring.rubrics import get_rubric_for_domain

class BaseEvaluator(ABC):
    def __init__(self, groq_api_key: Optional[str] = None):
        self.groq_api_key = groq_api_key
        # Initialize the ensemble for advanced Prometheus judging
        if groq_api_key:
            self.ensemble = MultiJudgeEnsemble(groq_api_key)
        else:
            self.ensemble = None

    @abstractmethod
    async def evaluate(self, prompt_entry: Dict[str, Any], base_resp: str, ft_resp: str) -> Dict[str, Any]:
        """
        Executes evaluation for a single prompt across both models.
        """
        pass

class CapabilityEvaluator(BaseEvaluator):
    """
    Standard Prometheus-style evaluator that uses multi-judge ensemble 
    and dynamic rubric injection.
    """
    async def evaluate(self, prompt_entry: Dict[str, Any], base_resp: str, ft_resp: str) -> Dict[str, Any]:
        scoring_method = prompt_entry.get("scoring_method", "llm_judge")
        domain = prompt_entry.get("domain", "reasoning")
        
        # Determine the rubric to use (dynamic engine)
        rubric = get_rubric_for_domain(domain)
        
        base_result = {}
        ft_result = {}
        evaluation_method = scoring_method
        
        if scoring_method == "keyword_match":
            keywords = prompt_entry.get("keywords", [])
            base_score = float(score_keyword_match(base_resp, keywords))
            ft_score = float(score_keyword_match(ft_resp, keywords))
            base_result = {"score": base_score, "confidence": 1.0, "reasoning": "Keyword match"}
            ft_result = {"score": ft_score, "confidence": 1.0, "reasoning": "Keyword match"}
        
        elif scoring_method == "llm_judge" and self.ensemble:
            # RUN MULTI-JUDGE ENSEMBLE
            # We run baseline and fine-tuned evaluations in parallel
            tasks = [
                self.ensemble.get_consensus_score(
                    prompt_entry["prompt_text"], base_resp, rubric, rounds=1, use_ensemble=True
                ),
                self.ensemble.get_consensus_score(
                    prompt_entry["prompt_text"], ft_resp, rubric, rounds=1, use_ensemble=True
                )
            ]
            
            base_result, ft_result = await asyncio.gather(*tasks)
        else:
            # Fallback for missing API keys
            base_result = {"score": 0, "confidence": 0, "reasoning": "Judge unavailable"}
            ft_result = {"score": 0, "confidence": 0, "reasoning": "Judge unavailable"}

        # Normalize metrics for project consistency
        return {
            "prompt_id": prompt_entry["id"],
            "prompt_text": prompt_entry["prompt_text"],
            "domain": domain,
            "base_response": base_resp,
            "ft_response": ft_resp,
            
            # Core Prometheus Metrics
            "base_score": base_result["score"],
            "ft_score": ft_result["score"],
            "base_correct": 1 if base_result["score"] >= 60 else 0,
            "ft_correct": 1 if ft_result["score"] >= 60 else 0,
            
            "confidence": (base_result["confidence"] + ft_result["confidence"]) / 2,
            "reasoning": ft_result.get("reasoning", ""),
            "evaluation_method": evaluation_method,
            "meta": {
                "variance": ft_result.get("variance", 0),
                "judges_used": ft_result.get("judges_used", 0)
            }
        }
