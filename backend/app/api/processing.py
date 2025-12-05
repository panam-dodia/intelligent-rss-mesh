from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db, SessionLocal
from app.models.article import Article
from app.services.embedder import EmbeddingService
from app.services.ner_service import NERService

router = APIRouter(prefix="/processing", tags=["processing"])

# Create service singletons to avoid reloading models
_ner_service = None
_embedder_service = None

def get_ner_service():
    """Get or create NER service singleton"""
    global _ner_service
    if _ner_service is None:
        print("🔧 Initializing NER service...")
        _ner_service = NERService()
    return _ner_service

def get_embedder_service():
    """Get or create Embedder service singleton"""
    global _embedder_service
    if _embedder_service is None:
        print("🔧 Initializing Embedder service...")
        _embedder_service = EmbeddingService()
    return _embedder_service

def process_article_task(article_id: int):
    """Background task to process an article"""
    db = SessionLocal()
    try:
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article or article.is_processed:
            return

        # Use singleton services - MUCH faster!
        ner = get_ner_service()
        embedder = get_embedder_service()

        # Extract entities
        if article.content:
            entities = ner.extract_entities(article.content)
            article.entities = {"entities": entities}
            article.sentiment_score = ner.analyze_sentiment(article.content)

        # Generate and store embedding with timeout handling
        embedding_id = None
        try:
            embedding_id = embedder.store_embedding(
                article_id=article.id,
                title=article.title,
                content=article.content or article.summary or "",
                metadata={
                    "source_domain": article.source_domain,
                    "published_date": article.published_date.isoformat() if article.published_date else None
                }
            )
            article.embedding_id = embedding_id
        except Exception as embed_error:
            # Don't fail the entire processing if embedding fails
            print(f"⚠️  Embedding failed for article {article_id}: {str(embed_error)}")
            article.embedding_id = None

        # Mark as processed even if embedding failed
        article.is_processed = True

        db.commit()
        print(f"✓ Processed article {article_id}: {article.title[:50]}")
    except Exception as e:
        print(f"✗ Error processing article {article_id}: {str(e)}")
        db.rollback()
    finally:
        db.close()

@router.post("/process/{article_id}")
async def process_article(
    article_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Process a single article"""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        return {"error": "Article not found"}
    
    if article.is_processed:
        return {"message": "Article already processed"}
    
    background_tasks.add_task(process_article_task, article_id)
    
    return {"message": f"Processing article {article_id} in background"}

@router.post("/process-all")
async def process_all_unprocessed(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Process all unprocessed articles"""
    unprocessed = db.query(Article).filter(Article.is_processed == False).all()
    
    for article in unprocessed:
        background_tasks.add_task(process_article_task, article.id)
    
    return {
        "message": f"Processing {len(unprocessed)} articles in background",
        "count": len(unprocessed)
    }

@router.get("/stats")
async def get_processing_stats(db: Session = Depends(get_db)):
    """Get processing statistics"""
    total = db.query(Article).count()
    processed = db.query(Article).filter(Article.is_processed == True).count()
    
    return {
        "total_articles": total,
        "processed": processed,
        "unprocessed": total - processed,
        "processing_rate": f"{(processed/total*100):.1f}%" if total > 0 else "0%"
    }