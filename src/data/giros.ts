export type Giro = { code: string; name: string };

// Canonical dataset lives in giros.json for portability.
// This TS wrapper provides types, helpers and indexed access.
import data from './giros.json';

export const giros: Giro[] = data as Giro[];

// Map for O(1) lookups by code
export const girosByCode: Record<string, Giro> = Object.fromEntries(
  giros.map((g) => [g.code, g])
);

export function searchGiros(query: string, limit = 20): Giro[] {
  if (!query) return giros.slice(0, limit);
  const q = query.toLowerCase();
  return giros
    .filter((g) => g.code.includes(q) || g.name.toLowerCase().includes(q))
    .slice(0, limit);
}

export function toSelectOptions(list: Giro[]) {
  return list.map((g) => ({ value: g.code, label: `${g.code} — ${g.name}` }));
}
