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
from evaluation.gemini_evaluator import GeminiEvaluator
from schemas.models import ModelConfig
from dotenv import load_dotenv

router = APIRouter(prefix="/api/testing", tags=["Scalability Testing"])

# MongoDB collection reference for history
audit_history = db_manager.db["audit_results"]

load_dotenv()

# Dependency for Model Client and Evaluator
def get_tools():
    hf_token = os.getenv("HF_TOKEN")
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not hf_token:
        raise HTTPException(status_code=500, detail="HF_TOKEN not set")
    return ModelClient(hf_token), CapabilityEvaluator(groq_api_key)

@router.get("/domains")
async def get_available_domains():
    """
    Returns available prompt domains from prompts.json for UI selection.
    """
    prompts_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts.json")
    try:
        with open(prompts_path, "r") as f:
            data = json.load(f)
            meta = data.get("metadata", {})
            domains = meta.get("domains", [])
            labels = meta.get("domain_labels", {})
            all_prompts = data.get("prompts", [])
            
            # Count prompts per domain
            domain_counts = {}
            for p in all_prompts:
                d = p.get("domain", "unknown")
                domain_counts[d] = domain_counts.get(d, 0) + 1
            
            return {
                "domains": [
                    {
                        "id": d,
                        "label": labels.get(d, d.replace("_", " ").title()),
                        "prompt_count": domain_counts.get(d, 0)
                    }
                    for d in domains
                ],
                "total_prompts": len(all_prompts)
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load domains: {str(e)}")

@router.post("/scalability")
async def run_scalability_test(
    model_id: str,
    sample_count: int = 1,
    domain: str = "all",
    tools: tuple = Depends(get_tools)
):
    """
    Streams a scalability test on a single model using prompts.json.
    Optionally filters prompts by domain.
    Each trial is sent as a JSON chunk as it completes.
    """
    model_client, evaluator = tools
    
    # 1. Load Prompts
    prompts_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts.json")
    try:
        with open(prompts_path, "r") as f:
            data = json.load(f)
            all_prompts = data.get("prompts", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load prompts: {str(e)}")

    if not all_prompts:
        raise HTTPException(status_code=404, detail="No prompts found in prompts.json")

    # 2. Filter by domain if specified
    if domain and domain != "all":
        filtered = [p for p in all_prompts if p.get("domain") == domain]
        if filtered:
            all_prompts = filtered
            print(f"📋 [Test] Filtered to {len(all_prompts)} prompts for domain: {domain}")
        else:
            print(f"⚠️ [Test] No prompts for domain '{domain}', using all prompts")

    # 3. Scale Prompts
    test_prompts = []
    for i in range(sample_count):
        test_prompts.append(all_prompts[i % len(all_prompts)])

    async def generate_results():
        results = []
        start_time = time.time()
        
        # We process in small concurrent batches to maintain speed but stream quickly
        batch_size = 2
        for i in range(0, len(test_prompts), batch_size):
            batch = test_prompts[i:i+batch_size]
            batch_tasks = [
                process_single_prompt(model_client, evaluator, model_id, p) 
                for p in batch
            ]
            
            batch_results = await asyncio.gather(*batch_tasks)
            for r in batch_results:
                results.append(r)
                # Yield trial chunk
                yield json.dumps({"type": "trial", "data": r}) + "\n"
            
            # Pacing: Deliberate 0.5s sleep to satisfy the "1 by 1" visual requirement
            await asyncio.sleep(0.5)
        
        end_time = time.time()
        total_duration = end_time - start_time

        # Final Aggregation
        successful_runs = [r for r in results if r["status"] == "success"]
        correct_runs = [r for r in successful_runs if r.get("correct") == 1]
        
        avg_latency = sum(r["latency"] for r in successful_runs) / len(successful_runs) if successful_runs else 0
        accuracy = (len(correct_runs) / len(successful_runs)) * 100 if successful_runs else 0
        
        final_data = {
            "type": "final",
            "model_id": model_id,
            "domain": domain,
            "sample_count": sample_count,
            "metrics": {
                "accuracy": round(accuracy, 2),
                "avg_latency_ms": round(avg_latency * 1000, 2),
                "total_duration_s": round(total_duration, 2),
                "throughput_qps": round(len(results) / total_duration, 2),
                "success_rate": round((len(successful_runs) / len(results)) * 100, 2)
            }
        }
        yield json.dumps(final_data) + "\n"

    return StreamingResponse(generate_results(), media_type="application/x-ndjson")

async def process_single_prompt(client: ModelClient, evaluator: CapabilityEvaluator, model_id: str, prompt: Dict[str, Any]):
    p_start = time.time()
    try:
        response = await client.query_model(model_id, prompt["prompt_text"])
        p_end = time.time()
        latency = p_end - p_start
        
        # Evaluate
        eval_res = await evaluator.evaluate(prompt, response, response)
        
        # Persist to MongoDB
        try:
            await db_manager.audit_results.insert_one({
                "timestamp": time.time(),
                "model_id": model_id,
                "prompt_id": prompt["id"],
                "prompt_text": prompt["prompt_text"],
                "response": response,
                "latency": latency,
                "score": eval_res["ft_score"],
                "correct": eval_res["ft_correct"],
                "domain": prompt.get("domain", "default")
            })
        except Exception as db_err:
            print(f"MongoDB Insert Error: {db_err}")

        return {
            "prompt_id": prompt["id"],
            "metadata": prompt, # Include full source from prompts.json
            "prompt_text": prompt["prompt_text"],
            "response": response,
            "latency": latency,
            "score": eval_res["ft_score"],
            "correct": eval_res["ft_correct"],
            "status": "success"
        }
    except Exception as e:
        return {
            "prompt_id": prompt["id"],
            "status": "error",
            "error": str(e),
            "latency": time.time() - p_start
        }

@router.post("/evaluate-gemini")
async def evaluate_with_gemini(
    prompt_text: str,
    response_text: str,
    result_status: str,
    model_id: str = "unknown"
):
    """
    Evaluates a specific model response using the Gemini service at port 3020.
    """
    evaluator = GeminiEvaluator(port=3020)
    payload = {
        "input": prompt_text,
        "output": response_text,
        "result": result_status,
        "model_id": model_id
    }
    
    print(f"\n🔗 [Proxy] Forwarding to Gemini Service at {evaluator.url}")
    print(f"   Model: {model_id}")
    print(f"   Prompt length: {len(prompt_text)} chars")
    
    try:
        import httpx
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(evaluator.url, json=payload)
            print(f"   ↳ Node.js responded: {resp.status_code}")
            
            if resp.status_code == 200:
                data = resp.json()
                print(f"   ✅ Forensic trace received with {len(data)} parameters")
                return data
            else:
                print(f"   ❌ Node.js error: {resp.text[:200]}")
                return evaluator._get_default_trace()
    except Exception as e:
        print(f"   ❌ Connection failed: {str(e)}")
        return evaluator._get_default_trace()

@router.get("/history/{model_id}")
async def get_model_history(model_id: str):
    """
    Fetches the latest 5 forensic audits for a specific model from MongoDB.
    """
    try:
        cursor = audit_history.find({"model_id": model_id}).sort("timestamp", -1).limit(5)
        history = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            ts = doc.get("timestamp")
            
            # Robust timestamp parsing (handle float, int, or datetime objects)
            if isinstance(ts, (int, float)):
                doc["timestamp"] = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(ts))
            elif hasattr(ts, 'strftime'): # Handle datetime objects
                doc["timestamp"] = ts.strftime('%Y-%m-%d %H:%M:%S')
            
            # Map DB fields to Trial structure
            history.append({
                "prompt_id": doc.get("prompt_id", "historical"),
                "prompt_text": doc.get("input") or doc.get("prompt_text"),
                "response": doc.get("output") or doc.get("response"),
                "latency": doc.get("latency", 0),
                "score": doc.get("score") or 0,
                "status": "success",
                "forensic_eval": doc.get("forensic_trace")
            })
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History fetch failed: {str(e)}")

@router.get("/integrity")
async def get_audit_integrity():
    """
    Returns the total count of forensic records in MongoDB to verify persistence.
    """
    try:
        count = await audit_history.count_documents({})
        return {
            "status": "connected",
            "total_forensic_audits": count,
            "last_check": time.time()
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/compare-run")
async def compare_run(
    model_a_id: str,
    model_b_id: str,
    domain: str = "all",
    sample_count: int = 1,
    tools: tuple = Depends(get_tools)
):
    """
    Runs the same prompts against two models and streams results.
    """
    model_client, evaluator = tools

    # Load and filter prompts
    prompts_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts.json")
    with open(prompts_path, "r") as f:
        data = json.load(f)
        all_prompts = data.get("prompts", [])

    if domain and domain != "all":
        filtered = [p for p in all_prompts if p.get("domain") == domain]
        if filtered:
            all_prompts = filtered

    test_prompts = [all_prompts[i % len(all_prompts)] for i in range(sample_count)]

    async def generate():
        for idx, prompt in enumerate(test_prompts):
            p_text = prompt["prompt_text"]

            # Query both models
            t1 = time.time()
            resp_a = await model_client.query_model(model_a_id, p_text)
            lat_a = time.time() - t1

            t2 = time.time()
            resp_b = await model_client.query_model(model_b_id, p_text)
            lat_b = time.time() - t2

            trial = {
                "type": "trial",
                "index": idx,
                "prompt": prompt,
                "model_a": {"model_id": model_a_id, "response": resp_a, "latency": lat_a, "status": "success"},
                "model_b": {"model_id": model_b_id, "response": resp_b, "latency": lat_b, "status": "success"}
            }
            yield json.dumps(trial) + "\n"
            await asyncio.sleep(0.3)

        yield json.dumps({"type": "done"}) + "\n"

    return StreamingResponse(generate(), media_type="application/x-ndjson")

@router.post("/compare-evaluate")
async def compare_evaluate(
    prompt: str,
    expected_answer: str = "",
    response_a: str = "",
    response_b: str = "",
    model_a_id: str = "model_a",
    model_b_id: str = "model_b"
):
    """
    Proxies to the Node.js compare evaluation service.
    """
    try:
        import httpx
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post("http://localhost:3020/compare/evaluate", json={
                "prompt": prompt,
                "expected_answer": expected_answer,
                "response_a": response_a,
                "response_b": response_b,
                "model_a_id": model_a_id,
                "model_b_id": model_b_id
            })
            if resp.status_code == 200:
                return resp.json()
            return {"model_a_score": 50, "model_b_score": 50, "winner": "tie", "reasoning": "Service error", "dimensions": {"accuracy": {"a": 50, "b": 50}, "relevance": {"a": 50, "b": 50}, "coherence": {"a": 50, "b": 50}, "completeness": {"a": 50, "b": 50}, "safety": {"a": 50, "b": 50}}}
    except Exception as e:
        print(f"Compare eval error: {e}")
        return {"model_a_score": 50, "model_b_score": 50, "winner": "tie", "reasoning": str(e), "dimensions": {"accuracy": {"a": 50, "b": 50}, "relevance": {"a": 50, "b": 50}, "coherence": {"a": 50, "b": 50}, "completeness": {"a": 50, "b": 50}, "safety": {"a": 50, "b": 50}}}

