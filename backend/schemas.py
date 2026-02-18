from pydantic import BaseModel, Field
from typing import List, Optional
from pydantic import ConfigDict
from datetime import datetime

class NoteBase(BaseModel):
    title: str
    body: str

class NoteCreate(NoteBase):
    user_id: Optional[int] = None

class Note(NoteBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    name: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    notes: List[Note] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    name: Optional[str] = None

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
