import httpx

from ..core.config import settings


async def call_gemma(messages: list[dict], max_tokens: int = 512) -> str:
    """Thin wrapper around the Gemma API. Filled in during Phase 4
    (conversational tutor) and Phase 6 (dynamic quiz generation)."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.gemma_api_base_url}/generate",
            headers={"Authorization": f"Bearer {settings.gemma_api_key}"},
            json={"messages": messages, "max_tokens": max_tokens},
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        return data.get("text", "")
