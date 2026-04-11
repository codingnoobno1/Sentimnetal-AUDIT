from fastapi import APIRouter, HTTPException
from core.db import db_manager
from bson import ObjectId

router = APIRouter(prefix="/api/audit", tags=["Audit Status"])

@router.get("/status/{audit_id}")
async def get_audit_status(audit_id: str):
    """
    FOR MOBILE SYNC: Checks the status of an asynchronous forensic audit.
    Returns the 11-dimension report once the Express judge node (3020) has completed processing.
    """
    try:
        if not ObjectId.is_valid(audit_id):
            raise HTTPException(status_code=400, detail="Invalid Audit ID format")
            
        audit = await db_manager.audit_results.find_one({"_id": ObjectId(audit_id)})
        
        if not audit:
            raise HTTPException(status_code=404, detail="Audit record not found")
            
        # Clean up the BSON data for JSON response
        audit["_id"] = str(audit["_id"])
        
        return audit
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
