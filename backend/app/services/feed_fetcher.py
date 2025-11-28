import feedparser
from datetime import datetime
from typing import List, Dict, Optional
import httpx
from newspaper import Article as NewsArticle
from app.models.article import Feed, Article
from sqlalchemy.orm import Session

class FeedFetcher:
    def __init__(self, db: Session):
        self.db = db
    
    async def fetch_feed(self, feed_url: str) -> List[Dict]:
        """Fetch and parse RSS feed"""
        try:
            parsed = feedparser.parse(feed_url)
            articles = []
            
            for entry in parsed.entries:
                article_data = {
                    'title': entry.get('title', ''),
                    'url': entry.get('link', ''),
                    'summary': entry.get('summary', ''),
                    'author': entry.get('author', ''),
                    'published_date': self._parse_date(entry.get('published')),
                    'source_domain': self._extract_domain(entry.get('link', ''))
                }
                articles.append(article_data)
            
            return articles
        except Exception as e:
            print(f"Error fetching feed {feed_url}: {str(e)}")
            return []
    
    async def extract_full_content(self, url: str) -> Optional[str]:
        """Extract full article content from URL"""
        try:
            article = NewsArticle(url)
            article.download()
            article.parse()
            return article.text
        except Exception as e:
            print(f"Error extracting content from {url}: {str(e)}")
            return None
    
    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse date string to datetime"""
        if not date_str:
            return None
        try:
            from email.utils import parsedate_to_datetime
            return parsedate_to_datetime(date_str)
        except:
            return None
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL"""
        try:
            from urllib.parse import urlparse
            return urlparse(url).netloc
        except:
            return ""
    
    async def save_articles(self, articles: List[Dict]) -> int:
        """Save articles to database"""
        saved_count = 0
        
        for article_data in articles:
            # Check if article already exists
            existing = self.db.query(Article).filter(
                Article.url == article_data['url']
            ).first()
            
            if existing:
                continue
            
            # Extract full content
            full_content = await self.extract_full_content(article_data['url'])
            if full_content:
                article_data['content'] = full_content
            
            # Create new article
            article = Article(**article_data)
            self.db.add(article)
            saved_count += 1
        
        self.db.commit()
        return saved_count