from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.db.database import get_db
from app.models.article import Article
from app.services.embedder import EmbeddingService
from app.core.deps import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/articles", tags=["articles"])

class ArticleResponse(BaseModel):
    id: int
    title: str
    url: str
    summary: str | None
    author: str | None
    source_domain: str
    published_date: datetime | None
    is_processed: bool
    entities: dict | None
    topics: dict | None
    sentiment_score: float | None
    
    class Config:
        from_attributes = True

class SimilarArticle(BaseModel):
    article_id: int
    title: str
    url: str
    similarity_score: float

@router.get("/", response_model=List[ArticleResponse])
async def get_articles(
    skip: int = 0,
    limit: int = 20,
    source: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get articles from user's subscribed feeds"""
    user = db.query(User).filter(User.id == current_user.id).first()
    
    # If no subscriptions, show all (for first-time users)
    if not user.subscribed_feeds:
        query = db.query(Article)
    else:
        # Get source domains from subscribed feeds
        subscribed_domains = [feed.url.split('/')[2] if '/' in feed.url else feed.url.replace('https://', '').replace('http://', '').split('/')[0] for feed in user.subscribed_feeds]
        query = db.query(Article).filter(Article.source_domain.in_(subscribed_domains))
    
    if source:
        query = query.filter(Article.source_domain == source)
    
    articles = query.order_by(Article.published_date.desc()).offset(skip).limit(limit).all()
    return articles

@router.get("/{article_id}/similar", response_model=List[SimilarArticle])
async def get_similar_articles(article_id: int, limit: int = 10, db: Session = Depends(get_db)):
    """Find articles similar to the given article"""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    if not article.is_processed:
        raise HTTPException(status_code=400, detail="Article not yet processed")
    
    embedder = EmbeddingService()
    results = embedder.search_similar_to_article(article_id, limit)
    
    similar_articles = []
    for result in results:
        similar_articles.append(SimilarArticle(
            article_id=result.payload['article_id'],
            title=result.payload['title'],
            url=db.query(Article).filter(Article.id == result.payload['article_id']).first().url,
            similarity_score=result.score
        ))
    
    return similar_articles

@router.post("/search")
async def search_articles(query: str = Query(..., min_length=3)):
    """Search for articles by text query"""
    embedder = EmbeddingService()
    results = embedder.search_similar(query, limit=20)
    
    return {
        "query": query,
        "results": [
            {
                "article_id": r.payload['article_id'],
                "title": r.payload['title'],
                "score": r.score
            }
            for r in results
        ]
    }