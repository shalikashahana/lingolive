from fastapi import APIRouter, Depends

from ..core.security import get_current_user
from ..core.supabase_client import supabase

router = APIRouter(prefix="/progress", tags=["progress"])

# Wired up in Phase 2 onward: level unlock logic, vocab-learned tracking,
# reading completion tracking. CRUD against the user_progress table.


@router.get("/me")
async def get_my_progress(user: dict = Depends(get_current_user)):
    firebase_uid = user.get("uid")
    result = (
        supabase.table("users")
        .select("*, user_progress(*)")
        .eq("firebase_uid", firebase_uid)
        .execute()
    )
    return result.data

from pydantic import BaseModel
from typing import Optional, Dict, Any

class TestStateUpdate(BaseModel):
    last_attempted_test_id: int
    quiz_state: Dict[str, Any]

@router.get("/level/{level_id}")
async def get_level_progress(level_id: int, user: dict = Depends(get_current_user)):
    firebase_uid = user.get("uid")
    # First get the user's UUID
    user_res = supabase.table("users").select("id").eq("firebase_uid", firebase_uid).single().execute()
    user_id = user_res.data["id"]

    progress_res = (
        supabase.table("user_progress")
        .select("*")
        .eq("user_id", user_id)
        .eq("level_id", level_id)
        .execute()
    )
    
    if not progress_res.data:
        return {"last_attempted_test_id": 0, "quiz_state": {}}
    return progress_res.data[0]

@router.post("/level/{level_id}/test-state")
async def update_test_state(level_id: int, state: TestStateUpdate, user: dict = Depends(get_current_user)):
    firebase_uid = user.get("uid")
    user_res = supabase.table("users").select("id").eq("firebase_uid", firebase_uid).single().execute()
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
        # Update existing
        supabase.table("user_progress").update({
            "last_attempted_test_id": state.last_attempted_test_id,
            "quiz_state": state.quiz_state
        }).eq("id", progress_res.data[0]["id"]).execute()
    else:
        # Insert new
        supabase.table("user_progress").insert({
            "user_id": user_id,
            "level_id": level_id,
            "last_attempted_test_id": state.last_attempted_test_id,
            "quiz_state": state.quiz_state
        }).execute()

    return {"status": "success"}
