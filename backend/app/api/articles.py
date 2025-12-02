from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from urllib.parse import urlparse
from app.db.database import get_db
from app.models.article import Article, Feed
from app.models.user import User
from app.core.deps import get_current_active_user

router = APIRouter(prefix="/articles", tags=["articles"])

def extract_root_domain(url: str) -> str:
    """Extract root domain from URL
    Examples:
      https://feeds.arstechnica.com/... -> arstechnica.com
      https://www.wired.com/feed/rss -> wired.com
      https://techcrunch.com/feed/ -> techcrunch.com
    """
    parsed = urlparse(url)
    domain = parsed.netloc  # e.g., feeds.arstechnica.com
    
    # Split by dots
    parts = domain.split('.')
    
    # Get last two parts (root domain)
    if len(parts) >= 2:
        return '.'.join(parts[-2:])  # e.g., arstechnica.com
    
    return domain

@router.get("/")
async def get_articles(
    skip: int = 0,
    limit: int = 20,
    source: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get articles from user's subscribed feeds (last 1 hour only)"""
    user = db.query(User).filter(User.id == current_user.id).first()
    
    # Only show articles from last 1 hour
    one_hour_ago = datetime.now() - timedelta(hours=1)
    
    # If no subscriptions, show ALL recent articles
    if not user.subscribed_feeds:
        print(f"📊 User {current_user.username} has no subscriptions - showing all articles")
        query = db.query(Article).filter(Article.published_date >= one_hour_ago)
    else:
        # Build list of possible source domains from subscribed feeds
        subscribed_domains = []
        for feed in user.subscribed_feeds:
            if not feed.url or feed.url == 'https://example.com/':
                continue  # Skip empty/test feeds
            
            # Extract root domain
            root_domain = extract_root_domain(feed.url)
            subscribed_domains.append(root_domain)
            
            # Also add with www. prefix
            www_domain = f"www.{root_domain}"
            subscribed_domains.append(www_domain)
        
        print(f"📊 User {current_user.username} subscribed domains: {subscribed_domains}")
        
        # Filter articles where source_domain matches any subscribed domain
        query = db.query(Article).filter(
            Article.published_date >= one_hour_ago,
            Article.source_domain.in_(subscribed_domains)
        )
    
    if source:
        query = query.filter(Article.source_domain == source)
    
    articles = query.order_by(Article.published_date.desc()).offset(skip).limit(limit).all()
    
    print(f"📰 Returning {len(articles)} articles for user {current_user.username}")
    
    return articles

@router.get("/{article_id}")
async def get_article(
    article_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific article by ID"""
    article = db.query(Article).filter(Article.id == article_id).first()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return article

@router.get("/{article_id}/similar")
async def get_similar_articles(
    article_id: int,
    limit: int = 5,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get similar articles based on embeddings"""
    from app.services.embedder import Embedder
    
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    embedder = Embedder()
    similar = embedder.find_similar(article.id, limit=limit)
    
    return similar

@router.post("/search")
async def search_articles(
    query: str,
    limit: int = 10,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Semantic search for articles"""
    from app.services.embedder import Embedder
    
    embedder = Embedder()
    results = embedder.semantic_search(query, limit=limit)
    
    return results