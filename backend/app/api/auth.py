from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.db.database import get_db
from app.models.user import User
from app.models.schemas import UserCreate, UserLogin, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.core.deps import get_current_active_user  # ADD THIS LINE

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        print(f"❌ Registration failed: User {user_data.email} already exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    print(f"🔐 Creating user {user_data.email} with hashed password (length: {len(hashed_password)})")
    
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    print(f"✅ User {user_data.email} created successfully (ID: {user.id})")
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_active": user.is_active,      # ADD THIS
            "created_at": user.created_at     # ADD THIS
        }
    }

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    print(f"🔍 Login attempt for email: {user_data.email}")
    
    # Find user
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user:
        print(f"❌ Login failed: User {user_data.email} not found in database")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"👤 Found user: {user.email} (ID: {user.id}, username: {user.username})")
    
    # Verify password
    password_valid = verify_password(user_data.password, user.hashed_password)
    print(f"🔓 Password verification result: {password_valid}")
    
    if not password_valid:
        print(f"❌ Login failed: Invalid password for {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"✅ Login successful for {user_data.email}")
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_active": user.is_active,      # ADD THIS
            "created_at": user.created_at     # ADD THIS
        }
    }

@router.get("/me")
async def get_current_user(current_user: User = Depends(get_current_active_user)):
    """Get current user info"""
    print(f"✓ Authenticated user: {current_user.username}")
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username
    }