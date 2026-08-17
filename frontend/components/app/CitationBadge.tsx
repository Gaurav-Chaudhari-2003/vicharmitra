"use client";
import { Quote } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Citation } from "@/lib/types";

export function CitationBadge({ citation, onClick }: { citation: Citation; onClick: (c: Citation) => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => onClick(citation)}
          className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent hover:bg-accent/20 hover:shadow-[0_0_10px_rgba(6,182,212,0.35)] transition-all align-middle mx-0.5"
        >
          <Quote size={10} />
          {citation.bookTitle.split(" ").slice(0, 2).join(" ")}{citation.chapter ? `, ${citation.chapter}` : ""}, p.{citation.page}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-semibold text-text-main mb-1">{citation.bookTitle}</p>
        <p className="text-text-muted italic">&ldquo;{citation.excerpt}&rdquo;</p>
      </TooltipContent>
    </Tooltip>
  );
}
