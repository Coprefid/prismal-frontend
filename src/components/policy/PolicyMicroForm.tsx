"use client";
import { useState } from 'react';
import InfoTooltip from '@/components/ui/InfoTooltip';
import MicroHelpModal from '@/components/policy/MicroHelpModal';
import GiroSelect, { type GiroSelectValue } from '@/components/GiroSelect';
import { searchGiros } from '@/data/giros';
import NumericInput from '@/components/ui/NumericInput';

export type MicroConfig = {
  estructurales: {
    antiguedad: { weight: number; warnYears: number; riskYears: number; omit: boolean };
    trabajadores: { weight: number; warnPayrollPct: number; riskPayrollPct: number; omit: boolean };
    giro: { weight: number; omit: boolean; selected: Array<{ code: string; name: string }> };
  };
  financieros: {
    ventas: { weight: number; growthMonths: number; warnDropPct: number; riskDropPct: number; omit: boolean };
    rentabilidad: { weight: number; warnMarginPct: number; riskMarginPct: number; omit: boolean };
    liquidez: { weight: number; warn: number; risk: number; omit: boolean };
    endeudamiento: { weight: number; warnX: number; riskX: number; omit: boolean };
    capitalPropio: { weight: number; omit: boolean };
  };
  tributarios: {
    cumplimiento: { weight: number; omit: boolean };
    carpetaDesactualizada: { warnDays: number; riskDays: number; omit: boolean };
  };
  comerciales: {
    morosidad: { weight: number; omit: boolean };
  };
  activosRespaldo: {
    activosDeclarados: { weight: number; omit: boolean };
    diversificacionClientes: { weight: number; omit: boolean };
    dependenciaProveedor: { omit: boolean };
  };
};

export function defaultMicroConfig(): MicroConfig {
  // Try to preselect 3 giros related to the requested sectors
  const pickGiro = (q: string) => (searchGiros(q, 1)[0] ?? null);
  const preselected = [
    pickGiro('construcción de edificios') || pickGiro('construcción'),
    pickGiro('comercio al por menor') || pickGiro('retail'),
    pickGiro('fabricación de productos alimenticios') || pickGiro('manufactura alimentos'),
  ].filter(Boolean) as Array<{ code: string; name: string }>;

  return {
    estructurales: {
      antiguedad: { weight: 0.10, warnYears: 2, riskYears: 1, omit: false },
      trabajadores: { weight: 0.10, warnPayrollPct: 30, riskPayrollPct: 50, omit: false },
      giro: { weight: 0.08, omit: false, selected: preselected },
    },
    financieros: {
      ventas: { weight: 0.20, growthMonths: 12, warnDropPct: 10, riskDropPct: 20, omit: false },
      rentabilidad: { weight: 0.15, warnMarginPct: 0, riskMarginPct: -5, omit: false },
      liquidez: { weight: 0.20, warn: 1.2, risk: 1.0, omit: false },
      endeudamiento: { weight: 0.20, warnX: 2, riskX: 3, omit: false },
      capitalPropio: { weight: 0.10, omit: false },
    },
    tributarios: {
      cumplimiento: { weight: 0.10, omit: false },
      carpetaDesactualizada: { warnDays: 30, riskDays: 90, omit: false },
    },
    comerciales: {
      morosidad: { weight: 0.15, omit: false },
    },
    activosRespaldo: {
      activosDeclarados: { weight: 0.10, omit: false },
      diversificacionClientes: { weight: 0.10, omit: false },
      dependenciaProveedor: { omit: true },
    },
  };
}

export type MicroPenalties = Record<string, { warnPenaltyPct: number; riskPenaltyPct: number }>;

