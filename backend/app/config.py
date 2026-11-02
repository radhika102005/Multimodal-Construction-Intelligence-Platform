"""
Configuration settings for the Multimodal Construction Intelligence Platform.
Reads from environment variables and provides sensible defaults for local development
and Render 512MB RAM free-tier deployment.
"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Server Binding
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"

    # CORS
    FRONTEND_ORIGINS: str = "*"

    # AI Configuration (supports 'gemini', 'openai', 'mock')
    AI_PROVIDER: str = "gemini"
    AI_API_KEY: str = ""
    AI_MODEL: str = "gemini-1.5-flash"

    # Uploads & Limits (tuned for 512MB RAM)
    MAX_UPLOAD_MB: int = 10
    REQUEST_TIMEOUT_SECONDS: int = 45

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins(self) -> List[str]:
        if not self.FRONTEND_ORIGINS or self.FRONTEND_ORIGINS.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.FRONTEND_ORIGINS.split(",") if origin.strip()]

    @property
    def is_ai_configured(self) -> bool:
        return bool(self.AI_API_KEY and len(self.AI_API_KEY.strip()) > 5)


settings = Settings()
