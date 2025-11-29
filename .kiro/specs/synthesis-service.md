# AI Synthesis Service Specification

## Overview
Service that generates intelligent summaries of information cascades using GPT-4, identifying patterns across multiple news sources.

## Components

### SynthesisService Class
Location: `backend/app/services/synthesizer.py`

#### Methods

**synthesize_cascade(cascade_data: Dict) -> str**
- Input: Cascade data including entity, articles, sources, mention count
- Process: 
  1. Extract top 5 articles from cascade
  2. Format article summaries with source attribution
  3. Generate GPT-4 prompt requesting:
     - Brief summary (2-3 sentences)
     - Significance/newsworthiness
     - Key facts and developments
     - Contradictions across sources
  4. Call GPT-4 with temperature 0.3 for factual output
- Output: Formatted briefing text

**synthesize_multiple_articles(articles: List[Article]) -> str**
- Input: List of Article objects (max 10)
- Process:
  1. Extract summaries/titles from articles
  2. Generate synthesis prompt for themes, patterns, contradictions
  3. Call GPT-4 for 5-7 sentence synthesis
- Output: Synthesized insight text

**explain_pattern(pattern_description: str, supporting_data: Dict) -> str**
- Input: Pattern description and supporting data
- Process: Generate explanation of pattern significance
- Output: Brief explanation (3-4 sentences)

## API Endpoints
Location: `backend/app/api/synthesis.py`

### GET /synthesis/cascade/{entity_name}
- Query params: hours (default 48)
- Returns: Cascade data + AI synthesis

### GET /synthesis/daily-briefing
- Returns: Last 24h articles + top 3 cascades + synthesis

### GET /synthesis/top-cascades
- Query params: limit (1-5, default 3)
- Returns: Array of top cascades with AI synthesis

## Integration Points
- Uses OpenAI GPT-4o-mini model
- Requires OPENAI_API_KEY in environment
- Integrates with PatternDetector for cascade data
- Called by frontend for real-time synthesis display

## Error Handling
- Graceful degradation if OpenAI API fails
- Continue processing other cascades on individual failures
- Log errors without breaking cascade detection

## Performance Considerations
- Limit article summaries to 5 per cascade
- Use GPT-4o-mini for speed and cost
- Temperature 0.3 for consistent, factual outputs
- Max tokens 300-500 to control response length