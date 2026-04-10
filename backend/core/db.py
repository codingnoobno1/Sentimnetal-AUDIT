import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "ForensicAudit"

class MongoDBManager:
    def __init__(self):
        self.client = AsyncIOMotorClient(MONGO_URI)
        self.db = self.client[DB_NAME]
        
        # Collections
        self.prompts = self.db.prompts
        self.audit_results = self.db.audit_results
        self.metrics = self.db.metrics

    async def ping(self):
        try:
            await self.client.admin.command('ping')
            return True
        except Exception:
            return False

# Global instance
db_manager = MongoDBManager()
