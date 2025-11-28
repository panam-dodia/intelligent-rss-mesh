from app.db.database import engine, Base
from app.models.article import Article, Feed, Entity

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()