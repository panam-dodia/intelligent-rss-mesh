from openai import OpenAI
from typing import List, Dict
from app.models.article import Article

class SynthesisService:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
    
    def synthesize_cascade(self, cascade_data: Dict) -> str:
        """Generate synthesis for an information cascade"""
        entity = cascade_data['entity']
        articles = cascade_data['articles']
        
        # Prepare article summaries
        article_summaries = []
        for i, article in enumerate(articles[:5], 1):  # Limit to 5 articles
            article_summaries.append(
                f"{i}. [{article['source']}] {article['title']}\n"
                f"   Published: {article['published_date']}\n"
                f"   URL: {article['url']}"
            )
        
        prompt = f"""You are analyzing an information cascade about "{entity}".

This entity has been mentioned {cascade_data['mention_count']} times across {cascade_data['source_count']} different sources in the last 48 hours.

Sources covering this: {', '.join(cascade_data['sources'])}

Key Articles:
{chr(10).join(article_summaries)}

Please provide:
1. A brief summary (2-3 sentences) of what's happening with {entity}
2. Why this is significant or newsworthy
3. Key facts or developments
4. Any contradictions or different perspectives across sources

Keep it concise and factual. Format as a briefing."""

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert news analyst who synthesizes information from multiple sources into clear, concise briefings."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )
        
        return response.choices[0].message.content
    
    def synthesize_multiple_articles(self, articles: List[Article]) -> str:
        """Synthesize insights from multiple articles"""
        if not articles:
            return "No articles to synthesize."
        
        article_summaries = []
        for i, article in enumerate(articles[:10], 1):
            summary = article.summary or article.title
            article_summaries.append(
                f"{i}. [{article.source_domain}] {article.title}\n"
                f"   {summary[:200]}..."
            )
        
        prompt = f"""Analyze these {len(articles)} recent articles and provide:

1. Main themes or topics emerging
2. Notable patterns or trends
3. Any contradictions or differing viewpoints
4. Key takeaways

Articles:
{chr(10).join(article_summaries)}

Provide a concise synthesis (5-7 sentences)."""

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert at identifying patterns and synthesizing insights from multiple news sources."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=400
        )
        
        return response.choices[0].message.content
    
    def explain_pattern(self, pattern_description: str, supporting_data: Dict) -> str:
        """Explain why a pattern is significant"""
        prompt = f"""Pattern detected: {pattern_description}

Supporting data:
{supporting_data}

Explain:
1. What this pattern means
2. Why it's significant
3. What to watch for next

Keep it brief (3-4 sentences)."""

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a data analyst explaining patterns in news coverage."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=300
        )
        
        return response.choices[0].message.content