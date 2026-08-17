"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, MessageSquare, ListTree, Download, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/vm-card";
import { Badge } from "@/components/ui/vm-badge";
import type { Book } from "@/lib/types";

export function BookCover({ book, className }: { book: Book; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: `linear-gradient(155deg, ${book.coverColor[0]}, ${book.coverColor[1]})`,
      }}
    >
      <div className="flex h-full flex-col justify-between p-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">{book.subject}</span>
        <div>
          <p className="text-sm font-bold leading-tight text-white line-clamp-4">{book.title}</p>
        </div>
      </div>
    </div>
  );
}

export function BookCard({ book }: { book: Book }) {
  const router = useRouter();

  return (
    <Card className="group relative overflow-hidden hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_8px_32px_rgba(99,102,241,0.18)]">
      <BookCover book={book} className="h-40 w-full rounded-t-2xl" />

      <div className="p-4">
        <p className="line-clamp-2 text-sm font-semibold text-text-main">{book.title}</p>
        {!!book.authors?.length && <p className="mt-0.5 text-xs text-text-muted">{book.authors.join(", ")}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {book.edition && <Badge variant="outline">{book.edition}</Badge>}
          {!!book.pageCount && <Badge variant="subtle">{book.pageCount}p</Badge>}
          <Badge variant={book.status === "Indexed" ? "success" : book.status === "Failed" ? "danger" : "warning"}>
            {book.status === "Processing" && <Loader2 className="h-3 w-3 animate-spin" />}
            {book.status}
          </Badge>
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-canvas/90 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
        <button
          onClick={() => router.push(`/workspace?book=${book.id}`)}
          className="flex w-40 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-[0_0_16px_rgba(99,102,241,0.4)] hover:bg-primary-dark"
        >
          <MessageSquare size={14} /> Ask Q&A
        </button>
        <button
          onClick={() => router.push(`/workspace?book=${book.id}&view=pdf`)}
          className="flex w-40 items-center justify-center gap-2 rounded-xl border border-border bg-surface/80 px-3 py-2 text-xs font-semibold text-text-main hover:border-primary/40"
        >
          <BookOpen size={14} /> Open PDF Viewer
        </button>
        <button className="flex w-40 items-center justify-center gap-2 rounded-xl border border-border bg-surface/80 px-3 py-2 text-xs font-semibold text-text-main hover:border-primary/40">
          <ListTree size={14} /> Chapter Index
        </button>
        <a
          href={book.file}
          download
          className="flex w-40 items-center justify-center gap-2 rounded-xl border border-border bg-surface/80 px-3 py-2 text-xs font-semibold text-text-main hover:border-primary/40"
        >
          <Download size={14} /> Download Original
        </a>
      </div>
    </Card>
  );
}
