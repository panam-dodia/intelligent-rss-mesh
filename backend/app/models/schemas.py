from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
    
# User preferences schemas
class UserPreferencesUpdate(BaseModel):
    categories: Optional[str] = None
    auto_process: Optional[bool] = None
    notification_enabled: Optional[bool] = None
    cascade_threshold_hours: Optional[int] = None
    min_sources_for_cascade: Optional[int] = None

class UserPreferencesResponse(BaseModel):
    categories: Optional[str]
    auto_process: bool
    notification_enabled: bool
    cascade_threshold_hours: int
    min_sources_for_cascade: int
    
    class Config:
        from_attributes = True