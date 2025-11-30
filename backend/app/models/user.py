from sqlalchemy import Column, Integer, String, Boolean, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

# Association table for user-feed subscriptions
user_feed_subscriptions = Table(
    'user_feed_subscriptions',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('feed_id', Integer, ForeignKey('feeds.id'), primary_key=True),
    Column('subscribed_at', DateTime, server_default=func.now())
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200))
    
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    created_at = Column(DateTime, server_default=func.now())
    last_login = Column(DateTime)
    
    # Relationships
    subscribed_feeds = relationship(
        "Feed",
        secondary=user_feed_subscriptions,
        backref="subscribers"
    )

class UserPreferences(Base):
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    
    # Feed preferences
    categories = Column(String(500))  # Comma-separated categories
    auto_process = Column(Boolean, default=True)
    notification_enabled = Column(Boolean, default=True)
    
    # Analysis preferences
    cascade_threshold_hours = Column(Integer, default=48)
    min_sources_for_cascade = Column(Integer, default=2)
    
    user = relationship("User", backref="preferences")