from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import List, Dict, Any, Optional
import os
from core.local_manager import LocalModelManager
from api.audit import get_orchestrator
from core.orchestrator import AuditOrchestrator

router = APIRouter(prefix="/api/models", tags=["Local Models"])

# Global manager instance pointing to the root backend/models directory
models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
local_manager = LocalModelManager(models_dir)

@router.get("/local")
async def list_local_models():
    """
    Returns a list of all models currently stored in the backend/models directory.
    """
    return {"local_models": local_manager.list_local_models()}

@router.get("/progress/{model_id:path}")
async def get_download_progress(model_id: str):
    """
    Returns the current download progress for a model.
    """
    progress = local_manager.get_progress(model_id)
    return {"model_id": model_id, "progress": progress}

@router.post("/download")
async def download_model(model_id: str, background_tasks: BackgroundTasks):
    """
    Triggers a background download of a model from Hugging Face.
    """
    if local_manager.is_model_downloaded(model_id):
        return {"status": "already_exists", "progress": 100.0, "message": f"Model {model_id} is already available offline."}

    # Since downloads are heavy, we run them in a background task
    background_tasks.add_task(local_manager.download_model, model_id)
    
    return {
        "status": "downloading",
        "progress": local_manager.get_progress(model_id),
        "message": f"Started background download for {model_id}."
    }

@router.post("/interact")
async def interact_with_model(
    model_id: str,
    prompt: str,
    parameters: Optional[Dict[str, Any]] = None,
    orchestrator: AuditOrchestrator = Depends(get_orchestrator)
):
    """
    Direct prompt injection for mobile/mobile playground.
    """
    try:
        response = await orchestrator.model_client.query_model(
            model_id=model_id,
            prompt=prompt,
            parameters=parameters
        )
        return {
            "model_id": model_id,
            "prompt": prompt,
            "response": response,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference Failure: {str(e)}")

@router.delete("/{model_id:path}")
async def delete_model(model_id: str):
    """
    Deletes a local model from disk.
    """
    path = local_manager.get_model_path(model_id)
    if os.path.exists(path):
        import shutil
        shutil.rmtree(path)
        # Reset progress
        if model_id in local_manager.progress_map:
            del local_manager.progress_map[model_id]
        return {"status": "deleted", "message": f"Model {model_id} removed from local storage."}
    
    raise HTTPException(status_code=404, detail=f"Model {model_id} not found in local storage.")
