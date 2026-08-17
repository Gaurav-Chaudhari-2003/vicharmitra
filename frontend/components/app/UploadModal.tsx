"use client";
import { useCallback, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/vm-button";
import { api } from "@/lib/api";

type Stage = "idle" | "uploading" | "processing" | "done" | "error";

export function UploadModal({
  open,
  onOpenChange,
  subjects,
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subjects: { id: string; name: string }[];
  onUploaded: () => void;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState("");
  const [folderId, setFolderId] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const doUpload = useCallback(
    async (file: File) => {
      setFileName(file.name);
      setStage("uploading");
      setError("");
      try {
        const res = await api.documents.upload(file, folderId || null);
        setStage("processing");

        const documentId = res.document_id;
        let attempts = 0;
        const poll = async (): Promise<void> => {
          attempts++;
          const doc = await api.documents.get(documentId);
          if (doc.status === "indexed") {
            setStage("done");
            onUploaded();
            return;
          }
          if (doc.status === "failed") {
            setStage("error");
            setError("Indexing failed on the server.");
            return;
          }
          if (attempts > 40) {
            setStage("done");
            onUploaded();
            return;
          }
          await new Promise((r) => setTimeout(r, 3000));
          return poll();
        };
        await poll();
      } catch (e: any) {
        setStage("error");
        setError(e?.message || "Upload failed");
      }
    },
    [folderId, onUploaded]
  );

  const reset = () => {
    setStage("idle");
    setFileName("");
    setError("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload New Book</DialogTitle>
          <DialogDescription>Drop a PDF and Vicharmitra AI will OCR, chunk, and index it automatically.</DialogDescription>
        </DialogHeader>

        {stage === "idle" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) doUpload(f);
            }}
            className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <UploadCloud className="h-9 w-9 text-primary" />
            <p className="text-sm font-medium text-text-main">Drag & drop a file here</p>
            <p className="text-xs text-text-muted">or</p>
            <label className="cursor-pointer">
              <span className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark">
                Browse Files
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && doUpload(e.target.files[0])}
              />
            </label>

            {subjects.length > 0 && (
              <div className="mt-4 w-full text-left">
                <label className="text-xs font-medium text-text-muted">Subject / Folder</label>
                <select
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-surface/60 px-3 py-2 text-sm text-text-main"
                >
                  <option value="">Uncategorized</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {(stage === "uploading" || stage === "processing") && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 animate-pulse text-primary" />
              <div className="flex-1">
                <p className="truncate text-sm font-medium text-text-main">{fileName}</p>
                <p className="text-xs text-text-muted">
                  {stage === "uploading" ? "Uploading…" : "OCR, chunking & embedding in progress…"}
                </p>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-primary to-accent" />
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 size={18} />
              <p className="text-sm font-medium">Indexed and ready to search</p>
            </div>
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        )}

        {stage === "error" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle size={18} />
              <p className="text-sm font-medium">{error || "Something went wrong"}</p>
            </div>
            <Button className="w-full" variant="outline" onClick={reset}>
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
