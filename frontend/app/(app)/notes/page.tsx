"use client";
import { useEffect, useState } from "react";
import { Download, Trash2, StickyNote } from "lucide-react";
import { Card } from "@/components/ui/vm-card";
import { Button } from "@/components/ui/vm-button";
import { getNotes, deleteNote, type SavedNote } from "@/lib/notesStore";

export default function NotesPage() {
  const [notes, setNotes] = useState<SavedNote[]>([]);

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const remove = (id: string) => {
    deleteNote(id);
    setNotes(getNotes());
  };

  const exportAnki = () => {
    const lines = notes.map((n) => `${n.bookTitle} ${n.chapter} p.${n.page}\t${n.excerpt.replace(/\t/g, " ")}`);
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vicharmitra-notes-anki.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Notes & Citations Export</h1>
          <p className="text-sm text-text-muted">
            Saved highlights from your Grounded Q&amp;A sessions — stored locally in this browser.
          </p>
        </div>
        <Button variant="accent" disabled={notes.length === 0} onClick={exportAnki}>
          <Download size={16} /> Export to Anki
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-text-muted">
          <StickyNote className="mx-auto mb-2 h-6 w-6" />
          No saved notes yet — export answers from the Q&amp;A Workspace to see them here.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <Card key={n.id} className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-semibold text-text-main">
                  {n.bookTitle}{n.chapter ? ` · ${n.chapter}` : ""} · p.{n.page}
                </p>
                <p className="mt-1 text-sm italic text-text-muted">&ldquo;{n.excerpt}&rdquo;</p>
                <p className="mt-2 text-[11px] text-text-muted">Saved {n.savedAt}</p>
              </div>
              <button
                onClick={() => remove(n.id)}
                className="shrink-0 rounded-lg p-1.5 text-text-muted hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 size={15} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
