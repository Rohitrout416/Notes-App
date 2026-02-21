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

    const onNoteAdded = (newNote: Note) =>{
        setNotes([newNote, ...notes])
        setShowForm(false)
    }
    
    const onNoteDelete = (id: number) =>{
        setNotes(notes.filter(note => note.id !== id))
    }

    return(
        <div>
            <div className="CreateNote">
                <div onClick={()=>setShowForm(!showForm)}>+</div>
                {/* {showForm ? <NoteForm /> : <></>} */}
                {showForm && <NoteForm onNoteAdded = {onNoteAdded}/>}

            </div>
            <div className="NoteGrid">

                {notes.map(note =>(
                    < NoteCard onNoteDelete={onNoteDelete} key={note.id} {...note} />
                ))}
            </div> 
            
        </div>
    )
}
