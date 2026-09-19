from fastapi import FastAPI

app = FastAPI(
    title="Notification Service",
    description="Python/FastAPI microservice for the Cloud Native Chat Platform",
    version="1.0.0"
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "notification-service"}
