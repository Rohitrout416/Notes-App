import type { NoteFormProps } from "../types"

export default function NoteForm({ editingNote, onNoteAdded, onCancel, onNoteUpdated, setIsGlobalLoading }: NoteFormProps) {

    const clientAction = async (formData: FormData) => {
        const title = formData.get("title") as string;
        const body = formData.get("body") as string;

        if (!title.trim() || !body.trim()) {
            alert("Please fill all the fields");
            return;
        }

        setIsGlobalLoading(true);

        try {
            if (editingNote) {
                const res = await fetch(`http://localhost:8000/notes/${editingNote.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, body })
                });
                const data = await res.json();
                onNoteUpdated(data);
            } else {
                const res = await fetch("http://localhost:8000/notes/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, body, user_id: 1 })
                });
                const data = await res.json();
                onNoteAdded(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsGlobalLoading(false);
        }
    };

    return (
        <div className="createForm">
            <form action={clientAction}>
                <p className="Heading">{editingNote ? "Update Note" : "Create Note"}</p>
                <p className="Label">Title</p>
                <input
                    type="text"
                    name="title"
                    placeholder="Please enter the title of the note"
                    defaultValue={editingNote ? editingNote.title : ""}
                />
                <p className="Label">Body</p>
                <textarea
                    name="body"
                    placeholder="Please enter the content of the note"
                    defaultValue={editingNote ? editingNote.body : ""}
                ></textarea>

                <button className="submitBtn" type="submit">
                    {editingNote ? "Update" : "Create"}
                </button>
                <button className="cancelBtn" type="button" onClick={onCancel}>Cancel</button>
            </form>
        </div>
    )
}