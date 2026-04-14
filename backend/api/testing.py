from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any, Optional
import os
import time
import json
import asyncio
from core.model_client import ModelClient
from core.db import db_manager
from evaluation.base import CapabilityEvaluator
from schemas.models import ModelConfig, AuditRequest, AuditRun, Diagnostic as DiagnosticSchema
from regression.detector import compute_regression_status, diagnose_regression
from dotenv import load_dotenv

router = APIRouter(prefix="/api/testing", tags=["Prometheus Testing"])

# MongoDB collection reference for history
audit_history = db_manager.db["audit_results"]

load_dotenv()

def get_tools():
    hf_token = os.getenv("HF_TOKEN")
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not hf_token:
        raise HTTPException(status_code=500, detail="HF_TOKEN not set")
    return ModelClient(hf_token), CapabilityEvaluator(groq_api_key)

@router.get("/integrity")
async def check_system_integrity():
    """
    Returns the total count of forensic audits stored in the database.
    """
    try:
        count = await audit_history.count_documents({})
        return {"total_forensic_audits": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{model_id:path}")
async def get_model_history(model_id: str):
    """
    Fetches historical audit results for a specific model.
    """
    try:
        cursor = audit_history.find({"model_id": model_id}).sort("timestamp", -1)
        history = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            history.append(doc)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate-gemini")
async def evaluate_gemini(
    prompt_text: str,
    response_text: str,
    result_status: str,
    model_id: str,
    expected_answer: Optional[str] = None,
    tools: tuple = Depends(get_tools)
):
    """
    FOR FRONTEND SYNC: Runs a forensic audit using the Prometheus evaluator.
    """
    _, evaluator = tools
    
    try:
        # Construct a prompt object similar to what process_single_prompt uses
        prompt_obj = {
            "prompt_text": prompt_text, 
            "id": "manual-audit",
            "expected_answer": expected_answer or ""
        }
        
        # Run evaluation
        eval_res = await evaluator.evaluate(prompt_obj, response_text, response_text)
        
        # Save results
        audit_doc = {
            "timestamp": time.time(),
            "model_id": model_id,
            "status": result_status,
            "input": prompt_text,
            "expected_answer": expected_answer or "",
            "output": response_text,
            "score": eval_res.get("ft_score", 0),
            "forensic_eval": eval_res.get("forensic_trace", eval_res), # Fallback if forensic_trace isn't nested
            "specialized_expertise": eval_res.get("specialized_expertise"),
            "technical_tips": eval_res.get("technical_tips")
        }
        
        await audit_history.insert_one(audit_doc)
        return audit_doc
        
    except Exception as e:
        err_str = str(e)
        if "api_key" in err_str.lower() or "401" in err_str:
            raise HTTPException(status_code=401, detail="Audit Engine Warning: Invalid or missing GROQ_API_KEY. Forensic analysis skipped.")
        if "rate_limit" in err_str.lower() or "429" in err_str:
            raise HTTPException(status_code=429, detail="Audit Engine Busy: Groq rate limit exceeded.")
        raise HTTPException(status_code=500, detail=f"Auditing Internal Error: {err_str}")

@router.get("/aggregate/{model_id:path}")
async def get_model_aggregate_stats(model_id: str):
    """
    PROMETHEUS SYNC: Computes institution-grade analytics from MongoDB records.
    """
    try:
        # Pipeline for domain-based aggregation
        pipeline = [
            {"$match": {"model_id": model_id}},
            {"$group": {
                "_id": "$domain",
                "avg_score": {"$avg": "$score"},
                "total_audits": {"$count": {}},
                "latest_timestamp": {"$max": "$timestamp"}
            }},
            {"$sort": {"avg_score": -1}}
        ]
        
        domain_stats = []
        cursor = audit_history.aggregate(pipeline)
        async for doc in cursor:
            avg_score = doc.get("avg_score")
            domain_stats.append({
                "domain": doc["_id"],
                "avg_score": round(avg_score, 2) if avg_score is not None else 0,
                "total_audits": doc["total_audits"],
                "last_active": doc["latest_timestamp"]
            })
            
        # Pipeline for global forensic parameters (Radar data)
        forensic_pipeline = [
            {"$match": {"model_id": model_id, "forensic_eval": {"$exists": True}}},
            {"$group": {
                "_id": None,
                "avg_logic": {"$avg": "$forensic_eval.logic.score"},
                "avg_hallucination": {"$avg": "$forensic_eval.hallucination.score"},
                "avg_safety": {"$avg": "$forensic_eval.safety.score"},
                "avg_instruction": {"$avg": "$forensic_eval.instruction_following.score"},
                "avg_arithmetic": {"$avg": "$forensic_eval.arithmetic.score"}
            }}
        ]
        
        forensic_avg = {
            "avg_logic": 0, "avg_hallucination": 0, "avg_safety": 0, 
            "avg_instruction": 0, "avg_arithmetic": 0
        }
        cursor = audit_history.aggregate(forensic_pipeline)
        async for doc in cursor:
            forensic_avg = {k: round(v, 2) if v is not None else 0 for k, v in doc.items() if k != "_id"}
            
        # Recent timeline (last 20 checks)
        timeline = []
        cursor = audit_history.find({"model_id": model_id}).sort("timestamp", -1).limit(20)
        async for doc in cursor:
            timeline.append({
                "timestamp": doc["timestamp"],
                "score": doc.get("score", 0),
                "domain": doc.get("domain", "unknown")
            })
            
        return {
            "model_id": model_id,
            "domains": domain_stats,
            "forensic_parameters": forensic_avg,
            "timeline": timeline[::-1], # Chronological order
            "total_records": await audit_history.count_documents({"model_id": model_id})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/domains")
async def get_available_domains():
    prompts_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts.json")
    try:
        with open(prompts_path, "r") as f:
            data = json.load(f)
            meta = data.get("metadata", {})
            domains = meta.get("domains", [])
            labels = meta.get("domain_labels", {})
            all_prompts = data.get("prompts", [])
            domain_counts = {}
            for p in all_prompts:
                d = p.get("domain", "unknown")
                domain_counts[d] = domain_counts.get(d, 0) + 1
            return {
                "domains": [{"id": d, "label": labels.get(d, d.replace("_", " ").title()), "prompt_count": domain_counts.get(d, 0)} for d in domains],
                "total_prompts": len(all_prompts)
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load domains: {str(e)}")

@router.post("/batch-evaluate")
async def batch_evaluate(
    model_id: str,
    cases: List[Dict[str, Any]],
    tools: tuple = Depends(get_tools)
):
    """
    PROMETHEUS SYNC: High-speed batch evaluation using dynamic rubrics.
    """
    _, evaluator = tools
    
    results = []
    # Process evaluations in parallel
    tasks = [
        evaluator.evaluate(c["prompt"], c.get("base_response", ""), c.get("ft_response", ""))
        for c in cases
    ]
    
    results = await asyncio.gather(*tasks)
    return results

@router.get("/diagnostics/regressions/{model_id}")
async def get_regression_diagnostics(model_id: str, tools: tuple = Depends(get_tools)):
    """
    PROMETHEUS SYNC: Detects capability drops and provides automated diagnoses.
    """
    try:
        # Fetch historical audits for this model
        cursor = audit_history.find({"model_id": model_id}).sort("timestamp", -1).limit(50)
        audits = []
        async for a in cursor:
            audits.append(a)
            
        if not audits:
            return {"diagnostics": [], "summary": "No previous audit data found."}
            
        # Group by domain and calculate deltas
        # (For this MVP, we assume a base comparison threshold in detector.py)
        domain_data = {}
        for a in audits:
            d = a.get("domain", "general")
            if d not in domain_data:
                domain_data[d] = []
            domain_data[d].append(a.get("score", 0))
            
        diagnostics = []
        for domain, scores in domain_data.items():
            avg_score = sum(scores) / len(scores)
            # Simulate a baseline comparison (In real-world, we'd compare against the 'baseline' model record)
            # Default baseline assumed 80 for diagnostic demonstration
            diag = diagnose_regression(domain, 80.0, avg_score)
            if diag:
                diagnostics.append(diag.dict())
                
        return {
            "model_id": model_id,
            "diagnostics": diagnostics,
            "status": "warning" if diagnostics else "healthy",
            "summary": f"Identified {len(diagnostics)} regression issues." if diagnostics else "No capability regressions detected."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scalability")
async def run_scalability_test(
    model_id: str,
    sample_count: int = 1,
    domain: str = "all",
    dataset_tag: str = "default",
    tools: tuple = Depends(get_tools)
):
    model_client, evaluator = tools
    prompts_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts.json")
    with open(prompts_path, "r") as f:
        data = json.load(f)
        all_prompts = data.get("prompts", [])

    if domain and domain != "all":
        filtered = [p for p in all_prompts if p.get("domain") == domain]
        if filtered: all_prompts = filtered

    test_prompts = [all_prompts[i % len(all_prompts)] for i in range(sample_count)]

    async def generate_results():
        results = []
        start_time = time.time()
        for idx, prompt in enumerate(test_prompts):
            res = await process_single_prompt(model_client, evaluator, model_id, prompt, dataset_tag)
            results.append(res)
            yield json.dumps({"type": "trial", "data": res}) + "\n"
            await asyncio.sleep(0.4)
        
        total_duration = time.time() - start_time
        successful_runs = [r for r in results if r["status"] == "success"]
        accuracy = (len([r for r in successful_runs if r.get("correct") == 1]) / len(successful_runs)) * 100 if successful_runs else 0
        
        yield json.dumps({
            "type": "final",
            "model_id": model_id,
            "metrics": {"accuracy": round(accuracy, 2), "total_duration_s": round(total_duration, 2)}
        }) + "\n"

    return StreamingResponse(generate_results(), media_type="application/x-ndjson")

async def process_single_prompt(
    client: ModelClient, 
    evaluator: CapabilityEvaluator, 
    model_id: str, 
    prompt: Dict[str, Any],
    dataset_tag: str = "default"
):
    p_start = time.time()
    try:
        response = await client.query_model(model_id, prompt["prompt_text"])
        # Use Prometheus Evaluator
        eval_res = await evaluator.evaluate(prompt, response, response)
        
        await audit_history.insert_one({
            "timestamp": time.time(),
            "model_id": model_id,
            "dataset_tag": dataset_tag,
            "domain": prompt.get("domain", "default"),
            "score": eval_res["ft_score"],
            "input": prompt["prompt_text"],
            "expected_answer": prompt.get("expected_answer", ""),
            "output": response
        })

        return {
            "prompt_id": prompt["id"],
            "prompt_text": prompt["prompt_text"],
            "expected_answer": prompt.get("expected_answer", ""),
            "response": response,
            "score": eval_res["ft_score"],
            "correct": eval_res["ft_correct"],
            "confidence": eval_res.get("confidence", 0.95),
            "reasoning": eval_res.get("reasoning", ""),
            "status": "success",
            "latency": time.time() - p_start
        }
    except Exception as e:
        return {"status": "error", "error": str(e), "latency": time.time() - p_start}
