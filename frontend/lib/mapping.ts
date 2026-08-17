import type { DocumentListItem, DocumentDetailResponse, SearchResult as ApiSearchResult, FolderTreeNode } from "@/types";
import type { Book, Citation, BookStatus } from "@/lib/types";

const COVER_PALETTE: [string, string][] = [
  ["#6366F1", "#312E81"],
  ["#06B6D4", "#164E63"],
  ["#F59E0B", "#78350F"],
  ["#10B981", "#064E3B"],
  ["#EF4444", "#7F1D1D"],
  ["#818CF8", "#3730A3"],
];

function coverColorFor(id: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return COVER_PALETTE[hash % COVER_PALETTE.length];
}

function statusFor(status: string): BookStatus {
  if (status === "indexed") return "Indexed";
  if (status === "failed") return "Failed";
  return "Processing";
}

export function docToBook(doc: DocumentListItem, folderName?: string): Book {
  return {
    id: doc.id,
    title: doc.title,
    subject: folderName || "Uncategorized",
    coverColor: coverColorFor(doc.id),
    uploadDate: doc.created_at,
    status: statusFor(doc.status),
    file: doc.download_url || "",
  };
}

export function docDetailToBook(doc: DocumentDetailResponse, folderName?: string): Book {
  const authorMeta = doc.metadata?.find((m) => m.key.toLowerCase() === "author" || m.key.toLowerCase() === "authors");
  return {
    id: doc.document_id,
    title: doc.title,
    authors: authorMeta ? [String(authorMeta.value)] : undefined,
    subject: folderName || "Uncategorized",
    coverColor: coverColorFor(doc.document_id),
    uploadDate: doc.created_at,
    status: statusFor(doc.status),
    file: doc.current_version?.download_url || "",
  };
}

export function searchResultToCitation(r: ApiSearchResult): Citation {
  return {
    bookId: r.document_id,
    bookTitle: r.document_name,
    chapter: "",
    page: r.page_number || 1,
    excerpt: r.snippet,
  };
}

export function flattenFolderTree(nodes: FolderTreeNode[]): { id: string; name: string }[] {
  const out: { id: string; name: string }[] = [];
  const walk = (list: FolderTreeNode[]) => {
    for (const n of list) {
      out.push({ id: n.id, name: n.name });
      const kids = n.subfolders || n.children;
      if (kids?.length) walk(kids);
    }
  };
  walk(nodes);
  return out;
}
