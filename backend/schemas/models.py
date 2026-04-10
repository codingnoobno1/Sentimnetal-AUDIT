from pydantic import BaseModel, Field
from typing import Optional, Any, Dict, List
from datetime import datetime

class ModelConfig(BaseModel):
    model_id: str
    is_baseline: bool = False
    parameters: Optional[Dict[str, Any]] = Field(
        default_factory=lambda: {"temperature": 0.1, "max_new_tokens": 512}
    )
    is_local: bool = False

class AuditRequest(BaseModel):
    models: List[ModelConfig]
    dataset_description: str
    domains: Optional[List[str]] = None
    # Keep support for old request format via aliases or properties if needed
    base_model_id: Optional[str] = None
    ft_model_id: Optional[str] = None

class ModelResult(BaseModel):
    model_id: str
    response: str
    score: float
    correct: Optional[int] = None
    confidence: Optional[float] = None

class EvaluationCase(BaseModel):
    prompt_id: str
    prompt_text: str
    domain: str

    # New multi-model results
    model_responses: Dict[str, ModelResult]

    evaluation_method: str  # exact_match, llm_judge, execution
    grounded: Optional[bool] = None
    score_details: Optional[Dict[str, Any]] = None

class DomainResult(BaseModel):
    domain: str
    model_scores: Dict[str, float]  # model_id -> mean_score
    status: str
    cases: List[EvaluationCase]

class Diagnostic(BaseModel):
    domain: str
    root_cause: str
    recommendation: str

class AuditRun(BaseModel):
    id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    status: str = "pending"
    progress: float = 0.0

    models: List[ModelConfig]
    dataset_description: str

    overall_scores: Dict[str, float]  # model_id -> score
    overall_delta: float  # Delta relative to baseline

    domain_results: List[DomainResult]

    health_status: str
    summary: str

    diagnostics: List[Diagnostic] = []

class HealthResponse(BaseModel):
    status: str = "ok"
