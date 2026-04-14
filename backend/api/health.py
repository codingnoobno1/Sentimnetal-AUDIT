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
        free_gb = round(free / (1024**3), 2)
        return {
            "drive": path,
            "total_gb": round(total / (1024**3), 2),
            "used_gb": round(used / (1024**3), 2),
            "free_gb": free_gb,
            "percent_used": round((used / total) * 100, 2),
            "summary": f"Cloud storage check complete. You have {free_gb} gigabytes of free space on drive {path.replace('/', '')}."
        }
    except Exception as e:
        # Fallback to current working directory drive
        total, used, free = shutil.disk_usage(".")
        free_gb = round(free / (1024**3), 2)
        return {
            "drive": "current",
            "total_gb": round(total / (1024**3), 2),
            "used_gb": round(used / (1024**3), 2),
            "free_gb": free_gb,
            "percent_used": round((used / total) * 100, 2),
            "summary": f"Local storage check complete. You have {free_gb} gigabytes of free space.",
            "error": str(e)
        }
    
