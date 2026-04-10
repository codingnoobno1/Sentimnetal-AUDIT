import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from huggingface_hub import snapshot_download
from typing import Dict, Any, Optional, List
import threading

class LocalModelManager:
    def __init__(self, models_dir: str):
        self.models_dir = models_dir
        self.loaded_models: Dict[str, Dict[str, Any]] = {}
        self.progress_map: Dict[str, float] = {}
        
        # Ensure root directory exists
        if not os.path.exists(self.models_dir):
            os.makedirs(self.models_dir)

    def get_model_path(self, model_id: str) -> str:
        safe_name = model_id.replace("/", "_")
        return os.path.join(self.models_dir, safe_name)

    def is_model_downloaded(self, model_id: str) -> bool:
        path = self.get_model_path(model_id)
        return os.path.exists(os.path.join(path, "config.json"))

    def get_progress(self, model_id: str) -> float:
        return self.progress_map.get(model_id, 0.0)

    async def download_model(self, model_id: str):
        """
        Downloads the model using snapshot_download with progress tracking.
        """
        path = self.get_model_path(model_id)
        if self.is_model_downloaded(model_id):
            self.progress_map[model_id] = 100.0
            return path

        self.progress_map[model_id] = 0.0
        print(f"Initializing auto-download for {model_id}...")

        try:
            self.progress_map[model_id] = 10.0
            import asyncio
            loop = asyncio.get_event_loop()
            
            def do_download():
                snapshot_download(
                    repo_id=model_id,
                    local_dir=path,
                    local_dir_use_symlinks=False,
                    resume_download=True
                )
            await loop.run_in_executor(None, do_download)
            self.progress_map[model_id] = 100.0
            return path
        except Exception as e:
            print(f"Download failed for {model_id}: {str(e)}")
            self.progress_map[model_id] = -1.0
            raise e

    def load_model(self, model_id: str) -> Dict[str, Any]:
        """
        Loads the model components (model & tokenizer) explicitly.
        """
        if model_id in self.loaded_models:
            return self.loaded_models[model_id]

        path = self.get_model_path(model_id)
        if not self.is_model_downloaded(model_id):
            raise FileNotFoundError(f"Model {model_id} not found locally at {path}")

        print(f"Loading hardware-safe local model {model_id}...")
        
        # Hardware-safe initialization per USER instructions
        tokenizer = AutoTokenizer.from_pretrained(path)
        tokenizer.padding_side = "left" # Best practice for causal LMs raw generation
        
        model = AutoModelForCausalLM.from_pretrained(
            path, 
            torch_dtype="auto", # CPU-safe auto-detection
            device_map="auto",   # Smart device allocation
            low_cpu_mem_usage=True
        )
        
        components = {
            "model": model,
            "tokenizer": tokenizer,
            "pipeline": None # We will move away from pipeline per instructions
        }
        
        self.loaded_models[model_id] = components
        return components

    def list_local_models(self) -> List[str]:
        if not os.path.exists(self.models_dir):
            return []
        models = []
        for d in os.listdir(self.models_dir):
            dir_path = os.path.join(self.models_dir, d)
            if os.path.isdir(dir_path) and os.path.exists(os.path.join(dir_path, "config.json")):
                models.append(d.replace("_", "/"))
        return models

    def unload_model(self, model_id: str):
        if model_id in self.loaded_models:
            # Explicitly move to cpu if possible before clearing to free VRAM
            del self.loaded_models[model_id]
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
