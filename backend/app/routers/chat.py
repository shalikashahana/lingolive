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
    
    # Check if frontend provided a dynamic prompt override (e.g. "[Japanese Language Tutor Mode]...")
    if user_text.startswith("[") and "User says:" in user_text:
        parts = user_text.split("User says:", 1)
        if len(parts) == 2:
            custom_prompt = parts[0].strip()
            actual_user_text = parts[1].strip()
            
            full_prompt = f"""{custom_prompt}

In every reply:
1. Respond naturally and conversationally to what the user said.
2. If you notice any mistakes, gently point them out with a better alternative.
3. Keep the conversation going by ending with an interesting follow-up question.
Be warm, friendly, and never condescending.

Output your response ONLY as JSON in this exact format:
{{
  "reply": "Your natural conversational reply, ending with a follow-up question.",
  "corrections": {{
    "original": "the exact phrase the user used that needs improvement",
    "improved": "the better natural phrasing",
    "explanation": "A brief, friendly explanation"
  }}
}}
If there are no mistakes, set "corrections" to null.

User Message: "{actual_user_text}"
"""
        else:
            full_prompt = f"{TUTOR_SYSTEM_PROMPT}\n\nUser Message: \"{user_text}\"\n"
    else:
        full_prompt = f"{TUTOR_SYSTEM_PROMPT}\n\nUser Message: \"{user_text}\"\n"
        
    result = await call_gemma(full_prompt)
    return result


