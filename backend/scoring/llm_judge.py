import json
import httpx
from typing import Dict, Any, List, Optional
from .rubrics import format_rubric_prompt

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

async def score_with_llm_judge(
    prompt: str,
    response: str,
    rubric: List[str],
    api_key: str,
    model: str = "llama3-70b-8192",
    temperature: float = 0.0
) -> Dict[str, Any]:
    """
    Evaluates a model response using an LLM judge with dynamic rubrics and strict JSON output.
    Returns both score and detailed reasoning.
    """
    if not api_key:
        return {"score": 0, "reasoning": "Missing API Key", "status": "error"}

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    
    formatted_rubric = format_rubric_prompt(rubric)
    
    system_prompt = (
        "You are an expert impartial judge. Evaluate the quality of the LLM response "
        "based strictly on the provided prompt and rubric criteria. "
        "You must return a valid JSON object only."
    )
    
    user_content = (
        f"PROMPT: {prompt}\n\n"
        f"RESPONSE TO EVALUATE: {response}\n\n"
        f"EVALUATION RUBRIC:\n{formatted_rubric}\n\n"
        "TASK: Score the response from 0-100 based on the rubric. "
        "Also provide a concise comparative reasoning.\n\n"
        "Return the result in this exact JSON format:\n"
        "{\n"
        "  \"score\": number,\n"
        "  \"reasoning\": \"string\"\n"
        "}"
    )

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        "temperature": temperature,
        "response_format": {"type": "json_object"},
        "max_tokens": 512
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(GROQ_URL, headers=headers, json=payload)
            res.raise_for_status()
            data = res.json()
            
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            
            return {
                "score": float(parsed.get("score", 0)),
                "reasoning": parsed.get("reasoning", "No reasoning provided"),
                "status": "success",
                "model": model
            }
    except Exception as e:
        print(f"LLM Judge Error ({model}): {str(e)}")
        return {
            "score": 0,
            "reasoning": f"Judge failure: {str(e)}",
            "status": "error",
            "model": model
        }
