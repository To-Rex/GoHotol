from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "XMS Hotel Management"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/xms_db"
    DATABASE_URL_SYNC: str = "postgresql://postgres:postgres@localhost:5432/xms_db"

    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    REDIS_URL: str = "redis://localhost:6379/0"

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@xms.com"

    CORS_ORIGINS: List[str] = ["*"]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
