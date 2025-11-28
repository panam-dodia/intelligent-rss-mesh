from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, HttpUrl
from datetime import datetime
from app.db.database import get_db
from app.models.article import Feed, Article
from app.services.feed_fetcher import FeedFetcher

router = APIRouter(prefix="/feeds", tags=["feeds"])

class FeedCreate(BaseModel):
    url: HttpUrl
    title: str = ""
    description: str = ""
    category: str = "general"

class FeedResponse(BaseModel):
    id: int
    url: str
    title: str
    category: str
    is_active: bool
    last_fetched: datetime | None
    
    class Config:
        from_attributes = True

@router.post("/", response_model=FeedResponse)
async def add_feed(feed: FeedCreate, db: Session = Depends(get_db)):
    """Add a new RSS feed"""
    # Check if feed already exists
    existing = db.query(Feed).filter(Feed.url == str(feed.url)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Feed already exists")
    
    new_feed = Feed(
        url=str(feed.url),
        title=feed.title,
        description=feed.description,
        category=feed.category
    )
    
    db.add(new_feed)
    db.commit()
    db.refresh(new_feed)
    
    return new_feed

@router.get("/", response_model=List[FeedResponse])
async def get_feeds(db: Session = Depends(get_db)):
    """Get all feeds"""
    feeds = db.query(Feed).all()
    return feeds

@router.post("/{feed_id}/fetch")
async def fetch_feed(feed_id: int, db: Session = Depends(get_db)):
    """Fetch articles from a specific feed"""
    feed = db.query(Feed).filter(Feed.id == feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")
    
    fetcher = FeedFetcher(db)
    articles = await fetcher.fetch_feed(feed.url)
    saved_count = await fetcher.save_articles(articles)
    
    # Update last_fetched
    feed.last_fetched = datetime.now()
    db.commit()
    
    return {
        "feed_id": feed_id,
        "articles_found": len(articles),
        "articles_saved": saved_count,
        "message": f"Successfully fetched {saved_count} new articles"
    }