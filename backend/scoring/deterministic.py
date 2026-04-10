from typing import List, Dict

def score_keyword_match(response: str, keywords: List[str]) -> int:
    if not keywords:
        return 0
    response_lower = response.lower()
    for keyword in keywords:
        if keyword.lower() in response_lower:
            return 1
    return 0

def calculate_domain_scores(results: List[Dict]) -> Dict[str, float]:
    if not results:
        return {"base_score": 0.0, "ft_score": 0.0}
    
    total = len(results)
    base_correct = sum(1 for r in results if r.get("base_correct", 0) == 1)
    ft_correct = sum(1 for r in results if r.get("ft_correct", 0) == 1)

    return {
        "base_score": (base_correct / total) * 100,
        "ft_score": (ft_correct / total) * 100
    }
