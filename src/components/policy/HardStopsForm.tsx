"use client";
import type React from 'react';
import InfoTooltip from '@/components/ui/InfoTooltip';

export type HardStops = {
  proceso_concursal: boolean;
  contactabilidad_invalida: boolean;
  direccion_no_comprobable: boolean;
  deterioro_comercial: boolean;
};

export type HardStopsParams = {
  deterioro: { minRegistros: number; montoUF: number };
};

export function defaultHardStops(): HardStops {
  return {
    proceso_concursal: false,
    contactabilidad_invalida: false,
    direccion_no_comprobable: false,
    deterioro_comercial: false,
  };
}

export function defaultHardStopsParams(): HardStopsParams {
  return {
    deterioro: { minRegistros: 3, montoUF: 50 },
  };
}

export default function HardStopsForm({
  value,
  params,
  available,
  extras,
  onChange,
  onChangeParams,
  onChangeExtras,
}: {
  value: HardStops;
  params: HardStopsParams;
  available: string[]; // macro/micro keys like 'macro:inflation', 'micro:antiguedad'
  extras: string[]; // selected extra hard stops from available
  onChange: (next: HardStops) => void;
  onChangeParams: (next: HardStopsParams) => void;
  onChangeExtras: (next: string[]) => void;
}) {
  const set = (key: keyof HardStops, checked: boolean) => {
    onChange({ ...value, [key]: checked });
  };
  const setParam = (path: string[], val: any) => {
    const next = structuredClone(params) as any;
    let obj = next;
    for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
    obj[path[path.length - 1]] = val;
    onChangeParams(next);
  };

  // DnD helpers using native HTML5 drag events
  const onDragStart = (e: React.DragEvent<HTMLButtonElement>, key: string) => {
    e.dataTransfer.setData('text/plain', key);
  };
  const onDropToSelected = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const key = e.dataTransfer.getData('text/plain');
    if (!key) return;
    if (!extras.includes(key)) onChangeExtras([...extras, key]);
  };
  const allowDrop = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const removeExtra = (key: string) => onChangeExtras(extras.filter(k => k !== key));

  return (
    <div className="space-y-4">
      <div className="card p-6 space-y-4">
        <div className="font-semibold flex items-center">Hard Stops
          <InfoTooltip title="¿Qué son?">{`Condiciones binarias que cortan crédito inmediatamente.
Puedes parametrizar umbrales (p.ej., deterioro comercial). También puedes arrastrar indicadores macro/micro a la lista de hard stops.`}</InfoTooltip>
        </div>

        {/* Chips togglables */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'proceso_concursal', label: 'Proceso concursal' },
            { key: 'contactabilidad_invalida', label: 'Contactabilidad inválida' },
            { key: 'direccion_no_comprobable', label: 'Dirección no comprobable' },
          ].map((it) => (
            <button
              key={it.key}
              type="button"
              onClick={() => set(it.key as keyof HardStops, !value[it.key as keyof HardStops])}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition ${value[it.key as keyof HardStops] ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/30 dark:text-rose-200' : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
              title="Activar/desactivar hard stop"
            >
              <span className={`h-2 w-2 rounded-full ${value[it.key as keyof HardStops] ? 'bg-rose-500' : 'bg-slate-400'}`} />
              {it.label}
            </button>
          ))}
        </div>

        {/* Deterioro comercial con acordeón */}
        <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => set('deterioro_comercial', !value.deterioro_comercial)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition ${value.deterioro_comercial ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/30 dark:text-rose-200' : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
              >
                <span className={`h-2 w-2 rounded-full ${value.deterioro_comercial ? 'bg-rose-500' : 'bg-slate-400'}`} />
                Deterioro comercial
              </button>
              <InfoTooltip title="Deterioro comercial">{`Define umbrales mínimos de registros y monto (UF) a partir de los cuales se aplica hard stop.`}</InfoTooltip>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition ${value.deterioro_comercial ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
          </div>
          {value.deterioro_comercial && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="label">Registros ≥</label>
                <input className="input" inputMode="numeric" value={params.deterioro.minRegistros}
                  onChange={(e)=>setParam(['deterioro','minRegistros'], Number(e.target.value)||0)} />
              </div>
              <div>
                <label className="label">Monto (UF) ≥</label>
                <input className="input" inputMode="decimal" value={params.deterioro.montoUF}
                  onChange={(e)=>setParam(['deterioro','montoUF'], Number(e.target.value)||0)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drag board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="mb-2 font-semibold">Indicadores disponibles</div>
          <div className="flex flex-wrap gap-2">
            {available.filter(k => !extras.includes(k)).map((k) => (
              <button
                key={k}
                draggable
                onDragStart={(e)=>onDragStart(e, k)}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                type="button"
                title="Arrastra a Hard Stops"
              >{k}</button>
            ))}
            {available.length === 0 && (
              <div className="text-sm text-slate-500">No hay indicadores activos</div>
            )}
          </div>
        </div>
        <div className="card p-4" onDrop={onDropToSelected} onDragOver={allowDrop}>
          <div className="mb-2 font-semibold">Hard Stops seleccionados</div>
          <div className="flex flex-wrap gap-2 min-h-10">
            {extras.map((k) => (
              <span key={k} className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/30 dark:text-rose-100">
                {k}
                <button type="button" aria-label="Eliminar" onClick={()=>removeExtra(k)} className="ml-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3"><path fillRule="evenodd" d="M6 8a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
                </button>
              </span>
            ))}
            {extras.length === 0 && (
              <div className="text-sm text-slate-500">Arrastra indicadores aquí</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
