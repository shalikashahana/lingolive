from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any

from ..core.security import get_current_user
from ..core.supabase_client import supabase

router = APIRouter(prefix="/progress", tags=["progress"])

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

@router.get("/dashboard")
async def get_dashboard_levels(user: dict = Depends(get_current_user)):
    firebase_uid = user.get("uid")
    user_res = supabase.table("users").select("id, current_level").eq("firebase_uid", firebase_uid).single().execute()
    if not user_res.data:
        return {"error": "User not found"}
        
    user_id = user_res.data["id"]
    current_level = user_res.data["current_level"]

    # Get all 100 levels
    levels_res = supabase.table("levels").select("*").order("level_number").execute()
    levels = levels_res.data

    # Get all progress for this user
    progress_res = supabase.table("user_progress").select("*").eq("user_id", user_id).execute()
    progress_map = {p["level_id"]: p for p in (progress_res.data or [])}

    dashboard_levels = []
    for lvl in levels:
        level_number = lvl["level_number"]
        lvl_id = lvl["id"]
        prog = progress_map.get(lvl_id, {})
        
        status = "locked"
        stars = 0
        score = prog.get("quiz_best_score", 0)

        if prog.get("completed") or score >= 80:
            status = "completed"
            stars = 3 if score >= 90 else (2 if score >= 80 else 1)
        elif level_number == current_level:
            status = "unlocked"
            if prog.get("quiz_state") and len(prog.get("quiz_state")) > 0:
                status = "in-progress"

        dashboard_levels.append({
            **lvl,
            "status": status,
            "stars": stars,
            "score": score
        })

    return {
        "current_level": current_level,
        "levels": dashboard_levels
    }

@router.post("/reset")
async def reset_user_progress(user: dict = Depends(get_current_user)):
    firebase_uid = user.get("uid")
    user_res = supabase.table("users").select("id").eq("firebase_uid", firebase_uid).single().execute()
    if user_res.data:
        user_id = user_res.data["id"]
        try:
            supabase.table("users").update({"current_level": 1}).eq("id", user_id).execute()
            supabase.table("user_progress").delete().eq("user_id", user_id).execute()
        except Exception as e:
            print("Reset error:", e)
    return {"message": "Progress reset successfully", "current_level": 1}

class TestStateUpdate(BaseModel):
    last_attempted_test_id: int
    quiz_state: Dict[str, Any]

@router.get("/level/{level_id}")
async def get_level_progress(level_id: int, user: dict = Depends(get_current_user)):
    firebase_uid = user.get("uid")
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

    # Upsert progress
    data = {
        "user_id": user_id,
        "level_id": level_id,
        "last_attempted_test_id": state.last_attempted_test_id,
        "quiz_state": state.quiz_state
    }
    
    # Check if quiz finished & passed
    if state.quiz_state.get("quizFinished"):
        score_count = state.quiz_state.get("scoreCount", 0)
        # assuming 10 questions
        score_percentage = (score_count / 10.0) * 100
        data["quiz_best_score"] = score_percentage
        if score_percentage >= 80:
            data["completed"] = True
            # Unlock next level in user table
            supabase.table("users").update({"current_level": level_id + 1}).eq("id", user_id).execute()

    res = supabase.table("user_progress").upsert(data, on_conflict="user_id,level_id").execute()
    return res.data
