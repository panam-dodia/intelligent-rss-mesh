# Pattern Detection Service Specification

## Overview
Analyzes articles to detect information cascades - entities being discussed across multiple independent sources, indicating emerging news patterns.

## Core Algorithm

### Cascade Detection
**Function**: `detect_cascades(hours: int) -> List[Dict]`

**Steps**:
1. Query articles published within time window (default 48 hours)
2. Filter to only processed articles (with entities extracted)
3. Build entity mention map:
   - Key: (entity_text.lower(), entity_type)
   - Value: sources, articles, timestamps
4. Identify cascades:
   - Entity mentioned by 2+ different sources
   - Calculate velocity: mentions / time_span (hours)
5. Sort by source diversity and mention count
6. Return top cascades

**Output Schema**:
```json
{
  "entity": "string",
  "type": "PERSON|ORG|GPE|PRODUCT|EVENT",
  "mention_count": "integer",
  "source_count": "integer",
  "sources": ["array of domains"],
  "velocity": "float (mentions/hour)",
  "first_seen": "ISO datetime",
  "last_seen": "ISO datetime",
  "articles": [
    {
      "id": "integer",
      "title": "string",
      "url": "string",
      "published_date": "ISO datetime",
      "source": "string"
    }
  ]
}
```

## Additional Analytics

### Entity Timeline
**Function**: `get_entity_timeline(entity_name: str, days: int) -> List[Dict]`
- Tracks mentions of specific entity over time
- Returns chronological list of articles

### Trending Topics
**Function**: `get_trending_topics(hours: int) -> List[Dict]`
- Counts entity frequency in time window
- Returns top 20 most mentioned entities

### Source Statistics
**Function**: `get_source_statistics() -> List[Dict]`
- Aggregates article count per source
- Calculates average sentiment per source

## Database Queries
- Uses SQLAlchemy ORM
- Filters on Article.published_date and Article.is_processed
- Accesses Article.entities JSON field for entity data

## Integration
- Called by analysis API endpoints
- Data feeds synthesis service
- Powers frontend cascade displays