import React, { useState } from "react"
import type { NoteFormProps } from "../types"

export default function NoteForm({editingNote, onNoteAdded, onCancel, onNoteUpdated}: NoteFormProps){
    const [title, setTitle] = useState(editingNote ? editingNote.title : "")
    const [body, setBody] = useState(editingNote ? editingNote.body : "")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();

        if(editingNote){
            setIsLoading(true);

            fetch(`http://localhost:8000/notes/${editingNote.id}`, {
                method: "PATCH",
                headers:{
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    title, body
                })
            })
            .then(res => res.json())
            .then(data => onNoteUpdated(data))
            .then(()=> {
                setTitle("")
                setBody("")
            })
            .then(() => setIsLoading(false))
            .catch(() => setIsLoading(false))
            .catch(err => console.log(err));
        }
        else{
            setIsLoading(true);
    
            fetch("http://localhost:8000/notes/",{
                method:"POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title, body, user_id: 1
                })
            }).then(res =>res.json())
            .then(data => onNoteAdded(data))
            .then(()=>{
                setTitle("")
                setBody("")
            })
            .then(() => setIsLoading(false))
            .catch(()=> setIsLoading(false))
            .catch(err => console.log(err));
        }
    }
    
    return(
        <div className="createForm">
            <form onSubmit={handleSubmit}>
                <p className="Heading">Create Note</p>
                <p className="Label">Title</p>
                <input type="text" name="title" placeholder="Please enter the title of the note" value={title} onChange={(e)=>setTitle(e.target.value)} />
                <p className="Label">Body</p>
                <textarea name="body" placeholder="Please enter the content of the note" value={body} onChange={(e)=>setBody(e.target.value)}></textarea>

                <button className="submitBtn" type="submit" disabled={isLoading}>{editingNote ? "Update" :"Create"}</button>
                <button className="cancelBtn" type="button" onClick={onCancel}>Cancel</button>
            </form>
        </div>
    )
}