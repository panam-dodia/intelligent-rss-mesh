from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import feeds, articles, processing, analysis
from app.api import feeds, articles, processing, analysis, synthesis

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI-powered RSS feed intelligence system"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(feeds.router, prefix=settings.API_V1_PREFIX)
app.include_router(articles.router, prefix=settings.API_V1_PREFIX)
app.include_router(processing.router, prefix=settings.API_V1_PREFIX)
app.include_router(analysis.router, prefix=settings.API_V1_PREFIX)
app.include_router(synthesis.router, prefix=settings.API_V1_PREFIX)

@app.get("/")
async def root():
    return {
        "message": "RSS Intelligence Mesh API",
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}