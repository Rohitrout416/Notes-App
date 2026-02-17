from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class NoteBase(BaseModel):
    title: str
    body: str
    created_at: datetime

class NoteCreate(NoteBase):
    user_id: Optional[int] = None

class Note(NoteBase):
    id: int
    user_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    name: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    notes: List[Note] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)



