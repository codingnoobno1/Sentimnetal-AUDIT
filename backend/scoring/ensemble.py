import asyncio
from typing import List, Dict, Any, Optional
from .llm_judge import score_with_llm_judge
import numpy as np

class MultiJudgeEnsemble:
    """
    Advanced Prometheus-style orchestrator that uses multiple LLM judges
    and self-consistency loops to ensure high reliability and low bias.
    """
    def __init__(self, groq_api_key: str, node_url: Optional[str] = None):
        self.groq_api_key = groq_api_key
        # Different models for the ensemble
        self.judges = [
            "llama3-70b-8192",
            "mixtral-8x7b-32768"
        ]
        self.node_url = node_url # Placeholder for future Node.js Gemini/Mistral judge integration

    async def get_consensus_score(
        self,
        prompt: str,
        response: str,
        rubric: List[str],
        rounds: int = 1,
        use_ensemble: bool = True
    ) -> Dict[str, Any]:
        """
        Runs multiple evaluation passes across different judges.
        Implements self-consistency (averaging over rounds) and unbiased ensemble voting.
        """
        tasks = []
        
        # Determine judges to use
        active_judges = self.judges if use_ensemble else [self.judges[0]]
        
        # Create tasks for all rounds and all judges
        for judge in active_judges:
            for r in range(rounds):
                # We use a slightly higher temperature for rounds > 1 to foster diversity
                temp = 0.3 if rounds > 1 else 0.0
                tasks.append(score_with_llm_judge(prompt, response, rubric, self.groq_api_key, model=judge, temperature=temp))
        
        results = await asyncio.gather(*tasks)
        
        # Filter successful scores
        valid_results = [r for r in results if r["status"] == "success"]
        
        if not valid_results:
            return {
                "score": 0,
                "confidence": 0,
                "reasoning": "Ensemble failure: All judges failed.",
                "variance": 0,
                "judges_used": 0
            }
            
        scores = [r["score"] for r in valid_results]
        avg_score = sum(scores) / len(scores)
        
        # Calculate consistency metrics
        variance = float(np.var(scores)) if len(scores) > 1 else 0.0
        # Confidence is high when variance is low
        confidence = 1.0 - (min(variance, 100) / 100) if len(scores) > 1 else 0.95
        
        # Aggregate reasoning (pick the one from the highest score or primary judge)
        primary_reasoning = valid_results[0]["reasoning"]
        
        return {
            "score": round(avg_score, 2),
            "confidence": round(confidence, 2),
            "reasoning": primary_reasoning,
            "variance": round(variance, 2),
            "judges_used": len(valid_results),
            "all_scores": scores
        }