export default function PolicyMicroForm({ value, penalties, onChange, onChangePenalty, globalWeight, onChangeGlobal }: {
  value: MicroConfig;
  penalties: MicroPenalties;
  onChange: (v: MicroConfig) => void;
  onChangePenalty: (key: string, p: { warnPenaltyPct?: number; riskPenaltyPct?: number }) => void;
  globalWeight: number;
  onChangeGlobal: (w: number) => void;
}) {
  const [helpOpen, setHelpOpen] = useState(false);
  const set = (path: string[], newVal: any) => {
    const next = structuredClone(value) as any;
    let obj = next;
    for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
    obj[path[path.length - 1]] = newVal;
    onChange(next);
  };

  // Helpers to read all weights (only those with omit === false)
  const weightsList: Array<{ key: string; weight: number; omit?: boolean }> = [
    { key: 'estructurales.antiguedad', weight: value.estructurales.antiguedad.weight, omit: value.estructurales.antiguedad.omit },
    { key: 'estructurales.trabajadores', weight: value.estructurales.trabajadores.weight, omit: value.estructurales.trabajadores.omit },
    { key: 'estructurales.giro', weight: value.estructurales.giro.weight, omit: value.estructurales.giro.omit },
    { key: 'financieros.ventas', weight: value.financieros.ventas.weight, omit: value.financieros.ventas.omit },
    { key: 'financieros.rentabilidad', weight: value.financieros.rentabilidad.weight, omit: value.financieros.rentabilidad.omit },
    { key: 'financieros.liquidez', weight: value.financieros.liquidez.weight, omit: value.financieros.liquidez.omit },
    { key: 'financieros.endeudamiento', weight: value.financieros.endeudamiento.weight, omit: value.financieros.endeudamiento.omit },
    { key: 'financieros.capitalPropio', weight: value.financieros.capitalPropio.weight, omit: value.financieros.capitalPropio.omit },
    { key: 'tributarios.cumplimiento', weight: value.tributarios.cumplimiento.weight, omit: value.tributarios.cumplimiento.omit },
    { key: 'comerciales.morosidad', weight: value.comerciales.morosidad.weight, omit: value.comerciales.morosidad.omit },
    { key: 'activosRespaldo.activosDeclarados', weight: value.activosRespaldo.activosDeclarados.weight, omit: value.activosRespaldo.activosDeclarados.omit },
    { key: 'activosRespaldo.diversificacionClientes', weight: value.activosRespaldo.diversificacionClientes.weight, omit: value.activosRespaldo.diversificacionClientes.omit },
  ];
  const totalPct = Math.round(((weightsList.reduce((acc, w) => acc + (w.omit ? 0 : (w.weight || 0)), 0)) * 100 + Number.EPSILON) * 100) / 100;
  const totalPctDisplay = Number.isFinite(totalPct) ? totalPct : 0;
  const over = totalPctDisplay > 100;

  function capWeightFor(key: string, desiredFraction: number): number {
    const others = weightsList.reduce((acc, w) => acc + (w.key === key || w.omit ? 0 : (w.weight || 0)), 0);
    const maxForThis = Math.max(0, 1 - others);
    return Math.min(Math.max(0, desiredFraction), maxForThis);
  }

  // Helpers para validaciones de penalizaciones
  // Para 'giro' solo exigimos Risk; Warn se considera 0 por defecto y no se muestra en UI
  const hasPen = (k: string) => (
    k === 'giro'
      ? (typeof penalties[k]?.riskPenaltyPct === 'number')
      : (typeof penalties[k]?.warnPenaltyPct === 'number' && typeof penalties[k]?.riskPenaltyPct === 'number')
  );
  const missWarn = (k: string) => (k === 'giro' ? false : typeof penalties[k]?.warnPenaltyPct !== 'number');
  const missRisk = (k: string) => typeof penalties[k]?.riskPenaltyPct !== 'number';

  // Clamp de porcentaje 0–100
  const clampPct = (n: number) => Math.max(0, Math.min(100, n));

  // Toggle UI para indicar si la variable está incluida u omitida
  function OmitToggle({ included, onChange }: { included: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        type="button"
        onClick={() => onChange(!included)}
        className={`inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs transition-colors ${included ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
        title={included ? 'Click para omitir' : 'Click para incluir'}
      >
        <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${included ? 'bg-emerald-500' : 'bg-slate-400'}`}>
          <span className={`absolute left-0 top-0 h-5 w-5 rounded-full bg-white shadow transition-transform ${included ? 'translate-x-4' : 'translate-x-0'}`} />
        </span>
        <span>{included ? 'Incluido' : 'Omitido'}</span>
      </button>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="card p-6 space-y-4">
        <div className="font-semibold flex items-center">
          Política micro (estructura interna)
          <InfoTooltip title="¿Qué es?">{"Parámetros internos de la empresa: estructurales, financieros, tributarios y comerciales/activos."}</InfoTooltip>
          <button type="button" className="ml-auto rounded-full border px-3 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" onClick={()=>setHelpOpen(true)}>Ver guía</button>
        </div>
        <div className="hint">Valores sugeridos. La suma de ponderaciones puede ser 100%. Puedes omitir indicadores para no considerarlos.</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 items-center gap-2">
            <label className="label flex items-center">Ponderación global de micro en el score total</label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                className="input"
                inputMode="decimal"
                value={Number.isFinite(globalWeight) ? Math.round((globalWeight * 100 + Number.EPSILON) * 100) / 100 : 0}
                onChange={(e) => {
                  const pct = Number(e.target.value);
                  (onChangeGlobal ?? (()=>{}))(Number.isFinite(pct) ? pct / 100 : 0);
                }}
                disabled
              />
              <div className="input flex items-center justify-center text-slate-500">%</div>
            </div>
            <div className="col-span-2 text-xs text-slate-500">Se calcula automáticamente como 100% menos la ponderación global de macro.</div>
          </div>
          <div className="md:col-span-1" />
          <div className="md:col-span-2">
            <label className="label">Total ponderaciones (micro)</label>
            <div className={`rounded-xl border p-2 ${over ? 'border-rose-300 bg-rose-50/40 dark:border-rose-400/60 dark:bg-rose-900/20' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span>{totalPctDisplay}%</span>
                <span>100%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className={`${over ? 'bg-rose-400' : 'bg-gradient-to-r from-logo-start via-logo-mid to-logo-end'} h-full`} style={{ width: `${Math.min(totalPctDisplay, 100)}%` }} />
              </div>
              {over && <div className="mt-1 text-xs text-rose-400">Supera 100%. Ajusta alguna ponderación.</div>}
            </div>
          </div>
        </div>
      </div>
      {/* Estructurales */}
      <div className="card p-6 space-y-4">
        <div className="font-semibold flex items-center justify-between">
          <div className="flex items-center">Estructurales<InfoTooltip title="Estructurales">{`Antigüedad, trabajadores y giro.
- Antigüedad: <1 año = riesgo / 1–2 años = warning / >2 años = ok. Parametrizable.
- N° de trabajadores: parte del respaldo operativo.
- Giro: rubros de mayor riesgo penalizan.
Puedes omitir indicadores que no aplican.`}</InfoTooltip></div>
          {/* guía ya está en el header card */}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`rounded-xl border p-3 ${value.estructurales.antiguedad.omit ? 'opacity-60 border-slate-200 dark:border-slate-800' : (!hasPen('antiguedad') ? 'border-rose-400 dark:border-rose-400' : 'border-slate-200 dark:border-slate-800')}`}>
            <label className="label">Antigüedad — Ponderación (%)</label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input className="input" inputMode="decimal" value={Math.round((value.estructurales.antiguedad.weight*100+Number.EPSILON)*100)/100}
                onChange={(e)=>{
                  const pct = Number(e.target.value);
                  const capped = capWeightFor('estructurales.antiguedad', Number.isFinite(pct)? pct/100 : 0);
                  set(['estructurales','antiguedad','weight'], capped);
                }} />
              <div className="input flex items-center justify-center text-slate-500">%</div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="label font-semibold !text-amber-600">Warn ≥ años</label>
                <input className="input" inputMode="numeric" value={value.estructurales.antiguedad.warnYears}
                  onChange={(e)=>set(['estructurales','antiguedad','warnYears'], Number(e.target.value)||0)} />
              </div>
              <div>
                <label className="label font-semibold !text-rose-400">Risk ≤ años</label>
                <input className="input" inputMode="numeric" value={value.estructurales.antiguedad.riskYears}
                  onChange={(e)=>set(['estructurales','antiguedad','riskYears'], Number(e.target.value)||0)} />
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="label">Penalización en Warn</label>
                <input className={`input ${(!value.estructurales.antiguedad.omit && missWarn('antiguedad')) ? 'ring-2 ring-rose-400 focus:ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['antiguedad']?.warnPenaltyPct === 'number') ? penalties['antiguedad']!.warnPenaltyPct : ''}
                  onChange={(e)=>onChangePenalty('antiguedad', { warnPenaltyPct: clampPct(Number(e.target.value)||0) })} />
              </div>
              <div>
                <label className="label">Penalización en Risk</label>
                <input className={`input ${(!value.estructurales.antiguedad.omit && missRisk('antiguedad')) ? 'ring-2 ring-rose-400 focus:ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['antiguedad']?.riskPenaltyPct === 'number') ? penalties['antiguedad']!.riskPenaltyPct : ''}
                  onChange={(e)=>onChangePenalty('antiguedad', { riskPenaltyPct: clampPct(Number(e.target.value)||0) })} />
              </div>
            </div>
            <div className="mt-2">
              <OmitToggle included={!value.estructurales.antiguedad.omit} onChange={(v)=>set(['estructurales','antiguedad','omit'], !v)} />
            </div>
          </div>
          <div className={`rounded-xl border p-3 ${value.estructurales.trabajadores.omit ? 'opacity-60 border-slate-200 dark:border-slate-800' : (!hasPen('trabajadores') ? 'border-rose-400 dark:border-rose-400' : 'border-slate-200 dark:border-slate-800')}`}>
            <div className="flex items-center justify-between">
              <label className="label">Trabajadores — Ponderación (%)</label>
              <InfoTooltip title="Carga por nómina">
{`Esta variable estima la carga por nómina como:
N° trabajadores × sueldo mediano INE del país observado (p. ej., Chile ≈ 580.000 CLP).
Se compara contra el margen para definir umbrales:
• Warn: cuando la carga representa ≥ 30% y < 50%
• Risk: cuando representa ≥ 50%
Los umbrales son parametrizables abajo.`}
              </InfoTooltip>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input className="input" inputMode="decimal" value={Math.round((value.estructurales.trabajadores.weight*100+Number.EPSILON)*100)/100}
                onChange={(e)=>{
                  const pct = Number(e.target.value);
                  const capped = capWeightFor('estructurales.trabajadores', Number.isFinite(pct)? pct/100 : 0);
                  set(['estructurales','trabajadores','weight'], capped);
                }} />
              <div className="input flex items-center justify-center text-slate-500">%</div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="label font-semibold !text-amber-600">Warn % carga nómina</label>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <NumericInput
                    className="input"
                    value={value.estructurales.trabajadores.warnPayrollPct}
                    onCommit={(n)=>set(['estructurales','trabajadores','warnPayrollPct'], n ?? 0)}
                    allowNegative={false}
                    allowDecimal
                    acceptComma
                  />
                  <div className="input flex items-center justify-center text-slate-500">%</div>
                </div>
              </div>
              <div>
                <label className="label font-semibold !text-rose-400">Risk % carga nómina</label>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <NumericInput
                    className="input"
                    value={value.estructurales.trabajadores.riskPayrollPct}
                    onCommit={(n)=>set(['estructurales','trabajadores','riskPayrollPct'], n ?? 0)}
                    allowNegative={false}
                    allowDecimal
                    acceptComma
                  />
                  <div className="input flex items-center justify-center text-slate-500">%</div>
                </div>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="label font-semibold !text-amber-600">Penalización en Warn</label>
                <input className={`input ${(!value.estructurales.trabajadores.omit && missWarn('trabajadores')) ? 'ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['trabajadores']?.warnPenaltyPct === 'number') ? penalties['trabajadores']!.warnPenaltyPct : ''}
                  onChange={(e)=>onChangePenalty('trabajadores', { warnPenaltyPct: clampPct(Number(e.target.value)||0) })} />
              </div>
              <div>
                <label className="label font-semibold !text-rose-400">Penalización en Risk</label>
                <input className={`input ${(!value.estructurales.trabajadores.omit && missRisk('trabajadores')) ? 'ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['trabajadores']?.riskPenaltyPct === 'number') ? penalties['trabajadores']!.riskPenaltyPct : ''}
                  onChange={(e)=>onChangePenalty('trabajadores', { riskPenaltyPct: clampPct(Number(e.target.value)||0) })} />
              </div>
            </div>
            <div className="mt-2">
              <OmitToggle included={!value.estructurales.trabajadores.omit} onChange={(v)=>set(['estructurales','trabajadores','omit'], !v)} />
            </div>
          </div>
        </div>
        <div className={`rounded-xl border p-3 ${value.estructurales.giro.omit ? 'opacity-60 border-slate-200 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800'}`}>
          <label className="label">Giro — Ponderación (%)</label>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input className="input" inputMode="decimal" value={Math.round((((value.estructurales?.giro?.weight ?? 0)*100)+Number.EPSILON)*100)/100}
              onChange={(e)=>{
                const pct = Number(e.target.value);
                const capped = capWeightFor('estructurales.giro', Number.isFinite(pct)? pct/100 : 0);
                set(['estructurales','giro','weight'], capped);
              }} />
            <div className="input flex items-center justify-center text-slate-500">%</div>
          </div>
          {/* Búsqueda y chips de giros seleccionados */}
          <div className="mt-2">
            <label className="label">Añadir giro</label>
            <GiroSelect
              value={null as unknown as GiroSelectValue}
              onChange={(gi)=>{
                if (!gi) return;
                const exists = (value.estructurales?.giro?.selected ?? []).some(x=>x.code===gi.code);
                if (exists) return;
                set(['estructurales','giro','selected'], [...(value.estructurales?.giro?.selected ?? []), { code: gi.code, name: gi.name }]);
              }}
              placeholder="Busca por nombre o código"
            />
            {(value.estructurales?.giro?.selected ?? []).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {(value.estructurales?.giro?.selected ?? []).map((g)=> (
                  <span key={g.code} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs dark:border-slate-700">
                    {g.code} — {g.name}
                    <button type="button" className="ml-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] dark:bg-slate-800" onClick={()=>{
                      set(['estructurales','giro','selected'], (value.estructurales?.giro?.selected ?? []).filter(x=>x.code!==g.code));
                    }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="mt-2">
            <label className="label font-bold !text-rose-400">Penalización en Risk</label>
            <input className={`input ${(!value.estructurales.giro.omit && missRisk('giro')) ? 'ring-2 ring-rose-400 focus:ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['giro']?.riskPenaltyPct === 'number') ? penalties['giro']!.riskPenaltyPct : ''}
              onChange={(e)=>onChangePenalty('giro', { riskPenaltyPct: clampPct(Number(e.target.value)||0) })} />
          </div>
          <div className="mt-2">
            <OmitToggle included={!value.estructurales.giro.omit} onChange={(v)=>set(['estructurales','giro','omit'], !v)} />
          </div>
        </div>
      </div>

      {/* Financieros */}
      <div className="card p-6 space-y-4">
        <div className="font-semibold flex items-center">Financieros internos<InfoTooltip title="Financieros">{`Ventas, rentabilidad, liquidez, endeudamiento y capital propio.
- Ventas: crecimiento últimos 12 meses. Warn/Risk por caída porcentual.
- Liquidez: Activo corriente / Pasivo corriente.
- Endeudamiento: Pasivo/Patrimonio.
- Capital propio: respaldo.`}</InfoTooltip></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`rounded-xl border p-3 ${value.financieros.ventas.omit ? 'opacity-60 border-slate-200 dark:border-slate-800' : (!hasPen('ventas') ? 'border-rose-400 dark:border-rose-400' : 'border-slate-200 dark:border-slate-800')}`}>
            <label className="label">Ventas — Ponderación (%)</label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input className="input" inputMode="decimal" value={Math.round((value.financieros.ventas.weight*100+Number.EPSILON)*100)/100}
                onChange={(e)=>{
                  const pct = Number(e.target.value);
                  const capped = capWeightFor('financieros.ventas', Number.isFinite(pct)? pct/100 : 0);
                  set(['financieros','ventas','weight'], capped);
                }} />
              <div className="input flex items-center justify-center text-slate-500">%</div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="label font-bold !text-amber-600">Warn variación %</label>
                <NumericInput
                  className="input"
                  value={value.financieros.ventas.warnDropPct}
                  onCommit={(n)=>set(['financieros','ventas','warnDropPct'], n ?? 0)}
                  allowNegative
                  allowDecimal
                  acceptComma
                />
              </div>
              <div>
                <label className="label font-bold !text-rose-400">Risk variación %</label>
                <NumericInput
                  className="input"
                  value={value.financieros.ventas.riskDropPct}
                  onCommit={(n)=>set(['financieros','ventas','riskDropPct'], n ?? 0)}
                  allowNegative
                  allowDecimal
                  acceptComma
                />
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="label font-bold !text-amber-600">Penalización en Warn</label>
                <input className={`input ${(!value.financieros.ventas.omit && missWarn('ventas')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['ventas']?.warnPenaltyPct === 'number') ? penalties['ventas']!.warnPenaltyPct : ''}
                  onChange={(e)=>onChangePenalty('ventas', { warnPenaltyPct: clampPct(Number(e.target.value)||0) })} />
              </div>
              <div>
                <label className="label font-bold !text-rose-400">Penalización en Risk</label>
                <input className={`input ${(!value.financieros.ventas.omit && missRisk('ventas')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['ventas']?.riskPenaltyPct === 'number') ? penalties['ventas']!.riskPenaltyPct : ''}
                  onChange={(e)=>onChangePenalty('ventas', { riskPenaltyPct: clampPct(Number(e.target.value)||0) })} />
              </div>
            </div>
            <div className="mt-2">
              <OmitToggle included={!value.financieros.ventas.omit} onChange={(v)=>set(['financieros','ventas','omit'], !v)} />
            </div>
          </div>
          <div className={`rounded-xl border p-3 ${value.financieros.liquidez.omit ? 'opacity-60 border-slate-200 dark:border-slate-800' : (!hasPen('liquidez') ? 'border-rose-400 dark:border-rose-400' : 'border-slate-200 dark:border-slate-800')}`}>
            <label className="label">Rentabilidad — Ponderación (%)</label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input className="input" inputMode="decimal" value={Math.round((value.financieros.rentabilidad.weight*100+Number.EPSILON)*100)/100}
                onChange={(e)=>{
                  const pct = Number(e.target.value);
                  const capped = capWeightFor('financieros.rentabilidad', Number.isFinite(pct)? pct/100 : 0);
                  set(['financieros','rentabilidad','weight'], capped);
                }} />
              <div className="input flex items-center justify-center text-slate-500">%</div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="label font-bold !text-amber-600">Warn margen %</label>
                <NumericInput
                  className="input"
                  value={value.financieros.rentabilidad.warnMarginPct}
                  onCommit={(n)=>set(['financieros','rentabilidad','warnMarginPct'], n ?? 0)}
                  allowNegative
                  allowDecimal
                  acceptComma
                />
              </div>
              <div>
                <label className="label font-bold !text-rose-400">Risk margen %</label>
                <NumericInput
                  className="input"
                  value={value.financieros.rentabilidad.riskMarginPct}
                  onCommit={(n)=>set(['financieros','rentabilidad','riskMarginPct'], n ?? 0)}
                  allowNegative
                  allowDecimal
                  acceptComma
                />
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="label font-bold !text-amber-600">Penalización en Warn</label>
                <input className={`input ${(!value.financieros.rentabilidad.omit && missWarn('rentabilidad')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['rentabilidad']?.warnPenaltyPct === 'number') ? penalties['rentabilidad']!.warnPenaltyPct : ''}
                  onChange={(e)=>onChangePenalty('rentabilidad', { warnPenaltyPct: clampPct(Number(e.target.value)||0) })} />
              </div>
              <div>
                <label className="label font-bold !text-rose-400">Penalización en Risk</label>
                <input className={`input ${(!value.financieros.rentabilidad.omit && missRisk('rentabilidad')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['rentabilidad']?.riskPenaltyPct === 'number') ? penalties['rentabilidad']!.riskPenaltyPct : ''}
                  onChange={(e)=>onChangePenalty('rentabilidad', { riskPenaltyPct: clampPct(Number(e.target.value)||0) })} />
              </div>
            </div>
            <div className="mt-2">
              <OmitToggle included={!value.financieros.rentabilidad.omit} onChange={(v)=>set(['financieros','rentabilidad','omit'], !v)} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <label className="label">Liquidez — Ponderación (%)</label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input className="input" inputMode="decimal" value={Math.round((value.financieros.liquidez.weight*100+Number.EPSILON)*100)/100}
                onChange={(e)=>{
                  const pct = Number(e.target.value);
                  const capped = capWeightFor('financieros.liquidez', Number.isFinite(pct)? pct/100 : 0);
                  set(['financieros','liquidez','weight'], capped);
                }} />
              <div className="input flex items-center justify-center text-slate-500">%</div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="label font-bold !text-amber-600">Warn ≥</label>
                <NumericInput
                  className="input"
                  value={value.financieros.liquidez.warn}
                  onCommit={(n)=>set(['financieros','liquidez','warn'], n ?? 0)}
                  allowNegative={false}
                  allowDecimal
                  acceptComma
                />
              </div>
              <div>
                <label className="label font-bold !text-rose-400">Risk ≤</label>
                <NumericInput
                  className="input"
                  value={value.financieros.liquidez.risk}
                  onCommit={(n)=>set(['financieros','liquidez','risk'], n ?? 0)}
                  allowNegative={false}
                  allowDecimal
                  acceptComma
                />
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="label font-bold !text-amber-600">Penalización en Warn</label>
                <input className={`input ${(!value.financieros.liquidez.omit && missWarn('liquidez')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['liquidez']?.warnPenaltyPct === 'number') ? penalties['liquidez']!.warnPenaltyPct : ''}
                  onChange={(e)=>onChangePenalty('liquidez', { warnPenaltyPct: clampPct(Number(e.target.value)||0) })} />
              </div>
              <div>
                <label className="label font-bold !text-rose-400">Penalización en Risk</label>
                <input className={`input ${(!value.financieros.liquidez.omit && missRisk('liquidez')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['liquidez']?.riskPenaltyPct === 'number') ? penalties['liquidez']!.riskPenaltyPct : ''}
                  onChange={(e)=>onChangePenalty('liquidez', { riskPenaltyPct: clampPct(Number(e.target.value)||0) })} />
              </div>
            </div>
            <div className="mt-2">
              <OmitToggle included={!value.financieros.liquidez.omit} onChange={(v)=>set(['financieros','liquidez','omit'], !v)} />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <label className="label">Endeudamiento — Ponderación (%)</label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input className="input" inputMode="decimal" value={Math.round((value.financieros.endeudamiento.weight*100+Number.EPSILON)*100)/100}
                onChange={(e)=>{
                  const pct = Number(e.target.value);
                  const capped = capWeightFor('financieros.endeudamiento', Number.isFinite(pct)? pct/100 : 0);
                  set(['financieros','endeudamiento','weight'], capped);
                }} />
              <div className="input flex items-center justify-center text-slate-500">%</div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="label font-bold !text-amber-600">Warn ×</label>
                <NumericInput
                  className="input"
                  value={value.financieros.endeudamiento.warnX}
                  onCommit={(n)=>set(['financieros','endeudamiento','warnX'], n ?? 0)}
                  allowNegative={false}
                  allowDecimal
                  acceptComma
                />
              </div>
              <div>
                <label className="label font-bold !text-rose-400">Risk ×</label>
                <NumericInput
                  className="input"
                  value={value.financieros.endeudamiento.riskX}
                  onCommit={(n)=>set(['financieros','endeudamiento','riskX'], n ?? 0)}
                  allowNegative={false}
                  allowDecimal
                  acceptComma
                />
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="label font-bold !text-amber-600">Penalización en Warn</label>
                <input className={`input ${(!value.financieros.endeudamiento.omit && missWarn('endeudamiento')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['endeudamiento']?.warnPenaltyPct === 'number') ? penalties['endeudamiento']!.warnPenaltyPct : ''}
                  onChange={(e)=>onChangePenalty('endeudamiento', { warnPenaltyPct: clampPct(Number(e.target.value)||0) })} />
              </div>
              <div>
                <label className="label font-bold !text-rose-400">Penalización en Risk</label>
                <input className={`input ${(!value.financieros.endeudamiento.omit && missRisk('endeudamiento')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['endeudamiento']?.riskPenaltyPct === 'number') ? penalties['endeudamiento']!.riskPenaltyPct : ''}
                  onChange={(e)=>onChangePenalty('endeudamiento', { riskPenaltyPct: clampPct(Number(e.target.value)||0) })} />
              </div>
            </div>
            <div className="mt-2">
              <OmitToggle included={!value.financieros.endeudamiento.omit} onChange={(v)=>set(['financieros','endeudamiento','omit'], !v)} />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <label className="label">Capital propio — Ponderación (%)</label>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input className="input" inputMode="decimal" value={Math.round((value.financieros.capitalPropio.weight*100+Number.EPSILON)*100)/100}
              onChange={(e)=>{
                const pct = Number(e.target.value);
                const capped = capWeightFor('financieros.capitalPropio', Number.isFinite(pct)? pct/100 : 0);
                set(['financieros','capitalPropio','weight'], capped);
              }} />
            <div className="input flex items-center justify-center text-slate-500">%</div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <label className="label font-bold !text-amber-600">Penalización en Warn</label>
              <input className={`input ${(!value.financieros.capitalPropio.omit && missWarn('capitalPropio')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['capitalPropio']?.warnPenaltyPct === 'number') ? penalties['capitalPropio']!.warnPenaltyPct : ''}
                onChange={(e)=>onChangePenalty('capitalPropio', { warnPenaltyPct: clampPct(Number(e.target.value)||0) })} />
            </div>
            <div>
              <label className="label font-bold !text-rose-400">Penalización en Risk</label>
              <input className={`input ${(!value.financieros.capitalPropio.omit && missRisk('capitalPropio')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['capitalPropio']?.riskPenaltyPct === 'number') ? penalties['capitalPropio']!.riskPenaltyPct : ''}
                onChange={(e)=>onChangePenalty('capitalPropio', { riskPenaltyPct: clampPct(Number(e.target.value)||0) })} />
            </div>
          </div>
          <div className="mt-2">
            <OmitToggle included={!value.financieros.capitalPropio.omit} onChange={(v)=>set(['financieros','capitalPropio','omit'], !v)} />
          </div>
        </div>
      </div>

      {/* Tributarios */}
      <div className="card p-6 space-y-4">
        <div className="font-semibold flex items-center">Tributarios<InfoTooltip title="Tributarios">{`Cumplimiento y carpeta tributaria.
- Cumplimiento: F29/F22 al día; rectificaciones frecuentes penalizan.
- Carpera desactualizada: parametriza warn/risk por días desde emisión.`}</InfoTooltip></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <label className="label">Cumplimiento — Ponderación (%)</label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                className="input"
                inputMode="decimal"
                value={Math.round((value.tributarios.cumplimiento.weight*100+Number.EPSILON)*100)/100}
                onChange={(e)=>{
                  const pct = Number(e.target.value);
                  const capped = capWeightFor('tributarios.cumplimiento', Number.isFinite(pct)? pct/100 : 0);
                  set(['tributarios','cumplimiento','weight'], capped);
                }}
              />
              <div className="input flex items-center justify-center text-slate-500">%</div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="label font-bold !text-amber-600">Penalización en Warn</label>
                <input className={`input ${(!value.tributarios.cumplimiento.omit && missWarn('cumplimiento')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['cumplimiento']?.warnPenaltyPct === 'number') ? penalties['cumplimiento']!.warnPenaltyPct : ''}
                  onChange={(e)=>onChangePenalty('cumplimiento', { warnPenaltyPct: clampPct(Number(e.target.value)||0) })} />
              </div>
              <div>
                <label className="label font-bold !text-rose-300">Penalización en Risk</label>
                <input className={`input ${(!value.tributarios.cumplimiento.omit && missRisk('cumplimiento')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['cumplimiento']?.riskPenaltyPct === 'number') ? penalties['cumplimiento']!.riskPenaltyPct : ''}
                  onChange={(e)=>onChangePenalty('cumplimiento', { riskPenaltyPct: clampPct(Number(e.target.value)||0) })} />
              </div>
            </div>
            <div className="mt-2">
              <OmitToggle included={!value.tributarios.cumplimiento.omit} onChange={(v)=>set(['tributarios','cumplimiento','omit'], !v)} />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <label className="label">Carpeta desactualizada (días)</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="label font-bold !text-amber-600">Warn ≥ días</label>
                <input className="input" inputMode="numeric" value={value.tributarios.carpetaDesactualizada.warnDays}
                  onChange={(e)=>set(['tributarios','carpetaDesactualizada','warnDays'], Number(e.target.value)||0)} />
              </div>
              <div>
                <label className="label font-bold !text-rose-400">Risk ≥ días</label>
                <input className="input" inputMode="numeric" value={value.tributarios.carpetaDesactualizada.riskDays}
                  onChange={(e)=>set(['tributarios','carpetaDesactualizada','riskDays'], Number(e.target.value)||0)} />
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="label font-bold !text-amber-600">Penalización en Warn</label>
                <input className={`input ${(!value.tributarios.carpetaDesactualizada.omit && missWarn('carpetaDesactualizada')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['carpetaDesactualizada']?.warnPenaltyPct === 'number') ? penalties['carpetaDesactualizada']!.warnPenaltyPct : ''}
                  onChange={(e)=>onChangePenalty('carpetaDesactualizada', { warnPenaltyPct: clampPct(Number(e.target.value)||0) })} />
              </div>
              <div>
                <label className="label font-bold !text-rose-400">Penalización en Risk</label>
                <input className={`input ${(!value.tributarios.carpetaDesactualizada.omit && missRisk('carpetaDesactualizada')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['carpetaDesactualizada']?.riskPenaltyPct === 'number') ? penalties['carpetaDesactualizada']!.riskPenaltyPct : ''}
                  onChange={(e)=>onChangePenalty('carpetaDesactualizada', { riskPenaltyPct: clampPct(Number(e.target.value)||0) })} />
              </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <label className="label font-bold !text-amber-600">Penalización en Warn</label>
            <input className="input" inputMode="decimal" value={penalties['cumplimiento']?.warnPenaltyPct ?? 0}
              onChange={(e)=>onChangePenalty('cumplimiento', { warnPenaltyPct: Number(e.target.value)||0 })} />
          </div>
          <div>
            <label className="label font-bold !text-rose-300">Penalización en Risk</label>
            <input className="input" inputMode="decimal" value={penalties['cumplimiento']?.riskPenaltyPct ?? 0}
              onChange={(e)=>onChangePenalty('cumplimiento', { riskPenaltyPct: Number(e.target.value)||0 })} />
          </div>
        </div>
        <div className="mt-2">
          <OmitToggle included={!value.tributarios.cumplimiento.omit} onChange={(v)=>set(['tributarios','cumplimiento','omit'], !v)} />
        </div>
      </div>
    </div>
    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <div className="card p-4">
        <label className="label">Carpeta desactualizada (días)</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <label className="label font-bold !text-amber-600">Warn ≥ días</label>
            <input className="input" inputMode="numeric" value={value.tributarios.carpetaDesactualizada.warnDays}
              onChange={(e)=>set(['tributarios','carpetaDesactualizada','warnDays'], Number(e.target.value)||0)} />
          </div>
          <div>
            <label className="label font-bold !text-rose-400">Risk ≥ días</label>
            <input className="input" inputMode="numeric" value={value.tributarios.carpetaDesactualizada.riskDays}
              onChange={(e)=>set(['tributarios','carpetaDesactualizada','riskDays'], Number(e.target.value)||0)} />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <label className="label font-bold !text-amber-600">Penalización en Warn</label>
            <input className="input" inputMode="decimal" value={penalties['carpetaDesactualizada']?.warnPenaltyPct ?? 0}
              onChange={(e)=>onChangePenalty('carpetaDesactualizada', { warnPenaltyPct: Number(e.target.value)||0 })} />
          </div>
          <div>
            <label className="label font-bold !text-rose-400">Penalización en Risk</label>
            <input className="input" inputMode="decimal" value={penalties['carpetaDesactualizada']?.riskPenaltyPct ?? 0}
              onChange={(e)=>onChangePenalty('carpetaDesactualizada', { riskPenaltyPct: Number(e.target.value)||0 })} />
          </div>
        </div>
        <div className="mt-2">
          <OmitToggle included={!value.tributarios.carpetaDesactualizada.omit} onChange={(v)=>set(['tributarios','carpetaDesactualizada','omit'], !v)} />
        </div>
      </div>
    </div>
  </div>

  <div className="card p-6 space-y-4">
    <div className="font-semibold flex items-center">Comerciales y Activos<InfoTooltip title="Comerciales / Activos">{`Morosidad, activos declarados y diversificación de clientes.
Puedes omitir lo que no aplique a tu negocio.`}</InfoTooltip></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Morosidad */}
      <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
        <label className="label">Morosidad — Ponderación (%)</label>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input className="input" inputMode="decimal" value={Math.round((value.comerciales.morosidad.weight*100+Number.EPSILON)*100)/100}
            onChange={(e)=>{
              const pct = Number(e.target.value);
              const capped = capWeightFor('comerciales.morosidad', Number.isFinite(pct)? pct/100 : 0);
              set(['comerciales','morosidad','weight'], capped);
            }} />
          <div className="input flex items-center justify-center text-slate-500">%</div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <label className="label font-bold !text-amber-600">Penalización en Warn</label>
            <input className={`input ${(!value.comerciales.morosidad.omit && missWarn('morosidad')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['morosidad']?.warnPenaltyPct === 'number') ? penalties['morosidad']!.warnPenaltyPct : ''}
            onChange={(e)=>onChangePenalty('morosidad', { warnPenaltyPct: clampPct(Number(e.target.value)||0) })} />
          </div>
          <div>
            <label className="label font-bold !text-rose-400">Penalización en Risk</label>
            <input className={`input ${(!value.comerciales.morosidad.omit && missRisk('morosidad')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['morosidad']?.riskPenaltyPct === 'number') ? penalties['morosidad']!.riskPenaltyPct : ''}
            onChange={(e)=>onChangePenalty('morosidad', { riskPenaltyPct: clampPct(Number(e.target.value)||0) })} />
          </div>
        </div>
        <div className="mt-2">
          <OmitToggle included={!value.comerciales.morosidad.omit} onChange={(v)=>set(['comerciales','morosidad','omit'], !v)} />
        </div>
      </div>

      {/* Activos declarados */}
      <div className={`rounded-xl border p-3 ${value.activosRespaldo.activosDeclarados.omit ? 'opacity-60 border-slate-200 dark:border-slate-800' : (!hasPen('activosDeclarados') ? 'border-rose-400 dark:border-rose-400' : 'border-slate-200 dark:border-slate-800')}`}>
        <label className="label">Activos declarados — Ponderación (%)</label>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input className="input" inputMode="decimal" value={Math.round((value.activosRespaldo.activosDeclarados.weight*100+Number.EPSILON)*100)/100}
            onChange={(e)=>{
              const pct = Number(e.target.value);
              const capped = capWeightFor('activosRespaldo.activosDeclarados', Number.isFinite(pct)? pct/100 : 0);
              set(['activosRespaldo','activosDeclarados','weight'], capped);
            }} />
          <div className="input flex items-center justify-center text-slate-500">%</div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <label className="label font-bold !text-amber-600">Penalización en Warn</label>
            <input className={`input ${(!value.activosRespaldo.activosDeclarados.omit && missWarn('activosDeclarados')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['activosDeclarados']?.warnPenaltyPct === 'number') ? penalties['activosDeclarados']!.warnPenaltyPct : ''}
            onChange={(e)=>onChangePenalty('activosDeclarados', { warnPenaltyPct: clampPct(Number(e.target.value)||0) })} />
          </div>
          <div>
            <label className="label font-bold !text-rose-400">Penalización en Risk</label>
            <input className={`input ${(!value.activosRespaldo.activosDeclarados.omit && missRisk('activosDeclarados')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['activosDeclarados']?.riskPenaltyPct === 'number') ? penalties['activosDeclarados']!.riskPenaltyPct : ''}
            onChange={(e)=>onChangePenalty('activosDeclarados', { riskPenaltyPct: clampPct(Number(e.target.value)||0) })} />
          </div>
        </div>
        <div className="mt-2">
          <OmitToggle included={!value.activosRespaldo.activosDeclarados.omit} onChange={(v)=>set(['activosRespaldo','activosDeclarados','omit'], !v)} />
        </div>
      </div>
    </div>

    {/* Diversificación clientes */}
    <div className={`rounded-xl border p-3 ${value.activosRespaldo.diversificacionClientes.omit ? 'opacity-60 border-slate-200 dark:border-slate-800' : (!hasPen('diversificacionClientes') ? 'border-rose-400 dark:border-rose-400' : 'border-slate-200 dark:border-slate-800')}`}>
      <label className="label">Diversificación clientes — Ponderación (%)</label>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input className="input" inputMode="decimal" value={Math.round((value.activosRespaldo.diversificacionClientes.weight*100+Number.EPSILON)*100)/100}
          onChange={(e)=>{
            const pct = Number(e.target.value);
            const capped = capWeightFor('activosRespaldo.diversificacionClientes', Number.isFinite(pct)? pct/100 : 0);
            set(['activosRespaldo','diversificacionClientes','weight'], capped);
          }} />
        <div className="input flex items-center justify-center text-slate-500">%</div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <label className="label font-bold !text-amber-600">Penalización en Warn</label>
          <input className={`input ${(!value.activosRespaldo.diversificacionClientes.omit && missWarn('diversificacionClientes')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['diversificacionClientes']?.warnPenaltyPct === 'number') ? penalties['diversificacionClientes']!.warnPenaltyPct : ''}
            onChange={(e)=>onChangePenalty('diversificacionClientes', { warnPenaltyPct: clampPct(Number(e.target.value)||0) })} />
        </div>
        <div>
          <label className="label font-bold !text-rose-400">Penalización en Risk</label>
          <input className={`input ${(!value.activosRespaldo.diversificacionClientes.omit && missRisk('diversificacionClientes')) ? 'ring-2 ring-rose-400 border-rose-400' : ''}`} inputMode="decimal" value={(typeof penalties['diversificacionClientes']?.riskPenaltyPct === 'number') ? penalties['diversificacionClientes']!.riskPenaltyPct : ''}
            onChange={(e)=>onChangePenalty('diversificacionClientes', { riskPenaltyPct: clampPct(Number(e.target.value)||0) })} />
        </div>
      </div>
      <div className="mt-2">
        <OmitToggle included={!value.activosRespaldo.diversificacionClientes.omit} onChange={(v)=>set(['activosRespaldo','diversificacionClientes','omit'], !v)} />
      </div>
    </div>
  </div>

  <MicroHelpModal open={helpOpen} onClose={()=>setHelpOpen(false)} />
    </div>
  );
}
