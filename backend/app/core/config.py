from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LogMind AI"
    DATABASE_URL: str = "postgresql://user:password@db:5432/logmind"
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    openai_api_key: str = "your-openai-api-key"

    class Config:
        env_file = ".env"

settings = Settings()
