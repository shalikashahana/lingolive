from fastapi import APIRouter, Depends

from ..core.security import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

# Wired up in Phase 7: daily rollups of time spent, words learned,
# conversation scores, and quiz accuracy for the analytics dashboard.


@router.get("/health")
async def analytics_health(user: dict = Depends(get_current_user)):
    return {"status": "ok", "uid": user.get("uid")}
