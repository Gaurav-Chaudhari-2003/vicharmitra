"use client";
import { useState } from "react";
import { AlertTriangle, Copy, StickyNote, ShieldCheck, RotateCcw, Check } from "lucide-react";
import { MarkdownAnswer } from "./MarkdownAnswer";
import { CitationBadge } from "./CitationBadge";
import { saveNotes } from "@/lib/notesStore";
import type { ChatMessage, Citation } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ChatBubble({
  message,
  onCitationClick,
}: {
  message: ChatMessage;
  onCitationClick: (c: Citation) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  if (message.role === "user") {
    return (
      <div className="flex justify-end animate-slideUp">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)]">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.isRefusal) {
    return (
      <div className="flex justify-start animate-slideUp">
        <div className="flex max-w-[85%] items-start gap-3 rounded-2xl rounded-tl-sm border border-warning/30 bg-warning/10 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-semibold text-warning">Information Not Found</p>
            <p className="mt-1 text-sm text-text-muted">
              The selected books do not contain details regarding this topic. Vicharmitra AI only answers from your
              library — nothing is fabricated.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-slideUp">
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm vm-glass px-4 py-3">
        <MarkdownAnswer content={message.content} />

        {!!message.citations?.length && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-2.5">
            <span className="text-[11px] font-medium text-text-muted mr-1">Sources:</span>
            {message.citations.map((c, i) => (
              <CitationBadge key={i} citation={c} onClick={onCitationClick} />
            ))}
          </div>
        )}

        <div className="mt-2.5 flex items-center gap-1 border-t border-border pt-2">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(message.content);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-text-muted hover:bg-surface-glass hover:text-text-main"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />} Copy
          </button>
          <button
            disabled={!message.citations?.length}
            onClick={() => {
              if (!message.citations?.length) return;
              saveNotes(message.citations);
              setSaved(true);
              setTimeout(() => setSaved(false), 1500);
            }}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-text-muted hover:bg-surface-glass hover:text-text-main disabled:opacity-40"
          >
            {saved ? <Check size={12} /> : <StickyNote size={12} />} {saved ? "Saved" : "Export to Notes"}
          </button>
          <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-text-muted hover:bg-surface-glass hover:text-text-main">
            <ShieldCheck size={12} /> Re-verify Grounding
          </button>
          <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-text-muted hover:bg-surface-glass hover:text-text-main">
            <RotateCcw size={12} /> Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}

export function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm vm-glass px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-primary animate-pulseGlow" />
        <span className="text-xs text-text-muted">Vicharmitra AI is verifying grounding across your library…</span>
      </div>
    </div>
  );
}
