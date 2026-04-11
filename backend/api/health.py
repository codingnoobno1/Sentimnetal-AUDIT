import shutil
import os
from fastapi import APIRouter
from schemas.models import HealthResponse

router = APIRouter(prefix="/api/health", tags=["Health"])

@router.get("")
async def health():
    return {"status": "ok"}

@router.get("/storage")
async def get_storage_info():
    """
    Returns live disk usage for the models storage drive (D:).
    """
    # Use D: as per user's log, fallback to current drive if not windows
    path = "D:/" if os.name == 'nt' else "/"
    try:
        total, used, free = shutil.disk_usage(path)
        return {
            "drive": path,
            "total_gb": round(total / (1024**3), 2),
            "used_gb": round(used / (1024**3), 2),
            "free_gb": round(free / (1024**3), 2),
            "percent_used": round((used / total) * 100, 2)
        }
    except Exception as e:
        # Fallback to current working directory drive
        total, used, free = shutil.disk_usage(".")
        return {
            "drive": "current",
            "total_gb": round(total / (1024**3), 2),
            "used_gb": round(used / (1024**3), 2),
            "free_gb": round(free / (1024**3), 2),
            "percent_used": round((used / total) * 100, 2),
            "error": str(e)
        }
    
