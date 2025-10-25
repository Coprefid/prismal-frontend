import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

// Clean RUT-like text to return only the digits; drop DV
function extractRutBody(raw: string): string | null {
  const s = (raw || '').toString();
  const cleaned = s.replace(/[^0-9kK]/g, '');
  if (cleaned.length < 2) return null;
  const body = cleaned.slice(0, -1); // drop DV
  if (!/^[0-9]+$/.test(body)) return null;
  return body.replace(/^0+/, ''); // remove leading zeros if any
}

async function tryFindInFile(filePath: string, rutBody: string) {
  try {
    const txt = await fs.readFile(filePath, 'utf8');
    // Files are arrays of objects
    const arr = JSON.parse(txt) as Array<Record<string, any>>;
    const target = arr.find((row) => {
      const r = String(row['RUT'] ?? '').replace(/[^0-9]/g, '');
      return r === rutBody;
    });
    if (!target) return null;
    const name = (target['Razón social'] ?? '').toString().trim();
    const ventasTramo = Number.parseInt((target['Tramo según ventas'] ?? '').toString(), 10);
    const workersStr = (target['Número de trabajadores dependie'] ?? '').toString();
    const workers = /^[0-9]+$/.test(workersStr) ? Number.parseInt(workersStr, 10) : undefined;
    const startActivitiesAt = (target['Fecha inicio de actividades vige'] ?? '').toString().trim();
    const capPosStr = (target['Tramo capital propio positivo'] ?? '').toString().trim();
    const capNegStr = (target['Tramo capital propio negativo'] ?? '').toString().trim();
    const capPos = /^[0-9]+$/.test(capPosStr) ? Number.parseInt(capPosStr, 10) : null;
    const capNeg = /^[0-9]+$/.test(capNegStr) ? Number.parseInt(capNegStr, 10) : null;

    // Derive a simple cptsSign proxy from capital propio when present
    let cptsSign: 'positivo' | 'negativo' | 'desconocido' = 'negativo';
    if (capPos && capPos > 0) cptsSign = 'positivo';
    else if (capNeg && capNeg > 0) cptsSign = 'negativo';

    return {
      name: name || undefined,
      ventasTramo: Number.isFinite(ventasTramo) ? ventasTramo : undefined,
      workers: typeof workers === 'number' ? workers : undefined,
      startActivitiesAt: startActivitiesAt || undefined,
      cptsSign,
      capitalPropioTramoPositivo: capPos,
      capitalPropioTramoNegativo: capNeg,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rut = (body?.rut || '').toString();
    const rutBody = extractRutBody(rut);
    if (!rutBody) return NextResponse.json({ ok: false, error: 'rut_invalid' }, { status: 400 });

    const dataDir = path.join(process.cwd(), 'src', 'data');
    const files = [
      'empresas-parte1.json',
      'empresas-parte2.json',
      'empresas-parte3.json',
      'empresas-parte4.json',
    ];

    for (const f of files) {
      const fp = path.join(dataDir, f);
      const found = await tryFindInFile(fp, rutBody);
      if (found) {
        return NextResponse.json({ ok: true, data: found });
      }
    }

    return NextResponse.json({ ok: true, data: null });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'lookup_failed' }, { status: 500 });
  }
}
