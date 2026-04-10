from typing import Dict, List

DEGRADATION_THRESHOLD = -10
IMPROVEMENT_THRESHOLD = 5

def compute_regression_status(base_score: float, ft_score: float) -> str:
    """
    Determines the regression status based on the delta between FT and Base scores.
    """
    delta = ft_score - base_score

    if delta < DEGRADATION_THRESHOLD:
        return "REGRESSED"
    elif delta <= IMPROVEMENT_THRESHOLD:
        return "STABLE"
    else:
        return "IMPROVED"

def calculate_overall_metrics(domain_results: List[Dict]) -> Dict[str, float]:
    """
    Calculates overall scores based on domain results.
    Currently uses simple average, can be updated for weighted average.
    """
    if not domain_results:
        return {"base": 0.0, "ft": 0.0}
    
    total_base = sum(d["base_score"] for d in domain_results)
    total_ft = sum(d["ft_score"] for d in domain_results)
    count = len(domain_results)
    
    return {
        "base": total_base / count,
        "ft": total_ft / count
    }
