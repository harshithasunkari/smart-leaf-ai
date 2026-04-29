import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.advisor_routes import router as advisor_router
from app.api.auth_routes import router as auth_router
from app.api.chat_routes import router as chat_router
from app.api.history_routes import router as history_router
from app.api.predict_routes import router as predict_router
from app.core.config import get_settings
from app.db.session import Base, engine
from app.services.ml_service import ml_service


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    await asyncio.to_thread(ml_service.load)
    yield


settings = get_settings()
app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Smart Leaf Advisor API (spec paths)
app.include_router(advisor_router)

# Optional: auth, legacy /api predict/history, chat
api = settings.api_prefix
app.include_router(auth_router, prefix=api)
app.include_router(predict_router, prefix=api)
app.include_router(history_router, prefix=api)
app.include_router(chat_router, prefix=api)


@app.get("/")
def root():
    return {
        "message": "Smart Leaf Advisor API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": [
            "POST /predict-single",
            "POST /predict-multiple",
            "POST /recommendation",
            "POST /history",
            "GET /history?user_id=",
        ],
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_ready": ml_service.ready,
        "model_error": ml_service.load_error,
    }


@app.get(f"{api}/health")
def health_legacy():
    return {
        "success": True,
        "message": "ok",
        "data": {"model_ready": ml_service.ready},
    }
