"use client";
import { useMemo } from "react";

export type Option = { value: string; label: string };

export default function MultiChipsSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const map = useMemo(() => new Map(options.map(o => [o.value, o.label])), [options]);
  const add = (val: string) => {
    if (!value.includes(val)) onChange([...value, val]);
  };
  const remove = (val: string) => onChange(value.filter(v => v !== val));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map(v => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-xs dark:bg-slate-800">
            {map.get(v) || v}
            <button type="button" aria-label="Eliminar" onClick={() => remove(v)} className="ml-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3"><path fillRule="evenodd" d="M6 8a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
            </button>
          </span>
        ))}
        {value.length === 0 && <span className="text-xs text-slate-500">{placeholder || 'Selecciona uno o más'}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.filter(o => !value.includes(o.value)).map(o => (
          <button key={o.value} type="button" onClick={() => add(o.value)} className="rounded-full border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
