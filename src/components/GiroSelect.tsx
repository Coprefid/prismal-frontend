"use client";
import { useEffect, useMemo, useState } from 'react';
import { searchGiros, toSelectOptions, girosByCode } from '@/data/giros';

export type GiroSelectValue = { code: string; name: string } | null;

export default function GiroSelect({ value, onChange, placeholder = 'Selecciona el giro…', limit = 15, disabled = false }: {
  value: GiroSelectValue;
  onChange: (v: GiroSelectValue) => void;
  placeholder?: string;
  limit?: number;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const options = useMemo(() => toSelectOptions(searchGiros(query, limit)), [query, limit]);

  useEffect(() => {
    if (value && value.code) {
      setQuery(`${value.code} — ${value.name}`);
    }
  }, [value]);

  return (
    <div className="relative">
      <input
        className="input w-full"
        placeholder={placeholder}
        value={query}
        disabled={disabled}
        onFocus={() => !disabled && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        onChange={(e) => {
          if (disabled) return;
          const v = e.target.value;
          setQuery(v);
          setOpen(true);
          // If they type an exact code match, auto-select
          const code = v.slice(0, 6);
          if (/^\d{6}$/.test(code) && girosByCode[code]) {
            onChange({ code, name: girosByCode[code].name });
          } else {
            onChange(null);
          }
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' && open && options.length > 0) {
            const first = options[0];
            setQuery(first.label);
            onChange({ code: first.value, name: first.label.split(' — ')[1] });
            setOpen(false);
            e.preventDefault();
          }
        }}
      />
      {open && !disabled && query && (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {options.length === 0 && (
            <div className="px-3 py-2 text-sm text-slate-500">Sin resultados</div>
          )}
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              onMouseDown={(e) => {
                // onMouseDown to avoid input blur closing before click
                e.preventDefault();
                setQuery(opt.label);
                onChange({ code: opt.value, name: opt.label.split(' — ')[1] });
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
