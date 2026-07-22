from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessagePayload(BaseModel):
    message: str
    level: Optional[str] = "13"

@router.get("/health")
async def chat_health():
    return {"status": "ok"}

@router.post("/message")
async def send_chat_message(payload: ChatMessagePayload):
    user_text = payload.message.strip()
    level = payload.level or "13"
    
    # Generate intelligent tutor feedback & optional grammar correction
    corrections = None
    if any(phrase in user_text.lower() for phrase in ["very good", "i go", "i think so that"]):
        corrections = {
            "original": user_text,
            "improved": user_text.replace("very good", "exceptionally articulate").replace("i think so that", "I am of the opinion that"),
            "explanation": "At Level C1, replace simple adjectives with precise vocabulary to demonstrate operational fluency."
        }

    reply = f"Thank you for sharing that thought on Level {level}! Communicating with precision and clear structure is key to mastering this level. How would you further elaborate on your perspective?"
    
    return {
        "reply": reply,
        "corrections": corrections
    }
