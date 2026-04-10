from typing import Dict

# Default weights for traditional sentiment categories
SENTIMENT_DOMAIN_WEIGHTS = {
    "product_reviews": 0.20,
    "social_media": 0.15,
    "customer_feedback": 0.15,
    "news_headlines": 0.15,
    "mixed_sentiment": 0.20,
    "sarcasm_detection": 0.15,
}

# Future: CAPABILITY_DOMAIN_WEIGHTS = { ... }

def get_weighted_score(domain_scores: Dict[str, float], weights: Dict[str, float]) -> float:
    """
    Computes a weighted average score for a set of domains.
    """
    total_weight = sum(weights.values())
    if total_weight == 0:
        return 0.0
        
    weighted_sum = sum(domain_scores.get(domain, 0.0) * weight for domain, weight in weights.items())
    return weighted_sum / total_weight
