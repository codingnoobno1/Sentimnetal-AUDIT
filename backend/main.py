import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# New Modular Imports
from api import audit, test, health, hf, testing, local_models, finetune, audit_status, chat

load_dotenv()

app = FastAPI(
    title="LLM Regression Sentinel - Modular Audit System",
    description="Refined architecture for forensic AI auditing and regression detection.",
    version="2.1.0"
)

# CORS Configuration
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Modular Routers
app.include_router(audit.router)
app.include_router(test.router)
app.include_router(health.router)
app.include_router(hf.router)
app.include_router(testing.router)
app.include_router(local_models.router)
app.include_router(finetune.router)
app.include_router(audit_status.router)
app.include_router(chat.router)

@app.on_event("startup")
async def startup_event():
    """
    Initializes background services on system launch.
    """
    from core.remote_sync import start_watchdog
    from api.local_models import local_manager
    import asyncio
    
    # Start the Remote Sync Watchdog as a non-blocking background task
    asyncio.create_task(start_watchdog(local_manager))
    print("PROMETHEUS: Remote Sync Watchdog initialized.")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
