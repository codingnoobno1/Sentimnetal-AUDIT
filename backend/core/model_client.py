import asyncio
import httpx
import os
import torch
from typing import Any, Dict, List, Tuple, Optional
from schemas.models import ModelConfig
from core.local_manager import LocalModelManager

HF_API_URL = "https://api-inference.huggingface.co/models"

class ModelClient:
    def __init__(self, hf_token: str):
        self.hf_token = hf_token
        self.headers = {
            "Authorization": f"Bearer {hf_token}",
            "Content-Type": "application/json",
        }
        # Initialize the local manager pointing to root backend/models
        models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
        self.local_manager = LocalModelManager(models_dir)

    async def query_model(
        self,
        model_id: str,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        is_local: bool = False
    ) -> str:
        """
        Queries a model, either via Hugging Face Inference API or locally.
        """
        if is_local or self.local_manager.is_model_downloaded(model_id):
            return await self._query_local(model_id, prompt, parameters)
        else:
            return await self._query_remote(model_id, prompt, parameters)

    async def _query_remote(self, model_id: str, prompt: str, parameters: Optional[Dict[str, Any]]) -> str:
        url = f"{HF_API_URL}/{model_id}"
        params = {"temperature": 0.1, "max_new_tokens": 512, "return_full_text": False}
        if parameters:
            params.update(parameters)
            
        payload = {
            "inputs": prompt,
            "parameters": params,
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                headers = self.headers.copy()
                headers["ngrok-skip-browser-warning"] = "69420"
                
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                result = response.json()
                
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get("generated_text", "").strip()
                return result.get("generated_text", "").strip()
        except Exception as e:
            print(f"Remote Query Error ({model_id}): {str(e)}")
            return f"REMOTE_FAILURE: {str(e)}"

    async def _query_local(self, model_id: str, prompt: str, parameters: Optional[Dict[str, Any]]) -> str:
        try:
            # We run the local inference in a thread pool to avoid blocking the event loop
            loop = asyncio.get_event_loop()
            components = self.local_manager.load_model(model_id)
            model = components["model"]
            tokenizer = components["tokenizer"]
            
            # 1. Chat Template for higher precision
            messages = [
                {"role": "system", "content": "You are a precise forensic AI auditor. Provide a structured sentiment classification based on the forensic evidence provided."},
                {"role": "user", "content": prompt}
            ]
            
            def run_inference():
                try:
                    # Apply Chat Template (e.g. for TinyLlama)
                    formatted_input = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
                    
                    # 2. Tokenization with Device Mapping (Resolves Meta Device error)
                    # Mapping to model.device ensures tensors are on the correct hardware
                    inputs = tokenizer(formatted_input, return_tensors="pt").to(model.device)
                    
                    # 3. Raw Generation (Resolves Parameter conflicts)
                    # We pass parameters explicitly to avoid generation_config collisions
                    # Removed max_length to avoid conflict with max_new_tokens
                    outputs = model.generate(
                        **inputs,
                        max_new_tokens=parameters.get("max_new_tokens", 512) if parameters else 512,
                        temperature=parameters.get("temperature", 0.7) if parameters else 0.7,
                        do_sample=True if (parameters.get("temperature", 0.7) if parameters else 0.7) > 0 else False,
                        top_p=0.95,
                        top_k=50,
                        pad_token_id=tokenizer.eos_token_id
                    )
                    
                    # 4. Decoding (Skip special tokens)
                    decoded = tokenizer.decode(outputs[0], skip_special_tokens=True)
                    
                    # Strip the prompt context if necessary (though chat template often handles this)
                    if decoded.startswith(formatted_input):
                        return decoded[len(formatted_input):].strip()
                    
                    # Alternative stripping for decoded templates (might include systems text)
                    if "assistant" in decoded.lower():
                        # Extract text after the last assistant marker
                        parts = decoded.split("assistant")
                        return parts[-1].strip()
                        
                    return decoded
                except Exception as inner_e:
                    print(f"Raw Generation Failure: {inner_e}")
                    return str(inner_e)

            result = await loop.run_in_executor(None, run_inference)
            return result
        except Exception as e:
            print(f"Local Query Error ({model_id}): {str(e)}")
            return f"LOCAL_FAILURE: {str(e)}"

    async def batch_query(
        self,
        config: ModelConfig,
        prompts: List[Dict[str, Any]]
    ) -> Dict[str, str]:
        """
        Executes multiple queries in parallel for a specific model configuration.
        """
        is_local = getattr(config, 'is_local', False) or self.local_manager.is_model_downloaded(config.model_id)
        
        if is_local:
            results = []
            for p in prompts:
                res = await self.query_model(config.model_id, p["prompt_text"], config.parameters, is_local=True)
                results.append(res)
        else:
            tasks = [
                self.query_model(config.model_id, p["prompt_text"], config.parameters, is_local=False) 
                for p in prompts
            ]
            results = await asyncio.gather(*tasks)
        
        response_map = {}
        for idx, prompt in enumerate(prompts):
            response_map[prompt["id"]] = results[idx]
            
        return response_map
