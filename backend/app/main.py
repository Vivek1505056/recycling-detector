from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.detect import router as detect_router
from app.core.config import settings

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detect_router, prefix="/api", tags=["detection"])


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}

