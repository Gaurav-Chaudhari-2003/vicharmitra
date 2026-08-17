"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, MessageSquare, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/vm-button";
import { Card } from "@/components/ui/vm-card";
import { Badge } from "@/components/ui/vm-badge";
import { MarkdownAnswer } from "@/components/app/MarkdownAnswer";
import { api } from "@/lib/api";
import type { SearchResponse } from "@/types";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleSelected = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const runSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.search.query(query);
      setResult(res);
      setSelected(Array.from(new Set(res.results.map((r) => r.document_id))));
    } catch (e: any) {
      setError(e?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold text-text-main">Cross-Book Semantic Discovery</h1>
      <p className="mb-6 text-sm text-text-muted">Search meaning, not keywords — across your whole library at once.</p>

      <Card className="p-4">
        <div className="relative">
          <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Ask a question across every book in your library…"
            className="h-11 pl-10"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={runSearch} disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <SearchIcon size={14} />} Search
          </Button>
        </div>
      </Card>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      {result && (
        <div className="mt-6 space-y-4">
          <Card className="p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent">AI Summary</p>
            <MarkdownAnswer content={result.ai_summary} />
          </Card>

          {result.results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-text-muted">
              No matching content found in your library for this query.
            </div>
          ) : (
            Object.values(
              result.results.reduce<Record<string, typeof result.results>>((acc, r) => {
                (acc[r.document_id] ||= []).push(r);
                return acc;
              }, {})
            ).map((group) => {
              const r0 = group[0];
              return (
                <Card key={r0.document_id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-text-main">{r0.document_name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={r0.score > 0.85 ? "success" : r0.score > 0.7 ? "default" : "outline"}>
                        {Math.round(r0.score * 100)}% match
                      </Badge>
                      <input
                        type="checkbox"
                        checked={selected.includes(r0.document_id)}
                        onChange={() => toggleSelected(r0.document_id)}
                        className="h-4 w-4 accent-primary"
                      />
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {group.map((m, i) => (
                      <div key={i} className="rounded-xl border border-border bg-surface/40 p-3">
                        {m.page_number != null && (
                          <p className="text-xs font-medium text-accent">p. {m.page_number}</p>
                        )}
                        <p className="mt-1 text-sm text-text-muted">{m.snippet}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })
          )}

          {result.results.length > 0 && (
            <Button
              size="lg"
              className="w-full"
              disabled={selected.length === 0}
              onClick={() => router.push(`/workspace?books=${selected.join(",")}`)}
            >
              <MessageSquare size={16} /> Open Q&A Workspace with Selected Books ({selected.length})
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
