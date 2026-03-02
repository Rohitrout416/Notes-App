from fastapi import FastAPI, Depends, HTTPException, Response, status, Request
from sqlalchemy.orm import Session
from database import get_db, engine
import models, schemas, auth
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import re

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Allow all domains to access the API
    allow_credentials=False,    # Cannot be True when allow_origins is ["*"]
    allow_methods=["*"],        # Allows GET, POST, etc.
    allow_headers=["*"],        # Allows any headers (like Content-Type)
)

# create note
@app.post('/notes/', response_model = schemas.Note)
async def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_note = models.Note(**note.model_dump(), user_id=current_user.id)

    if not note.title or not note.body:
        raise HTTPException(status_code=400, detail='Title and body are required')
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

# Authentication Routes

def is_strong_password(password: str) -> bool:
    if len(password) < 8:
        return False
    if not re.search("[A-Z]", password):
        return False
    if not re.search("[0-9]", password):
        return False
    return True

@app.post('/auth/register', response_model=schemas.User)
async def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    if not is_strong_password(user.password):
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long and contain at least one uppercase letter and one number")

    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post('/auth/login')
async def login(response: Response, user_credentials: schemas.UserCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = auth.create_access_token(data={"sub": user.email})
    
    # Set HttpOnly Cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        samesite="lax", # Strict requires same domain, Lax allows top-level navigations
        secure=False, # Must be False for local HTTP development and Nginx HTTP reverse proxy
        max_age=60 * 60 * 24 * 7 # 7 days
    )
    return {"message": "Logged in successfully"}

@app.post('/auth/logout')
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}

@app.get('/auth/me', response_model=schemas.User)
async def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# get note
@app.get('/notes/{note_id}', response_model=schemas.Note)
async def read_note(note_id: int, db: Session = Depends(get_db)):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()

    if not db_note:
        raise HTTPException(status_code=404, detail="Note Not Found")
    return db_note

#get all notes
@app.get('/notes/', response_model=List[schemas.Note])
async def read_all_notes(db: Session = Depends(get_db)):
    db_note = db.query(models.Note).order_by(models.Note.created_at.desc()).all()

    return db_note

# get user
@app.get('/users/{user_id}', response_model=schemas.User)
async def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()

    if not db_user:
        raise HTTPException(status_code = 404, detail = "No User Found")
    
    return db_user

# update user
@app.patch('/users/{user_id}', response_model=schemas.User)
async def update_user(user_id: int, updated_user: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail='User Not Found')

    if updated_user.name is not None:
        db_user.name = updated_user.name
        db.commit()
        db.refresh(db_user)
    
    return db_user

# update note
@app.patch('/notes/{note_id}', response_model=schemas.Note)
async def update_note(note_id: int, updated_note: schemas.NoteUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()

    if not db_note:
        raise HTTPException(status_code=404, detail='Note not Found')
        
    if db_note.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this note")
    
    if updated_note.title is not None:
        db_note.title = updated_note.title
    
    if updated_note.body is not None:
        db_note.body = updated_note.body
    
    db.commit()
    db.refresh(db_note)
    
    return db_note

@app.delete('/notes/{note_id}', status_code=204)
async def delete_note(note_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()

    if not db_note:
        raise HTTPException(status_code=404, detail='Note Not Found')
        
    if db_note.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this note")
    
    db.delete(db_note)
    db.commit()

    return