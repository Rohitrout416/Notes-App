import type { NoteCardProps } from "../types"
export default function NoteCard({id, title, body, created_at, onNoteDelete, onNoteEdit, setIsGlobalLoading}: NoteCardProps){
    const dateobj = new Date(created_at)

    const deleteNote = (id: number, e: React.MouseEvent)=>{
        setIsGlobalLoading(true)
        fetch(`http://localhost:8000/notes/${id}`, {
            method:"DELETE",
            headers:{
                "Content-Type":"application/json"
            }
        }).then(() => onNoteDelete(id))
        .then(() => setIsGlobalLoading(false))
        .catch(err => console.log(err))
        
        e.stopPropagation();
    }

    // const editNote = (id: number)=>{
        
    // }
    return(
        <div className="Note" onClick={()=>onNoteEdit({id, title, body, created_at, user_id: 1})}>
            <span className="deleteNote" onClick={(e)=>deleteNote(id, e)}>❌</span>
            <div className="title">
                <h3>{title}</h3>
                <p>{dateobj.toDateString()}</p>
            </div>
            <p>{body}</p>
        </div>
    )
}   