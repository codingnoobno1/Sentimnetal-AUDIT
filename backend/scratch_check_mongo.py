import asyncio
import sys
import os

# Add backend directory to sys.path so we can import core.db
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.db import db_manager

async def check():
    try:
        count = await db_manager.db['audit_results'].count_documents({})
        print(f"MongoDB Total Records: {count}")
    except Exception as e:
        print(f"Error checking MongoDB: {str(e)}")

if __name__ == "__main__":
    asyncio.run(check())
