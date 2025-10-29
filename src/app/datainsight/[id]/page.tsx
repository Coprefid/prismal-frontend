"use client";
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/api';
import AIResumenSection, { type AIResumen } from '@/components/AIResumenSection';

type DIItem = {
  id: string;
  createdAt: string;
  rut: string;
  tipoUsuario: '1' | '2';
  nombre?: string;
  score?: number;
  interpretacion?: string;
  payload: any;
};

const STORAGE_KEY = 'datainsight_items';

function getScoreColor(score?: number): string {
  if (typeof score !== 'number') return 'from-slate-400 to-slate-600';
  if (score >= 7) return 'from-emerald-400 to-emerald-600';
  if (score >= 5) return 'from-amber-400 to-amber-600';
  return 'from-rose-400 to-rose-600';
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const isOk = status === 'ok';
  const isNone = status === 'none';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${isOk ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : isNone ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
      {isOk && <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
      {status}
    </span>
  );
}

function Section({ title, children, status }: { title: string; children?: any; status?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-4 shadow-sm hover:shadow-md transition-shadow dark:border-slate-700 dark:from-slate-900 dark:to-slate-800/50">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <StatusBadge status={status} />
      </div>
      {children}
    </div>
  );
}

function DataTable({ rows, pageSize = 10 }: { rows: Array<Record<string, any>>; pageSize?: number }) {
  const [page, setPage] = useState(1);
  const cols = useMemo(() => {
    const keys = new Set<string>();
    rows.forEach((r) => Object.keys(r || {}).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [rows]);
  if (!rows || rows.length === 0) return <div className="text-sm text-slate-500 dark:text-slate-400 italic">Sin datos disponibles</div>;
  
  // Mostrar todas las columnas, con scroll horizontal si excede
  const visibleCols = cols;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = rows.slice(start, end);
  
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
            {visibleCols.map((c) => (
              <th key={c} className="px-2 py-2 text-left font-medium whitespace-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageRows.map((r, i) => (
            <tr key={i} className={`${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800'} hover:bg-blue-50 dark:hover:bg-slate-700/60 transition-colors ${i < pageRows.length - 1 ? 'border-b border-slate-200 dark:border-slate-600' : ''}`}>
              {visibleCols.map((c) => (
                <td key={c} className="px-2 py-2 align-top text-slate-700 dark:text-slate-200">{String(r?.[c] ?? '—')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > pageSize && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div>
            Mostrando {start + 1}-{Math.min(end, rows.length)} de {rows.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span>
              {currentPage}/{totalPages}
            </span>
            <button
              className="rounded px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DatainsightDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || '');
  const [item, setItem] = useState<DIItem | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [sociosPage, setSociosPage] = useState(1);
  const [aiResumenes, setAiResumenes] = useState<Record<string, any>>({});
  const [mostrarSugerencias, setMostrarSugerencias] = useState(true);
  const [processingRegistroId, setProcessingRegistroId] = useState<string | null>(null);
  const [loadingAntecedentes, setLoadingAntecedentes] = useState(false);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [loadingConsultas, setLoadingConsultas] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      const list: DIItem[] = raw ? JSON.parse(raw) : [];
      const found = list.find((x) => x.id === id) || null;
      setItem(found);
      // Siempre refrescar desde backend para traer ai_resumenes actualizados
      if (id) {
        (async () => {
          try {
            const res = await apiGet<any>(`/api/datainsight/${id}`);
            const d = res?.data;
            if (d && d._id) {
              const mapped: DIItem = {
                id: String(d._id),
                createdAt: d?.createdAt || found?.createdAt || new Date().toISOString(),
                rut: d?.rut || found?.rut || '',
                tipoUsuario: (d?.tipoUsuario === '1' || d?.tipoUsuario === '2') ? d.tipoUsuario : (found?.tipoUsuario ?? '2'),
                nombre: d?.variables?.antecedentes?.razon_social || d?.variables?.razon_social || d?.rut || found?.nombre || found?.rut || '',
                score: typeof d?.scoring?.total_ponderado_0a10 === 'number' ? d.scoring.total_ponderado_0a10 : (typeof d?.scoring?.score_1a1000 === 'number' ? d.scoring.score_1a1000 / 100 : (found?.score)),
                interpretacion: d?.scoring?.interpretacion ?? found?.interpretacion,
                payload: { data: { variables: d?.variables, scoring: d?.scoring, meta: d?.meta, rut: d?.rut, tipoUsuario: d?.tipoUsuario, ai_resumenes: d?.ai_resumenes } },
              };
              setItem(mapped);
              if (d?.ai_resumenes && typeof d.ai_resumenes === 'object') {
                setAiResumenes(d.ai_resumenes);
              }
              // Actualizar localStorage con ai_resumenes cuando venga desde backend
              const updatedList = list.map((x) => (x.id === id ? { ...mapped } : x));
              if (!updatedList.find((x) => x.id === id)) updatedList.push(mapped);
              if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

              // Enriquecer desde dataset local y refrescar
              try {
                const enr = await apiPost<any>(`/api/datainsight/${id}/enrich-local`, {});
                const d2 = enr?.data;
                if (d2 && d2._id) {
                  const mapped2: DIItem = {
                    id: String(d2._id),
                    createdAt: d2?.createdAt || mapped.createdAt,
                    rut: d2?.rut || mapped.rut,
                    tipoUsuario: (d2?.tipoUsuario === '1' || d2?.tipoUsuario === '2') ? d2.tipoUsuario : mapped.tipoUsuario,
                    nombre: d2?.variables?.antecedentes?.razon_social || d2?.variables?.razon_social || d2?.rut || mapped.nombre || '',
                    score: typeof d2?.scoring?.total_ponderado_0a10 === 'number' ? d2.scoring.total_ponderado_0a10 : (typeof d2?.scoring?.score_1a1000 === 'number' ? d2.scoring.score_1a1000 / 100 : (mapped.score)),
                    interpretacion: d2?.scoring?.interpretacion ?? mapped?.interpretacion,
                    payload: { data: { variables: d2?.variables, scoring: d2?.scoring, meta: d2?.meta, rut: d2?.rut, tipoUsuario: d2?.tipoUsuario, ai_resumenes: d2?.ai_resumenes } },
                  };
                  setItem(mapped2);
                  if (d2?.ai_resumenes && typeof d2.ai_resumenes === 'object') setAiResumenes(d2.ai_resumenes);
                  const updatedList2 = updatedList.map((x) => (x.id === id ? { ...mapped2 } : x));
                  if (!updatedList2.find((x) => x.id === id)) updatedList2.push(mapped2);
                  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList2));
                }
              } catch {}
            }
          } catch {}
        })();
      }
    } catch {}
  }, [id]);

  function persistAiResumenesToStorage(partial: Record<string, any>) {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      const list: DIItem[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((x) => x.id === id);
      if (idx !== -1) {
        const prev = list[idx];
        const prevPayload = prev?.payload || {};
        const prevData = prevPayload?.data || {} as any;
        const currentAi = prevData?.ai_resumenes || {};
        const merged = { ...currentAi, ...partial };
        list[idx] = {
          ...prev,
          payload: { data: { ...(prevData || {}), ai_resumenes: merged } }
        } as any;
      }
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }

  const payload = item?.payload || {};
  const data = payload?.data || payload; // backend envía {ok, data}
  const vars = data?.variables || {};
  const score = data?.scoring?.total_ponderado_0a10 ?? (typeof data?.scoring?.score_1a1000 === 'number' ? data.scoring.score_1a1000 / 100 : undefined);
  const interpretacion = data?.scoring?.interpretacion;
  const fetchMs: number | undefined = (data?.meta?.timings?.fetchMs ?? data?.meta?.timings?.totalMs) as number | undefined;

  // Enriquecidos locales
  const ventasTramo = vars?.antecedentes?.ventas_tramo as string | number | undefined;
  const trabajadoresDep = vars?.antecedentes?.trabajadores_dependientes as number | undefined;
  const cptPos = vars?.antecedentes?.capital_propio_tramo_positivo as string | number | undefined;
  const cptNeg = vars?.antecedentes?.capital_propio_tramo_negativo as string | number | undefined;
  const cptNum = (cptPos && Number(cptPos)) || (cptNeg && Number(cptNeg)) || undefined;
  const ventasDetalleBackend = vars?.antecedentes?.ventas_tramo_detalle as string | undefined;
  const cptsDetalleBackend = vars?.antecedentes?.cpts_detalle as string | undefined;
  const cptSignBackend = vars?.antecedentes?.cpts_sign as string | undefined;
  const ventasDetalle = ventasDetalleBackend || ventasTramoDescripcion(ventasTramo);
  const cptsDetalle = cptsDetalleBackend || cptsDescripcion(cptNum);
  const cptSign = cptSignBackend || (cptPos ? 'positivo' : (cptNeg ? 'negativo' : undefined));
  const cptsDetalleWithSign = cptsDetalle ? `${cptsDetalle}${cptSign ? ` (${cptSign})` : ''}` : undefined;

  if (!item) {
    return (
      <div className="p-6">
        <div className="mb-3 text-slate-500">Evaluación no encontrada.</div>
        <button className="btn-secondary" onClick={() => router.push('/datainsight')}>Volver</button>
      </div>
    );
  }

  const scoreColor = getScoreColor(typeof score === 'number' ? score : undefined);

  function parseFechaDDMMYYYY(s?: string): number {
    if (!s) return 0;
    const m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (!m) return 0;
    const d = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10) - 1;
    const y = parseInt(m[3], 10);
    const yyyy = y < 100 ? 2000 + y : y;
    const ts = new Date(yyyy, mo, d).getTime();
    return isNaN(ts) ? 0 : ts;
  }

  function ventasTramoDescripcion(tramo?: string | number): string | undefined {
    if (tramo == null) return undefined;
    const n = Number(tramo);
    const map: Record<number, string> = {
      1: 'Sin Información: no permite determinar estimación de ventas',
      2: '1er Rango Micro Empresa: 0,01 a 200 UF anuales',
      3: '2do Rango Micro Empresa: 200,01 a 600 UF anuales',
      4: '3er Rango Micro Empresa: 600,01 a 2.400 UF anuales',
      5: '1er Rango Pequeña Empresa: 2.400,01 a 5.000 UF anuales',
      6: '2do Rango Pequeña Empresa: 5.000,01 a 10.000 UF anuales',
      7: '3er Rango Pequeña Empresa: 10.000,01 a 25.000 UF anuales',
      8: '1er Rango Mediana Empresa: 25.000,01 a 50.000 UF anuales',
      9: '2do Rango Mediana Empresa: 50.000,01 a 100.000 UF anuales',
      10: '1er Rango Gran Empresa: 100.000,01 a 200.000 UF anuales',
      11: '2do Rango Gran Empresa: 200.000,01 a 600.000 UF anuales',
      12: '3er Rango Gran Empresa: 600.000,01 a 1.000.000 UF anuales',
      13: '4to Rango Gran Empresa: más de 1.000.000,01 UF anuales',
    };
    return map[n];
  }

  function cptsDescripcion(tramo?: string | number): string | undefined {
    if (tramo == null) return undefined;
    const n = Number(tramo);
    const map: Record<number, string> = {
      1: '0 < Capital Propio ≤ 10 UF',
      2: '10 < Capital Propio ≤ 25 UF',
      3: '25 < Capital Propio ≤ 50 UF',
      4: '50 < Capital Propio ≤ 100 UF',
      5: '100 < Capital Propio ≤ 250 UF',
      6: '250 < Capital Propio ≤ 500 UF',
      7: '500 < Capital Propio ≤ 1.000 UF',
      8: '1.000 < Capital Propio ≤ 2.000 UF',
      9: '2.000 < Capital Propio ≤ 10.000 UF',
      10: '10.000 < Capital Propio',
    };
    return map[n];
  }

  // Ordenar registros de socios_y_sociedades por Fecha Publicación desc
  const sortedSociosBlocks: any[] = Array.isArray(vars?.socios_y_sociedades)
    ? [...vars.socios_y_sociedades].sort((a: any, b: any) => {
        function firstFecha(block: any): number {
          if (!block || !Array.isArray(block.tables)) return 0;
          // Buscar en la primera tabla un campo que contenga 'Fecha Publicación'
          const table0 = block.tables[0];
          const row0 = Array.isArray(table0) && table0.length ? table0[0] : undefined;
          if (!row0) return 0;
          const key = Object.keys(row0).find((k) => /fecha.*publicaci/i.test(k));
          return parseFechaDDMMYYYY(key ? row0[key] : undefined);
        }
        return firstFecha(b) - firstFecha(a);
      })
    : [];

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/30 to-white p-6 shadow-lg dark:border-slate-700 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{item.nombre || item.rut}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-800">{item.rut}</span>
              <span>·</span>
              <span>{item.tipoUsuario === '1' ? 'Persona natural' : 'Empresa'}</span>
              <span>·</span>
              <span>{new Date(item.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Score</div>
              <div className={`mt-1 text-4xl font-bold bg-gradient-to-br ${scoreColor} bg-clip-text text-transparent`}>
                {typeof score === 'number' ? score.toFixed(1) : '—'}
              </div>
              {interpretacion && <div className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">{interpretacion}</div>}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tiempo</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {typeof fetchMs === 'number' ? `${(fetchMs/1000).toFixed(1)}s` : '—'}
              </div>
              {typeof fetchMs === 'number' && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{fetchMs} ms</div>}
            </div>
            <div className="flex flex-col gap-2">
              <button className="btn-secondary whitespace-nowrap" onClick={() => router.push('/datainsight')}>← Volver</button>
              <button className="btn-secondary whitespace-nowrap" onClick={() => setShowRaw((v) => !v)}>{showRaw ? '✕ JSON' : '{ } JSON'}</button>
              <button 
                className={`btn-secondary whitespace-nowrap ${!mostrarSugerencias ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => setMostrarSugerencias((v) => !v)}
                title={mostrarSugerencias ? 'Ocultar sugerencias IA' : 'Mostrar sugerencias IA'}
              >
                {mostrarSugerencias ? (
                  <><svg className="inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> IA</>
                ) : (
                  <><svg className="inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> IA</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid sections */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="Antecedentes" status="ok">
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-xl">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Razón social</div>
                  <div className="font-medium">{vars?.antecedentes?.razon_social || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">RUT</div>
                  <div className="font-medium">{vars?.antecedentes?.rut || data?.rut || item.rut}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Inicio actividades</div>
                  <div className="font-medium">{vars?.antecedentes?.inicio_actividades || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tamaño empresa</div>
                  <div className="font-medium">{vars?.antecedentes?.tamano_empresa || '—'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tamaño empresa detalle</div>
                  <div className="font-medium">{ventasDetalle || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Trabajadores dependientes</div>
                  <div className="font-medium">{typeof trabajadoresDep === 'number' ? trabajadoresDep : '—'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">CPTS detalle</div>
                  <div className="font-medium">{cptsDetalleWithSign || '—'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Última dirección</div>
                  <div className="font-medium text-sm">{vars?.antecedentes?.ultima_direccion_registrada || '—'}</div>
                </div>
                {Array.isArray(vars?.antecedentes?.giros) && vars.antecedentes.giros.length > 0 && (
                  <div className="col-span-2"><div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Giros</div><div className="text-xs leading-relaxed">{vars.antecedentes.giros.map((g: string, i: number) => <span key={i} className="inline-block rounded bg-slate-100 px-2 py-0.5 mr-1 mb-1 dark:bg-slate-800">{g}</span>)}</div></div>
                )}
              </div>
              {loadingAntecedentes && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-fuchsia-500/10 backdrop-blur-[2px] animate-pulse" />
                  <div className="nebula-overlay" />
                  <style jsx>{`
                    @keyframes nebula-float { 0%,100%{transform:translate(0%,0%) scale(1) rotate(0deg);opacity:.6;}25%{transform:translate(-2%,-2%) scale(1.05) rotate(90deg);opacity:.8;}50%{transform:translate(2%,0%) scale(.98) rotate(180deg);opacity:.7;}75%{transform:translate(0%,2%) scale(1.02) rotate(270deg);opacity:.9;} }
                    .nebula-overlay{position:absolute;inset:0;background:radial-gradient(ellipse at 20% 30%, rgba(168,85,247,.35) 0%, transparent 50%),radial-gradient(ellipse at 80% 70%, rgba(6,182,212,.35) 0%, transparent 50%),radial-gradient(ellipse at 50% 50%, rgba(217,70,239,.25) 0%, transparent 60%),radial-gradient(ellipse at 30% 80%, rgba(99,102,241,.25) 0%, transparent 50%);filter:blur(35px);animation:nebula-float 10s ease-in-out infinite;mix-blend-mode:screen;}
                  `}</style>
                </div>
              )}
            </div>
            {mostrarSugerencias && (
              <AIResumenSection
                reportId={id}
                sectionKey="antecedentes"
                endpoint="/api/datainsight/:id/resumir-antecedentes"
                requestBody={{ antecedentes: vars?.antecedentes || {} }}
                resumenExistente={aiResumenes['antecedentes'] || data?.ai_resumenes?.['antecedentes']}
                onResumenGenerado={(resumen: AIResumen) => {
                  setAiResumenes((prev) => ({ ...prev, antecedentes: resumen }));
                  persistAiResumenesToStorage({ antecedentes: resumen });
                }}
                onLoadingChange={(l: boolean) => setLoadingAntecedentes(l)}
              />
            )}
          </div>
        </Section>
        <Section title="Direcciones registradas" status={vars?.direcciones_registradas?.length ? 'ok' : 'none'}>
          <DataTable rows={Array.isArray(vars?.direcciones_registradas) ? vars.direcciones_registradas : []} />
        </Section>

        <Section title="Resumen" status={vars?.resumen_status || (Array.isArray(vars?.resumen) && vars.resumen.length ? 'ok' : 'none')}>
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-xl">
              <DataTable rows={Array.isArray(vars?.resumen) ? vars.resumen : []} />
              {loadingResumen && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-fuchsia-500/10 backdrop-blur-[2px] animate-pulse" />
                  <div className="nebula-overlay" />
                  <style jsx>{`
                    @keyframes nebula-float { 0%,100%{transform:translate(0%,0%) scale(1) rotate(0deg);opacity:.6;}25%{transform:translate(-2%,-2%) scale(1.05) rotate(90deg);opacity:.8;}50%{transform:translate(2%,0%) scale(.98) rotate(180deg);opacity:.7;}75%{transform:translate(0%,2%) scale(1.02) rotate(270deg);opacity:.9;} }
                    .nebula-overlay{position:absolute;inset:0;background:radial-gradient(ellipse at 20% 30%, rgba(168,85,247,.35) 0%, transparent 50%),radial-gradient(ellipse at 80% 70%, rgba(6,182,212,.35) 0%, transparent 50%),radial-gradient(ellipse at 50% 50%, rgba(217,70,239,.25) 0%, transparent 60%),radial-gradient(ellipse at 30% 80%, rgba(99,102,241,.25) 0%, transparent 50%);filter:blur(35px);animation:nebula-float 10s ease-in-out infinite;mix-blend-mode:screen;}
                  `}</style>
                </div>
              )}
            </div>
            {mostrarSugerencias && (
              <AIResumenSection
                reportId={id}
                sectionKey="resumen"
                endpoint="/api/datainsight/:id/resumir-resumen"
                requestBody={{
                  rows: Array.isArray(vars?.resumen) ? vars.resumen : [],
                  company_size: vars?.antecedentes?.tamano_empresa || vars?.antecedentes?.tamaño_empresa || vars?.antecedentes?.segmento || vars?.antecedentes?.tamano,
                  details: {
                    morosidades_banca: Array.isArray(vars?.morosidades_banca) ? vars.morosidades_banca : [],
                    morosidades_ccs: Array.isArray(vars?.morosidades_ccs) ? vars.morosidades_ccs : [],
                    protestos_banca: Array.isArray(vars?.protestos_banca) ? vars.protestos_banca : [],
                    protestos_ccs: Array.isArray(vars?.protestos_ccs) ? vars.protestos_ccs : [],
                    infracciones_laborales: Array.isArray(vars?.infracciones_laborales) ? vars.infracciones_laborales : [],
                    infracciones_previsionales: Array.isArray(vars?.infracciones_previsionales) ? vars.infracciones_previsionales : [],
                    anotaciones_tributarias: Array.isArray(vars?.anotaciones_tributarias) ? vars.anotaciones_tributarias : [],
                  }
                }}
                resumenExistente={aiResumenes['resumen'] || data?.ai_resumenes?.['resumen']}
                onResumenGenerado={(resumen: AIResumen) => {
                  setAiResumenes((prev) => ({ ...prev, resumen }));
                  persistAiResumenesToStorage({ resumen });
                }}
                onLoadingChange={(l: boolean) => setLoadingResumen(l)}
              />
            )}
          </div>
        </Section>

        <Section title="Consultas al RUT" status={vars?.consultas_al_rut_status || (Array.isArray(vars?.consultas_al_rut) && vars.consultas_al_rut.length ? 'ok' : 'none')}>
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-xl">
              <DataTable rows={Array.isArray(vars?.consultas_al_rut) ? vars.consultas_al_rut : []} />
              {loadingConsultas && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-fuchsia-500/10 backdrop-blur-[2px] animate-pulse" />
                  <div className="nebula-overlay" />
                  <style jsx>{`
                    @keyframes nebula-float { 0%,100%{transform:translate(0%,0%) scale(1) rotate(0deg);opacity:.6;}25%{transform:translate(-2%,-2%) scale(1.05) rotate(90deg);opacity:.8;}50%{transform:translate(2%,0%) scale(.98) rotate(180deg);opacity:.7;}75%{transform:translate(0%,2%) scale(1.02) rotate(270deg);opacity:.9;} }
                    .nebula-overlay{position:absolute;inset:0;background:radial-gradient(ellipse at 20% 30%, rgba(168,85,247,.35) 0%, transparent 50%),radial-gradient(ellipse at 80% 70%, rgba(6,182,212,.35) 0%, transparent 50%),radial-gradient(ellipse at 50% 50%, rgba(217,70,239,.25) 0%, transparent 60%),radial-gradient(ellipse at 30% 80%, rgba(99,102,241,.25) 0%, transparent 50%);filter:blur(35px);animation:nebula-float 10s ease-in-out infinite;mix-blend-mode:screen;}
                  `}</style>
                </div>
              )}
            </div>
            {mostrarSugerencias && (
              <AIResumenSection
                reportId={id}
                sectionKey="consultas_rut"
                endpoint="/api/datainsight/:id/resumir-consultas"
                requestBody={{ rows: Array.isArray(vars?.consultas_al_rut) ? vars.consultas_al_rut : [] }}
                resumenExistente={aiResumenes['consultas_rut'] || data?.ai_resumenes?.['consultas_rut']}
                onResumenGenerado={(resumen: AIResumen) => {
                  setAiResumenes((prev) => ({ ...prev, consultas_rut: resumen }));
                  persistAiResumenesToStorage({ consultas_rut: resumen });
                }}
                onLoadingChange={(l: boolean) => setLoadingConsultas(l)}
              />
            )}
          </div>
        </Section>

        <Section title="Protestos (Banca)" status={vars?.protestos_banca_status}>
          <DataTable rows={Array.isArray(vars?.protestos_banca) ? vars.protestos_banca : []} />
        </Section>
        <Section title="Protestos (CCS)" status={vars?.protestos_ccs_status}>
          <DataTable rows={Array.isArray(vars?.protestos_ccs) ? vars.protestos_ccs : []} />
        </Section>

        <Section title="Morosidades (Banca)" status={vars?.morosidades_banca_status}>
          <DataTable rows={Array.isArray(vars?.morosidades_banca) ? vars.morosidades_banca : []} />
        </Section>
        <Section title="Morosidades (CCS)" status={vars?.morosidades_ccs_status}>
          <DataTable rows={Array.isArray(vars?.morosidades_ccs) ? vars.morosidades_ccs : []} />
        </Section>

        <Section title="Infracciones laborales" status={vars?.infracciones_laborales_status}>
          <DataTable rows={Array.isArray(vars?.infracciones_laborales) ? vars.infracciones_laborales : []} />
        </Section>
        <Section title="Infracciones previsionales" status={vars?.infracciones_previsionales_status}>
          <DataTable rows={Array.isArray(vars?.infracciones_previsionales) ? vars.infracciones_previsionales : []} />
        </Section>

        <Section title="Bienes raíces y vehículos" status={vars?.bienes_raices_status}>
          <DataTable rows={Array.isArray(vars?.bienes_raices) ? vars.bienes_raices : []} />
        </Section>

        <Section title="Exportaciones" status={vars?.exportaciones_status}>
          <DataTable rows={Array.isArray(vars?.exportaciones) ? vars.exportaciones : []} />
        </Section>
        <Section title="Importaciones" status={vars?.importaciones_status}>
          <DataTable rows={Array.isArray(vars?.importaciones) ? vars.importaciones : []} />
        </Section>

        <div className="lg:col-span-2">
          <Section title="Socios y sociedades" status={Array.isArray(vars?.socios_y_sociedades) && vars.socios_y_sociedades.length ? 'ok' : 'none'}>
            {sortedSociosBlocks.length > 0 ? (
              <div className="space-y-3">
                {(() => {
                  const total = sortedSociosBlocks.length;
                  const current = Math.min(sociosPage, total);
                  const block = sortedSociosBlocks[current - 1];
                  return (
                    <>
                      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30">
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                          <div className="font-medium">Registro #{current}</div>
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                              onClick={() => setSociosPage((p) => Math.max(1, p - 1))}
                              disabled={current === 1}
                            >
                              Anterior
                            </button>
                            <span>
                              {current}/{total}
                            </span>
                            <button
                              className="rounded px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                              onClick={() => setSociosPage((p) => Math.min(total, p + 1))}
                              disabled={current === total}
                            >
                              Siguiente
                            </button>
                          </div>
                        </div>
                        {Array.isArray(block?.tables) ? block.tables.map((tbl: any, tIdx: number) => {
                          // Buscar si esta tabla tiene un campo "Detalle" con escritura
                          const detalleRow = Array.isArray(tbl) ? tbl.find((row: any) => row?.Detalle && row.Detalle.length > 100) : null;
                          const registroIdRow = Array.isArray(tbl) && tbl.length > 0 ? tbl[0] : null;
                          const registroId = registroIdRow?.['Id Registro'] || registroIdRow?.Id || `registro-${tIdx}`;
                          const detalleTexto = detalleRow?.Detalle || '';
                          const resumenExistente = aiResumenes[registroId] || data?.ai_resumenes?.[registroId];
                          const isProcessing = processingRegistroId === registroId;

                          return (
                            <div key={tIdx} className="mb-3 last:mb-0 space-y-3">
                              <div className="relative overflow-hidden rounded-xl">
                                <DataTable rows={Array.isArray(tbl) ? tbl : []} />
                                {isProcessing && (
                                  <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-fuchsia-500/10 backdrop-blur-[2px] animate-pulse" />
                                    <div className="nebula-overlay" />
                                    <style jsx>{`
                                      @keyframes nebula-float {
                                        0%, 100% { 
                                          transform: translate(0%, 0%) scale(1) rotate(0deg);
                                          opacity: 0.6;
                                        }
                                        25% { 
                                          transform: translate(-2%, -2%) scale(1.05) rotate(90deg);
                                          opacity: 0.8;
                                        }
                                        50% { 
                                          transform: translate(2%, 0%) scale(0.98) rotate(180deg);
                                          opacity: 0.7;
                                        }
                                        75% { 
                                          transform: translate(0%, 2%) scale(1.02) rotate(270deg);
                                          opacity: 0.9;
                                        }
                                      }
                                      .nebula-overlay {
                                        position: absolute;
                                        inset: 0;
                                        background: 
                                          radial-gradient(ellipse at 20% 30%, rgba(168, 85, 247, 0.35) 0%, transparent 50%),
                                          radial-gradient(ellipse at 80% 70%, rgba(6, 182, 212, 0.35) 0%, transparent 50%),
                                          radial-gradient(ellipse at 50% 50%, rgba(217, 70, 239, 0.25) 0%, transparent 60%),
                                          radial-gradient(ellipse at 30% 80%, rgba(99, 102, 241, 0.25) 0%, transparent 50%);
                                        filter: blur(35px);
                                        animation: nebula-float 10s ease-in-out infinite;
                                        mix-blend-mode: screen;
                                      }
                                    `}</style>
                                  </div>
                                )}
                              </div>
                              {mostrarSugerencias && detalleTexto && detalleTexto.length > 100 && (
                                <AIResumenSection
                                  reportId={id}
                                  sectionKey={registroId}
                                  endpoint="/api/datainsight/:id/resumir-escritura"
                                  requestBody={{ registroId, detalleEscritura: detalleTexto }}
                                  resumenExistente={resumenExistente}
                                  onResumenGenerado={(resumen: AIResumen) => {
                                    setAiResumenes((prev) => ({ ...prev, [registroId]: resumen }));
                                  }}
                                  onLoadingChange={(loading: boolean) => {
                                    setProcessingRegistroId(loading ? registroId : null);
                                  }}
                                />
                              )}
                            </div>
                          );
                        }) : <div className="text-sm text-slate-500 dark:text-slate-400 italic">Sin datos</div>}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400 italic">Sin datos disponibles</div>
            )}
          </Section>
        </div>

        <div className="lg:col-span-2">
          <Section title="Publicación en sociedades" status={vars?.publicacion_en_sociedades_status}>
            {(() => {
              const rows = Array.isArray(vars?.publicacion_en_sociedades) ? [...vars.publicacion_en_sociedades] : [];
              rows.sort((a: any, b: any) => {
                const keyA = Object.keys(a).find((k) => /fecha.*publicaci/i.test(k));
                const keyB = Object.keys(b).find((k) => /fecha.*publicaci/i.test(k));
                return parseFechaDDMMYYYY(keyB ? b[keyB] : undefined) - parseFechaDDMMYYYY(keyA ? a[keyA] : undefined);
              });
              return <DataTable rows={rows} />;
            })()}
          </Section>
        </div>
      </div>

      {showRaw && (
        <Section title="JSON bruto" status="ok">
          <pre className="max-h-[420px] overflow-auto text-xs whitespace-pre-wrap break-words bg-slate-50 p-3 rounded-xl text-slate-700 dark:bg-slate-800 dark:text-slate-200">{JSON.stringify(payload, null, 2)}</pre>
        </Section>
      )}
    </div>
  );
}
