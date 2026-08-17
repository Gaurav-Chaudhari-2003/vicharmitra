"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, Atom, FlaskConical, Sigma, Stethoscope, Folder as FolderIcon, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/vm-card";
import { api } from "@/lib/api";
import { flattenFolderTree } from "@/lib/mapping";

const SUBJECT_META: Record<string, { icon: any; color: string }> = {
  "Computer Science": { icon: Cpu, color: "#6366F1" },
  Physics: { icon: Atom, color: "#06B6D4" },
  Chemistry: { icon: FlaskConical, color: "#10B981" },
  Mathematics: { icon: Sigma, color: "#F59E0B" },
  Medicine: { icon: Stethoscope, color: "#EF4444" },
};

export default function CatalogsPage() {
  const router = useRouter();
  const [counts, setCounts] = useState<{ id: string; name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.folders.getTree(), api.documents.list({ include_all: true })])
      .then(([tree, docs]) => {
        const folders = flattenFolderTree(tree);
        setCounts(
          folders.map((f) => ({
            ...f,
            count: docs.filter((d) => d.folder_id === f.id && !d.is_trashed).length,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold text-text-main">Subject Catalogs</h1>
      <p className="mb-6 text-sm text-text-muted">Browse your library organized by discipline.</p>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-text-muted">
          <Loader2 size={16} className="animate-spin" /> Loading catalogs…
        </div>
      ) : counts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-text-muted">
          No subject folders yet — create folders while uploading books to organize them here.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {counts.map(({ id, name, count }) => {
            const meta = SUBJECT_META[name] || { icon: FolderIcon, color: "#818CF8" };
            const Icon = meta.icon;
            return (
              <Card
                key={id}
                className="cursor-pointer p-5 hover:-translate-y-1 hover:border-primary/40"
                onClick={() => router.push(`/library?subject=${id}`)}
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: `${meta.color}22`, color: meta.color }}
                >
                  <Icon size={20} />
                </div>
                <p className="font-semibold text-text-main">{name}</p>
                <p className="text-sm text-text-muted">{count} volume{count === 1 ? "" : "s"}</p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
