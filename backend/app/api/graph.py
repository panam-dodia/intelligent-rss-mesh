from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.article import Article
from app.services.embedder import EmbeddingService
from typing import List, Dict
from collections import defaultdict
from datetime import datetime, timedelta

router = APIRouter(prefix="/graph", tags=["graph"])

@router.get("/knowledge-graph")
async def get_knowledge_graph(
    hours: int = Query(48, ge=1, le=168),
    min_similarity: float = Query(0.75, ge=0.5, le=1.0),
    db: Session = Depends(get_db)
):
    """Generate knowledge graph data for visualization"""
    cutoff = datetime.now() - timedelta(hours=hours)
    
    # Get recent processed articles
    articles = db.query(Article).filter(
        Article.published_date >= cutoff,
        Article.is_processed == True
    ).limit(50).all()
    
    if not articles:
        return {"nodes": [], "links": []}
    
    # Build nodes
    nodes = []
    entity_map = defaultdict(lambda: {"count": 0, "articles": set(), "type": ""})
    
    # Article nodes
    for article in articles:
        nodes.append({
            "id": f"article_{article.id}",
            "label": article.title[:50] + "...",
            "type": "article",
            "source": article.source_domain,
            "url": article.url,
            "published": article.published_date.isoformat() if article.published_date else None,
            "size": 8
        })
        
        # Extract entities
        if article.entities:
            entities = article.entities.get('entities', [])
            for entity in entities:
                entity_key = entity['text'].lower()
                entity_map[entity_key]['count'] += 1
                entity_map[entity_key]['articles'].add(article.id)
                entity_map[entity_key]['type'] = entity['type']
    
    # Entity nodes (only if mentioned in 2+ articles)
    for entity_text, data in entity_map.items():
        if data['count'] >= 2:
            nodes.append({
                "id": f"entity_{entity_text}",
                "label": entity_text.title(),
                "type": "entity",
                "entity_type": data['type'],
                "mention_count": data['count'],
                "size": min(20, 8 + data['count'] * 2)
            })
    
    # Build links
    links = []
    
    # Article-Entity links
    for article in articles:
        if article.entities:
            entities = article.entities.get('entities', [])
            for entity in entities:
                entity_key = entity['text'].lower()
                if entity_map[entity_key]['count'] >= 2:
                    links.append({
                        "source": f"article_{article.id}",
                        "target": f"entity_{entity_key}",
                        "type": "mentions"
                    })
    
    # Article-Article similarity links
    embedder = EmbeddingService()
    for i, article in enumerate(articles[:20]):  # Limit for performance
        similar = embedder.search_similar_to_article(article.id, limit=3)
        for sim in similar:
            if sim.score >= min_similarity:
                target_id = sim.payload.get('article_id')
                if any(a.id == target_id for a in articles):
                    links.append({
                        "source": f"article_{article.id}",
                        "target": f"article_{target_id}",
                        "type": "similar",
                        "similarity": round(sim.score, 2)
                    })
    
    return {
        "nodes": nodes,
        "links": links,
        "stats": {
            "article_count": len([n for n in nodes if n['type'] == 'article']),
            "entity_count": len([n for n in nodes if n['type'] == 'entity']),
            "connection_count": len(links)
        }
    }