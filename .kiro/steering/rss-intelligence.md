# RSS Intelligence System - Kiro Steering Document

## Project Context
This is an AI-powered RSS feed intelligence system that detects information cascades across news sources and generates intelligent synthesis using GPT-4.

## Code Style Preferences

### Python Backend
- Use type hints for all function parameters and returns
- Prefer async/await for I/O operations
- Follow FastAPI best practices for route handlers
- Use Pydantic models for request/response validation
- SQLAlchemy for database operations
- Keep services in separate files under `app/services/`

### TypeScript Frontend
- Use functional components with hooks
- Prefer TypeScript interfaces over types for object shapes
- Use Tailwind CSS for styling
- Keep components small and focused
- Async state management with React hooks

## Architecture Patterns

### Backend
- **Layered Architecture**:
  - API Layer: FastAPI routes in `app/api/`
  - Service Layer: Business logic in `app/services/`
  - Data Layer: SQLAlchemy models in `app/models/`
- **Dependency Injection**: Use FastAPI's Depends for database sessions
- **Background Tasks**: Use FastAPI BackgroundTasks for async processing

### Frontend
- **Component Structure**: Atomic design principles
- **State Management**: React hooks (useState, useEffect)
- **API Integration**: Centralized axios client in `lib/api.ts`

## Key Workflows

### Article Processing Pipeline
1. Fetch RSS feeds → FeedFetcher
2. Extract full content → newspaper3k
3. Generate embeddings → SentenceTransformers
4. Store in Qdrant → EmbeddingService
5. Extract entities → spaCy NER
6. Update Article record → is_processed = True

### Cascade Detection Flow
1. Query recent articles (48h window)
2. Extract entities from all articles
3. Group by entity, track sources
4. Filter: 2+ sources required
5. Calculate velocity (mentions/hour)
6. Sort by source diversity
7. Generate AI synthesis for top cascades

## Spooky Theme Guidelines
- Use dark backgrounds (gray-900, black)
- Red accents for "blood" effects (#8B0000)
- Purple for "spectral" elements (#4B0082)
- Animations: flicker, pulse, drip effects
- Typography: Monospace fonts for haunted feel
- Naming: Use terms like "necromancy", "spirits", "haunted", "cursed"

## Error Handling
- Always use try-except blocks for external API calls
- Log errors but continue processing other items
- Provide user-friendly error messages
- Graceful degradation when services unavailable

## Performance Optimizations
- Limit article processing to batches
- Use background tasks for heavy operations
- Cache frequently accessed data in Redis
- Limit graph nodes to 50 for visualization
- Use pagination for article lists