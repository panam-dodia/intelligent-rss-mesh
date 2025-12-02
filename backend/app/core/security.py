from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.core.config import settings

# Reduce bcrypt rounds for hackathon/demo (default is 12, we use 4 for speed)
# NOTE: For production, use default rounds (12) or higher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=4)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    try:
        result = pwd_context.verify(plain_password, hashed_password)
        print(f"🔐 Password verify called: plain_len={len(plain_password)}, hash_len={len(hashed_password)}, result={result}")
        return result
    except Exception as e:
        print(f"❌ Password verification error: {str(e)}")
        return False

def get_password_hash(password: str) -> str:
    """Hash a password"""
    hashed = pwd_context.hash(password)
    print(f"🔐 Password hash created: plain_len={len(password)}, hash_len={len(hashed)}")
    return hashed

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
