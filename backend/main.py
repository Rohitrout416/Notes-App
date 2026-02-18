from fastapi import FastAPI, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from database import get_db, engine
import models, schemas

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# create note
@app.post('/notes/', response_model = schemas.Note)
async def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db)):
    db_note = models.Note(**note.model_dump())

    user_id = note.user_id
    db_user = db.query(models.User).filter(models.User.id == note.user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail='User doesn\'t exist!')
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

# create user
@app.post('/users/', response_model = schemas.User)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# get note
@app.get('/notes/{note_id}', response_model=schemas.Note)
async def read_note(note_id: int, db: Session = Depends(get_db)):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()

    if not db_note:
        raise HTTPException(status_code=404, detail="Note Not Found")
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
async def update_note(note_id: int, updated_note: schemas.NoteUpdate, db: Session = Depends(get_db)):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()

    if not db_note:
        raise HTTPException(status_code=404, detail='Note not Found')
    
    if updated_note.title is not None:
        db_note.title = updated_note.title
    
    if updated_note.body is not None:
        db_note.body = updated_note.body
    
    db.commit()
    db.refresh(db_note)
    
    return db_note

@app.delete('/notes/{note_id}', status_code=204)
async def delete_note(note_id: int, db: Session = Depends(get_db)):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()

    if not db_note:
        raise HTTPException(status_code=404, detail='Note Not Found')
    
    db.delete(db_note)
    db.commit()

    return