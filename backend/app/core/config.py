from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "ScholarBridge"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Security
    SECRET_KEY: str = "your-super-secret-key-change-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "sqlite:///./scholarbridge.db"

    # CORS
    FRONTEND_URL: str = "https://scholar-bridge-lyart.vercel.app"

    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 5
    ALLOWED_FILE_TYPES: list = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]

    # Email (optional)
    SMTP_HOST: str = "smtp.mailtrap.io"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = "noreply@scholarbridge.com"
    EMAILS_FROM_NAME: str = "ScholarBridge"

    # Firebase (optional)
    FIREBASE_CREDENTIALS_PATH: str = ""
    FIREBASE_STORAGE_BUCKET: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
