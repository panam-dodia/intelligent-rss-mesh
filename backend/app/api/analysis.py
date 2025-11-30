from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.services.pattern_detector import PatternDetector
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.article import Feed

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.get("/cascades")
async def get_cascades(hours: int = Query(48, ge=1, le=168), db: Session = Depends(get_db)):
    """Detect information cascades in the last N hours"""
    detector = PatternDetector(db)
    cascades = detector.detect_cascades(hours)
    
    return {
        "time_window_hours": hours,
        "cascades_detected": len(cascades),
        "cascades": cascades[:10]
    }

@router.get("/trending")
async def get_trending(hours: int = Query(24, ge=1, le=168), db: Session = Depends(get_db)):
    """Get trending topics"""
    detector = PatternDetector(db)
    trending = detector.get_trending_topics(hours)
    
    return {
        "time_window_hours": hours,
        "trending_topics": trending
    }

@router.get("/entity/{entity_name}/timeline")
async def get_entity_timeline(entity_name: str, days: int = Query(30, ge=1, le=90), db: Session = Depends(get_db)):
    """Get timeline of mentions for a specific entity"""
    detector = PatternDetector(db)
    timeline = detector.get_entity_timeline(entity_name, days)
    
    return {
        "entity": entity_name,
        "days": days,
        "mentions": len(timeline),
        "timeline": timeline
    }

@router.get("/sources")
async def get_source_stats(db: Session = Depends(get_db)):
    """Get statistics by source"""
    detector = PatternDetector(db)
    stats = detector.get_source_statistics()
    
    return {
        "sources": stats,
        "total_sources": len(stats)
    }