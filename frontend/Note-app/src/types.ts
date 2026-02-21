export interface Note {
    id: number,
    title: string,
    body: string,
    created_at: string
    user_id: number
}

export interface NoteFormProps{
    onNoteAdded: (note: Note)=> void
}

export interface NoteCardProps extends Note{
    onNoteDelete: (id: number) => void
}