#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Usage: node scripts/parse-giros-raw.mjs [inputPath] [outputPath]
// Defaults:
//   inputPath:  src/data/giros-raw.txt
//   outputPath: src/data/giros.json

const projectRoot = process.cwd();
const inPath = resolve(projectRoot, process.argv[2] || 'src/data/giros-raw.txt');
const outPath = resolve(projectRoot, process.argv[3] || 'src/data/giros.json');

// Read as raw buffer and detect BOM/encoding to support files saved as UTF-16 on Windows
const buf = await readFile(inPath);
let text;
if (buf.length >= 2 && buf[0] === 0xFF && buf[1] === 0xFE) {
  // UTF-16 LE with BOM
  text = Buffer.from(buf.subarray(2)).toString('utf16le');
} else if (buf.length >= 2 && buf[0] === 0xFE && buf[1] === 0xFF) {
  // UTF-16 BE with BOM -> convert to LE by swapping or decode as utf16le after swap
  const swapped = Buffer.allocUnsafe(buf.length - 2);
  for (let i = 2; i < buf.length; i += 2) {
    swapped[i - 2] = buf[i + 1];
    swapped[i - 1] = buf[i];
  }
  text = swapped.toString('utf16le');
} else if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
  // UTF-8 with BOM
  text = Buffer.from(buf.subarray(3)).toString('utf8');
} else {
  // Heuristic: many NUL bytes suggests UTF-16LE without BOM (0x00 every other byte)
  let nulCount = 0;
  for (let i = 0; i < Math.min(buf.length, 2048); i++) if (buf[i] === 0) nulCount++;
  const isLikelyUtf16 = nulCount > Math.min(buf.length, 2048) / 4;
  text = buf.toString(isLikelyUtf16 ? 'utf16le' : 'utf8');
}

const rawLines = text.split(/\r?\n/);
const isHeader = (s) => {
  const t = (s || '').trim();
  if (!t) return true;
  // Only treat as header if it does NOT start with a 6-digit code
  if (/^\d{6}\b/.test(t)) return false;
  return /^(AGRICULTURA|Código|IVA|Categoría|Tributaria|Disponible\s+Internet|EXPLOTACIÓN|INDUSTRIA|SUMINISTRO|CONSTRUCCIÓN|COMERCIO|TRANSPORTE|INFORMACIÓN|ACTIVIDADES|OTRAS|ENSEÑANZA|ADMINISTRACIÓN|ACTIVIDADES\s+DE\s+LOS\s+HOGARES|ACTIVIDADES\s+DE\s+ORGANIZACIONES)/i.test(t);
};

const items = [];
for (let i = 0; i < rawLines.length; i++) {
  const original = rawLines[i] ?? '';
  // Normalize NBSP and trim
  const line = original.replace(/\u00A0/g, ' ').trim();

  if (!line) continue;

  // Try inline first: 6 digits + whitespace + name
  // Split columns by tabs OR 2+ spaces (common export formats)
  if (/^\d{6}\b/.test(line)) {
    const cols = line.split(/\t+| {2,}/).filter(Boolean);
    if (cols.length >= 2 && /^\d{6}$/.test(cols[0])) {
      const code = cols[0];
      let name = cols[1].trim();
      // Drop common trailing tokens if they were glued into name by single spaces
      name = name.replace(/\s+(SI|NO|G)(\s+\d+)?(\s+(SI|NO|G))?\s*$/i, '').trim();
      if (name) {
        items.push({ code, name: name.replace(/\s+/g, ' ') });
        continue;
      }
    }
    // Fallback: allow single spaces between code and name
    const m2 = line.match(/^(\d{6})\s+(.+)$/);
    if (m2) {
      const code = m2[1];
      // drop trailing columns (e.g., SI 1 SI) separated by tabs or 2+ spaces
      let name = m2[2].split(/\t+| {2,}/)[0].trim();
      name = name.replace(/\s+(SI|NO|G)(\s+\d+)?(\s+(SI|NO|G))?\s*$/i, '').trim();
      if (name) {
        items.push({ code, name: name.replace(/\s+/g, ' ') });
        continue;
      }
    }
  }

  // Two-line: current line is exactly the code
  if (/^\d{6}$/.test(line)) {
    const code = line;
    // find the next non-header, non-empty line as the name
    let j = i + 1;
    while (j < rawLines.length) {
      const cand = (rawLines[j] ?? '').replace(/\u00A0/g, ' ').trim();
      if (cand) {
        let name = cand.split(/\t+| {2,}/)[0].trim();
        name = name.replace(/\s+(SI|NO|G)(\s+\d+)?(\s+(SI|NO|G))?\s*$/i, '').trim();
        if (name) items.push({ code, name: name.replace(/\s+/g, ' ') });
        i = j; // jump to name line
        break;
      }
      j++;
    }
  }
}

// de-duplicate by code
const seen = new Set();
const dedup = [];
for (const it of items) {
  if (!seen.has(it.code)) {
    seen.add(it.code);
    dedup.push(it);
  }
}

// sort by code
const sorted = dedup.sort((a, b) => a.code.localeCompare(b.code));

await writeFile(outPath, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
console.log(`Parsed ${sorted.length} giros -> ${outPath}`);
