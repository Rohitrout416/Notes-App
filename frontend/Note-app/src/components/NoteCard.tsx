import type { NoteCardProps } from "../types"
import { useAuth } from "../context/AuthContext"

export default function NoteCard({ id, title, body, created_at, user_id, onNoteDelete, onNoteEdit, setIsGlobalLoading }: NoteCardProps) {
    const dateobj = new Date(created_at)
    const { currentUser } = useAuth();

    const deleteNote = (id: number, e: React.MouseEvent) => {
        setIsGlobalLoading(true)
        fetch(`/api/notes/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(() => onNoteDelete(id))
            .then(() => setIsGlobalLoading(false))
            .catch(err => console.log(err))

        e.stopPropagation();
    }

    // const editNote = (id: number)=>{

    // }
    return (
        <div className="Note" onClick={() => {
            if (currentUser && currentUser.id === user_id) {
                onNoteEdit({ id, title, body, created_at, user_id })
            }
        }}>
            {currentUser && currentUser.id === user_id && (
                <span className="deleteNote" onClick={(e) => deleteNote(id, e)}>❌</span>
            )}
            <div className="title">
                <h3>{title}</h3>
                <p>{dateobj.toDateString()}</p>
            </div>
            <p>{body}</p>
        </div>
    )
}