from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

from ..core.security import get_current_user
from ..core.supabase_client import supabase

router = APIRouter(prefix="/reading", tags=["reading"])

class ReadPassageRequest(BaseModel):
    passage_id: int
    level_id: int

@router.post("/read")
async def mark_passage_read(req: ReadPassageRequest, user: dict = Depends(get_current_user)):
    firebase_uid = user.get("uid")
    user_res = supabase.table("users").select("id").eq("firebase_uid", firebase_uid).single().execute()
    if not user_res.data:
        return {"error": "User not found"}
        
    user_id = user_res.data["id"]
    
    # Check if a progress row already exists
    progress_res = (
        supabase.table("user_progress")
        .select("id, reading_completed")
        .eq("user_id", user_id)
        .eq("level_id", req.level_id)
        .execute()
    )

    if progress_res.data:
        supabase.table("user_progress").update({
            "reading_completed": True
        }).eq("id", progress_res.data[0]["id"]).execute()
    else:
        supabase.table("user_progress").insert({
            "user_id": user_id,
            "level_id": req.level_id,
            "reading_completed": True
        }).execute()

    return {"status": "success"}
