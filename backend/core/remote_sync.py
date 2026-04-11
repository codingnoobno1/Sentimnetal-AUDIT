import asyncio
import os
from .db import db_manager
from .local_manager import LocalModelManager

class RemoteSyncWatchdog:
    """
    Background worker that monitors MongoDB for remote download requests.
    Allows triggering PC downloads from mobile devices.
    """
    def __init__(self, local_manager: LocalModelManager):
        self.local_manager = local_manager
        self.running = False
        self.poll_interval = 30 # seconds

    async def start(self):
        self.running = True
        print(f"Remote Sync Watchdog started. Polling every {self.poll_interval}s...")
        
        while self.running:
            try:
                await self.check_for_queued_downloads()
            except Exception as e:
                print(f"Watchdog Error during check: {str(e)}")
            
            await asyncio.sleep(self.poll_interval)

    async def stop(self):
        self.running = False
        print("Remote Sync Watchdog stopping...")

    async def check_for_queued_downloads(self):
        """
        Queries MongoDB for models with status 'queued'.
        """
        # Find all queued models
        cursor = db_manager.db.model_registry.find({"status": "queued"})
        queued_models = await cursor.to_list(length=10)

        for model_doc in queued_models:
            model_id = model_doc["model_id"]
            print(f"Remote Request Detected: {model_id}. Initializing auto-download...")
            
            # 1. Update status to 'downloading' to notify mobile user
            await db_manager.db.model_registry.update_one(
                {"model_id": model_id},
                {"$set": {"status": "downloading"}}
            )

            try:
                # 2. Trigger the download process
                # We run this in a background thread using the existing local_manager logic
                await self.local_manager.download_model(model_id)
                
                # 3. Mark as 'ready' once successful
                await db_manager.db.model_registry.update_one(
                    {"model_id": model_id},
                    {"$set": {"status": "ready", "local_path": self.local_manager.get_model_path(model_id)}}
                )
                print(f"Remote Download Success: {model_id} is now available on laptop.")
                
            except Exception as e:
                print(f"Remote Download Failed for {model_id}: {str(e)}")
                await db_manager.db.model_registry.update_one(
                    {"model_id": model_id},
                    {"$set": {"status": "failed"}}
                )

# Factory function to initiate watchdog
def start_watchdog(local_manager: LocalModelManager):
    watchdog = RemoteSyncWatchdog(local_manager)
    # Return the coroutine to be assigned to a background task
    return watchdog.start()
