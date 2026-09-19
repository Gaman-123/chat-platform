from fastapi import FastAPI
from app.api.notifications import router as notifications_router

app = FastAPI(
    title="Notification Service",
    description="Python/FastAPI microservice for the Cloud Native Chat Platform",
    version="1.0.0"
)

app.include_router(notifications_router, prefix="/api/notifications", tags=["notifications"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "notification-service"}
