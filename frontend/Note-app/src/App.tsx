import NoteCard from "./components/NoteCard";
import type { Note } from "./types";
import './components/NoteCard.css'
import './App.css'

export default function App(){
    const note: Note = {
        title: "Note 1",
        body: "Body 1",
        created_at: "2022-01-01",
        user_id: 1,
        id: 1
    }
    return(
        <div>
            <div className="NoteGrid">

                <NoteCard {...note} />
                <NoteCard {...note} />
                <NoteCard {...note} />
                <NoteCard {...note} />
            </div>
            
        </div>
    )
}