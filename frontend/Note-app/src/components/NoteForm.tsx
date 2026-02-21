import React, { useState } from "react"
import type { NoteFormProps } from "../types"

export default function NoteForm({onNoteAdded}: NoteFormProps){
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        
        setIsLoading(true)

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
    
    return(
        <form onSubmit={handleSubmit}>
            <p>Title</p>
            <input type="text" name="title" placeholder="Please enter the title of the note" value={title} onChange={(e)=>setTitle(e.target.value)} />
            <p>Body</p>
            <textarea name="body" placeholder="Please enter the content of the note" value={body} onChange={(e)=>setBody(e.target.value)}></textarea>

            <button type="submit" disabled={isLoading}>{isLoading ? "Creating Note ..." :"Create"}</button>
        </form>
    )
}