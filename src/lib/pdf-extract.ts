// Simple client-side PDF text extractor using pdfjs-dist
// We only read the first N pages to keep it light. This runs in the browser.

export async function extractPdfTextFirstPages(file: File, maxPages = 3): Promise<string> {
  // Import only on client and point worker to a CDN to avoid bundling worker chunks in Next.js dev
  const pdfjs: any = await import('pdfjs-dist');
  // Use a pinned CDN worker to prevent local chunk writes/locks in Windows
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.js';

  const buf = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: buf });
  const doc = await loadingTask.promise;
  const pages = Math.min(maxPages, doc.numPages);
  let text = '';
  for (let i = 1; i <= pages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((it: any) => it.str).join(' ');
    text += `\n${pageText}`;
  }
  try { await doc.destroy?.(); } catch {}
  return text;
}

export function extractRutFromText(text: string): string | null {
  const t = (text || '').toString();
  // Support dotted formats like 77.553.354-4
  const mdotted = t.match(/\b\d{1,3}(?:\.\d{3}){1,2}-[0-9kK]\b/);
  if (mdotted) return mdotted[0].replace(/\./g, '');
  const m = t.match(/\b\d{7,8}-[0-9kK]\b/);
  if (m) return m[0];
  const m2 = t.match(/\b\d{8,9}\b/);
  return m2 ? m2[0] : null;
}

export function extractRazonSocialHeuristic(text: string): string | null {
  const lines = (text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  // 1) Look for explicit label "Razón Social" (accent-insensitive)
  let idx = lines.findIndex(l => /raz[oó]n\s+social/i.test(l));
  if (idx >= 0) {
    // Candidate: next non-empty line(s) after the label row
    for (let j = idx + 1; j < Math.min(lines.length, idx + 5); j++) {
      const cand = lines[j];
      if (cand && !/raz[oó]n\s+social/i.test(cand) && cand.length > 3) {
        return cand.slice(0, 140);
      }
    }
  }
  // 2) Look near RUT line (many informes show name right above/below the RUT)
  const rutLineIdx = lines.findIndex(l => /\b\d{7,8}-[0-9kK]\b/.test(l));
  if (rutLineIdx >= 0) {
    const window = lines.slice(Math.max(0, rutLineIdx - 3), Math.min(lines.length, rutLineIdx + 4));
    // Prefer company-like tokens
    const companyish = window.find(l => /\b(s\.a\.|s\.a|sociedad|ltda|limitada|spa|compa[nñ]ia|empresa)\b/i.test(l));
    if (companyish) return companyish.slice(0, 140);
    // Otherwise pick the longest uppercased-ish line
    const upperish = window
      .filter(l => l.replace(/[^A-Z]/g, '').length >= Math.min(5, Math.floor(l.length * 0.4)))
      .sort((a, b) => b.length - a.length)[0];
    if (upperish) return upperish.slice(0, 140);
  }
  // 3) Fallback: the first reasonably long line near the top
  const firstLong = lines.slice(0, 15).find(l => l.length > 10);
  return firstLong ? firstLong.slice(0, 140) : null;
}
