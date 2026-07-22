from fastapi import APIRouter, Depends

from ..core.security import get_current_user

router = APIRouter(prefix="/quiz", tags=["quiz"])

# Wired up in Phase 6: dynamic MCQ / fill-in-the-blank / error-spotting
# generation. Will read the user's completed levels, vocab, and reading
# progress from Supabase, send it to gemma_service.generate_quiz(), and
# store + return the generated question set.


@router.get("/health")
async def quiz_health(user: dict = Depends(get_current_user)):
    return {"status": "ok", "uid": user.get("uid")}
