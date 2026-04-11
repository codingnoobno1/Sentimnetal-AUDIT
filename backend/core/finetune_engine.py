import os
import torch
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    TrainingArguments, 
    Trainer, 
    TrainerCallback
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import Dataset
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB Configuration (Sharing with Express node)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client["ForensicAudit"]

class MongoProgressCallback(TrainerCallback):
    """
    Custom callback to push training metrics to MongoDB in real-time.
    """
    def __init__(self, job_id: str):
        self.job_id = job_id

    def on_log(self, args, state, control, logs=None, **kwargs):
        if logs:
            import asyncio
            # We use a synchronous wrapper or a separate thread-safe approach for DB writes in Trainer
            # For simplicity in this local context, we'll try to push basic metrics
            step = state.global_step
            loss = logs.get("loss", 0.0)
            lr = logs.get("learning_rate", 0.0)
            epoch = logs.get("epoch", 0.0)
            
            # Note: Trainer runs in a thread, so we'd typically use a queue or synchronous client
            # But for this local MVP, we'll print and rely on the status poller
            print(f"STEP {step}: Loss {loss:.4f} | LR {lr:.2e}")

class LocalFineTuner:
    def __init__(self, model_dir: str):
        self.model_dir = model_dir

    def prepare_dataset(self, samples: List[Dict[str, str]]) -> Dataset:
        """
        Converts raw samples input/output into a Hugging Face Dataset.
        """
        formatted = []
        for s in samples:
            formatted.append({
                "text": f"### Instruction: {s['input']}\n### Response: {s['output']}"
            })
        return Dataset.from_list(formatted)

    async def run_training(self, job_id: str, model_id: str, dataset: List[Dict[str, str]], config: Dict[str, Any]):
        """
        Main training loop using PEFT/LoRA.
        """
        print(f"Starting Fine-Tune Job: {job_id} for model {model_id}")
        
        # 1. Update Job Status to 'running'
        await db.finetune_jobs.update_one(
            {"job_id": job_id},
            {"$set": {"status": "running", "start_time": datetime.utcnow()}}
        )

        try:
            # 2. Load Model & Tokenizer
            model_path = os.path.join(self.model_dir, model_id.replace("/", "_"))
            tokenizer = AutoTokenizer.from_pretrained(model_path)
            tokenizer.pad_token = tokenizer.eos_token
            
            # CPU-friendly loading
            model = AutoModelForCausalLM.from_pretrained(
                model_path,
                torch_dtype=torch.float32, # CPU safety
                device_map={"": "cpu"},
                low_cpu_mem_usage=True
            )

            # 3. Apply LoRA
            lora_config = LoraConfig(
                r=config.get("lora_r", 8),
                lora_alpha=config.get("lora_alpha", 16),
                target_modules=["q_proj", "v_proj"], # Safe defaults for Llama/Phi
                bias="none",
                task_type="CAUSAL_LM"
            )
            model = get_peft_model(model, lora_config)
            model.print_trainable_parameters()

            # 4. Prepare Data
            train_data = self.prepare_dataset(dataset)
            def tokenize_function(examples):
                return tokenizer(examples["text"], truncation=True, padding="max_length", max_length=512)
            
            tokenized_dataset = train_data.map(tokenize_function, batched=True)

            # 5. Training Arguments
            output_dir = os.path.join(self.model_dir, f"ft_{job_id}")
            training_args = TrainingArguments(
                output_dir=output_dir,
                per_device_train_batch_size=config.get("batch_size", 1),
                num_train_epochs=config.get("epochs", 1),
                learning_rate=config.get("learning_rate", 2e-5),
                logging_steps=10,
                save_steps=100,
                use_cpu=True, # Enforce CPU training per USER request
                no_cuda=True,
                report_to="none"
            )

            # 6. Initialize Trainer
            trainer = Trainer(
                model=model,
                args=training_args,
                train_dataset=tokenized_dataset,
                callbacks=[MongoProgressCallback(job_id)]
            )

            # 7. Execute Training
            start_t = time.time()
            trainer.train()
            duration = time.time() - start_t

            # 8. Save Model
            trainer.save_model(output_dir)
            
            # 9. Register new model version
            await db.model_registry.update_one(
                {"model_id": f"{model_id}_ft_{job_id}"},
                {"$set": {
                    "name": f"{model_id} (LoRA FT)",
                    "base_model": model_id,
                    "local_path": output_dir,
                    "status": "ready",
                    "created_at": datetime.utcnow()
                }},
                upsert=True
            )

            # 10. Update Job Status to 'completed'
            await db.finetune_jobs.update_one(
                {"job_id": job_id},
                {"$set": {
                    "status": "completed", 
                    "end_time": datetime.utcnow(),
                    "metrics.training_time_sec": duration
                }}
            )
            
            return output_dir

        except Exception as e:
            print(f"Job {job_id} Error: {str(e)}")
            await db.finetune_jobs.update_one(
                {"job_id": job_id},
                {"$set": {"status": "failed", "logs": [str(e)]}}
            )
            raise e
