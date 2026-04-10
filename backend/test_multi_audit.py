import httpx
import asyncio
import json

BASE_URL = "http://localhost:5000/audit"

async def test_multi_audit():
    payload = {
        "models": [
            {
                "model_id": "cardiffnlp/twitter-roberta-base-sentiment",
                "is_baseline": True,
                "parameters": {"temperature": 0.1, "max_new_tokens": 128}
            },
            {
                "model_id": "distilbert-base-uncased-finetuned-sst-2-english",
                "is_baseline": False,
                "parameters": {"temperature": 0.5, "max_new_tokens": 128}
            }
        ],
        "dataset_description": "Multi-model validation test",
        "domains": ["product_reviews"]
    }

    print("Triggering multi-model audit...", flush=True)
    async with httpx.AsyncClient(timeout=300.0) as client:
        response = await client.post(f"{BASE_URL}/multi", json=payload)
        
        if response.status_code != 200:
            print(f"Error: {response.text}", flush=True)
            return

        result = response.json()
        print(f"Audit Completed! ID: {result['id']}", flush=True)
        print(f"Overall Scores: {result['overall_scores']}", flush=True)
        print(f"Overall Delta: {result['overall_delta']}%", flush=True)
        
        # Verify schema
        print("\nForensic Verification:", flush=True)
        for domain_res in result['domain_results']:
            print(f"Domain: {domain_res['domain']} | Status: {domain_res['status']}")
            for case in domain_res['cases'][:1]:
                print(f"  Example Case Responses: {list(case['model_responses'].keys())}")

if __name__ == "__main__":
    asyncio.run(test_multi_audit())
