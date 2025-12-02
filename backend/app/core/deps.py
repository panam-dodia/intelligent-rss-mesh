from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.core.config import settings
from time import time

security = HTTPBearer()

# Simple in-memory cache for user lookups (hackathon optimization)
# Format: {user_id: (user_object, timestamp)}
_user_cache = {}
_CACHE_TTL = 60  # Cache for 60 seconds

def _get_cached_user(user_id: int, db: Session) -> User:
    """Get user from cache or database"""
    now = time()

    # Check cache
    if user_id in _user_cache:
        user_obj, timestamp = _user_cache[user_id]
        if now - timestamp < _CACHE_TTL:
            print(f"✅ Cache HIT for user {user_id}")
            return user_obj
        else:
            print(f"⚠️ Cache EXPIRED for user {user_id}")

    # Cache miss or expired - query database
    print(f"🔍 Cache MISS - querying DB for user {user_id}")
    user = db.query(User).filter(User.id == user_id).first()

    if user:
        # Store in cache
        _user_cache[user_id] = (user, now)

    return user

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            print(f"No user_id in token payload")
            raise credentials_exception
        # CONVERT STRING BACK TO INT
        user_id = int(user_id_str)
    except (JWTError, ValueError) as e:
        print(f"JWT decode error: {str(e)}")
        raise credentials_exception

    # Use cached lookup instead of direct DB query
    user = _get_cached_user(user_id, db)
    if user is None:
        print(f"User {user_id} not found in database")
        raise credentials_exception

    print(f"✓ Authenticated user: {user.username}")
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user