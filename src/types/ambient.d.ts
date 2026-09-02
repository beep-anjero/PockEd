// Ambient module declarations for libraries without bundled TypeScript types.

// Mammoth (DOCX → text). Only the browser bundle is used in this app.
declare module 'mammoth/mammoth.browser' {
  export interface MammothMessage {
    type: string;
    message: string;
  }
  export interface MammothExtractResult {
    value: string;
    messages: MammothMessage[];
  }
  export function extractRawText(options: {
    arrayBuffer: ArrayBuffer;
  }): Promise<MammothExtractResult>;
}

// PDF.js (ESM build). Only the surface used in this app is typed.
declare module 'pdfjs-dist/build/pdf.mjs' {
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }
  export interface PDFPageProxy {
    getTextContent(): Promise<{
      items: unknown[];
    }>;
  }
  export interface PDFLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export function getDocument(options: { data: ArrayBuffer }): PDFLoadingTask;
}

// Next.js asset import suffix (?url returns the public URL of the asset).
declare module '*?url' {
  const url: string;
  export default url;
}