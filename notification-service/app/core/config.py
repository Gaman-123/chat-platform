from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Notification Service"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/notifications"

    class Config:
        env_file = ".env"

settings = Settings()
