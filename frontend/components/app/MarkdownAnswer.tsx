"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export function MarkdownAnswer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none text-text-main prose-headings:text-text-main prose-strong:text-text-main prose-code:text-accent prose-p:leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
