import httpx
import json
from ..core.config import settings

async def call_gemma(prompt: str) -> dict:
    """Calls the Google Gemini API to get a JSON response."""
    url = f"{settings.gemma_api_base_url}/models/gemini-2.5-flash:generateContent?key={settings.gemma_api_key}"
    
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

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, json=payload, timeout=60.0)
        response.raise_for_status()
        data = response.json()
        
        try:
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            # Clean markdown JSON block formatting if returned by model
            if raw_text.startswith("```"):
                raw_text = raw_text.split("\n", 1)[-1]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                raw_text = raw_text.strip()
            return json.loads(raw_text)
        except (KeyError, IndexError, json.JSONDecodeError) as e:
            print("JSON parse fallback error:", e)
            return {
                "reply": "That's an interesting topic! Could you elaborate a bit more on that?",
                "corrections": None
            }

