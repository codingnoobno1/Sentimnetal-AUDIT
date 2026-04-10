import json
from pathlib import Path
from typing import List, Dict, Any

class PromptEngine:
    def __init__(self, prompt_file: str = "prompts.json"):
        self.prompt_file = Path(prompt_file)

    def load_prompts(self) -> List[Dict[str, Any]]:
        """
        Loads the prompt set from the JSON storage.
        """
        if not self.prompt_file.exists():
            return []
            
        with open(self.prompt_file, "r") as f:
            data = json.load(f)
            
        return data.get("prompts", [])

    def filter_by_domain(self, domain: str) -> List[Dict[str, Any]]:
        """
        Filters prompts by a specific domain (e.g., 'arithmetic', 'product_reviews').
        """
        prompts = self.load_prompts()
        return [p for p in prompts if p.get("domain") == domain]
