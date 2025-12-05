from app.db.database import engine, Base, SessionLocal
from app.models.article import Article, Feed, Entity
from app.models.user import User, UserPreferences

def seed_default_feeds():
    """Add default RSS feeds if database is empty"""
    db = SessionLocal()
    try:
        # Check if feeds already exist
        existing_count = db.query(Feed).count()
        if existing_count > 0:
            print(f"✅ Database already has {existing_count} feeds")
            return

        feeds_data = [
            {
                "url": "https://techcrunch.com/feed/",
                "title": "TechCrunch",
                "description": "The latest technology news and information on startups",
                "category": "technology"
            },
            {
                "url": "https://www.theverge.com/rss/index.xml",
                "title": "The Verge",
                "description": "Technology, science, art, and culture news",
                "category": "technology"
            },
            {
                "url": "https://www.wired.com/feed/rss",
                "title": "Wired",
                "description": "How emerging technology affects culture, the economy, and politics",
                "category": "technology"
            },
            {
                "url": "https://hnrss.org/frontpage",
                "title": "Hacker News",
                "description": "Hacker News front page articles",
                "category": "technology"
            },
            {
                "url": "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
                "title": "NYTimes Technology",
                "description": "New York Times technology news",
                "category": "technology"
            },
            {
                "url": "https://feeds.arstechnica.com/arstechnica/index",
                "title": "Ars Technica",
                "description": "Technology news, analysis, and reviews",
                "category": "technology"
            },
            {
                "url": "https://www.engadget.com/rss.xml",
                "title": "Engadget",
                "description": "Consumer electronics and gadgets news",
                "category": "technology"
            },
            {
                "url": "https://feeds.bbci.co.uk/news/technology/rss.xml",
                "title": "BBC Technology",
                "description": "BBC technology news",
                "category": "technology"
            },
            {
                "url": "https://www.technologyreview.com/feed/",
                "title": "MIT Technology Review",
                "description": "MIT's magazine of innovation",
                "category": "technology"
            },
            {
                "url": "https://feeds.feedburner.com/venturebeat/SZYF",
                "title": "VentureBeat",
                "description": "Technology business news and analysis",
                "category": "technology"
            }
        ]

        for feed_data in feeds_data:
            feed = Feed(**feed_data)
            db.add(feed)

        db.commit()
        print(f"✅ Seeded {len(feeds_data)} default feeds")

    except Exception as e:
        print(f"❌ Error seeding feeds: {str(e)}")
        db.rollback()
    finally:
        db.close()

def init_db():
    """Initialize database tables and seed default data"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

    # Seed default feeds
    seed_default_feeds()

if __name__ == "__main__":
    init_db()