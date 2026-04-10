import json
import httpx
from typing import List, Dict, Any, Optional
from schemas.models import Diagnostic

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

class DiagnosticExplainer:
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def explain_regression(
        self,
        domain: str,
        base_score: float,
        ft_score: float,
        examples: List[str],
        dataset_desc: str
    ) -> Diagnostic:
        """
        Uses an LLM to explain why a specific domain regressed and returns a structured Diagnostic.
        """
        if not self.api_key:
            return Diagnostic(
                domain=domain,
                root_cause="API Key missing",
                recommendation="Configure GROQ_API_KEY"
            )

        examples_text = "\n".join(f"- {ex}" for ex in examples[:3])
        
        prompt = (
            f"You are an AI diagnostic expert. Analyze this regression:\n\n"
            f"Domain: {domain}\n"
            f"Performance Change: {base_score}% -> {ft_score}% (Delta: {ft_score - base_score}%)\n"
            f"Fine-tuning Dataset: {dataset_desc}\n\n"
            f"Misclassification Examples:\n{examples_text}\n\n"
            "Return a JSON object explaining:\n"
            "1. root_cause\n"
            "2. recommendation (Specific data augmentation or training strategy)\n"
        )

        payload = {
            "model": "llama3-70b-8192",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
            "response_format": {"type": "json_object"}
        }

        headers = {"Authorization": f"Bearer {self.api_key}"}

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(GROQ_URL, headers=headers, json=payload)
                res.raise_for_status()
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                
                return Diagnostic(
                    domain=domain,
                    root_cause=parsed.get("root_cause", "Unknown"),
                    recommendation=parsed.get("recommendation", "Unknown")
                )
        except Exception as e:
            return Diagnostic(
                domain=domain,
                root_cause=f"Diagnostic failed: {str(e)}",
                recommendation="Check API connectivity"
            )
