import httpx
import json
from ..core.config import settings

async def call_gemma(prompt: str) -> dict:
    """Calls the Google Gemini API to get a JSON response."""
    url = f"{settings.gemma_api_base_url}/models/gemini-1.5-flash:generateContent?key={settings.gemma_api_key}"
    
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, timeout=30.0)
        response.raise_for_status()
        data = response.json()
        
        try:
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text)
        except (KeyError, IndexError, json.JSONDecodeError):
            return {"reply": "I'm sorry, I encountered an error processing that.", "corrections": None}

