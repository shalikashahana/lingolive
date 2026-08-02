import json
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from typing import Dict, Any

from ..core.security import get_current_user
from ..core.supabase_client import supabase

router = APIRouter(prefix="/sync", tags=["sync"])

class SyncData(BaseModel):
    local_storage: Dict[str, Any]

@router.post("/")
async def push_sync_data(sync_data: SyncData, user: dict = Depends(get_current_user)):
    firebase_uid = user.get("uid")
    user_res = supabase.table("users").select("id").eq("firebase_uid", firebase_uid).single().execute()
    if not user_res.data:
        return {"error": "User not found"}
        
    user_id = user_res.data["id"]
    
    # We use level_id = 9999 as a special marker for global frontend state in user_progress
    # UPSERT pattern
    existing = supabase.table("user_progress").select("id").eq("user_id", user_id).eq("level_id", 9999).execute()
    
    if existing.data:
        # Update
        supabase.table("user_progress").update({
            "quiz_state": sync_data.local_storage
        }).eq("id", existing.data[0]["id"]).execute()
    else:
        # Insert
        supabase.table("user_progress").insert({
            "user_id": user_id,
            "level_id": 9999,
            "quiz_state": sync_data.local_storage
        }).execute()
        
    return {"status": "synced"}

@router.get("/")
async def pull_sync_data(user: dict = Depends(get_current_user)):
    firebase_uid = user.get("uid")
    user_res = supabase.table("users").select("id").eq("firebase_uid", firebase_uid).single().execute()
    if not user_res.data:
        return {"error": "User not found"}
        
    user_id = user_res.data["id"]
    
    res = supabase.table("user_progress").select("quiz_state").eq("user_id", user_id).eq("level_id", 9999).execute()
    
    if res.data and len(res.data) > 0:
        return {"status": "success", "local_storage": res.data[0].get("quiz_state", {})}
    
    return {"status": "success", "local_storage": {}}
