import spacy
from typing import List, Dict, Set
from collections import Counter

class NERService:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
    
    def extract_entities(self, text: str) -> List[Dict]:
        """Extract named entities from text"""
        doc = self.nlp(text[:1000000])  # spaCy has limits
        
        entities = []
        seen = set()
        
        for ent in doc.ents:
            # Filter relevant entity types
            if ent.label_ in ['PERSON', 'ORG', 'GPE', 'PRODUCT', 'EVENT', 'LAW', 'NORP']:
                entity_key = (ent.text.lower(), ent.label_)
                if entity_key not in seen:
                    entities.append({
                        'text': ent.text,
                        'type': ent.label_,
                        'start': ent.start_char,
                        'end': ent.end_char
                    })
                    seen.add(entity_key)
        
        return entities
    
    def get_entity_frequency(self, entities: List[Dict]) -> Dict[str, int]:
        """Count entity mentions"""
        entity_texts = [e['text'].lower() for e in entities]
        return dict(Counter(entity_texts))
    
    def analyze_sentiment(self, text: str) -> float:
        """Simple sentiment analysis (-1 to 1)"""
        # This is a placeholder - you can enhance with better models
        doc = self.nlp(text[:100000])
        
        # Simple polarity based on spaCy's sentiment (if available)
        # For now, return neutral
        return 0.0