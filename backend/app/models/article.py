from sqlalchemy import Column, Integer, String, Text, DateTime, Float, JSON, Boolean
from sqlalchemy.sql import func
from app.db.database import Base

class Article(Base):
    __tablename__ = "articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    url = Column(String(1000), unique=True, nullable=False, index=True)
    content = Column(Text)
    summary = Column(Text)
    author = Column(String(200))
    source_domain = Column(String(200), index=True)
    published_date = Column(DateTime, index=True)
    fetched_date = Column(DateTime, server_default=func.now())
    
    # Processing status
    is_processed = Column(Boolean, default=False)
    embedding_id = Column(String(100))  # Qdrant point ID
    
    # Extracted data
    entities = Column(JSON)  # List of extracted entities
    topics = Column(JSON)    # List of topics
    sentiment_score = Column(Float)
    
    # Metadata
    meta = Column(JSON)  # CHANGED from metadata to meta

class Feed(Base):
    __tablename__ = "feeds"
    
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(1000), unique=True, nullable=False)
    title = Column(String(500))
    description = Column(Text)
    category = Column(String(100))
    is_active = Column(Boolean, default=True)
    last_fetched = Column(DateTime)
    fetch_interval = Column(Integer, default=1800)  # seconds
    created_at = Column(DateTime, server_default=func.now())

class Entity(Base):
    __tablename__ = "entities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, index=True)
    entity_type = Column(String(50))  # PERSON, ORG, GPE, etc.
    first_seen = Column(DateTime, server_default=func.now())
    mention_count = Column(Integer, default=1)
    meta = Column(JSON)  # CHANGED from metadata to meta