from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional
import os
from schemas.models import AuditRequest, AuditRun
from core.orchestrator import AuditOrchestrator

router = APIRouter(prefix="/audit", tags=["Audit"])

# Global orchestrator instance
_orchestrator: Optional[AuditOrchestrator] = None

def get_orchestrator() -> AuditOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        hf_token = os.getenv("HF_TOKEN")
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not hf_token:
            raise HTTPException(status_code=500, detail="HF_TOKEN not set")
        _orchestrator = AuditOrchestrator(hf_token, groq_api_key)
    return _orchestrator

@router.post("/run", response_model=AuditRun)
async def run_audit(
    request: AuditRequest, 
    background_tasks: BackgroundTasks,
    orchestrator: AuditOrchestrator = Depends(get_orchestrator)
):
    try:
        # Backward compatibility for base_model_id / ft_model_id
        models = request.models
        if not models and request.base_model_id and request.ft_model_id:
            from schemas.models import ModelConfig
            models = [
                ModelConfig(model_id=request.base_model_id, is_baseline=True),
                ModelConfig(model_id=request.ft_model_id, is_baseline=False)
            ]
        
        if not models:
            raise HTTPException(status_code=400, detail="No models specified")

        # Start audit (Orchestrator handles backgrounding internally or we use background_tasks)
        # For simplicity in this version, we'll keep it as an async call
        return await orchestrator.run_audit(
            models=models,
            dataset_description=request.dataset_description,
            domains=request.domains
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/multi", response_model=AuditRun)
async def run_multi_audit(
    request: AuditRequest,
    orchestrator: AuditOrchestrator = Depends(get_orchestrator)
):
    """
    Dedicated endpoint for multi-model audits with advanced configurations.
    """
    if not request.models:
        raise HTTPException(status_code=400, detail="Models list is required for multi-audit")
        
    return await orchestrator.run_audit(
        models=request.models,
        dataset_description=request.dataset_description,
        domains=request.domains
    )

@router.get("/{audit_id}", response_model=AuditRun)
async def get_audit_result(audit_id: str, orchestrator: AuditOrchestrator = Depends(get_orchestrator)):
    result = orchestrator.get_audit(audit_id)
    if not result:
        raise HTTPException(status_code=404, detail="Audit result not found")
    return result
