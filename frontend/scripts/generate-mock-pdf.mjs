import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "mock-books");
mkdirSync(outDir, { recursive: true });

const BOOKS = [
  { file: "deep-learning.pdf", title: "Deep Learning Principles & Architectures", chapters: ["Introduction to Neural Networks", "Backpropagation & Optimization", "Convolutional Networks", "Recurrent & Sequence Models", "Regularization Techniques", "Attention & Transformers", "Generative Models", "Deployment at Scale"] },
  { file: "university-physics.pdf", title: "University Physics with Modern Physics", chapters: ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics", "Relativity", "Quantum Mechanics", "Nuclear Physics", "Particle Physics"] },
  { file: "stewart-calculus.pdf", title: "Stewart Calculus: Early Transcendentals", chapters: ["Functions & Limits", "Derivatives", "Applications of Derivatives", "Integrals", "Applications of Integration", "Series & Sequences", "Multivariable Calculus", "Vector Calculus"] },
  { file: "generic.pdf", title: "Reference Volume", chapters: ["Chapter One", "Chapter Two", "Chapter Three", "Chapter Four", "Chapter Five", "Chapter Six"] },
];

const PAGES_PER_BOOK = 260;

async function buildBook(book) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const chapterEvery = Math.floor(PAGES_PER_BOOK / book.chapters.length);

  for (let i = 1; i <= PAGES_PER_BOOK; i++) {
    const page = pdf.addPage([612, 792]);
    const chapterIdx = Math.min(book.chapters.length - 1, Math.floor((i - 1) / chapterEvery));
    const chapterTitle = book.chapters[chapterIdx];

    page.drawText(book.title, { x: 56, y: 740, size: 10, font, color: rgb(0.4, 0.42, 0.46) });
    page.drawText(`Chapter ${chapterIdx + 1}: ${chapterTitle}`, { x: 56, y: 690, size: 20, font: bold, color: rgb(0.09, 0.09, 0.12) });
    page.drawLine({ start: { x: 56, y: 675 }, end: { x: 556, y: 675 }, thickness: 1, color: rgb(0.85, 0.85, 0.88) });

    const paragraph =
      "This is placeholder body text standing in for the original textbook content on this page. " +
      "It demonstrates page layout, pagination, and the citation highlight overlay used by the Grounded Q&A Workspace. " +
      "In a production deployment this region would contain the real OCR-extracted and re-flowed text of the source volume.";
    const words = paragraph.split(" ");
    let line = "";
    let y = 640;
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (font.widthOfTextAtSize(test, 11) > 500) {
        page.drawText(line, { x: 56, y, size: 11, font, color: rgb(0.2, 0.21, 0.24) });
        y -= 18;
        line = w;
      } else {
        line = test;
      }
    }
    if (line) page.drawText(line, { x: 56, y, size: 11, font, color: rgb(0.2, 0.21, 0.24) });

    // A highlighted "cited excerpt" style block used for citation-jump demos
    page.drawRectangle({ x: 56, y: y - 90, width: 500, height: 46, color: rgb(0.98, 0.95, 0.8), opacity: 0.6 });
    page.drawText("Cited excerpt region (used by the citation highlight overlay demo).", {
      x: 66, y: y - 72, size: 10, font, color: rgb(0.35, 0.28, 0.05),
    });

    page.drawText(String(i), { x: 300, y: 40, size: 10, font, color: rgb(0.5, 0.5, 0.5) });
  }

  const bytes = await pdf.save();
  writeFileSync(path.join(outDir, book.file), bytes);
  console.log(`Wrote ${book.file} (${PAGES_PER_BOOK} pages)`);
}

for (const book of BOOKS) {
  await buildBook(book);
}
