# RSS Necromancy 🎃

> Resurrecting the dead art of RSS feeds through dark AI magic

An AI-powered RSS intelligence system that detects information cascades across news sources and generates intelligent synthesis using pattern detection and GPT-4.

**Hackathon Category**: Resurrection (bringing RSS feeds back to life)

## 🔮 What It Does

RSS Necromancy transforms traditional RSS feeds into an intelligent information mesh that:

- **Detects Information Cascades**: Identifies when entities (people, organizations, events) are mentioned across multiple independent sources
- **Generates AI Synthesis**: Uses GPT-4 to create intelligent briefings that synthesize insights from multiple articles
- **Visualizes Knowledge Graphs**: Shows semantic relationships between articles and entities
- **Tracks Patterns**: Calculates cascade velocity and trend emergence

## 🎯 Key Features

1. **Multi-Source Intelligence**: Aggregates from TechCrunch, The Verge, Ars Technica, Engadget, and more
2. **Semantic Search**: Vector embeddings enable similarity-based article discovery
3. **Entity Tracking**: Named entity recognition tracks people, organizations, and events
4. **Real-time Analysis**: Detects emerging patterns as they develop
5. **Spooky UI**: Haunted interface with fog effects, blood-dripping headers, and spectral animations

## 🛠️ Tech Stack

**Backend**:
- FastAPI (async Python web framework)
- PostgreSQL (article metadata)
- Qdrant (vector database for embeddings)
- Redis (caching and task queue)
- Sentence Transformers (embedding generation)
- spaCy (named entity recognition)
- OpenAI GPT-4 (synthesis generation)

**Frontend**:
- Next.js 14 with TypeScript
- TailwindCSS (styling)
- React Force Graph (knowledge graph viz)
- Recharts (analytics)

## 🎃 Kiro Usage Documentation

This project extensively uses Kiro throughout development:

### 1. Spec-Driven Development

Created detailed specs for core services:
- **`specs/synthesis-service.md`**: Complete specification for AI synthesis including methods, API endpoints, and integration points
- **`specs/pattern-detection.md`**: Algorithm documentation for cascade detection, trending topics, and source analytics

**Impact**: Specs enabled rapid iteration. I used them to have Kiro generate complete service implementations with proper error handling and type hints.

**Example workflow**:
```
Me: "Implement the SynthesisService according to the spec"
Kiro: [Generates complete service with all methods, error handling, and OpenAI integration]
```

### 2. Agent Hooks

Created automation hook for article processing:
- **`hooks/auto-process.sh`**: Automatically triggers background processing when new articles are fetched

**Impact**: This hook saved manual work. Every time I fetched new feeds, Kiro could trigger processing automatically.

### 3. Steering Documents

Created comprehensive steering doc:
- **`steering/rss-intelligence.md`**: Project context, code style preferences, architecture patterns, and theme guidelines

**Impact**: This ensured consistency across all generated code. Kiro understood the spooky theme, architectural patterns, and error handling requirements without me repeating myself.

**Most impressive generation**: The entire knowledge graph visualization component. I described the desired behavior in conversation, Kiro referenced the steering doc for styling preferences, and generated a complete ForceGraph component with:
- Proper node coloring by type
- Interactive tooltips
- Link animations
- Spooky theme integration
- Responsive sizing

### 4. Vibe Coding Examples

Throughout the project, I used natural conversation with Kiro to build features:

**Example 1 - Creating the spooky theme**:
```
Me: "Create a haunted, spooky CSS theme with blood-red accents, fog effects, and dripping animations"
Kiro: [Generated complete globals.css with custom animations, CSS variables, and utility classes]
```

**Example 2 - Pattern detection algorithm**:
```
Me: "I need to detect when entities are mentioned across multiple sources. Calculate velocity as mentions per hour."
Kiro: [Generated complete PatternDetector class with SQLAlchemy queries and velocity calculations]
```

**Example 3 - API integration**:
```
Me: "Create a centralized API client with methods for all our endpoints"
Kiro: [Generated lib/api.ts with typed axios client and all endpoint methods]
```

## 📊 Development Process Comparison

**With Kiro**:
- ✅ Completed full-stack app in ~3 hours
- ✅ Consistent code style across 20+ files
- ✅ Comprehensive error handling from specs
- ✅ Zero boilerplate fatigue

**Without Kiro** (estimated):
- ❌ Would take 2-3 days minimum
- ❌ Inconsistent patterns across services
- ❌ Likely missing error handling
- ❌ Manual repetition for similar components

## 🚀 Setup Instructions

1. **Clone repository**:
```bash
git clone <your-repo-url>
cd intelligent-rss-mesh
```

2. **Backend setup**:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

3. **Start databases**:
```bash
docker-compose up -d
```

4. **Initialize database**:
```bash
python -m app.db.init_db
```

5. **Set environment variables** (create `backend/.env`):
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rss_mesh
REDIS_URL=redis://localhost:6379
QDRANT_URL=http://localhost:6333
OPENAI_API_KEY=your-key-here
```

6. **Start backend**:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

7. **Frontend setup** (new terminal):
```bash
cd frontend
npm install
```

8. **Start frontend**:
```bash
npm run dev
```

9. **Visit**: http://localhost:3000

## 🎬 Demo Workflow

1. Add RSS feeds via Swagger UI (http://localhost:8000/docs)
2. Fetch articles from feeds
3. Process articles (generates embeddings, extracts entities)
4. View cascades on dashboard
5. Click "View AI Synthesis" for GPT-4 generated insights
6. Explore knowledge graph showing article relationships

## 📈 What Makes This Special

1. **Actually Useful**: Solves real information overload problem
2. **Novel Approach**: Combines vector search + NER + GPT synthesis
3. **Production-Ready**: Proper error handling, background processing, database optimization
4. **Visually Impressive**: Interactive graph + spooky theme
5. **Well-Architected**: Clean separation of concerns, typed APIs, comprehensive specs

## 🏆 Why This Wins

- **Potential Value**: Addresses genuine need for intelligent news aggregation
- **Implementation**: Extensive Kiro usage across specs, hooks, and steering
- **Creativity**: Spooky resurrection theme, novel cascade detection algorithm
- **Quality**: Production-grade code, comprehensive error handling, smooth UX

## 📝 License

MIT License