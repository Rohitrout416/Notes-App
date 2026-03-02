from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from pydantic import ConfigDict
from datetime import datetime

class NoteBase(BaseModel):
    title: str
    body: str

class NoteCreate(NoteBase):
    pass

class Note(NoteBase):
    id: int
    user_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    notes: List[Note] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
