from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.article import Article, Entity
from datetime import datetime, timedelta
from typing import List, Dict
from collections import Counter
import json
from typing import List, Dict, Set

class PatternDetector:
    def __init__(self, db: Session):
        self.db = db
    
    def detect_cascades(self, hours: int = 48) -> List[Dict]:
        """Detect information cascades - topics spreading across sources"""
        cutoff = datetime.now() - timedelta(hours=hours)
        
        # Get recent articles
        recent_articles = self.db.query(Article).filter(
            Article.published_date >= cutoff,
            Article.is_processed == True
        ).all()
    
        if not recent_articles:
            return []
        
        # Extract all entities from recent articles
        entity_mentions = {}
        
        for article in recent_articles:
            if article.entities:
                entities = article.entities.get('entities', [])
                for entity in entities:
                    entity_key = (entity['text'].lower(), entity['type'])
                    
                    if entity_key not in entity_mentions:
                        entity_mentions[entity_key] = {
                            'text': entity['text'],
                            'type': entity['type'],
                            'sources': set(),
                            'articles': [],
                            'first_seen': article.published_date,
                            'last_seen': article.published_date
                        }
                    
                    entity_mentions[entity_key]['sources'].add(article.source_domain)
                    entity_mentions[entity_key]['articles'].append({
                        'id': article.id,
                        'title': article.title,
                        'url': article.url,
                        'published_date': article.published_date.isoformat(),
                        'source': article.source_domain
                    })
                    
                    if article.published_date < entity_mentions[entity_key]['first_seen']:
                        entity_mentions[entity_key]['first_seen'] = article.published_date
                    if article.published_date > entity_mentions[entity_key]['last_seen']:
                        entity_mentions[entity_key]['last_seen'] = article.published_date
        
        # Find cascades (entities mentioned by multiple sources)
        cascades = []
        for entity_key, data in entity_mentions.items():
            if len(data['sources']) >= 2:  # At least 2 different sources
                # Calculate velocity
                time_span = (data['last_seen'] - data['first_seen']).total_seconds() / 3600  # hours
                velocity = len(data['articles']) / max(time_span, 1)
                
                cascades.append({
                    'entity': data['text'],
                    'type': data['type'],
                    'mention_count': len(data['articles']),
                    'source_count': len(data['sources']),
                    'sources': list(data['sources']),
                    'velocity': round(velocity, 2),
                    'first_seen': data['first_seen'].isoformat(),
                    'last_seen': data['last_seen'].isoformat(),
                    'articles': data['articles']
                })
        
        # Sort by mention count and source diversity
        cascades.sort(key=lambda x: (x['source_count'], x['mention_count']), reverse=True)
        
        return cascades
    
    def get_entity_timeline(self, entity_name: str, days: int = 30) -> List[Dict]:
        """Get timeline of entity mentions"""
        cutoff = datetime.now() - timedelta(days=days)
        
        articles = self.db.query(Article).filter(
            Article.published_date >= cutoff,
            Article.is_processed == True
        ).order_by(Article.published_date).all()
        
        timeline = []
        for article in articles:
            if article.entities:
                entities = article.entities.get('entities', [])
                for entity in entities:
                    if entity['text'].lower() == entity_name.lower():
                        timeline.append({
                            'date': article.published_date.isoformat(),
                            'article_id': article.id,
                            'title': article.title,
                            'url': article.url,
                            'source': article.source_domain
                        })
                        break
        
        return timeline
    
    def get_trending_topics(self, hours: int = 24) -> List[Dict]:
        """Get trending topics based on entity frequency"""
        cutoff = datetime.now() - timedelta(hours=hours)
        
        recent_articles = self.db.query(Article).filter(
            Article.published_date >= cutoff,
            Article.is_processed == True
        ).all()
        
        entity_counter = Counter()
        entity_types = {}
        
        for article in recent_articles:
            if article.entities:
                entities = article.entities.get('entities', [])
                for entity in entities:
                    key = entity['text'].lower()
                    entity_counter[key] += 1
                    entity_types[key] = entity['type']
        
        trending = [
            {
                'entity': name,
                'type': entity_types[name],
                'mentions': count
            }
            for name, count in entity_counter.most_common(20)
        ]
        
        return trending
    
    def get_source_statistics(self) -> List[Dict]:
        """Get statistics by source"""
        stats = self.db.query(
            Article.source_domain,
            func.count(Article.id).label('article_count'),
            func.avg(Article.sentiment_score).label('avg_sentiment')
        ).group_by(Article.source_domain).all()
        
        return [
            {
                'source': stat.source_domain,
                'article_count': stat.article_count,
                'avg_sentiment': round(stat.avg_sentiment, 3) if stat.avg_sentiment else 0.0
            }
            for stat in stats
        ]