from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://@localhost/university_db"
    REDIS_URL: str = "redis://localhost:6379"

settings = Settings()