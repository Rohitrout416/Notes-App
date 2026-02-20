import NoteCard from "./components/NoteCard";
import type { Note } from "./types";
import './components/NoteCard.css'
import './App.css'
import NoteForm from "./components/NoteForm";
import { useState } from "react";

export default function App(){
    const notes: Note[] = [{
        title: "Note 1",
        body: "Body 1",
        created_at: "2022-01-01",
        user_id: 1,
        id: 1
    },
{
        title: "Note 1",
        body: "Body 1",
        created_at: "2022-01-01",
        user_id: 1,
        id: 1
    },
{
        title: "Note 1",
        body: "Body 1",
        created_at: "2022-01-01",
        user_id: 1,
        id: 1
    },
{
        title: "Note 1",
        body: "Body 1",
        created_at: "2022-01-01",
        user_id: 1,
        id: 1
    },
{
        title: "Note 1",
        body: "Body 1",
        created_at: "2022-01-01",
        user_id: 1,
        id: 1
    }]

    const [showForm, setShowForm] = useState(false);
    return(
        <div>
            <div className="CreateNote">
                <div onClick={()=>setShowForm(!showForm)}>+</div>
                {/* {showForm ? <NoteForm /> : <></>} */}
                {showForm && <NoteForm />}

            </div>
            <div className="NoteGrid">

                {notes.map(note =>(
                    < NoteCard key={note.id} {...note} />
                ))}
            </div> 
            
        </div>
    )
}