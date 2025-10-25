export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function capitalPropioTramoLabel(tramo: number | null | undefined): string {
  const t = typeof tramo === 'number' ? tramo : 0;
  const map: Record<number, string> = {
    1: '0 < Capital Propio <=10 UF',
    2: '10 < Capital Propio <=25 UF',
    3: '25 < Capital Propio <=50 UF',
    4: '50 < Capital Propio <=100 UF',
    5: '100 < Capital Propio <=250 UF',
    6: '250 < Capital Propio <=500 UF',
    7: '500 < Capital Propio <=1.000 UF',
    8: '1.000 < Capital Propio <=2.000 UF',
    9: '2.000 < Capital Propio <=10.000 UF',
    10: '10.000 < Capital Propio',
  };
  return map[t] || 'Sin dato';
}

export function ventasRangeUFFromTramo(tramo: number | null | undefined): { min: number | null; max: number | null; median: number | null; label: string } {
  const t = typeof tramo === 'number' ? tramo : 0;
  // Ranges from SII F22 description
  const ranges: Record<number, { min: number | null; max: number | null; label: string }> = {
    1: { min: null, max: null, label: 'Sin Información' },
    2: { min: 0.01, max: 200, label: '0,01 a 200,00 UF anuales' },
    3: { min: 200.01, max: 600, label: '200,01 a 600,00 UF anuales' },
    4: { min: 600.01, max: 2400, label: '600,01 a 2.400,00 UF anuales' },
    5: { min: 2400.01, max: 5000, label: '2.400,01 a 5.000,00 UF anuales' },
    6: { min: 5000.01, max: 10000, label: '5.000,01 a 10.000,00 UF anuales' },
    7: { min: 10000.01, max: 25000, label: '10.000,01 a 25.000,00 UF anuales' },
    8: { min: 25000.01, max: 51000, label: '25.000,01 a 51.000,00 UF anuales' },
    9: { min: 50001, max: 100000, label: '50.001,00 a 100.000,00 UF anuales' },
    10: { min: 100001, max: 200000, label: '100.001,00 a 200.000,00 UF anuales' },
    11: { min: 200001, max: 400000, label: '200.001,00 a 400.000,00 UF anuales' },
    12: { min: 400001, max: 600000, label: '400.001,00 a 600.000,00 UF anuales' },
    13: { min: 600001, max: null, label: 'más de 600.000,01 UF anuales' },
  };
  const r = ranges[t] || ranges[1];
  let median: number | null = null;
  // Only closed intervals (2..12) have a defined median as mid-point
  if (t >= 2 && t <= 12 && r.min != null && r.max != null) median = (r.min + r.max) / 2;
  return { min: r.min, max: r.max, median, label: r.label };
}

export function isValidName(name: string, max = 50): boolean {
  const trimmed = name.trim();
  return trimmed.length > 1 && trimmed.length <= max;
}

export function isValidPhoneCL(prefix: string, number: string): boolean {
  // Chile mobile: +569 + 9 digits
  const okPrefix = prefix === '+569';
  const okNumber = /^\d{9}$/.test(number);
  return okPrefix && okNumber;
}

export function isStrongPassword(pw: string): boolean {
  // at least 8, max 64, one lowercase, one uppercase, one digit, one special
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/.test(pw);
}

// Chilean RUT utilities
function _cleanRut(raw: string): string {
  return (raw || '').toString().replace(/[^0-9kK]/g, '').toUpperCase();
}

function _computeDv(body: string): string {
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const mod = 11 - (sum % 11);
  if (mod === 11) return '0';
  if (mod === 10) return 'K';
  return String(mod);
}

export function validateRutCL(raw: string): boolean {
  const txt = _cleanRut(raw);
  if (!txt || txt.length < 2) return false;
  const body = txt.slice(0, -1);
  const dv = txt.slice(-1);
  if (!/^[0-9]+$/.test(body)) return false;
  return _computeDv(body) === dv.toUpperCase();
}

export function normalizeRutCL(raw: string): string | null {
  const txt = _cleanRut(raw);
  if (!txt || txt.length < 2) return null;
  const body = txt.slice(0, -1);
  if (!/^[0-9]+$/.test(body)) return null;
  const dv = _computeDv(body);
  return `${Number(body).toString()}-${dv}`;
}

// Only structural check (format), does not verify DV correctness
export function hasRutStructureCL(raw: string): boolean {
  const s = (raw || '').toString().trim();
  // allow formats like 12.345.678-5 or 12345678-5 or 123456785
  const cleaned = s.replace(/[^0-9kK]/g, '');
  if (cleaned.length < 2) return false;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  return /^[0-9]+$/.test(body) && /^[0-9kK]$/.test(dv);
}

export function rutBodyFromAny(raw: string): string | null {
  const cleaned = (raw || '').toString().replace(/[^0-9kK]/g, '');
  if (cleaned.length < 1) return null;
  const body = cleaned.replace(/[kK]$/, '').replace(/[^0-9]/g, '');
  if (!body) return null;
  return body.replace(/^0+/, '');
}

export function formatRutCL(raw: string): string {
  const txt = _cleanRut(raw);
  if (!txt) return '';
  // If user typed less than 2 chars, just return digits
  if (txt.length < 2) return txt;
  const body = txt.slice(0, -1).replace(/[^0-9]/g, '');
  const dv = txt.slice(-1);
  // thousand separators
  const bodyNum = Number(body).toString();
  const withDots = bodyNum.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots}-${dv}`;
}

export type CompanySize = 'micro' | 'pequena' | 'mediana' | 'grande' | 'desconocido';

export function companySizeFromVentasTramo(tramo: number | null | undefined): CompanySize {
  const t = typeof tramo === 'number' ? tramo : 0;
  if (t <= 1) return 'desconocido';
  if (t >= 2 && t <= 4) return 'micro';
  if (t >= 5 && t <= 7) return 'pequena';
  if (t >= 8 && t <= 10) return 'mediana';
  if (t >= 11 && t <= 13) return 'grande';
  return 'desconocido';
}

export function classifyCapitalPropioUF(valueUF: number | null | undefined): { tranche: number | null; label: string; sign: 'negativo' | 'cero' | 'positivo' } {
  if (valueUF == null || Number.isNaN(valueUF)) return { tranche: null, label: 'sin_dato', sign: 'cero' };
  const v = Number(valueUF);
  if (v < 0) return { tranche: null, label: 'capital_propio_negativo', sign: 'negativo' };
  if (v === 0) return { tranche: null, label: 'capital_propio_cero', sign: 'cero' };
  // Positive tranches
  if (v <= 10) return { tranche: 1, label: '0–10 UF', sign: 'positivo' };
  if (v <= 25) return { tranche: 2, label: '10–25 UF', sign: 'positivo' };
  if (v <= 50) return { tranche: 3, label: '25–50 UF', sign: 'positivo' };
  if (v <= 100) return { tranche: 4, label: '50–100 UF', sign: 'positivo' };
  if (v <= 250) return { tranche: 5, label: '100–250 UF', sign: 'positivo' };
  if (v <= 500) return { tranche: 6, label: '250–500 UF', sign: 'positivo' };
  if (v <= 1000) return { tranche: 7, label: '500–1.000 UF', sign: 'positivo' };
  if (v <= 2000) return { tranche: 8, label: '1.000–2.000 UF', sign: 'positivo' };
  if (v <= 10000) return { tranche: 9, label: '2.000–10.000 UF', sign: 'positivo' };
  return { tranche: 10, label: '> 10.000 UF', sign: 'positivo' };
}
