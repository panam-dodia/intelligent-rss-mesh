import asyncio
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.article import Feed, Article
from app.services.feed_fetcher import FeedFetcher
from app.api.processing import process_article_task

async def cleanup_old_articles():
    """Delete articles published more than 7 days ago (changed from 24h to prevent deleting fresh articles)"""
    db = SessionLocal()
    try:
        # Delete based on published date - but use 7 days to keep recent articles
        seven_days_ago = datetime.now() - timedelta(days=7)

        # Count before delete - only articles published more than 7 days ago
        old_count = db.query(Article).filter(
            Article.published_date < seven_days_ago
        ).count()

        if old_count > 0:
            # Delete old articles
            db.query(Article).filter(
                Article.published_date < seven_days_ago
            ).delete()

            db.commit()
            print(f"🗑️ Deleted {old_count} articles older than 7 days")
        else:
            print(f"✨ No old articles to delete")
    except Exception as e:
        print(f"Error cleaning up articles: {str(e)}")
        db.rollback()
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
            
            fetcher = FeedFetcher(db)
            articles = await fetcher.fetch_feed(feed.url)
            saved_count = await fetcher.save_articles(articles)
            
            # Get new article IDs
            if saved_count > 0:
                new_articles = db.query(Article).order_by(Article.id.desc()).limit(saved_count).all()
                new_article_ids.extend([a.id for a in new_articles])
            
            total_new += saved_count
            
            # Update last_fetched
            feed.last_fetched = datetime.now()
            db.commit()
            
            print(f"✅ Saved {saved_count} new articles from {feed.title}")
        
        # Process new articles with better performance
        if new_article_ids:
            articles_to_process = new_article_ids[:100]  # Increased from 20 to 100
            if len(new_article_ids) > 100:
                print(f"⚠️ Limited processing to first 100 of {len(new_article_ids)} new articles")
            else:
                print(f"🔮 Processing {len(articles_to_process)} new articles...")

            # Process in parallel batches with concurrent.futures for better performance
            from concurrent.futures import ThreadPoolExecutor, as_completed

            with ThreadPoolExecutor(max_workers=4) as executor:
                # Submit all articles for processing
                futures = {executor.submit(process_article_task, article_id): article_id
                          for article_id in articles_to_process}

                # Track progress
                completed = 0
                for future in as_completed(futures):
                    article_id = futures[future]
                    try:
                        future.result()
                        completed += 1
                        if completed % 10 == 0:
                            print(f"📊 Progress: {completed}/{len(articles_to_process)} articles processed")
                    except Exception as e:
                        print(f"✗ Error processing {article_id}: {str(e)}")

            print(f"✅ Completed processing {completed} articles")
        
        # Clean up old articles after processing
        await cleanup_old_articles()
        
        print("🌙 All feeds fetched and processed!")
    except Exception as e:
        print(f"Error in fetch_all_feeds: {str(e)}")
    finally:
        db.close()

async def background_scheduler():
    """Run scheduled tasks"""
    print("🎃 Background scheduler starting...")
    
    # Clean up old articles IMMEDIATELY on startup
    print("🧹 Cleaning up old articles on startup...")
    await cleanup_old_articles()
    
    # Wait 5 seconds before first fetch
    await asyncio.sleep(5)
    
    # Start the fetch loop
    while True:
        print("🕷️ Starting scheduled feed fetch...")
        await fetch_all_feeds()
        print("⏰ Next fetch in 30 minutes...")
        await asyncio.sleep(1800)  # 30 minutes
