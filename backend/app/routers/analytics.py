from fastapi import APIRouter, Depends

from ..core.security import get_current_user
from ..core.supabase_client import supabase

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/overview")
async def get_analytics_overview(user: dict = Depends(get_current_user)):
    firebase_uid = user.get("uid")
    user_res = supabase.table("users").select("id").eq("firebase_uid", firebase_uid).single().execute()
    if not user_res.data:
        return {"error": "User not found"}
        
    user_id = user_res.data["id"]
    
    # Fetch all user progress
    progress_res = supabase.table("user_progress").select("*").eq("user_id", user_id).execute()
    
    words_learned = 0
    stories_read = 0
    modules_completed = 0
    
    if progress_res.data:
        for p in progress_res.data:
            words_learned += len(p.get("vocab_learned_ids") or [])
            if p.get("reading_completed"):
                stories_read += 1
            if p.get("test_passed"):
                modules_completed += 1
                
    # Return aggregated data matching the frontend's INITIAL_ANALYTICS structure
    return {
        "streak_days": 1,
        "xp_points": modules_completed * 150 + stories_read * 50,
        "cefr_distribution": [
            { "band": 'A1', "percentage": 100 if modules_completed >= 1 else 0 },
            { "band": 'A2', "percentage": min(100, modules_completed * 2) },
            { "band": 'B1', "percentage": 0 },
            { "band": 'B2', "percentage": 0 },
            { "band": 'C1', "percentage": 0 },
            { "band": 'C2', "percentage": 0 }
        ],
        "words_learned_count": words_learned,
        "idioms_mastered_count": 0,
        "sentences_practiced_count": 0,
        "vocab_accuracy": 90,
        "stories_read_count": stories_read,
        "reading_comprehension_score": 100 if stories_read > 0 else 0,
        "reading_speed_wpm": 0,
        "conversations_count": 0,
        "gemma_skills": {
            "grammatical_accuracy": 0,
            "vocabulary_variety": 0,
            "pronunciation": 0,
            "conversational_fluency": 0
        },
        "average_accuracy": 100 if modules_completed > 0 else 0,
        "grammar_modules_completed": modules_completed
    }


@router.get("/health")
async def analytics_health(user: dict = Depends(get_current_user)):
    return {"status": "ok", "uid": user.get("uid")}
