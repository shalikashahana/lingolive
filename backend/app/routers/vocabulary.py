from fastapi import APIRouter, Depends

from ..core.security import get_current_user
from ..core.supabase_client import supabase

router = APIRouter(prefix="/vocabulary", tags=["vocabulary"])

@router.get("/{level_id}")
async def get_vocabulary(level_id: int, user: dict = Depends(get_current_user)):
    # Fetch vocabulary words for this level
    vocab_res = supabase.table("vocabulary").select("*").eq("level_id", level_id).execute()
    vocab_list = vocab_res.data
    
    # Get user progress to know which words are learned
    firebase_uid = user.get("uid")
    user_res = supabase.table("users").select("id").eq("firebase_uid", firebase_uid).single().execute()
    if not user_res.data:
        return {"vocabulary": vocab_list, "learned_ids": []}
        
    user_id = user_res.data["id"]
    progress_res = supabase.table("user_progress").select("vocab_learned_ids").eq("user_id", user_id).eq("level_id", level_id).execute()
    
    learned_ids = []
    if progress_res.data:
        learned_ids = progress_res.data[0].get("vocab_learned_ids", [])
        
    return {
        "vocabulary": vocab_list,
        "learned_ids": learned_ids
    }

from pydantic import BaseModel
from typing import List

class LearnVocabRequest(BaseModel):
    learned_ids: List[int]

@router.post("/{level_id}/learn")
async def update_learned_vocabulary(level_id: int, req: LearnVocabRequest, user: dict = Depends(get_current_user)):
    firebase_uid = user.get("uid")
    user_res = supabase.table("users").select("id").eq("firebase_uid", firebase_uid).single().execute()
    if not user_res.data:
        return {"error": "User not found"}
        
    user_id = user_res.data["id"]
    
    # Check if a progress row already exists
    progress_res = (
        supabase.table("user_progress")
        .select("id")
        .eq("user_id", user_id)
        .eq("level_id", level_id)
        .execute()
    )

    if progress_res.data:
        supabase.table("user_progress").update({
            "vocab_learned_ids": req.learned_ids
        }).eq("id", progress_res.data[0]["id"]).execute()
    else:
        supabase.table("user_progress").insert({
            "user_id": user_id,
            "level_id": level_id,
            "vocab_learned_ids": req.learned_ids
        }).execute()

    return {"status": "success"}
