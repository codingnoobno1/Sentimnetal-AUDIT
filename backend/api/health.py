from fastapi import APIRouter
from schemas.models import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok")
