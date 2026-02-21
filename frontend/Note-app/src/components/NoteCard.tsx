import type { NoteCardProps } from "../types"
export default function NoteCard({id, title, body, created_at, onNoteDelete}: NoteCardProps){
    const dateobj = new Date(created_at)

    const deleteNote = (id: number)=>{
        fetch(`http://localhost:8000/notes/${id}`, {
            method:"DELETE",
            headers:{
                "Content-Type":"application/json"
            }
        }).then(() => onNoteDelete(id))
        .catch(err => console.log(err))
        


    }
    return(
        <div className="Note">
            <div className="deleteNote" onClick={()=>deleteNote(id)}>x</div>
            <div className="title">
                <h3>{title}</h3>
                <p>{dateobj.toDateString()}</p>
            </div>
            <p>{body}</p>
        </div>
    )
}   