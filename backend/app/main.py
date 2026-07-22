from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .routers import chat, quiz, progress, analytics

app = FastAPI(title="LingoLive API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(progress.router)
app.include_router(chat.router)
app.include_router(quiz.router)
app.include_router(analytics.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
