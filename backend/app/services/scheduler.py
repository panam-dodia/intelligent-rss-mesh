import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.article import Feed
from app.services.feed_fetcher import FeedFetcher
from app.api.processing import process_article_task

async def fetch_all_feeds():
    """Fetch articles from all active feeds"""
    db = SessionLocal()
    try:
        feeds = db.query(Feed).filter(Feed.is_active == True).all()
        
        for feed in feeds:
            print(f"🎃 Fetching feed: {feed.title}")
            fetcher = FeedFetcher(db)
            articles = await fetcher.fetch_feed(feed.url)
            saved_count = await fetcher.save_articles(articles)
            
            # Update last_fetched
            feed.last_fetched = datetime.now()
            db.commit()
            
            print(f"✅ Saved {saved_count} new articles from {feed.title}")
            
            # Process new articles
            if saved_count > 0:
                # Get the newly saved articles
                from app.models.article import Article
                new_articles = db.query(Article).filter(
                    Article.source_domain == feed.title.lower().replace(' ', ''),
                    Article.is_processed == False
                ).all()
                
                for article in new_articles:
                    try:
                        process_article_task(article.id)
                    except Exception as e:
                        print(f"Error processing article {article.id}: {str(e)}")
        
        print("🌙 All feeds fetched and processed!")
    except Exception as e:
        print(f"Error in fetch_all_feeds: {str(e)}")
    finally:
        db.close()

async def background_scheduler():
    """Run fetch every 30 minutes"""
    while True:
        print("🕷️ Starting scheduled feed fetch...")
        await fetch_all_feeds()
        print("⏰ Next fetch in 30 minutes...")
        await asyncio.sleep(1800)  # 30 minutes