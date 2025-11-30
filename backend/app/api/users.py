from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.user import User, UserPreferences
from app.models.article import Feed
from app.models.schemas import (
    UserPreferencesUpdate,
    UserPreferencesResponse
)
from app.core.deps import get_current_active_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/feeds/available")
async def get_available_feeds(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all available feeds with subscription status"""
    all_feeds = db.query(Feed).all()
    user = db.query(User).filter(User.id == current_user.id).first()
    subscribed_ids = {feed.id for feed in user.subscribed_feeds}
    
    return [
        {
            "id": feed.id,
            "url": feed.url,
            "title": feed.title,
            "category": feed.category,
            "description": feed.description,
            "is_subscribed": feed.id in subscribed_ids,
            "last_fetched": feed.last_fetched.isoformat() if feed.last_fetched else None
        }
        for feed in all_feeds
    ]

@router.get("/feeds/subscribed")
async def get_subscribed_feeds(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's subscribed feeds"""
    user = db.query(User).filter(User.id == current_user.id).first()
    
    return [
        {
            "id": feed.id,
            "url": feed.url,
            "title": feed.title,
            "category": feed.category,
            "description": feed.description
        }
        for feed in user.subscribed_feeds
    ]

@router.post("/feeds/{feed_id}/subscribe")
async def subscribe_to_feed(
    feed_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Subscribe to a feed"""
    feed = db.query(Feed).filter(Feed.id == feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")
    
    user = db.query(User).filter(User.id == current_user.id).first()
    
    if feed in user.subscribed_feeds:
        return {"message": "Already subscribed", "is_subscribed": True}
    
    user.subscribed_feeds.append(feed)
    db.commit()
    
    return {"message": f"Subscribed to {feed.title}", "is_subscribed": True}

@router.post("/feeds/{feed_id}/unsubscribe")
async def unsubscribe_from_feed(
    feed_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Unsubscribe from a feed"""
    feed = db.query(Feed).filter(Feed.id == feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")
    
    user = db.query(User).filter(User.id == current_user.id).first()
    
    if feed not in user.subscribed_feeds:
        return {"message": "Not subscribed", "is_subscribed": False}
    
    user.subscribed_feeds.remove(feed)
    db.commit()
    
    return {"message": f"Unsubscribed from {feed.title}", "is_subscribed": False}

@router.get("/preferences", response_model=UserPreferencesResponse)
async def get_user_preferences(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user preferences"""
    prefs = db.query(UserPreferences).filter(
        UserPreferences.user_id == current_user.id
    ).first()
    
    if not prefs:
        prefs = UserPreferences(user_id=current_user.id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    
    return prefs

@router.put("/preferences", response_model=UserPreferencesResponse)
async def update_user_preferences(
    preferences: UserPreferencesUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user preferences"""
    prefs = db.query(UserPreferences).filter(
        UserPreferences.user_id == current_user.id
    ).first()
    
    if not prefs:
        prefs = UserPreferences(user_id=current_user.id)
        db.add(prefs)
    
    update_data = preferences.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prefs, field, value)
    
    db.commit()
    db.refresh(prefs)
    
    return prefs