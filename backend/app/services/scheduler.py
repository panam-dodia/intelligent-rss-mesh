import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.article import Feed, Article
from app.services.feed_fetcher import FeedFetcher
from app.api.processing import process_article_task

async def process_unprocessed_articles():
    """Process all unprocessed articles in batches"""
    db = SessionLocal()
    try:
        unprocessed = db.query(Article).filter(Article.is_processed == False).all()
        
        if not unprocessed:
            print("✨ All articles already processed")
            return
        
        print(f"🔮 Found {len(unprocessed)} unprocessed articles")
        
        # Process in batches of 20
        for i in range(0, len(unprocessed), 20):
            batch = unprocessed[i:i+20]
            print(f"Processing batch {i//20 + 1} ({len(batch)} articles)...")
            
            for article in batch:
                try:
                    process_article_task(article.id)
                except Exception as e:
                    print(f"✗ Error processing {article.id}: {str(e)}")
            
            # Small delay between batches to avoid overwhelming the system
            await asyncio.sleep(2)
        
        print(f"✅ Finished processing {len(unprocessed)} articles")
    except Exception as e:
        print(f"Error in process_unprocessed_articles: {str(e)}")
    finally:
        db.close()

async def fetch_all_feeds():
    """Fetch articles from all active feeds"""
    db = SessionLocal()
    try:
        feeds = db.query(Feed).filter(Feed.is_active == True).all()
        total_new = 0
        new_article_ids = []
        
        for feed in feeds:
            print(f"🎃 Fetching feed: {feed.title}")
            
            # Get articles before fetch
            before_count = db.query(Article).count()
            
            fetcher = FeedFetcher(db)
            articles = await fetcher.fetch_feed(feed.url)
            saved_count = await fetcher.save_articles(articles)
            
            # Get new article IDs
            if saved_count > 0:
                after_count = db.query(Article).count()
                new_articles = db.query(Article).order_by(Article.id.desc()).limit(saved_count).all()
                new_article_ids.extend([a.id for a in new_articles])
            
            total_new += saved_count
            
            # Update last_fetched
            feed.last_fetched = datetime.now()
            db.commit()
            
            print(f"✅ Saved {saved_count} new articles from {feed.title}")
        
        # Process newly fetched articles immediately
        if new_article_ids:
            print(f"🔮 Processing {len(new_article_ids)} newly fetched articles...")
            for article_id in new_article_ids:
                try:
                    process_article_task(article_id)
                except Exception as e:
                    print(f"✗ Error processing {article_id}: {str(e)}")
        
        print("🌙 All feeds fetched and processed!")
    except Exception as e:
        print(f"Error in fetch_all_feeds: {str(e)}")
    finally:
        db.close()

async def background_scheduler():
    """Run scheduled tasks"""
    # On startup: process all unprocessed articles
    print("🎃 Starting background scheduler...")
    print("🔮 Processing existing unprocessed articles...")
    await process_unprocessed_articles()
    
    # Then start the fetch loop
    while True:
        print("🕷️ Starting scheduled feed fetch...")
        await fetch_all_feeds()
        print("⏰ Next fetch in 30 minutes...")
        await asyncio.sleep(1800)  # 30 minutes