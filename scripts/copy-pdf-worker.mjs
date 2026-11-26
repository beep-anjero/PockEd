// Copies the pdf.js worker that ships with pdfjs-dist into public/ so the
// browser can load it from a stable static URL (/pdf.worker.min.mjs).
//
// Why: bundler-specific asset imports (e.g. `?url`) are not supported by
// Next.js/Turbopack, which left `GlobalWorkerOptions.workerSrc` undefined and
// broke PDF uploads. Copying keeps the worker version locked to the installed
// pdfjs-dist version, which pdf.js requires to match the API version.
//
// Runs automatically through the predev / prebuild npm hooks.

import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const destDir = join(root, 'public');
const dest = join(destDir, 'pdf.worker.min.mjs');

try {
  await mkdir(destDir, { recursive: true });
  await copyFile(source, dest);
  console.log('[copy-pdf-worker] Copied pdf.worker.min.mjs to public/');
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[copy-pdf-worker] Failed to copy the pdf.js worker: ${message}`);
  console.error('[copy-pdf-worker] Run `npm install` and try again.');
  process.exit(1);
}
