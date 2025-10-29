export function cleanRut(rut: string): string {
  return (rut || '')
    .toString()
    .replace(/[^0-9kK]/g, '')
    .toUpperCase();
}

export function computeDV(num: number): string {
  let M = 0, S = 1;
  while (num > 0) {
    S = (S + (num % 10) * (9 - (M++ % 6))) % 11;
    num = Math.floor(num / 10);
  }
  return S ? String(S - 1) : 'K';
}

export function validateRut(rut: string): boolean {
  const cleaned = cleanRut(rut);
  if (!cleaned) return false;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  if (!/^[0-9]+$/.test(body)) return false;
  const expected = computeDV(parseInt(body, 10));
  return dv.toUpperCase() === expected.toUpperCase();
}

export function formatRut(rut: string): string {
  const cleaned = cleanRut(rut);
  if (!cleaned) return '';
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  const reversed = body.split('').reverse();
  const chunks: string[] = [];
  for (let i = 0; i < reversed.length; i += 3) {
    chunks.push(reversed.slice(i, i + 3).join(''));
  }
  const withDots = chunks.map((c) => c.split('').reverse().join('')).reverse().join('.');
  return `${withDots}-${dv}`;
}
