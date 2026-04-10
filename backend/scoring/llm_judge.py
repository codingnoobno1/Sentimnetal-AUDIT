import json
import httpx
from typing import Dict, Any

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

async def score_with_llm_judge(
    prompt: str,
    response: str,
    rubric: str,
    api_key: str,
    model: str = "llama3-70b-8192"
) -> int:
    """
    Evaluates a model response using an LLM judge with strict JSON output.
    """
    if not api_key:
        return 0

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    
    system_prompt = (
        "You are an expert impartial judge. Evaluate the quality of the LLM response "
        "based on the provided prompt and rubric. You must return a valid JSON object "
        "containing exactly one key: 'score', which must be an integer between 1 and 10."
    )
    
    user_content = (
        f"PROMPT: {prompt}\n\n"
        f"RESPONSE TO EVALUATE: {response}\n\n"
        f"RUBRIC: {rubric}\n\n"
        "Return the score in JSON format: {\"score\": N}"
    )

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "max_tokens": 128
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(GROQ_URL, headers=headers, json=payload)
            res.raise_for_status()
            data = res.json()
            
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            return int(parsed.get("score", 0))
    except (httpx.HTTPError, json.JSONDecodeError, KeyError, ValueError):
        # Fallback to 0 if judge fails
        return 0
