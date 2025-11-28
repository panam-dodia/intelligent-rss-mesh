from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # API Settings
    APP_NAME: str = "RSS Intelligence Mesh"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str
    
    # Qdrant
    QDRANT_URL: str
    QDRANT_COLLECTION_NAME: str = "articles"
    
    # OpenAI
    OPENAI_API_KEY: str
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # Processing
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()