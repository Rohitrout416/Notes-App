export interface Note {
    id: number,
    title: string,
    body: string,
    created_at: string
    user_id: number
}

export interface NoteFormProps {
    onNoteAdded: (note: Note) => void,
    onNoteUpdated: (note: Note) => void,
    onCancel: () => void,
    editingNote: Note | null,
    setIsGlobalLoading: (isGlobalLoading: boolean) => void,
    isGlobalLoading: boolean
}

export interface NoteCardProps extends Note {
    onNoteDelete: (id: number) => void,
    onNoteEdit: (note: Note) => void,
    setIsGlobalLoading: (isGlobalLoading: boolean) => void
}

export interface User {
    id: number;
    email: string;
}

export interface AuthContextType {
    currentUser: User | null;
    login: (user: User) => void;
    logout: () => void;
    isInitializing: boolean;
}