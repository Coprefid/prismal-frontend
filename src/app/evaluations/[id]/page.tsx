"use client";
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';
import EChart from '@/components/charts/EChart';
import Loader from '@/components/ui/Loader';

export default function EvaluationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [policy, setPolicy] = useState<any>(null);
  const [tab, setTab] = useState<'resumen' | 'ct'>('resumen');
  const [ctVars, setCtVars] = useState<any>(null);
  const [ctView, setCtView] = useState<'chart' | 'table'>('chart');
  const [docId, setDocId] = useState<string | null>(null);
  const [docStatus, setDocStatus] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiGet(`/api/evaluations/${id}`);
        const d = (resp as any)?.data || null;
        setData(d);
        try { setDocId((d as any)?.sources?.ctDocumentId || null); } catch {}
      } catch (e: any) {
        setErr('No fue posible cargar la evaluación.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Fetch company policy to know which micro variables to expect
  const companyId = (data as any)?.companyId;
  useEffect(() => {
    (async () => {
      try {
        if (!companyId) return;
        const resp = await apiGet(`/api/company-policy/${companyId}`);
        setPolicy((resp as any)?.data || null);
      } catch {}
    })();
  }, [companyId]);
  // Define features early and memoize so hooks have a stable reference
  const features = useMemo(() => ((data as any)?.features || {}), [data]);
  const macro = (features as any)?.macro || {};
  const macroVals = macro?.values || {};
  const macroVarSel = macro?.variationSelected || {};
  const obs = macro?.observability || {};
  const extras = (macro as any)?.extras || {};
  const pib = (extras as any)?.pib || {};
  const unemployment = (extras as any)?.unemployment || {};
  const commodities = (extras as any)?.commodities || {};
  // Helper to normalize month label e.g., "07 / 2025" -> "2025-07"
  const toMonthISO = (periodLabel: string): string => {
    const m = String(periodLabel).match(/(\d{2})\s*\/\s*(\d{4})/);
    return m ? `${m[2]}-${m[1]}` : String(periodLabel);
  };
  // Helpers for CT summaries
  const str = (x: any) => String(x ?? '').trim();
  const eqi = (a: any, b: any) => str(a).toLowerCase() === str(b).toLowerCase();
  const num = (x: any) => {
    const s = String(x ?? '').replace(/[\.\s]/g, '').replace(/[\u2212−]/g, '-').replace(/,/g, '');
    const m = s.match(/-?\d+(?:\.\d+)?/);
    return m ? Number(m[0]) : 0;
  };
  const badge = (val?: number, suffix = '%') => {
    if (val == null || !Number.isFinite(Number(val))) return null;
    const v = Number(val);
    const ok = v >= 0;
    const arrow = ok ? '▲' : '▼';
    const txt = `${arrow} ${Math.abs(v).toFixed(2)}${suffix}`;
    return (
      <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${ok ? 'bg-emerald-900/30 text-emerald-300' : 'bg-rose-900/30 text-rose-300'}`}>{txt}</span>
    );
  };

  // Compute micro variables present/missing (0/false count as present)
  const { microPresent, microMissing } = useMemo(() => {
    const cfg = (policy as any)?.micro?.config || {};
    const required: string[] = Array.isArray((policy as any)?.micro?.requiredKeys)
      ? (policy as any).micro.requiredKeys
      : (Array.isArray((policy as any)?.micro?.required) ? (policy as any).micro.required : []);
    const groups = ['estructurales','financieros','tributarios','comerciales','activosRespaldo'] as const;
    const keysFromCfg: string[] = groups.flatMap((g) => Object.keys((cfg as any)?.[g] || {}));
    const allKeys = Array.from(new Set([ ...keysFromCfg.map((k) => `micro:${k}`), ...required ]));
    const present: string[] = [];
    const missing: string[] = [];
    for (const k of allKeys) {
      const v = (features as any)[k];
      const isPresent = v !== null && v !== undefined; // 0/false treated as present
      if (isPresent) present.push(k); else missing.push(k);
    }
    return { microPresent: present, microMissing: missing };
  }, [policy, features]);

  // CT helpers - Poll document status until extracted/failed and capture variables
  // Place BEFORE any early return to preserve hook order across renders
  useEffect(() => {
    let timer: any = null;
    const hasCtInFeatures = !!(features as any)?.ct;
    async function tick() {
      try {
        if (!docId || hasCtInFeatures) return;
        const r = await apiGet(`/api/uploads/${docId}`);
        const payload: any = (r as any)?.data || {};
        const status = payload?.status || null;
        setDocStatus(status);
        const v = payload?.meta?.variables || null;
        if (v && !ctVars) setCtVars(v);
        if (status === 'extracted' || status === 'extract_failed') {
          if (status === 'extract_failed') {
            const msg = payload?.meta?.extractError?.message || payload?.meta?.extractError?.code || 'Extracción fallida';
            setDocError(msg);
          }
          return; // stop polling
        }
        timer = setTimeout(tick, 3000);
      } catch {
        timer = setTimeout(tick, 4000);
      }
    }
    if (docId && !hasCtInFeatures) {
      tick();
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [docId, features, ctVars]);

  // Early returns AFTER all hooks are called to keep hook order stable
  if (loading) return <Loader fullScreen label="Cargando evaluación…" />;
  if (err) return <div className="p-6 text-rose-500">{err}</div>;
  if (!data) return <div className="p-6 text-slate-500">No encontrada</div>;

  const s = data?.summaryCard || { score: data?.score, lineSuggestedCLP: 0, riskPct: 0, riskLabel: '—' };
  const fmtCLP = (n: number) => (Number(n) || 0).toLocaleString('es-CL');
  const showInt = (v: any) => (v == null ? '—' : Number(v));
  const showWorkers = (v: any) => (v == null ? 'No encontrado' : String(Number(v)));
  const fmtUSD = (n: number) => (Number(n) || 0).toLocaleString('en-US');
  const safePct = (n: any) => (Number.isFinite(Number(n)) ? Number(n).toFixed(2) : '—');

  // Sales chart helpers
  const salesMonthly: Array<{ month: string; sales?: number; purchases?: number; margin?: number }> = Array.isArray((features as any)?.sales_monthly) ? (features as any).sales_monthly : [];
  const salesAvg = (features as any)?.sales_average_clp;
  const purchasesAvg = (features as any)?.purchases_average_clp;
  const marginAvg = (features as any)?.margin_average_clp;
  const chartData = [...salesMonthly].sort((a, b) => (a.month || '').localeCompare(b.month || ''));
  const SalesChart = ({ data }: { data: Array<{ month: string; sales?: number; margin?: number }> }) => {
    const w = 320; const h = 80; const pad = 6;
    const vals = data.map(d => Number(d.sales || 0));
    const max = Math.max(1, ...vals);
    const barW = Math.max(2, Math.floor((w - pad * 2) / Math.max(1, data.length * 1.2)));
    const gap = Math.max(1, Math.floor(barW * 0.2));
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="88">
        {data.map((d, i) => {
          const x = pad + i * (barW + gap);
          const v = Number(d.sales || 0);
          const bh = Math.round(((v / max) * (h - pad * 2)) || 0);
          const y = h - pad - bh;
          return <rect key={i} x={x} y={y} width={barW} height={bh} fill="#60a5fa" opacity={0.9} />;
        })}
      </svg>
    );
  };
  // CT helpers and grouped chart (ventas, compras, margen)

  const ct: any = (features as any)?.ct || ctVars || {};
  let ctMonthlyRaw: Array<{ month: string; sales?: number; purchases?: number; margin?: number }> = Array.isArray((features as any)?.ct_monthly) ? (features as any).ct_monthly : [];
  if ((!ctMonthlyRaw || ctMonthlyRaw.length === 0) && ct?.f29) {
    const toNum = (x: any) => {
      const s = String(x ?? '').replace(/[\.\s]/g, '').replace(/[\u2212−]/g, '-').replace(/,/g, '');
      const m = s.match(/-?\d+(?:\.\d+)?/);
      return m ? Number(m[0]) : 0;
    };
    const periods: any[] = Array.isArray(ct.f29?.periodo) ? ct.f29.periodo : [];
    const base: any[] = Array.isArray(ct.f29?.base_imponible) ? ct.f29.base_imponible : [];
    const compra: any[] = Array.isArray(ct.f29?.compra) ? ct.f29.compra : [];
    const margen: any[] = Array.isArray(ct.f29?.margen) ? ct.f29.margen : [];
    ctMonthlyRaw = periods.map((p, i) => ({
      month: toMonthISO(String(p)),
      sales: toNum(base[i]),
      purchases: toNum(compra[i]),
      margin: toNum(margen[i]),
    }));
  }
  const ctMonthly = [...ctMonthlyRaw].sort((a, b) => (a.month || '').localeCompare(b.month || ''));
  // CT averages fallback if features averages are not present
  const ctSalesAvg = (salesAvg != null ? salesAvg : (ctMonthly.length ? Math.round(ctMonthly.reduce((s, m) => s + (Number(m.sales||0)), 0) / ctMonthly.length) : 0));
  const ctPurchasesAvg = (purchasesAvg != null ? purchasesAvg : (ctMonthly.length ? Math.round(ctMonthly.reduce((s, m) => s + (Number(m.purchases||0)), 0) / ctMonthly.length) : 0));
  const ctMarginAvg = (marginAvg != null ? marginAvg : (ctMonthly.length ? Math.round(ctMonthly.reduce((s, m) => s + (Number(m.margin||0)), 0) / ctMonthly.length) : 0));
  // Build ECharts option for CT F29 multi-series (ventas, compras, remanente, margen, IVA crédito, postergación, IVA pagado)
  const monthsCat: string[] = ctMonthly.map((d) => d.month);
  const mapFromF29 = (field: string): number[] => {
    const per: any[] = Array.isArray(ct?.f29?.periodo) ? ct.f29.periodo : [];
    const vals: any[] = Array.isArray((ct?.f29 as any)?.[field]) ? (ct.f29 as any)[field] : [];
    const mp = new Map<string, number>();
    for (let i = 0; i < per.length; i++) mp.set(toMonthISO(String(per[i])), Number(String(vals[i] ?? '0').replace(/[\.\s,]/g, '')) || 0);
    return monthsCat.map((m) => mp.get(m) ?? 0);
  };
  const s_sales = monthsCat.map((m) => Number(ctMonthly.find((x) => x.month === m)?.sales || 0));
  const s_purch = monthsCat.map((m) => Number(ctMonthly.find((x) => x.month === m)?.purchases || 0));
  const s_margin = monthsCat.map((m) => Number(ctMonthly.find((x) => x.month === m)?.margin || 0));
  const s_rem = mapFromF29('remanente');
  const s_ivaCred = mapFromF29('iva_credito');
  const s_post = mapFromF29('postergacion');
  const s_ivaPag = mapFromF29('iva_pagado');
  const formatCLP = (n: number) => (Number(n) || 0).toLocaleString('es-CL');
  const CLPSpan = (n: number) => (
    <span className={Number(n) < 0 ? 'text-rose-600 dark:text-rose-400' : undefined}>${fmtCLP(Number(n))}</span>
  );
  const optF29 = monthsCat.length === 0 ? null : {
    backgroundColor: 'transparent',
    textStyle: { color: '#94a3b8' },
    color: ['#3b82f6','#94a3b8','#f59e0b','#10b981','#8b5cf6','#ef4444','#22c55e'],
    tooltip: {
      trigger: 'axis',
      renderMode: 'html',
      formatter: (params: any) => {
        const arr = Array.isArray(params) ? params : [params];
        const title = arr[0]?.axisValueLabel ?? '';
        const rows = arr.map((p: any) => {
          const v = Number(p.data || 0);
          const val = `$${formatCLP(v)}`;
          const color = v < 0 ? ' style="color:#ef4444"' : '';
          const dot = `<span style=\"display:inline-block;width:10px;height:10px;background:${p.color};border-radius:50%;margin-right:6px;\"></span>`;
          return `<div>${dot}${p.seriesName}: <span${color}>${val}</span></div>`;
        }).join('');
        return `<div><div style=\"margin-bottom:4px;opacity:.8\">${title}</div>${rows}</div>`;
      },
    },
    legend: { top: 0, textStyle: { color: '#94a3b8' } },
    grid: { left: 50, right: 20, bottom: 110, top: 40 },
    xAxis: { type: 'category', data: monthsCat, axisLabel: { rotate: 0, hideOverlap: true, margin: 16, formatter: (v: any) => String(v).replace('-', '\n') }, axisLine: { lineStyle: { color: '#64748b' } } },
    yAxis: { type: 'value', axisLabel: { formatter: (v: any) => `$${formatCLP(Number(v))}` }, axisLine: { lineStyle: { color: '#64748b' } }, splitLine: { lineStyle: { color: '#1f2937' } } },
    dataZoom: [ { type: 'inside' }, { type: 'slider', height: 16, bottom: 12 } ],
    series: [
      { name: 'Ventas (Base imponible)', type: 'line', smooth: true, data: s_sales },
      { name: 'Compras', type: 'line', smooth: true, data: s_purch },
      { name: 'Remanente', type: 'line', smooth: true, data: s_rem },
      { name: 'Margen', type: 'line', smooth: true, data: s_margin },
      { name: 'IVA Crédito', type: 'line', smooth: true, data: s_ivaCred },
      { name: 'Postergación', type: 'line', smooth: true, data: s_post },
      { name: 'IVA Pagado', type: 'line', smooth: true, data: s_ivaPag },
    ],
  } as any;
  const ctRows = monthsCat.map((m, i) => ({
    month: m,
    sales: s_sales[i] ?? 0,
    purchases: s_purch[i] ?? 0,
    rem: s_rem[i] ?? 0,
    margin: s_margin[i] ?? 0,
    ivaCred: s_ivaCred[i] ?? 0,
    post: s_post[i] ?? 0,
    ivaPag: s_ivaPag[i] ?? 0,
  }));
  // F22: only table below; chart not required
  const normalizeRutUI = (raw?: any) => {
    try {
      if (!raw) return '';
      let s = String(raw).trim().replace(/[\u2010-\u2015\u2212]/g, '-').replace(/[\.\s]/g, '').toUpperCase();
      if (!s.includes('-')) {
        const m = s.match(/^(\d+)([0-9K])$/i);
        if (m) s = `${m[1]}-${m[2].toUpperCase()}`;
      }
      return s;
    } catch { return String(raw ?? ''); }
  };
  
  // Age formatting helpers
  const ageMonths = Number((features as any)?.antiguedadMeses ?? 0);
  const years = Math.floor(ageMonths / 12);
  const monthsRem = Math.max(0, ageMonths % 12);
  const ageLabel = years >= 1
    ? `${years} año${years > 1 ? 's' : ''} ${monthsRem} mes${monthsRem === 1 ? '' : 'es'}`
    : `${ageMonths} mes${ageMonths === 1 ? '' : 'es'}`;
  const startAt = (features as any)?.startActivitiesAt || (features as any)?.fecha_inicio_actividades || (features as any)?.constitucion_fecha || (features as any)?.company?.startActivitiesAt;
  const startAtStr = startAt ? new Date(startAt).toLocaleDateString('es-CL') : null;
  const companyName = (data as any)?.companyName || (features as any)?.razon_social || (data as any)?.company?.name || null;
  const companyRut = (data as any)?.companyRut || (features as any)?.rut || (data as any)?.company?.rut || null;


  return (
    <div className="w-full px-0 md:px-0">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Resultado de Evaluación</h1>
        <button
          onClick={() => router.push(`/chat?evalId=${data?._id || data?.id || ''}`)}
          className="rounded-full bg-gradient-to-r from-logo-start via-logo-mid to-logo-end px-4 py-2 text-sm font-semibold text-white shadow-card"
        >Enriquecer</button>
      </div>

      {/* Estado de procesamiento de Carpeta Tributaria */}
      {docId && (
        <div className="mb-4">
          {docStatus !== 'extracted' && docStatus !== 'extract_failed' && (
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 ring-1 ring-slate-200 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:ring-white/10">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin text-logo-start" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity=".2"/><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" fill="none"/></svg>
                Procesamiento de Carpeta Tributaria en curso…
              </div>
            </div>
          )}
          {docStatus === 'extracted' && (
            <div className="rounded-xl border border-emerald-300/40 bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-300/40 dark:border-emerald-500/20 dark:bg-emerald-900/20 dark:text-emerald-200">
              Carpeta Tributaria procesada correctamente.
            </div>
          )}
          {docStatus === 'extract_failed' && (
            <div className="rounded-xl border border-rose-300/40 bg-rose-50 p-3 text-sm text-rose-800 ring-1 ring-rose-300/40 dark:border-rose-500/20 dark:bg-rose-900/20 dark:text-rose-200">
              No fue posible extraer datos de la Carpeta Tributaria. {docError ? `(${docError})` : ''}
            </div>
          )}
        </div>
      )}

      {(companyName || companyRut) && (
        <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {companyName ? <span className="font-medium text-slate-700 dark:text-slate-200">{companyName}</span> : null}
          {companyName && companyRut ? ' • ' : ''}
          {companyRut ? <span>{companyRut}</span> : null}
        </div>
      )}
      {/* Tabs */}
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => setTab('resumen')} className={`rounded-full px-3 py-1 text-xs ${tab === 'resumen' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>Resumen</button>
        <button onClick={() => setTab('ct')} className={`rounded-full px-3 py-1 text-xs ${tab === 'ct' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>Carpeta Tributaria</button>
      </div>

      {tab === 'resumen' && (
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Macro snapshot */}
        <div className="rounded-2xl bg-slate-900/60 p-4 text-slate-100 ring-1 ring-white/10 shadow-card">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm text-slate-300">Macro ({macro?.country || '—'})</div>
            <div className="text-xs text-slate-400">{macro?.asOf ? new Date(macro.asOf).toLocaleString() : ''}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-slate-800/60 p-3">
              <div className="text-xs text-slate-400">UF</div>
              <div className="mt-1 font-semibold">{fmtCLP(Number(macroVals.uf || 0))}</div>
              {badge(macroVarSel.uf)}
            </div>
            <div className="rounded-xl bg-slate-800/60 p-3">
              <div className="text-xs text-slate-400">USD</div>
              <div className="mt-1 font-semibold">{fmtUSD(Number(macroVals.usd || 0))}</div>
              {badge(macroVarSel.usd)}
            </div>
            <div className="rounded-xl bg-slate-800/60 p-3">
              <div className="text-xs text-slate-400">Inflación mensual</div>
              <div className="mt-1 font-semibold">{safePct(macroVals.inflationMonthly)}%</div>
              {badge(macroVarSel.inflationMonthly)}
            </div>
            <div className="rounded-xl bg-slate-800/60 p-3">
              <div className="text-xs text-slate-400">Inflación acumulada</div>
              <div className="mt-1 font-semibold">{safePct(macroVals.inflationAccumulated)}%</div>
              {badge(macroVarSel.inflationAccumulated)}
            </div>
            <div className="rounded-xl bg-slate-800/60 p-3">
              <div className="text-xs text-slate-400">TPM</div>
              <div className="mt-1 font-semibold">{safePct(macroVals.tpm)}%</div>
              {badge(macroVarSel.tpm)}
            </div>
          </div>
        </div>
        {/* Micro + Giros */}
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
          <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Micro y Giros</div>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-200">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <div className="text-xs text-slate-500">Antigüedad</div>
              <div className="mt-1 font-semibold">{ageLabel}</div>
              <div className="text-[11px] text-slate-500">{startAtStr || 'Inicio n/d'}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <div className="text-xs text-slate-500">Trabajadores</div>
              <div className="mt-1 font-semibold">{showWorkers((features as any)?.workers)}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <div className="text-xs text-slate-500">Giro</div>
              <div className="mt-1 font-semibold truncate" title={`${(features as any)?.company?.giroName || (features as any)?.giroName || ''}`}>{(features as any)?.company?.giroName || (features as any)?.giroName || '—'}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <div className="text-xs text-slate-500">Ventas promedio</div>
              <div className="mt-1 font-semibold">{CLPSpan(salesAvg ?? 0)}</div>
            </div>

            {/* Planilla (estimación) y Morosidad */}
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 md:col-span-2">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {/* Planilla */}
                <div>
                  <div className="text-xs text-slate-500">Planilla estimada</div>
                  {(() => {
                    const workers = Number((features as any)?.workers ?? 0) || 0;
                    const MEDIAN_SALARY_CLP = 580000; // INE aprox, configurable
                    const payroll = workers * MEDIAN_SALARY_CLP;
                    return (
                      <div className="mt-1 text-sm">
                        <div>N° trabajadores: <span className="font-semibold">{workers}</span></div>
                        <div>Estimación mensual: <span className="font-semibold">{CLPSpan(payroll)}</span></div>
                        <div className="text-[11px] text-slate-500">Cálculo: trabajadores × sueldo mediano país</div>
                      </div>
                    );
                  })()}
                </div>

                {/* Morosidad */}
                <div>
                  <div className="text-xs text-slate-500">Morosidad</div>
                  {(() => {
                    const f: any = features || {};
                    const eventos = f.morosidad_vigente_documentos ?? f.morosidad_eventos ?? f.atrasos_eventos ?? f.dpd_eventos ?? f.overdue_events ?? null;
                    const monto = f.morosidad_vigente_monto ?? f.morosidad_monto_clp ?? f.overdue_amount_clp ?? f.morosidad_total_clp ?? null;
                    const maxDpd = f.morosidad_max_dpd ?? f.max_dpd ?? f.dpd_max ?? null;
                    const ultimo = f.morosidad_ultimo ?? f.last_overdue_at ?? f.ultimo_atraso ?? null;
                    return (
                      <div className="mt-1 text-sm">
                        <div>Eventos: <span className="font-semibold">{showInt(eventos)}</span></div>
                        <div>Monto vencido: <span className="font-semibold">{monto == null ? '—' : CLPSpan(Number(monto))}</span></div>
                        <div>Máx DPD: <span className="font-semibold">{showInt(maxDpd)}</span></div>
                        <div className="text-[11px] text-slate-500">{ultimo ? `Último atraso: ${new Date(ultimo).toLocaleDateString('es-CL')}` : 'Último atraso: —'}</div>
                      </div>
                    );
                  })()}
                </div>
                {/* Deterioro Comercial */}
                <div>
                  <div className="text-xs text-slate-500">Deterioro Comercial</div>
                  {(() => {
                    const v = (features as any)?.deterioro_comercial;
                    const label = v === true ? 'Con deterioro' : v === false ? 'Sin deterioro' : '—';
                    return (
                      <div className="mt-1 text-sm font-semibold">{label}</div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {tab === 'resumen' && (
      <div className="rounded-2xl bg-slate-900/60 p-4 text-slate-100 ring-1 ring-white/10 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm text-slate-300">Evaluación de Riesgo</div>
          <span className="rounded-full bg-emerald-900/40 px-2 py-0.5 text-xs text-emerald-300">{s.riskLabel}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-800/60 p-3 text-center">
            <div className="text-3xl font-bold">{s.score}</div>
            <div className="text-xs text-slate-400">Score Crediticio</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3 text-center">
            <div className="text-2xl font-bold text-emerald-300">{CLPSpan(s.lineSuggestedCLP)}</div>
            <div className="text-xs text-slate-400">Línea Sugerida</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3 text-center">
            <div className="text-[11px] text-slate-400">Avalúo {((features as any)?.realestate_appraisal_clp == null) ? '—' : `${CLPSpan((features as any)?.realestate_appraisal_clp)}`}</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="text-xs text-slate-400">Vehículos</div>
            <div className="mt-1 font-semibold">N° {showInt((features as any)?.vehicles_count)}</div>
            <div className="text-[11px] text-slate-400">Avalúo {((features as any)?.vehicles_appraisal_clp == null) ? '—' : `${CLPSpan((features as any)?.vehicles_appraisal_clp)}`}</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="text-xs text-slate-400">Concursal</div>
            <div className="mt-1 font-semibold">{showInt((features as any)?.quiebra_eventos)} eventos</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="text-xs text-slate-400">Bancos Relacionados</div>
            <div className="mt-1 font-semibold truncate" title={`${((features as any)?.bancos_relacionados ?? '')}`}>{((features as any)?.bancos_relacionados ?? '—') || '—'}</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="text-xs text-slate-400">Exportaciones 5y</div>
            <div className="mt-1 font-semibold">{showInt((features as any)?.exports_5y)}</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="text-xs text-slate-400">Importaciones 5y</div>
            <div className="mt-1 font-semibold">{showInt((features as any)?.imports_5y)}</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="text-xs text-slate-400">Infracciones laborales</div>
            <div className="mt-1 font-semibold">{showInt((features as any)?.labor_fines)}</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="text-xs text-slate-400">Infracciones previsionales</div>
            <div className="mt-1 font-semibold">{showInt((features as any)?.pension_fines)}</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="text-xs text-slate-400">Prendas s/d</div>
            <div className="mt-1 font-semibold">{showInt((features as any)?.prendas_sin_desplazamiento)}</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="text-xs text-slate-400">Anotaciones tributarias</div>
            <div className="mt-1 font-semibold">{showInt((features as any)?.anotaciones_tributarias)}</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="text-xs text-slate-400">Consultas al RUT</div>
            <div className="mt-1 font-semibold">{showInt((features as any)?.rut_queries)}</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="text-xs text-slate-400">Publicaciones (sociedad / socio)</div>
            <div className="mt-1 font-semibold">{showInt((features as any)?.publicaciones_sociedad)} / {showInt((features as any)?.publicaciones_socio)}</div>
          </div>
        </div>
      </div>
      )}

      {/* Variables aportadas / no detectadas */}
      {tab === 'resumen' && (
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
          <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Variables aportadas</div>
          {microPresent.length === 0 ? (
            <div className="text-xs text-slate-500">—</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {microPresent.map((k) => (
                <span key={k} className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
          <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Variables no detectadas</div>
          {microMissing.length === 0 ? (
            <div className="text-xs text-slate-500">—</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {microMissing.map((k) => (
                <span key={k} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Details */}
      {tab === 'resumen' && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
            <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Alerts</div>
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
              {(data?.alerts || []).map((a: string, i: number) => <li key={i}>{a}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
            <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Features</div>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-300">{JSON.stringify(data?.features || {}, null, 2)}</pre>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10 md:col-span-2">
            <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Explain</div>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-300">{JSON.stringify(data?.explain || [], null, 2)}</pre>
          </div>
        </div>
      )}

      {/* CT Tab */}
      {tab === 'ct' && (
        <div className="mt-2 grid grid-cols-1 gap-4">
          {/* Empty state */}
          {!ct || Object.keys(ct).length === 0 ? (
            <div className="rounded-2xl bg-white p-4 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-white/10">
              No hay datos de Carpeta Tributaria para esta evaluación.
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
                <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Identificación (Carpeta Tributaria)</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  <div><span className="text-slate-500">Empresa:</span> <span className="font-semibold">{ct?.identificacion?.emisor_nombre || '—'}</span></div>
                  <div className="mt-1"><span className="text-slate-500">RUT:</span> <span className="font-semibold">{normalizeRutUI(ct?.identificacion?.emisor_rut || ct?.inputs?.rut)}</span></div>
                </div>
              </div>

              {Array.isArray(ctMonthly) && ctMonthly.length > 0 && (
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Serie mensual (últimos {ctMonthly.length} meses)</div>
                    <div className="flex items-center gap-2">
                      <div className="hidden text-[11px] text-slate-500 sm:inline">Periodo YYYY-MM</div>
                      <div className="flex items-center gap-1">
                        <button
                          aria-label="Ver gráfico"
                          onClick={() => setCtView('chart')}
                          className={`rounded-full p-1.5 text-xs ring-1 ${ctView==='chart' ? 'bg-slate-800 text-white ring-white/10' : 'bg-slate-200 text-slate-700 ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-white/10'}`}
                          title="Ver gráfico"
                        >
                          {/* chart icon */}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 3h2v18H4V3Zm7 6h2v12h-2V9Zm7-4h2v16h-2V5Z"/></svg>
                        </button>
                        <button
                          aria-label="Ver tabla"
                          onClick={() => setCtView('table')}
                          className={`rounded-full p-1.5 text-xs ring-1 ${ctView==='table' ? 'bg-slate-800 text-white ring-white/10' : 'bg-slate-200 text-slate-700 ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-white/10'}`}
                          title="Ver tabla"
                        >
                          {/* table icon */}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3V3Zm2 2v3h14V5H5Zm14 5H5v3h14v-3Zm0 5H5v3h14v-3Z"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  {ctView === 'chart' ? (
                    <div className="w-full">
                      {optF29 ? <EChart option={optF29} height={420} /> : null}
                    </div>
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
                          {ctRows.map((r, i) => (
                            <tr key={r.month} className={i < ctRows.length - 1 ? 'border-b border-slate-200/60 dark:border-white/10' : ''}>
                              <td className="px-3 py-1">{r.month}</td>
                              <td className="px-3 py-1 text-right">{CLPSpan(r.sales)}</td>
                              <td className="px-3 py-1 text-right">{CLPSpan(r.purchases)}</td>
                              <td className="px-3 py-1 text-right">{CLPSpan(r.rem)}</td>
                              <td className="px-3 py-1 text-right">{CLPSpan(r.margin)}</td>
                              <td className="px-3 py-1 text-right">{CLPSpan(r.ivaCred)}</td>
                              <td className="px-3 py-1 text-right">{CLPSpan(r.post)}</td>
                              <td className="px-3 py-1 text-right">{CLPSpan(r.ivaPag)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                      <div className="text-xs text-slate-500">Venta promedio</div>
                      <div className="mt-1 font-semibold">{CLPSpan(ctSalesAvg ?? 0)}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                      <div className="text-xs text-slate-500">Compra promedio</div>
                      <div className="mt-1 font-semibold">{CLPSpan(ctPurchasesAvg ?? 0)}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                      <div className="text-xs text-slate-500">Margen promedio</div>
                      <div className="mt-1 font-semibold">{CLPSpan(ctMarginAvg ?? 0)}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
                <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Alertas (Carpeta Tributaria)</div>
                <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
                  {Object.values(ct?.alertas || {}).filter((v: any) => v && String(v).trim()).map((v: any, i: number) => (
                    <li key={i}>{String(v)}</li>
                  ))}
                  {Object.values(ct?.alertas || {}).filter((v: any) => v && String(v).trim()).length === 0 && (
                    <li className="text-slate-500">—</li>
                  )}
                </ul>
              </div>

              {/* F29 Summary Tables */}
              {ct?.f29 && (
                <div className="grid grid-cols-1 gap-4">
                  {/* Tipo de Declaración */}
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
                    <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Tipo de Declaración F29 (conteo)</div>
                    {(() => {
                      const tipos: any[] = Array.isArray(ct?.f29?.tipo_declaracion) ? ct.f29.tipo_declaracion : [];
                      const periods: any[] = Array.isArray(ct?.f29?.periodo) ? ct.f29.periodo : [];
                      const total = Math.max(tipos.length, periods.length);
                      const prim = tipos.filter((t) => eqi(t, 'Primitiva')).length;
                      const modSin = tipos.filter((t) => eqi(t, 'Modificatoria sin giro')).length;
                      const modCon = tipos.filter((t) => eqi(t, 'Modificatoria con giro')).length;
                      return (
                        <div>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-800/70 text-slate-100 dark:bg-slate-800">
                                <th className="px-3 py-2 text-left">Tipo de Declaración</th>
                                <th className="px-3 py-2 text-right">Cantidad</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-slate-200/60 dark:border-white/10"><td className="px-3 py-1">Total F29</td><td className="px-3 py-1 text-right font-semibold">{total}</td></tr>
                              <tr className="border-b border-slate-200/60 dark:border-white/10"><td className="px-3 py-1">Primitiva</td><td className="px-3 py-1 text-right">{prim}</td></tr>
                              <tr className="border-b border-slate-200/60 dark:border-white/10"><td className="px-3 py-1">Modificatoria sin giro</td><td className="px-3 py-1 text-right">{modSin}</td></tr>
                              <tr><td className="px-3 py-1">Modificatoria con giro</td><td className="px-3 py-1 text-right">{modCon}</td></tr>
                            </tbody>
                          </table>
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Importancia: el tipo de declaración F29 indica si el período fue declarado por primera vez (Primitiva) o si fue rectificado. Las rectificatorias sin giro ajustan datos sin generar nueva deuda; las rectificatorias/modificatorias con giro determinan un impuesto adicional que Tesorería gira. Una mayor frecuencia de rectificatorias con giro puede evidenciar inconsistencias o atrasos de pago.
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Estado de Pago */}
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
                    <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Estado de Pago F29 (pagado vs declarado sin pago)</div>
                    {(() => {
                      const estados: any[] = Array.isArray(ct?.f29?.pago_estado) ? ct.f29.pago_estado : [];
                      const pagado = estados.filter((s) => eqi(s, 'Pagado')).length;
                      const sinPago = estados.filter((s) => eqi(s, 'Declarado sin pago')).length;
                      return (
                        <div>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-800/70 text-slate-100 dark:bg-slate-800">
                                <th className="px-3 py-2 text-left">Estado de Pago</th>
                                <th className="px-3 py-2 text-right">Cantidad</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-slate-200/60 dark:border-white/10"><td className="px-3 py-1">Pagado</td><td className="px-3 py-1 text-right">{pagado}</td></tr>
                              <tr><td className="px-3 py-1">Declarado sin pago</td><td className="px-3 py-1 text-right">{sinPago}</td></tr>
                            </tbody>
                          </table>
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Un F29 “Pagado” suele incluir datos bancarios y/o un medio de pago. Si el F29 está “Declarado sin pago”, típicamente no aparecen datos bancarios ni medio de pago. Este indicador ayuda a validar liquidez tributaria reciente y consistencia de cumplimiento.
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* F22 Section */}
              {ct?.f22 && (
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
                  <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">F22 (Resumen por período)</div>
                  {(() => {
                    const per: any[] = Array.isArray(ct?.f22?.periodo) ? ct.f22.periodo : [];
                    const rows = per.map((p, i) => ({
                      periodo: String(p),
                      ingresos: num(ct?.f22?.ingresos?.[i]),
                      activo: num(ct?.f22?.total_activo?.[i]),
                      pasivo: num(ct?.f22?.total_pasivo?.[i]),
                      utilidad: num(ct?.f22?.utilidad?.[i]),
                      perdida: num(ct?.f22?.perdida?.[i]),
                      cptPos: num(ct?.f22?.cpt_positivo?.[i]),
                      cptNeg: num(ct?.f22?.cpt_negativo?.[i]),
                    }));
                    if (rows.length === 0) return <div className="text-sm text-slate-500">—</div>;
                    return (
                      <div className="overflow-auto">
                        <table className="min-w-[720px] w-full text-sm">
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
                            {rows.map((r, i) => (
                              <tr key={i} className={i < rows.length - 1 ? 'border-b border-slate-200/60 dark:border-white/10' : ''}>
                                <td className="px-3 py-1">{r.periodo}</td>
                                <td className="px-3 py-1 text-right">{CLPSpan(r.ingresos)}</td>
                                <td className="px-3 py-1 text-right">{CLPSpan(r.activo)}</td>
                                <td className="px-3 py-1 text-right">{CLPSpan(r.pasivo)}</td>
                                <td className="px-3 py-1 text-right">{CLPSpan(r.utilidad)}</td>
                                <td className="px-3 py-1 text-right">{CLPSpan(r.perdida)}</td>
                                <td className="px-3 py-1 text-right">{CLPSpan(r.cptPos)}</td>
                                <td className="px-3 py-1 text-right">{CLPSpan(r.cptNeg)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Suggestion (non-binding) */}
              {(ct?.capacidad_sugerida || ct?.resumen?.resultado) && (
                <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-900 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-800">
                  <div className="mb-1 text-sm font-semibold">Sugerencia de capacidad de crédito</div>
                  <div className="text-sm">
                    {ct?.capacidad_sugerida != null && (<div>Capacidad sugerida (CLP): <span className="font-semibold">${fmtCLP(Number(ct.capacidad_sugerida))}</span></div>)}
                    {ct?.resumen?.resultado && (<div>Resultado sugerido: <span className="font-semibold">{String(ct.resumen.resultado)}</span>{ct?.resumen?.nota_riesgo != null ? <span className="ml-2 text-[11px]">(nota {ct.resumen.nota_riesgo})</span> : null}</div>)}
                  </div>
                  <div className="mt-2 text-xs opacity-80">Aviso: esta sugerencia es informativa y no vinculante; debe revisarse junto con políticas internas y evidencia financiera.</div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
