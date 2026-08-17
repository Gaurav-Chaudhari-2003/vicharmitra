export type BookStatus = "Indexed" | "Processing" | "Failed";

export interface Book {
  id: string;
  title: string;
  authors?: string[];
  edition?: string;
  subject: string;
  pageCount?: number;
  coverColor: [string, string];
  uploadDate: string;
  status: BookStatus;
  isbn?: string;
  file: string;
}

export interface Chunk {
  id: string;
  bookId: string;
  chapter: string;
  page: number;
  text: string;
}

export interface Citation {
  bookId: string;
  bookTitle: string;
  chapter: string;
  page: number;
  excerpt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  isRefusal?: boolean;
  timestamp: string;
}

export interface SearchFilter {
  subjects: string[];
  courseCode?: string;
  query: string;
}

export interface SearchResultMatch {
  chapter: string;
  page: number;
  snippet: string;
}

export interface SearchResult {
  book: Book;
  relevance: number;
  matches: SearchResultMatch[];
}
