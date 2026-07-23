from fastapi import APIRouter, Depends

from ..core.security import get_current_user

router = APIRouter(prefix="/quiz", tags=["quiz"])

from ..services.gemma_service import call_gemma
from ..services.prompt_templates import QUIZ_GENERATION_PROMPT
from ..core.supabase_client import supabase

@router.get("/generate/{level_id}")
async def generate_quiz(level_id: int, user: dict = Depends(get_current_user)):
    # Fetch level info
    level_res = supabase.table("levels").select("*").eq("level_number", level_id).single().execute()
    cefr_band = "B2"
    if level_res.data:
        cefr_band = level_res.data.get("cefr_band", "B2")

    prompt = QUIZ_GENERATION_PROMPT.format(level_number=level_id, cefr_band=cefr_band)
    
    result = await call_gemma(prompt)
    
    # Store attempt (optional for now, let's just return it)
    return result


@router.get("/health")
async def quiz_health(user: dict = Depends(get_current_user)):
    return {"status": "ok", "uid": user.get("uid")}
