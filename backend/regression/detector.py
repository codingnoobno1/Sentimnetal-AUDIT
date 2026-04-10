from typing import Dict, List, Optional
from schemas.models import Diagnostic, ModelConfig

DEGRADATION_THRESHOLD = -10
IMPROVEMENT_THRESHOLD = 5

# "Likely Cause" Mapping Engine (Prometheus Intelligence)
CAUSE_MAP = {
    "logic": {
        "issue": "Reasoning degradation",
        "cause": "Potential over-fitting on conversational/chat data at the expense of step-by-step logic.",
        "fix": "Increase weight of CoT (Chain of Thought) reasoning samples in the next fine-tuning pass."
    },
    "coding": {
        "issue": "Code generation failure drop",
        "cause": "Insufficient representation of structured syntax and programmatic logic in the fine-tuning dataset.",
        "fix": "Add at least 500-1000 high-quality code/instruction pairs to the dataset."
    },
    "factuality": {
        "issue": "Hallucination spike",
        "cause": "Noise in synthetic data or lack of grounding in the training corpus.",
        "fix": "Filter synthetic data for quality or include more verified factual Q&A pairs."
    },
    "natural_language": {
        "issue": "Fluency/Inference drop",
        "cause": "Potential catastrophic forgetting of base linguistic patterns during specialized tuning.",
        "fix": "Include 10-15% of the original base pre-training data to maintain general fluency."
    }
}

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

def diagnose_regression(
    domain: str, 
    base_score: float, 
    ft_score: float, 
    model_config: Optional[ModelConfig] = None
) -> Optional[Diagnostic]:
    """
    Automated diagnosis engine that correlates score drops with likely causes
    based on domain performance and dataset fingerprinting.
    """
    delta = ft_score - base_score
    if delta >= DEGRADATION_THRESHOLD:
        return None
        
    # Get base mapping
    info = CAUSE_MAP.get(domain, {
        "issue": f"{domain.title()} Performance Drop",
        "cause": "General capability regression identified.",
        "fix": "Review most recent dataset additions for quality issues."
    })
    
    # Enrichment from Dataset Profile (Fingerprinting Correlation)
    cause = info["cause"]
    if model_config and model_config.dataset_profile:
        profile = model_config.dataset_profile
        if domain == "coding" and profile.percent_code < 10:
            cause = f"CRITICAL: {cause} (Dataset profile confirms only {profile.percent_code}% code content)."
        elif domain == "logic" and profile.percent_reasoning < 15:
            cause = f"CRITICAL: {cause} (Dataset profile confirms only {profile.percent_reasoning}% reasoning content)."

    return Diagnostic(
        domain=domain,
        issue=info["issue"],
        likely_cause=cause,
        fix_recommendation=info["fix"],
        severity="high" if delta < -20 else "medium",
        score_delta=round(delta, 2)
    )

def calculate_overall_metrics(domain_results: List[Dict]) -> Dict[str, float]:
    if not domain_results:
        return {"base": 0.0, "ft": 0.0}
    
    total_base = sum(d["base_score"] for d in domain_results)
    total_ft = sum(d["ft_score"] for d in domain_results)
    count = len(domain_results)
    
    return {
        "base": total_base / count,
        "ft": total_ft / count
    }
