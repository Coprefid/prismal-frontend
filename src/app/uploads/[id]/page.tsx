"use client";
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { apiGet, apiPost } from '@/lib/api';
import AIResumenSection, { type AIResumen } from '@/components/AIResumenSection';
import Loader from '@/components/ui/Loader';
import EChart from '@/components/charts/EChart';

export default function UploadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [vars, setVars] = useState<any>(null);
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [creatingEval, setCreatingEval] = useState(false);
  const [evalId, setEvalId] = useState<string | null>(null);
  const [evalErr, setEvalErr] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResumenes, setAiResumenes] = useState<Record<string, AIResumen>>({});
  const [aiVisible, setAiVisible] = useState<boolean>(true);

  useEffect(() => {
    let timer: any = null;
    async function tick() {
      try {
        const r = await apiGet(`/api/uploads/${id}`);
        const d = (r as any)?.data || null;
        setData(d);
        const st = d?.status || null;
        setStatus(st);
        const mv = d?.meta?.variables || null;
        if (mv) setVars(mv);
        if (st !== 'extracted' && st !== 'extract_failed') {
          timer = setTimeout(tick, 3000);
        }
      } catch {
        setErr('No fue posible cargar el documento.');
      } finally {
        setLoading(false);
      }
    }
    if (id) tick();
    return () => { if (timer) clearTimeout(timer); };
  }, [id]);

  // When CT is extracted, auto-create an evaluation once
  useEffect(() => {
    const companyId = (data as any)?.companyId || (data as any)?.meta?.companyId;
    if (!id || !companyId) return;
    if (status !== 'extracted') return;
    if (creatingEval || evalId) return;
    let cancelled = false;
    (async () => {
      try {
        setCreatingEval(true);
        setEvalErr(null);
        const resp: any = await apiPost('/api/evaluations', { companyId, documentId: id });
        const newId = resp?.data?.evaluationId || resp?.data?.id || resp?.id || null;
        if (!cancelled) setEvalId(newId);
      } catch (e: any) {
        if (!cancelled) setEvalErr('No fue posible crear la evaluación automáticamente.');
      } finally {
        if (!cancelled) setCreatingEval(false);
      }
    })();
    return () => { cancelled = true; };
  }, [status, id, data, creatingEval, evalId]);

  // Do NOT early-return before all hooks (e.g., useMemo) are declared.
  const filename = data?.meta?.filename || (data?.uri ? String(data.uri).split('/').pop() : '') || '';
  // Variables pueden venir como { ok, variables } o directamente el objeto
  const vroot: any = (vars && typeof vars === 'object' && 'variables' in vars) ? (vars as any).variables : vars;
  const ct = vroot || {};
  const resumenExistente = (data as any)?.meta?.ai_resumenes?.ct || null;
  useEffect(() => {
    // Si existe un resumen en servidor, que inicie visible
    if (resumenExistente && aiVisible == null) setAiVisible(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumenExistente]);

  const toMonthISO = (label: string): string => {
    const m = String(label).match(/(\d{2})\s*\/\s*(\d{4})/);
    return m ? `${m[2]}-${m[1]}` : String(label);
  };
  const fmtCLP = (n: number) => (Number(n) || 0).toLocaleString('es-CL');
  const toNum = (x: any) => {
    const s = String(x ?? '').replace(/[\.\s]/g, '').replace(/[\u2212−]/g, '-').replace(/,/g, '');
    const m = s.match(/-?\d+(?:\.\d+)?/);
    return m ? Number(m[0]) : 0;
  };

  // F29 data
  const f29 = (ct as any)?.f29 || {};
  const periods: string[] = Array.isArray(f29?.periodo) ? f29.periodo : [];
  let monthsCat: string[] = periods.map((p: string) => toMonthISO(String(p)));
  const mapSeries = (arr: any[]): number[] => monthsCat.map((_, i) => toNum(arr?.[i] ?? 0));
  const s_sales = mapSeries(Array.isArray(f29?.base_imponible) ? f29.base_imponible : []);
  const s_purch = mapSeries(Array.isArray(f29?.compra) ? f29.compra : []);
  const s_rem = mapSeries(Array.isArray(f29?.remanente) ? f29.remanente : []);
  const s_margin = mapSeries(Array.isArray(f29?.margen) ? f29.margen : []);
  const s_ivaCred = mapSeries(Array.isArray(f29?.iva_credito) ? f29.iva_credito : []);
  const s_post = mapSeries(Array.isArray(f29?.postergacion) ? f29.postergacion : []);
  const s_ivaPag = mapSeries(Array.isArray(f29?.iva_pagado) ? f29.iva_pagado : []);

  // Invert order for chart only (chronological asc so most recent at the end)
  const monthsCatAsc = [...monthsCat].reverse();
  const rev = (a: number[]) => [...a].reverse();

  const optF29 = useMemo(() => monthsCatAsc.length === 0 ? null : ({
    backgroundColor: 'transparent',
    textStyle: { color: '#94a3b8' },
    color: ['#3b82f6','#94a3b8','#f59e0b','#10b981','#8b5cf6','#ef4444','#22c55e'],
    tooltip: { trigger: 'axis' },
    legend: { top: 0, textStyle: { color: '#94a3b8' }, selected: { 'Ventas (Base imponible)': true, 'Compras': true, 'Margen': true, 'Remanente': false, 'IVA Crédito': false, 'Postergación': false, 'IVA Pagado': false } },
    grid: { left: 50, right: 20, bottom: 110, top: 40 },
    xAxis: { type: 'category', data: monthsCatAsc, axisLabel: { margin: 16, formatter: (v: any) => String(v).replace('-', '\n') } },
    yAxis: { type: 'value', axisLabel: { formatter: (v: any) => `$${fmtCLP(Number(v))}` }, splitLine: { lineStyle: { color: '#1f2937' } } },
    dataZoom: [ { type: 'inside' }, { type: 'slider', height: 16, bottom: 12 } ],
    series: [
      { name: 'Ventas (Base imponible)', type: 'line', smooth: true, data: rev(s_sales) },
      { name: 'Compras', type: 'line', smooth: true, data: rev(s_purch) },
      { name: 'Remanente', type: 'line', smooth: true, data: rev(s_rem) },
      { name: 'Margen', type: 'line', smooth: true, data: rev(s_margin) },
      { name: 'IVA Crédito', type: 'line', smooth: true, data: rev(s_ivaCred) },
      { name: 'Postergación', type: 'line', smooth: true, data: rev(s_post) },
      { name: 'IVA Pagado', type: 'line', smooth: true, data: rev(s_ivaPag) },
    ],
  }) as any, [monthsCatAsc.join(','), s_sales.join(','), s_purch.join(','), s_rem.join(','), s_margin.join(','), s_ivaCred.join(','), s_post.join(','), s_ivaPag.join(',')]);

  const resumen = (ct as any)?.resumen || {};
  const alertas = (ct as any)?.alertas || {};
  const ident = (ct as any)?.identificacion || {};
  const negCls = (n: number) => (n < 0 ? 'text-rose-400 dark:text-rose-300' : '');
  // Derivados para tablas de conteo (reutilizando lógica de la vista antigua)
  const tiposDecl: string[] = Array.isArray((f29 as any)?.tipo_declaracion) ? (f29 as any).tipo_declaracion : [];
  const pagosEstado: string[] = Array.isArray((f29 as any)?.pago_estado) ? (f29 as any).pago_estado : [];
  const countMap = (arr: string[]) => {
    const m = new Map<string, number>();
    for (const v of arr) m.set(String(v || '—'), (m.get(String(v || '—')) || 0) + 1);
    return Array.from(m.entries());
  };
  const declCounts = countMap(tiposDecl);
  const pagoCounts = countMap(pagosEstado);
  // F22 resumen por período
  const f22 = (ct as any)?.f22 || {};
  const f22Periodo: string[] = Array.isArray(f22?.periodo) ? f22.periodo : [];
  const f22Ingresos: any[] = Array.isArray(f22?.ingresos) ? f22.ingresos : [];
  const f22Activo: any[] = Array.isArray(f22?.total_activo) ? f22.total_activo : [];
  const f22Pasivo: any[] = Array.isArray(f22?.total_pasivo) ? f22.total_pasivo : [];
  const f22Util: any[] = Array.isArray(f22?.utilidad) ? f22.utilidad : [];
  const f22Perd: any[] = Array.isArray(f22?.perdida) ? f22.perdida : [];
  const f22CptPos: any[] = Array.isArray(f22?.cpt_positivo) ? f22.cpt_positivo : [];
  const f22CptNeg: any[] = Array.isArray(f22?.cpt_negativo) ? f22.cpt_negativo : [];

  // Now it's safe to early-return; hooks above have run every render
  if (loading) return <Loader fullScreen label="Cargando documento…" />;
  if (err) return <div className="p-6 text-rose-500">{err}</div>;
  if (!data) return <div className="p-6 text-slate-500">No encontrado</div>;

  return (
    <div className="w-full px-4 md:px-6">
      <div className="mx-auto w-full max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Carpeta Tributaria</h1>
        <div className="flex items-center gap-2">
          <button className="btn-secondary whitespace-nowrap" onClick={() => router.push('/evaluations' as Route)}>← Volver</button>
          <span className={`rounded-full px-3 py-1 text-xs ${status === 'extracted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200' : status === 'extract_failed' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>{status || '—'}</span>
        </div>
      </div>

      <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        {filename ? <span className="font-medium text-slate-700 dark:text-slate-200">{filename}</span> : null}
      </div>

      {status !== 'extracted' && status !== 'extract_failed' && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 ring-1 ring-slate-200 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:ring-white/10">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin text-logo-start" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity=".2"/><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" fill="none"/></svg>
            Procesando Carpeta Tributaria…
          </div>
        </div>
      )}

      {status === 'extract_failed' && (
        <div className="mb-4 rounded-xl border border-rose-300/40 bg-rose-50 p-3 text-sm text-rose-800 ring-1 ring-rose-300/40 dark:border-rose-500/20 dark:bg-rose-900/20 dark:text-rose-200">
          No fue posible extraer datos.
        </div>
      )}

      {status === 'extracted' && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 ring-1 ring-slate-200 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:ring-white/10">
          {creatingEval && (
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin text-logo-start" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity=".2"/><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" fill="none"/></svg>
              Creando evaluación…
            </div>
          )}
          {!creatingEval && evalId && (
            <div>
              Evaluación creada. <a className="text-logo-start underline" href={`/evaluations/${evalId}`}>Ver evaluación</a>
            </div>
          )}
          {!creatingEval && !evalId && evalErr && (
            <div className="text-rose-400">{evalErr}</div>
          )}
        </div>
      )}

      {/* Identificación */}
      <div className="mb-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10 relative overflow-hidden">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Identificación</div>
          {/* Botón solamente en header */}
          <AIResumenSection
            reportId={id}
            sectionKey="ct"
            endpoint="/api/uploads/:id/resumir-ct"
            resumenExistente={aiResumenes['ct'] || resumenExistente}
            onResumenGenerado={(resumen) => { setAiResumenes((prev) => ({ ...prev, ct: resumen })); }}
            onLoadingChange={(loading) => setAiLoading(loading)}
            mode="button"
            controlledVisible={aiVisible}
            onVisibleChange={setAiVisible}
          />
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          <div><span className="text-slate-500">Empresa:</span> <span className="font-semibold">{ident?.emisor_nombre || '—'}</span></div>
          <div className="mt-1"><span className="text-slate-500">RUT:</span> <span className="font-semibold">{ident?.emisor_rut || (ct as any)?.inputs?.rut || '—'}</span></div>
          {ident?.domicilio ? (<div className="mt-1"><span className="text-slate-500">Domicilio:</span> <span>{ident.domicilio}</span></div>) : null}
        </div>
        {/* Resumen sólo debajo de la Identificación */}
        <div className="mt-3">
          <AIResumenSection
            reportId={id}
            sectionKey="ct"
            endpoint="/api/uploads/:id/resumir-ct"
            resumenExistente={aiResumenes['ct'] || resumenExistente}
            onResumenGenerado={(resumen) => { setAiResumenes((prev) => ({ ...prev, ct: resumen })); }}
            showButton={false}
            mode="summary"
            controlledVisible={aiVisible}
            onVisibleChange={setAiVisible}
          />
        </div>
        {aiLoading && (
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

      {/* KPIs resumidos */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-900/60 p-4 text-slate-100 ring-1 ring-white/10 shadow-card">
          <div className="text-xs text-slate-300">Venta promedio</div>
          <div className="mt-1 text-lg font-semibold">${fmtCLP(Number(resumen?.venta_promedio || 0))}</div>
        </div>
        <div className="rounded-2xl bg-slate-900/60 p-4 text-slate-100 ring-1 ring-white/10 shadow-card">
          <div className="text-xs text-slate-300">Compra promedio</div>
          <div className="mt-1 text-lg font-semibold">${fmtCLP(Number(resumen?.compra_promedio || 0))}</div>
        </div>
        <div className="rounded-2xl bg-slate-900/60 p-4 text-slate-100 ring-1 ring-white/10 shadow-card">
          <div className="text-xs text-slate-300">Margen promedio</div>
          <div className="mt-1 text-lg font-semibold">${fmtCLP(Number(resumen?.margen_promedio || 0))}</div>
        </div>
      </div>

      {/* Serie F29 */}
      {monthsCat.length > 0 && (
        <div className="mb-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Serie mensual (últimos {monthsCat.length} meses)</div>
            <div className="flex items-center gap-1">
              <button onClick={() => setView('chart')} className={`rounded-full px-2 py-1 text-xs ${view==='chart' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>Gráfico</button>
              <button onClick={() => setView('table')} className={`rounded-full px-2 py-1 text-xs ${view==='table' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>Tabla</button>
            </div>
          </div>
          {view === 'chart' ? (
            optF29 ? <EChart option={optF29} height={420} /> : null
          ) : (
            <div className="overflow-auto">
              <table className="min-w-[880px] w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/70 text-slate-100 dark:bg-slate-800">
                    <th className="px-3 py-2 text-left">Período</th>
                    <th className="px-3 py-2 text-right">Ventas</th>
                    <th className="px-3 py-2 text-right">Compras</th>
                    <th className="px-3 py-2 text-right">Remanente</th>
                    <th className="px-3 py-2 text-right">Margen</th>
                    <th className="px-3 py-2 text-right">IVA Crédito</th>
                    <th className="px-3 py-2 text-right">Postergación</th>
                    <th className="px-3 py-2 text-right">IVA Pagado</th>
                  </tr>
                </thead>
                <tbody>
                  {monthsCat.map((m, i) => (
                    <tr key={m} className="border-b border-slate-100/10">
                      <td className="px-3 py-2">{m}</td>
                      <td className={`px-3 py-2 text-right ${negCls(s_sales[i] || 0)}`}>${fmtCLP(s_sales[i] || 0)}</td>
                      <td className={`px-3 py-2 text-right ${negCls(s_purch[i] || 0)}`}>${fmtCLP(s_purch[i] || 0)}</td>
                      <td className={`px-3 py-2 text-right ${negCls(s_rem[i] || 0)}`}>${fmtCLP(s_rem[i] || 0)}</td>
                      <td className={`px-3 py-2 text-right ${negCls(s_margin[i] || 0)}`}>${fmtCLP(s_margin[i] || 0)}</td>
                      <td className={`px-3 py-2 text-right ${negCls(s_ivaCred[i] || 0)}`}>${fmtCLP(s_ivaCred[i] || 0)}</td>
                      <td className={`px-3 py-2 text-right ${negCls(s_post[i] || 0)}`}>${fmtCLP(s_post[i] || 0)}</td>
                      <td className={`px-3 py-2 text-right ${negCls(s_ivaPag[i] || 0)}`}>${fmtCLP(s_ivaPag[i] || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Alertas */}
      <div className="mb-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
        <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Alertas (Carpeta Tributaria)</div>
        <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
          {Object.entries(alertas || {}).filter(([,v]) => String(v || '').trim() !== '').map(([k, v]) => (
            <li key={k}>{String(v)}</li>
          ))}
          {Object.entries(alertas || {}).every(([,v]) => String(v || '').trim() === '') && (
            <li>Sin alertas</li>
          )}
        </ul>
      </div>

      {/* Tipo de Declaración F29 (conteo) */}
      {declCounts.length > 0 && (
        <div className="mb-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
          <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Tipo de Declaración F29 (conteo)</div>
          <div className="overflow-auto">
            <table className="min-w-[560px] w-full text-sm">
              <thead>
                <tr className="bg-slate-800/70 text-slate-100 dark:bg-slate-800">
                  <th className="px-3 py-2 text-left">Tipo de Declaración</th>
                  <th className="px-3 py-2 text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100/10">
                  <td className="px-3 py-2 font-medium">Total F29</td>
                  <td className="px-3 py-2 text-right">{monthsCat.length}</td>
                </tr>
                {declCounts.map(([k, n]) => (
                  <tr key={k} className="border-b border-slate-100/10">
                    <td className="px-3 py-2">{k}</td>
                    <td className="px-3 py-2 text-right">{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estado de Pago F29 (conteo) */}
      {pagoCounts.length > 0 && (
        <div className="mb-8 rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
          <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Estado de Pago F29 (pagado vs declarado sin pago)</div>
          <div className="overflow-auto">
            <table className="min-w-[560px] w-full text-sm">
              <thead>
                <tr className="bg-slate-800/70 text-slate-100 dark:bg-slate-800">
                  <th className="px-3 py-2 text-left">Estado de Pago</th>
                  <th className="px-3 py-2 text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {pagoCounts.map(([k, n]) => (
                  <tr key={k} className="border-b border-slate-100/10">
                    <td className="px-3 py-2">{k}</td>
                    <td className="px-3 py-2 text-right">{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* F22 (Resumen por período) */}
      {f22Periodo.length > 0 && (
        <div className="mb-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
          <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">F22 (Resumen por período)</div>
          <div className="overflow-auto">
            <table className="min-w-[880px] w-full text-sm">
              <thead>
                <tr className="bg-slate-800/70 text-slate-100 dark:bg-slate-800">
                  <th className="px-3 py-2 text-left">Período</th>
                  <th className="px-3 py-2 text-right">Ingresos</th>
                  <th className="px-3 py-2 text-right">Activo Total</th>
                  <th className="px-3 py-2 text-right">Pasivo Total</th>
                  <th className="px-3 py-2 text-right">Utilidad</th>
                  <th className="px-3 py-2 text-right">Pérdida</th>
                  <th className="px-3 py-2 text-right">CPT +</th>
                  <th className="px-3 py-2 text-right">CPT -</th>
                </tr>
              </thead>
              <tbody>
                {f22Periodo.map((p, i) => (
                  <tr key={p} className="border-b border-slate-100/10">
                    <td className="px-3 py-2">{String(p)}</td>
                    <td className="px-3 py-2 text-right">${fmtCLP(toNum(f22Ingresos[i]))}</td>
                    <td className="px-3 py-2 text-right">${fmtCLP(toNum(f22Activo[i]))}</td>
                    <td className="px-3 py-2 text-right">${fmtCLP(toNum(f22Pasivo[i]))}</td>
                    <td className="px-3 py-2 text-right">${fmtCLP(toNum(f22Util[i]))}</td>
                    <td className="px-3 py-2 text-right">${fmtCLP(toNum(f22Perd[i]))}</td>
                    <td className="px-3 py-2 text-right">${fmtCLP(toNum(f22CptPos[i]))}</td>
                    <td className="px-3 py-2 text-right">${fmtCLP(toNum(f22CptNeg[i]))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sugerencia de capacidad de crédito */}
      {(ct as any)?.capacidad_sugerida != null && (
        <div className="mb-12 rounded-2xl bg-emerald-900/30 p-4 text-emerald-100 ring-1 ring-emerald-500/20">
          <div className="text-sm font-semibold">Sugerencia de capacidad de crédito</div>
          <div className="mt-1 text-lg font-bold">Capacidad sugerida (CLP): ${fmtCLP(Number((ct as any).capacidad_sugerida || 0))}</div>
          <div className="mt-1 text-sm">Resultado sugerido: <span className="font-semibold">{String(resumen?.resultado || '—')}</span></div>
          <div className="mt-2 text-xs opacity-80">Aviso: esta sugerencia es informativa y no vinculante; debe revisarse junto con políticas internas y evidencia financiera.</div>
        </div>
      )}
      </div>
    </div>
  );
}
