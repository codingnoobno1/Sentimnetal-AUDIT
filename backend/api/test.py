from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from api.audit import get_orchestrator
from core.orchestrator import AuditOrchestrator
from schemas.models import EvaluationCase

router = APIRouter(prefix="/test", tags=["Isolated Testing"])

@router.post("/{domain}", response_model=List[EvaluationCase])
async def test_domain(
    domain: str, 
    base_model_id: str, 
    ft_model_id: str,
    orchestrator: AuditOrchestrator = Depends(get_orchestrator)
):
    """
    Runs an isolated test for a specific domain (e.g., 'arithmetic', 'logic').
    """
    prompts = orchestrator.prompt_engine.filter_by_domain(domain)
    if not prompts:
        raise HTTPException(status_code=404, detail=f"No prompts found for domain: {domain}")

    # Simplified audit flow for a single domain
    base_responses = await orchestrator.model_client.batch_query(base_model_id, prompts)
    ft_responses = await orchestrator.model_client.batch_query(ft_model_id, prompts)

    eval_tasks = [
        orchestrator.evaluator.evaluate(p, base_responses[p["id"]], ft_responses[p["id"]])
        for p in prompts
    ]
    results = await asyncio.gather(*eval_tasks)
    
    return [EvaluationCase(**res) for res in results]

import asyncio # Needed for gather inside the function
