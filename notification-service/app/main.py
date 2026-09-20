from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.notifications import router as notifications_router
from app.core.database import engine, Base
import app.models.db_notification  # Ensures models are registered with Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create table schemas on startup in PostgreSQL / Neon
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="Notification Service",
    description="Python/FastAPI microservice for the Cloud Native Chat Platform",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(notifications_router, prefix="/api/notifications", tags=["notifications"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "notification-service"}
