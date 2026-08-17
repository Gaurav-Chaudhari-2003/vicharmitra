"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { ZoomIn, ZoomOut, Maximize2, Search, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PdfViewerHandle {
  jumpTo: (page: number) => void;
}

export function PdfViewer({
  fileUrl,
  jumpToPage,
  jumpKey,
}: {
  fileUrl: string;
  jumpToPage: number | null;
  jumpKey: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.1);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPdfError(false);
    setPage(1);

    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjsLib.getDocument({ url: fileUrl }).promise;
        if (cancelled) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
      } catch (e) {
        console.error("PDF load failed", e);
        if (!cancelled) setPdfError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !canvasRef.current) return;
      const pg = await pdfDoc.getPage(pageNum);
      const viewport = pg.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await pg.render({ canvasContext: ctx, viewport }).promise;
    },
    [pdfDoc, scale]
  );

  useEffect(() => {
    if (pdfDoc) renderPage(page);
  }, [pdfDoc, page, scale, renderPage]);

  useEffect(() => {
    if (jumpToPage && pdfDoc) {
      const clamped = Math.min(Math.max(1, jumpToPage), numPages || jumpToPage);
      setPage(clamped);
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      setFlash(false);
      requestAnimationFrame(() => setFlash(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpKey, pdfDoc]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg p-1.5 text-text-muted hover:bg-surface-glass disabled:opacity-30"
            disabled={page <= 1}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[110px] text-center text-xs font-medium text-text-muted">
            Page {page} of {numPages || "…"}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(numPages || p + 1, p + 1))}
            className="rounded-lg p-1.5 text-text-muted hover:bg-surface-glass disabled:opacity-30"
            disabled={page >= numPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="mx-1 h-5 w-px bg-border" />

        <button onClick={() => setScale((s) => Math.max(0.5, s - 0.15))} className="rounded-lg p-1.5 text-text-muted hover:bg-surface-glass">
          <ZoomOut size={15} />
        </button>
        <button onClick={() => setScale((s) => Math.min(2.5, s + 0.15))} className="rounded-lg p-1.5 text-text-muted hover:bg-surface-glass">
          <ZoomIn size={15} />
        </button>
        <button onClick={() => setScale(1.1)} className="rounded-lg p-1.5 text-text-muted hover:bg-surface-glass">
          <Maximize2 size={15} />
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        <div className="relative min-w-[120px] flex-1 max-w-[220px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input placeholder="Search in PDF…" className="h-8 pl-7 text-xs" />
        </div>

        <button
          onClick={() => setBookmarked((b) => !b)}
          className={cn("ml-auto rounded-lg p-1.5 hover:bg-surface-glass", bookmarked ? "text-accent" : "text-text-muted")}
        >
          <Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto bg-black/5 dark:bg-black/40 p-6">
        {loading && (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">Loading PDF…</div>
        )}
        {pdfError && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-text-muted">
            <p>Couldn&apos;t render this PDF in-browser.</p>
            <a href={fileUrl} target="_blank" rel="noreferrer" className="text-accent underline">
              Open the source file directly
            </a>
          </div>
        )}
        {!loading && !pdfError && (
          <div className="relative mx-auto w-fit">
            <canvas ref={canvasRef} className="rounded-lg shadow-2xl" />
            {flash && (
              <div
                onAnimationEnd={() => setFlash(false)}
                className="vm-citation-highlight pointer-events-none absolute inset-0 rounded-lg border-2 border-warning bg-warning/10"
                title="Jumped to the cited page — exact passage highlighting isn't available yet"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
