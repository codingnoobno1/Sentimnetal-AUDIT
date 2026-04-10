from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from scoring.deterministic import score_keyword_match
from scoring.llm_judge import score_with_llm_judge

class BaseEvaluator(ABC):
    def __init__(self, groq_api_key: Optional[str] = None):
        self.groq_api_key = groq_api_key

    @abstractmethod
    async def evaluate(self, prompt_entry: Dict[str, Any], base_resp: str, ft_resp: str) -> Dict[str, Any]:
        """
        Executes evaluation for a single prompt across both models.
        """
        pass

class CapabilityEvaluator(BaseEvaluator):
    """
    Standard evaluator that uses the prompt's specified scoring method.
    """
    async def evaluate(self, prompt_entry: Dict[str, Any], base_resp: str, ft_resp: str) -> Dict[str, Any]:
        scoring_method = prompt_entry.get("scoring_method", "keyword_match")
        
        base_score = 0.0
        ft_score = 0.0
        evaluation_method = scoring_method
        score_details = {}

        if scoring_method == "keyword_match":
            keywords = prompt_entry.get("keywords", [])
            base_score = float(score_keyword_match(base_resp, keywords))
            ft_score = float(score_keyword_match(ft_resp, keywords))
        
        elif scoring_method == "llm_judge" and self.groq_api_key:
            b_score = await score_with_llm_judge(
                prompt_entry["prompt_text"], base_resp, prompt_entry.get("rubric", ""), self.groq_api_key
            )
            f_score = await score_with_llm_judge(
                prompt_entry["prompt_text"], ft_resp, prompt_entry.get("rubric", ""), self.groq_api_key
            )
            
            # Use raw scores (0-10) but normalize or pass as-is
            base_score = float(b_score)
            ft_score = float(f_score)
            score_details = {"base_raw_score": b_score, "ft_raw_score": f_score}

        # Derive binary correctness if needed (threshold 5 for LLM judge)
        base_correct = 1 if base_score >= 5 else 0
        ft_correct = 1 if ft_score >= 5 else 0

        return {
            "prompt_id": prompt_entry["id"],
            "prompt_text": prompt_entry["prompt_text"],
            "domain": prompt_entry["domain"],
            "base_response": base_resp,
            "ft_response": ft_resp,
            "base_score": base_score,
            "ft_score": ft_score,
            "base_correct": base_correct,
            "ft_correct": ft_correct,
            "evaluation_method": evaluation_method,
            "score_details": score_details,
            "grounded": True, # Placeholder for future grounding engine
            "confidence": 0.95 # Placeholder for future confidence engine
        }
