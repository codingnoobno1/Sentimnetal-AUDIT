import httpx
from typing import Dict, Any, Optional
import json

class GeminiEvaluator:
    def __init__(self, port: int = 3020):
        self.url = f"http://localhost:{port}/evaluate"

    async def evaluate_generation(self, prompt: str, response: str, result_status: str) -> Dict[str, Any]:
        """
        Calls the Gemini evaluation service at port 3020 to get 7-parameter scores and reasoning.
        Returns a dictionary with both numerical scores and reasoning justifications.
        """
        payload = {
            "input": prompt,
            "output": response,
            "result": result_status
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(self.url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    # data is expected to be { "arithmetic": {"score": X, "reason": Y}, ... }
                    # We preserve the full dictionary structure for the frontend reasoning trace
                    return data
                else:
                    print(f"Gemini Service Error ({resp.status_code}): {resp.text}")
                    return self._get_default_trace()
        except Exception as e:
            print(f"Failed to communicate with Gemini Service at {self.url}: {str(e)}")
            return self._get_default_trace()

    def _get_default_trace(self) -> Dict[str, Any]:
        params = ["arithmetic", "logic", "code_generation", "instruction_following", "general_knowledge", "safety", "hallucination"]
        return {p: {"score": 0.0, "reason": "Evaluation failed or service unreachable"} for p in params}

    async def evaluate(self, prompt: Dict[str, Any], initial_response: str, fine_tuned_response: str) -> Dict[str, Any]:
        """
        Main interface for CapabilitiyEvaluator.
        """
        # Call the high-res evaluator
        trace = await self.evaluate_generation(prompt["prompt_text"], fine_tuned_response, "success")
        
        # Calculate a simple average for the base benchmarking score if needed
        scores = []
        if isinstance(trace, dict):
            for k, v in trace.items():
                if isinstance(v, dict) and "score" in v:
                    scores.append(float(v["score"]))
                elif isinstance(v, (int, float)):
                    scores.append(float(v))
        
        avg_score = sum(scores) / len(scores) if scores else 0.0
        
        return {
            "ft_score": avg_score,
            "ft_correct": 1 if avg_score > 70 else 0,
            "forensic_trace": trace
        }
