from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from qdrant_client.http.exceptions import UnexpectedResponse
from typing import List, Optional
import uuid
from app.core.config import settings

class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
        self.qdrant = QdrantClient(url=settings.QDRANT_URL, timeout=10)  # 10 second timeout
        self._ensure_collection()
    
    def _ensure_collection(self):
        """Create Qdrant collection if it doesn't exist"""
        try:
            self.qdrant.get_collection(settings.QDRANT_COLLECTION_NAME)
            print(f"Collection {settings.QDRANT_COLLECTION_NAME} already exists")
        except Exception as e:
            try:
                self.qdrant.create_collection(
                    collection_name=settings.QDRANT_COLLECTION_NAME,
                    vectors_config=VectorParams(
                        size=settings.EMBEDDING_DIMENSION,
                        distance=Distance.COSINE
                    )
                )
                print(f"Created Qdrant collection: {settings.QDRANT_COLLECTION_NAME}")
            except UnexpectedResponse as ue:
                if "already exists" in str(ue):
                    print(f"Collection {settings.QDRANT_COLLECTION_NAME} already exists")
                else:
                    raise
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text"""
        embedding = self.model.encode(text)
        return embedding.tolist()
    
    def store_embedding(self, article_id: int, title: str, content: str, metadata: dict) -> str:
        """Generate and store embedding in Qdrant"""
        # Combine title and content for embedding
        text = f"{title}\n\n{content[:5000]}"  # Limit content length
        
        embedding = self.generate_embedding(text)
        point_id = str(uuid.uuid4())
        
        # Store in Qdrant
        self.qdrant.upsert(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            points=[
                PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload={
                        "article_id": article_id,
                        "title": title,
                        **metadata
                    }
                )
            ]
        )
        
        return point_id
    
    def search_similar(self, text: str, limit: int = 10, score_threshold: float = 0.7):
        """Search for similar articles"""
        embedding = self.generate_embedding(text)
        
        try:
            results = self.qdrant.query_points(
                collection_name=settings.QDRANT_COLLECTION_NAME,
                query=embedding,
                limit=limit,
                score_threshold=score_threshold
            )
            return results.points
        except Exception as e:
            print(f"Error in search_similar: {e}")
            return []
    
    def search_similar_to_article(self, article_id: int, limit: int = 10):
        """Find articles similar to a given article"""
        try:
            # Get the article's point from Qdrant
            results = self.qdrant.scroll(
                collection_name=settings.QDRANT_COLLECTION_NAME,
                scroll_filter=Filter(
                    must=[
                        FieldCondition(
                            key="article_id",
                            match=MatchValue(value=article_id)
                        )
                    ]
                ),
                limit=1
            )
            
            points, _ = results
            
            if not points:
                return []
            
            point = points[0]
            
            # Search for similar articles using the vector
            similar_results = self.qdrant.query_points(
                collection_name=settings.QDRANT_COLLECTION_NAME,
                query=point.vector,
                limit=limit + 1  # +1 to potentially exclude self
            )
            
            # Filter out the original article and apply score threshold manually
            similar_points = [
                p for p in similar_results.points 
                if p.payload.get('article_id') != article_id and p.score >= 0.7
            ]
            
            return similar_points[:limit]
        except Exception as e:
            print(f"Error in search_similar_to_article: {e}")
            return []