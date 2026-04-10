from fastapi import APIRouter, Query, HTTPException
import httpx
import os
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any

router = APIRouter(prefix="/api/hf", tags=["HuggingFace"])

load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")
HF_API_BASE = "https://huggingface.co/api/models"

@router.get("/search")
async def search_models(
    query: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    task: Optional[str] = "text-generation"
):
    """
    Search for models on Hugging Face.
    """
    headers = {}
    if HF_TOKEN:
        headers["Authorization"] = f"Bearer {HF_TOKEN}"

    params = {
        "search": query,
        "limit": limit,
        "sort": "downloads",
        "direction": -1,
    }
    
    if task:
        params["filter"] = task

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(HF_API_BASE, params=params, headers=headers)
            response.raise_for_status()
            models = response.json()
            
            # Clean up the response for the frontend
            results = []
            for m in models:
                results.append({
                    "id": m.get("modelId") or m.get("id"),
                    "author": m.get("author"),
                    "downloads": m.get("downloads", 0),
                    "likes": m.get("likes", 0),
                    "lastModified": m.get("lastModified"),
                    "tags": m.get("tags", []),
                    "pipeline_tag": m.get("pipeline_tag"),
                    "isPrivate": m.get("private", False)
                })
            return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching models from HF: {str(e)}")

@router.get("/model/{model_id:path}")
async def get_model_details(model_id: str):
    """
    Get detailed info for a specific model.
    """
    headers = {}
    if HF_TOKEN:
        headers["Authorization"] = f"Bearer {HF_TOKEN}"
        
    url = f"{HF_API_BASE}/{model_id}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching model details: {str(e)}")
