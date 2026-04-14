from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
from core.model_client import ModelClient
import os

import httpx

router = APIRouter(prefix="/chat", tags=["Direct Chat"])

# Mistral Configuration
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_MODEL = "open-mistral-7b" 

# Fallback Configuration (Hugging Face)
HF_FALLBACK_MODEL = "google/flan-t5-large"

def get_model_client() -> ModelClient:
    hf_token = os.getenv("HF_TOKEN")
    if not hf_token:
        raise HTTPException(status_code=500, detail="HF_TOKEN not configured in backend.")
    return ModelClient(hf_token)

async def query_mistral_direct(prompt: str) -> str:
    """
    Calls Mistral AI API directly using the MISTRAL_API_KEY.
    """
    api_key = os.getenv("MISTRAL_API_KEY")
    if not api_key:
        raise Exception("MISTRAL_API_KEY not set")

    payload = {
        "model": MISTRAL_MODEL,
        "messages": [
            {"role": "system", "content": "You are a helpful and precise assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 512
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(MISTRAL_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"].strip()

@router.post("")
async def direct_chat(
    request: Dict[str, Any],
    hf_client: ModelClient = Depends(get_model_client)
):
    """
    Direct chatbot endpoint with high-fidelity Mistral API.
    Attempts direct Mistral call first, falls back to HF if necessary.
    """
    prompt = request.get("prompt")
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required.")

    used_model = MISTRAL_MODEL
    try:
        # ATTEMPT 1: Direct Mistral AI API
        print(f"📡 [Chat] Attempting direct Mistral API: {MISTRAL_MODEL}")
        response = await query_mistral_direct(prompt)
        
    except Exception as e:
        # ATTEMPT 2: HF Fallback (Flan-T5)
        print(f"⚠️ [Chat] Mistral Direct Failed: {str(e)}. Attempting HF fallback.")
        used_model = HF_FALLBACK_MODEL
        try:
            response = await hf_client.query_model(
                model_id=HF_FALLBACK_MODEL,
                prompt=prompt,
                parameters={"temperature": 0.7, "max_new_tokens": 512}
            )
        except Exception as fallback_err:
            raise HTTPException(status_code=503, detail="Both Mistral Direct and HF fallback are offline.")

    return {
        "response": response,
        "model_id": used_model,
        "status": "success",
        "metadata": {"mode": "direct_chat"}
    }
