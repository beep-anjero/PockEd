// Client-side text extraction from PDF, DOCX, and TXT files.
// Designed to run in the browser without a backend.

export type ExtractResult = {
  text: string;
  pages?: number;
  warnings?: string[];
};

const MAX_CHARS = 200_000; // safety cap so we never blow up the browser

export async function extractTextFromFile(file: File): Promise<ExtractResult> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    return extractPdf(file);
  }
  if (
    name.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractDocx(file);
  }
  if (
    name.endsWith('.txt') ||
    name.endsWith('.md') ||
    file.type.startsWith('text/') ||
    file.type === ''
  ) {
    return extractTxt(file);
  }
  throw new Error(
    `Unsupported file type: ${file.type || name || 'unknown'}. Please upload a PDF, DOCX, or TXT file.`
  );
}

function truncate(text: string): string {
  if (text.length <= MAX_CHARS) return text;
  return text.slice(0, MAX_CHARS) + '\n\n[...content truncated for processing...]';
}

async function extractTxt(file: File): Promise<ExtractResult> {
  const text = await file.text();
  return { text: truncate(text) };
}

async function extractDocx(file: File): Promise<ExtractResult> {
  const mammoth = await import('mammoth/mammoth.browser');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const warnings = (result.messages || [])
    .filter((m: { type: string }) => m.type === 'warning')
    .map((m: { message: string }) => m.message);
  return { text: truncate(result.value || ''), warnings };
}

async function extractPdf(file: File): Promise<ExtractResult> {
  // Lazy-load pdfjs-dist so it only ships when a user actually uploads a PDF
  const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
  // Use the worker file shipped with pdfjs-dist (copied via ?url so Next bundles it)
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages as number;

  const parts: string[] = [];
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: unknown) => {
        if (typeof item === 'object' && item && 'str' in item) {
          return String((item as { str: unknown }).str ?? '');
        }
        return '';
      })
      .filter(Boolean)
      .join(' ');
    if (pageText.trim()) parts.push(pageText.trim());
  }

  // Best-effort cleanup
  const combined = parts
    .join('\n\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { text: truncate(combined), pages: pageCount };
}