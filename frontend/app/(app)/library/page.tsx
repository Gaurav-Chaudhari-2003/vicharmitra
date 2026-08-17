"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/vm-button";
import { BookCard } from "@/components/app/BookCard";
import { UploadModal } from "@/components/app/UploadModal";
import { api } from "@/lib/api";
import { docToBook, flattenFolderTree } from "@/lib/mapping";
import type { Book } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function LibraryPage() {
  const [query, setQuery] = useState("");
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [docs, tree] = await Promise.all([api.documents.list({ include_all: true }), api.folders.getTree()]);
      const flatFolders = flattenFolderTree(tree);
      setSubjects(flatFolders);
      const folderNameById = new Map(flatFolders.map((f) => [f.id, f.name]));
      setBooks(docs.filter((d) => !d.is_trashed).map((d) => docToBook(d, d.folder_id ? folderNameById.get(d.folder_id) : undefined)));
    } catch (e) {
      console.error("Failed to load library", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const matchesSubject = !subjectId || b.subject === subjects.find((s) => s.id === subjectId)?.name;
      const matchesQuery = !query || b.title.toLowerCase().includes(query.toLowerCase());
      return matchesSubject && matchesQuery;
    });
  }, [books, query, subjectId, subjects]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Library Shelf</h1>
          <p className="text-sm text-text-muted">Your institutional and personal digital volumes.</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Plus size={16} /> Upload New Book
        </Button>
      </div>

      <div className="mb-5 flex flex-col gap-3">
        <div className="relative max-w-xl">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your library…"
            className="pl-10"
          />
        </div>
        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSubjectId(null)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                !subjectId ? "border-primary bg-primary/15 text-primary-light" : "border-border text-text-muted hover:border-primary/40"
              )}
            >
              All Subjects
            </button>
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubjectId(s.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  subjectId === s.id ? "border-primary bg-primary/15 text-primary-light" : "border-border text-text-muted hover:border-primary/40"
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-text-muted">
          <Loader2 size={16} className="animate-spin" /> Loading your library…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-text-muted">
          {books.length === 0 ? "Your library is empty — upload your first book to get started." : "No books match your filters."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} subjects={subjects} onUploaded={load} />
    </div>
  );
}
