from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from ..services.gemma_service import call_gemma
from ..services.prompt_templates import TUTOR_SYSTEM_PROMPT

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessagePayload(BaseModel):
    message: str
    level: Optional[str] = None

@router.get("/health")
async def chat_health():
    return {"status": "ok"}

@router.post("/message")
async def send_chat_message(payload: ChatMessagePayload):
    user_text = payload.message.strip()
    full_prompt = f"{TUTOR_SYSTEM_PROMPT}\n\nUser Message: \"{user_text}\"\n"
    result = await call_gemma(full_prompt)
    return result


