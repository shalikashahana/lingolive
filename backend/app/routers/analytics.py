from fastapi import APIRouter, Depends

from ..core.security import get_current_user
from ..core.supabase_client import supabase

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/overview")
async def get_analytics_overview(user: dict = Depends(get_current_user)):
    firebase_uid = user.get("uid")
    user_res = supabase.table("users").select("id, current_level").eq("firebase_uid", firebase_uid).single().execute()
    if not user_res.data:
        return {"error": "User not found"}
        
    user_id = user_res.data["id"]
    current_level = user_res.data.get("current_level") or 1
    
    # Fetch all user progress
    progress_res = supabase.table("user_progress").select("*").eq("user_id", user_id).execute()
    
    words_learned_set = set()
    stories_read = 0
    modules_completed = 0
    sentences_practiced = 0
    idioms_mastered = 0
    
    # Track daily activity minutes if updated_at is present
    weekly_activity_map = {"Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0}
    
    if progress_res.data:
        for p in progress_res.data:
            learned_ids = p.get("vocab_learned_ids") or []
            for wid in learned_ids:
                words_learned_set.add(wid)
                
            if p.get("reading_completed"):
                stories_read += 1
            if p.get("completed") or p.get("test_passed") or (p.get("quiz_best_score") or 0) >= 80:
                modules_completed += 1
            if p.get("quiz_state"):
                quiz_state = p.get("quiz_state")
                if isinstance(quiz_state, dict):
                    sentences_practiced += quiz_state.get("sentencesPracticed", 0)
                    idioms_mastered += quiz_state.get("idiomsMastered", 0)

    words_learned = len(words_learned_set)
    xp_points = (modules_completed * 100) + (stories_read * 50) + (words_learned * 10) + (sentences_practiced * 5)
    
    # Determine CEFR band based on level
    cefr = "A1"
    if current_level > 80:
        cefr = "C2"
    elif current_level > 60:
        cefr = "C1"
    elif current_level > 45:
        cefr = "B2"
    elif current_level > 30:
        cefr = "B1"
    elif current_level > 15:
        cefr = "A2"

    # Calculate streak (0 if no progress completed)
    streak_days = 0
    if modules_completed > 0 or words_learned > 0 or stories_read > 0:
        streak_days = max(1, min(modules_completed, 30))

    # Weekly activity data formatting
    weekly_activity = [
        {"day": day, "minutes": weekly_activity_map[day]}
        for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    ]

    # Achievements calculation
    achievements = [
        {
            "id": "streak_master",
            "title": "Streak Master",
            "description": "Maintain a 5-day practice streak",
            "unlocked": streak_days >= 5,
            "progress_text": f"{min(streak_days, 5)}/5 days",
            "category": "streak"
        },
        {
            "id": "grammar_guru",
            "title": "Grammar Guru",
            "description": "Pass 10 grammar modules",
            "unlocked": modules_completed >= 10,
            "progress_text": f"{min(modules_completed, 10)}/10 modules",
            "category": "grammar"
        },
        {
            "id": "idiom_titan",
            "title": "Idiom Titan",
            "description": "Master 50 native idioms",
            "unlocked": idioms_mastered >= 50,
            "progress_text": f"{min(idioms_mastered, 50)}/50 idioms",
            "category": "idioms"
        }
    ]

    # Check current level completion status for Today's Mission
    current_level_progress = {}
    if progress_res.data:
        for p in progress_res.data:
            if p.get("level_id") == current_level:
                current_level_progress = p
                break

    mission_completed_grammar = bool(current_level_progress.get("completed") or (current_level_progress.get("quiz_best_score") or 0) >= 80)
    mission_completed_sentences = bool(sentences_practiced > 0)
    mission_completed_reading = bool(current_level_progress.get("reading_completed"))

    today_mission = {
        "title": f"Level {current_level} Mission",
        "reward_xp": 100,
        "items": [
            {
                "id": 1,
                "text": f"Complete Level {current_level} Grammar & Quiz",
                "completed": mission_completed_grammar,
                "path": "/grammar"
            },
            {
                "id": 2,
                "text": "Practice Daily Sentences with Audio",
                "completed": mission_completed_sentences,
                "path": "/sentences"
            },
            {
                "id": 3,
                "text": "Read 1 Short Story & Answer Quiz",
                "completed": mission_completed_reading,
                "path": "/story"
            }
        ]
    }

    return {
        "streak_days": streak_days,
        "xp_points": xp_points,
        "current_level": current_level,
        "cefr_band": cefr,
        "next_level_xp": current_level * 100,
        "interview_readiness": None,  # Not Available for new users
        "words_learned_count": words_learned,
        "vocab_total": 200,
        "weekly_activity": weekly_activity,
        "achievements": achievements,
        "today_mission": today_mission,
        "stories_read_count": stories_read,
        "grammar_modules_completed": modules_completed,
        "idioms_mastered_count": idioms_mastered,
        "sentences_practiced_count": sentences_practiced,
        "cefr_distribution": [
            { "band": 'A1', "percentage": 100 if current_level <= 15 else 0 },
            { "band": 'A2', "percentage": 100 if 16 <= current_level <= 30 else 0 },
            { "band": 'B1', "percentage": 100 if 31 <= current_level <= 45 else 0 },
            { "band": 'B2', "percentage": 100 if 46 <= current_level <= 60 else 0 },
            { "band": 'C1', "percentage": 100 if 61 <= current_level <= 80 else 0 },
            { "band": 'C2', "percentage": 100 if current_level > 80 else 0 }
        ],
        "vocab_accuracy": 100 if words_learned > 0 else 0,
        "reading_comprehension_score": 100 if stories_read > 0 else 0,
        "reading_speed_wpm": 0,
        "conversations_count": 0,
        "gemma_skills": {
            "grammatical_accuracy": 0,
            "vocabulary_variety": 0,
            "pronunciation": 0,
            "conversational_fluency": 0
        },
        "average_accuracy": 100 if modules_completed > 0 else 0
    }


@router.get("/health")
async def analytics_health(user: dict = Depends(get_current_user)):
    return {"status": "ok", "uid": user.get("uid")}
