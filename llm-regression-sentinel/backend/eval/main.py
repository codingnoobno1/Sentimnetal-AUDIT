from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List
import json
from prometheus_scorer import PrometheusEvaluator

app = FastAPI(title="LLM Regression Sentinel - Eval Engine")

class EvalRequest(BaseModel):
    base_responses: Dict[str, str]
    fine_tuned_responses: Dict[str, str]

@app.get("/")
async def root():
    return {"message": "Sentinel Evaluation Engine is active"}

@app.get("/test-suites")
async def get_suites():
    try:
        with open('test_cases.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Test cases.json not found")

@app.post("/evaluate")
async def run_evaluation(request: EvalRequest):
    try:
        evaluator = PrometheusEvaluator('test_cases.json')
        report = evaluator.run_suite(request.base_responses, request.fine_tuned_responses)
        
        # Calculate overall stats
        total = len(report)
        regressions = len([r for r in report if r['status'] == 'regression'])
        improvements = len([r for r in report if r['status'] == 'improved'])
        
        return {
            "summary": {
                "total_cases": total,
                "regressions": regressions,
                "improvements": improvements,
                "status": "Warning" if regressions > 0 else "Stable"
            },
            "detailed_report": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
