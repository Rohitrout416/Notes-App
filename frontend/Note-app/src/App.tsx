import NoteCard from "./components/NoteCard";
import type { Note } from "./types";
import './components/NoteCard.css'
import './App.css'
import NoteForm from "./components/NoteForm";
import { useState, useEffect } from "react";


export default function App(){
    const [notes, setNotes] = useState<Note[]>([]);
    
        useEffect(()=>{
            fetch("http://localhost:8000/notes/")
            .then(res => res.json())
            .then(data => setNotes(data))
            .catch(err => console.error(err));
        },[]);
    

    const [showForm, setShowForm] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    const onNoteEdit = (note: Note)=>{
        setEditingNote(note)
        setShowForm(true)
    }

    const onNoteAdded = (newNote: Note) =>{
        setNotes([newNote, ...notes])
        setShowForm(false)
    }
    
    const handleCancel = () =>{
        setShowForm(false)
    }
    
    const onNoteDelete = (id: number) =>{
        setNotes(notes.filter(note => note.id !== id))
    }
    
    const onNoteUpdated = (updatedNote: Note) => {
        setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
        setShowForm(false);
    }

    return(
        <div className="Wall">
            <div className="CreateNote">
                <div className="plusButton" onClick={()=>{setEditingNote(null); setShowForm(true)}}>+</div>
                {/* {showForm ? <NoteForm /> : <></>} */}
                {showForm && <NoteForm onNoteAdded = {onNoteAdded} onNoteUpdated = {onNoteUpdated} onCancel={handleCancel} editingNote={editingNote}/>}

            </div>
            <div className="NoteGrid">

                {notes.map(note =>(
                    < NoteCard onNoteDelete={onNoteDelete} onNoteEdit={onNoteEdit} key={note.id} {...note} />
                ))}
            </div> 
            
        </div>
    )
}
