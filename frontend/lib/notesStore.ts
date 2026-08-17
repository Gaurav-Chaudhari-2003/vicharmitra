import type { Citation } from "@/lib/types";

export interface SavedNote extends Citation {
  id: string;
  savedAt: string;
}

const KEY = "vicharmitra_notes";

export function getNotes(): SavedNote[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveNote(citation: Citation): void {
  if (typeof window === "undefined") return;
  const notes = getNotes();
  notes.unshift({ ...citation, id: `${citation.bookId}-${citation.page}-${Date.now()}`, savedAt: new Date().toLocaleDateString() });
  localStorage.setItem(KEY, JSON.stringify(notes));
}

export function saveNotes(citations: Citation[]): void {
  citations.forEach(saveNote);
}

export function deleteNote(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(getNotes().filter((n) => n.id !== id)));
}
