from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.synthesizer import SynthesisService
from app.services.pattern_detector import PatternDetector
from app.models.article import Article
from app.core.config import settings
from datetime import datetime, timedelta

router = APIRouter(prefix="/synthesis", tags=["synthesis"])

@router.get("/cascade/{entity_name}")
async def synthesize_cascade(entity_name: str, hours: int = Query(48, ge=1, le=168), db: Session = Depends(get_db)):
    """Generate AI synthesis for a specific entity cascade"""
    detector = PatternDetector(db)
    cascades = detector.detect_cascades(hours)
    
    # Find the specific cascade
    cascade = None
    for c in cascades:
        if c['entity'].lower() == entity_name.lower():
            cascade = c
            break
    
    if not cascade:
        raise HTTPException(status_code=404, detail=f"No cascade found for entity: {entity_name}")
    
    synthesizer = SynthesisService(settings.OPENAI_API_KEY)
    synthesis = synthesizer.synthesize_cascade(cascade)
    
    return {
        "entity": entity_name,
        "cascade_data": cascade,
        "synthesis": synthesis
    }

@router.get("/daily-briefing")
async def daily_briefing(db: Session = Depends(get_db)):
    """Generate a daily briefing of top stories and patterns"""
    # Get articles from last 24 hours
    cutoff = datetime.now() - timedelta(hours=24)
    recent_articles = db.query(Article).filter(
        Article.published_date >= cutoff,
        Article.is_processed == True
    ).order_by(Article.published_date.desc()).limit(15).all()
    
    if not recent_articles:
        return {"message": "No recent articles to synthesize"}
    
    # Get cascades
    detector = PatternDetector(db)
    cascades = detector.detect_cascades(24)
    
    # Synthesize
    synthesizer = SynthesisService(settings.OPENAI_API_KEY)
    synthesis = synthesizer.synthesize_multiple_articles(recent_articles)
    
    return {
        "period": "last_24_hours",
        "article_count": len(recent_articles),
        "top_cascades": cascades[:3],
        "synthesis": synthesis,
        "articles": [
            {
                "id": a.id,
                "title": a.title,
                "url": a.url,
                "source": a.source_domain,
                "published": a.published_date.isoformat()
            }
            for a in recent_articles
        ]
    }

@router.get("/top-cascades")
async def synthesize_top_cascades(limit: int = Query(3, ge=1, le=5), db: Session = Depends(get_db)):
    """Get AI synthesis for top cascades"""
    detector = PatternDetector(db)
    cascades = detector.detect_cascades(48)
    
    if not cascades:
        return {"message": "No cascades detected", "syntheses": []}
    
    synthesizer = SynthesisService(settings.OPENAI_API_KEY)
    
    syntheses = []
    for cascade in cascades[:limit]:
        try:
            synthesis = synthesizer.synthesize_cascade(cascade)
            syntheses.append({
                "entity": cascade['entity'],
                "type": cascade['type'],
                "mention_count": cascade['mention_count'],
                "source_count": cascade['source_count'],
                "synthesis": synthesis
            })
        except Exception as e:
            print(f"Error synthesizing cascade for {cascade['entity']}: {str(e)}")
            continue
    
    return {
        "syntheses": syntheses,
        "total_cascades": len(cascades)
    }