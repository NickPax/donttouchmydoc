// Lazily loads PDF.js with a worker URL that works on static hosting.
// Keeps the heavy pdfjs-dist module out of the main bundle.

let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;

export function loadPdfjs(): Promise<typeof import('pdfjs-dist')> {
  if (pdfjsPromise) return pdfjsPromise;
  pdfjsPromise = (async () => {
    const pdfjs = await import('pdfjs-dist');
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    return pdfjs;
  })();
  return pdfjsPromise;
}
