"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ShieldCheck, X, Plus, Send, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/vm-badge";
import { ChatBubble, ThinkingBubble } from "@/components/app/ChatBubble";
import { PdfViewer } from "@/components/app/PdfViewer";
import { api } from "@/lib/api";
import { docToBook, searchResultToCitation } from "@/lib/mapping";
import type { ChatMessage as UiChatMessage, Citation, Book } from "@/lib/types";
import { cn } from "@/lib/utils";

function WorkspaceInner() {
  const params = useSearchParams();
  const initialIds = useMemo(() => {
    const single = params.get("book");
    const many = params.get("books");
    if (many) return many.split(",").filter(Boolean);
    if (single) return [single];
    return [];
  }, [params]);

  const [scopedIds, setScopedIds] = useState<string[]>(initialIds);
  const [allDocs, setAllDocs] = useState<Book[]>([]);
  const [booksById, setBooksById] = useState<Record<string, Book>>({});
  const [activePdfId, setActivePdfId] = useState<string | undefined>(initialIds[0]);
  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [jumpPage, setJumpPage] = useState<number | null>(null);
  const [jumpKey, setJumpKey] = useState(0);
  const [mobileTab, setMobileTab] = useState<"chat" | "pdf">("chat");
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    api.documents.list({ include_all: true }).then((docs) => {
      const books = docs.filter((d) => !d.is_trashed).map((d) => docToBook(d));
      setAllDocs(books);
      setBooksById(Object.fromEntries(books.map((b) => [b.id, b])));
      if (!activePdfId && books.length) setActivePdfId(books[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scopedBooks = scopedIds.map((id) => booksById[id]).filter(Boolean) as Book[];
  const activeBook = (activePdfId && booksById[activePdfId]) || scopedBooks[0];

  const handleCitationClick = (c: Citation) => {
    setActivePdfId(c.bookId);
    setJumpPage(c.page);
    setJumpKey((k) => k + 1);
    setMobileTab("pdf");
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: UiChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    try {
      if (!sessionIdRef.current) {
        const session = await api.chat.createSession("Workspace Chat");
        sessionIdRef.current = session.id;
      }
      const res = await api.chat.sendMessage(sessionIdRef.current, text);
      const citations = (res.results || []).map(searchResultToCitation);
      const reply: UiChatMessage = {
        id: res.id,
        role: "assistant",
        content: res.content,
        citations: citations.length ? citations : undefined,
        isRefusal: !res.content?.trim() && citations.length === 0,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((m) => [...m, reply]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ ${e?.message || "Something went wrong reaching Vicharmitra AI."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  if (!activeBook) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-muted">
        <Loader2 size={16} className="mr-2 animate-spin" /> Loading your library…
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex md:hidden border-b border-border">
        {(["chat", "pdf"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMobileTab(t)}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium capitalize transition-colors",
              mobileTab === t ? "border-b-2 border-primary text-primary-light" : "text-text-muted"
            )}
          >
            {t === "chat" ? "AI Assistant" : "PDF Reader"}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <PanelGroup direction="horizontal" className="hidden md:flex h-full">
          <Panel defaultSize={42} minSize={28} className="flex flex-col border-r border-border">
            <ChatPane
              allDocs={allDocs}
              scopedBooks={scopedBooks}
              scopedIds={scopedIds}
              setScopedIds={setScopedIds}
              messages={messages}
              thinking={thinking}
              input={input}
              setInput={setInput}
              send={send}
              onCitationClick={handleCitationClick}
            />
          </Panel>
          <PanelResizeHandle className="w-1.5 bg-border/60 hover:bg-primary/50 transition-colors" />
          <Panel defaultSize={58} minSize={32}>
            <PdfPane allDocs={allDocs} activeBook={activeBook} setActivePdfId={setActivePdfId} jumpPage={jumpPage} jumpKey={jumpKey} />
          </Panel>
        </PanelGroup>

        <div className="flex md:hidden h-full flex-col">
          {mobileTab === "chat" ? (
            <ChatPane
              allDocs={allDocs}
              scopedBooks={scopedBooks}
              scopedIds={scopedIds}
              setScopedIds={setScopedIds}
              messages={messages}
              thinking={thinking}
              input={input}
              setInput={setInput}
              send={send}
              onCitationClick={handleCitationClick}
            />
          ) : (
            <PdfPane allDocs={allDocs} activeBook={activeBook} setActivePdfId={setActivePdfId} jumpPage={jumpPage} jumpKey={jumpKey} />
          )}
        </div>
      </div>
    </div>
  );
}

function ChatPane({ allDocs, scopedBooks, scopedIds, setScopedIds, messages, thinking, input, setInput, send, onCitationClick }: any) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {scopedBooks.map((b: Book) => (
            <span key={b.id} className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary-light">
              {b.title.split(" ").slice(0, 3).join(" ")}
              <button onClick={() => setScopedIds(scopedIds.filter((id: string) => id !== b.id))}>
                <X size={11} />
              </button>
            </span>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-[11px] text-text-muted hover:border-primary/50">
                <Plus size={11} /> Add book
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {allDocs.filter((b: Book) => !scopedIds.includes(b.id)).map((b: Book) => (
                <DropdownMenuItem key={b.id} onClick={() => setScopedIds([...scopedIds, b.id])}>
                  {b.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Badge variant="success" className="mt-2.5">
          <ShieldCheck size={12} /> 100% Book-Grounded (Zero Hallucination Mode Active)
        </Badge>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && !thinking && (
          <p className="pt-8 text-center text-sm text-text-muted">Ask a grounded question about your library.</p>
        )}
        {messages.map((m: UiChatMessage) => (
          <ChatBubble key={m.id} message={m} onCitationClick={onCitationClick} />
        ))}
        {thinking && <ThinkingBubble />}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface/60 px-3 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask a grounded question about your library…"
            className="flex-1 bg-transparent text-sm text-text-main outline-none placeholder:text-text-muted"
          />
          <button onClick={send} className="rounded-xl bg-primary p-2 text-white hover:bg-primary-dark">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PdfPane({ allDocs, activeBook, setActivePdfId, jumpPage, jumpKey }: any) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-main hover:border-primary/40">
              {activeBook.title}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {allDocs.map((b: Book) => (
              <DropdownMenuItem key={b.id} onClick={() => setActivePdfId(b.id)}>
                {b.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1 min-h-0">
        {activeBook.file ? (
          <PdfViewer fileUrl={activeBook.file} jumpToPage={jumpPage} jumpKey={jumpKey} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            This document is still processing — no file available to preview yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={null}>
      <WorkspaceInner />
    </Suspense>
  );
}
