import type { Note } from "../types"
export default function NoteCard(note: Note){
    return(
        <div className="Note">
            <div className="title">
                <h3>{note.title}</h3>
                <p>{note.created_at}</p>
            </div>
            <p>{note.body}</p>
        </div>
    )
}   