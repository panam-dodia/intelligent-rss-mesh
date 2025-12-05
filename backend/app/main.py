from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from app.core.config import settings
from app.api import feeds, articles, processing, analysis, synthesis, auth, users

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database tables
    from app.db.init_db import init_db
    print("🗄️ Initializing database...")
    init_db()
    print("✅ Database initialized")

    # Start background scheduler WITHOUT BLOCKING
    from app.services.scheduler import background_scheduler

    # Run scheduler in background task (non-blocking)
    task = asyncio.create_task(background_scheduler())
    print("🎃 Background scheduler started (non-blocking)")

    yield  # App is ready to accept requests NOW

    # Shutdown: Cancel the task
    task.cancel()
    print("👻 Background scheduler stopped")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI-powered RSS feed intelligence system",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(feeds.router, prefix=settings.API_V1_PREFIX)
app.include_router(articles.router, prefix=settings.API_V1_PREFIX)
app.include_router(processing.router, prefix=settings.API_V1_PREFIX)
app.include_router(analysis.router, prefix=settings.API_V1_PREFIX)
app.include_router(synthesis.router, prefix=settings.API_V1_PREFIX)
