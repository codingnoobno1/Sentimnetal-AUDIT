from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Dict, Any, Optional
import uuid
import os
from core.finetune_engine import LocalFineTuner, db
from schemas.models import ModelConfig
from datetime import datetime

router = APIRouter(prefix="/api/finetune", tags=["MLOps & Fine-Tuning"])

# Shared engine instance
models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
engine = LocalFineTuner(models_dir)

@router.post("/start")
async def start_finetune_job(
    model_id: str, 
    dataset_id: str,
    epochs: int = 1,
    batch_size: int = 1,
    learning_rate: float = 2e-5,
    background_tasks: BackgroundTasks = None
):
    """
    Initiates a background fine-tuning job using LoRA on CPU.
    """
    job_id = f"job_{uuid.uuid4().hex[:8]}"
    
    # 1. Fetch Dataset Samples (Placeholder: In real scenario, fetch from dataset_registry)
    # For MVP, we'll assume a small internal set if not found
    samples = [
        {"input": "Identify the sentiment: I love this forensic tool!", "output": "Positive"},
        {"input": "Identify the sentiment: The model regressed in logic.", "output": "Negative"}
    ]

    # 2. Register Job in Mongo
    job_data = {
        "job_id": job_id,
        "model_id": model_id,
        "dataset_id": dataset_id,
        "status": "pending",
        "config": {
            "epochs": epochs,
            "batch_size": batch_size,
            "learning_rate": learning_rate
        },
        "created_at": datetime.utcnow()
    }
    await db.finetune_jobs.insert_one(job_data)

    # 3. Queue background task
    if background_tasks:
        background_tasks.add_task(
            engine.run_training, 
            job_id, 
            model_id, 
            samples, 
            job_data["config"]
        )
    
    return {
        "job_id": job_id,
        "status": "queued",
        "message": f"Fine-tuning of {model_id} successfully queued."
    }

@router.get("/jobs")
async def list_jobs():
    """
    Returns history of all fine-tuning jobs.
    """
    cursor = db.finetune_jobs.find({}, {"_id": 0}).sort("created_at", -1)
    jobs = []
    async for job in cursor:
        jobs.append(job)
    return jobs

@router.get("/metrics/{job_id}")
async def get_training_metrics(job_id: str):
    """
    Returns the loss timeline for a specific job.
    """
    cursor = db.training_metrics.find({"job_id": job_id}, {"_id": 0}).sort("step", 1)
    metrics = []
    async for m in cursor:
        metrics.append(m)
    return metrics

@router.post("/dataset/register")
async def register_dataset(name: str, samples_count: int, source: str = "manual"):
    """
    Registers a new dataset fingerprint in the registry.
    """
    dataset_id = f"ds_{uuid.uuid4().hex[:6]}"
    dataset_data = {
        "dataset_id": dataset_id,
        "name": name,
        "size": samples_count,
        "source": source,
        "created_at": datetime.utcnow(),
        "quality_score": 0.9 # Default for new registry
    }
    await db.dataset_registry.insert_one(dataset_data)
    return dataset_data
