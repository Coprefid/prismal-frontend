"use client";
import React, { useState } from 'react';
import { validateRut, formatRut } from '@/lib/rut';

export default function CarpetaTributariaPage() {
  const [rut, setRut] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ deudaVigente: string; creditoOtorgar: string } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!validateRut(rut)) {
      setError('RUT inválido.');
      return;
    }
    if (!file) {
      setError('Adjunta la Carpeta Tributaria en PDF.');
      return;
    }
    if (file.type !== 'application/pdf') {
      setError('Sólo se permite PDF.');
      return;
    }

    setLoading(true);
    try {
      // Placeholder: simulamos procesamiento del PDF y consulta
      await new Promise((res) => setTimeout(res, 800));
      setResult({ deudaVigente: '$ 0', creditoOtorgar: '$ 5.000.000' });
    } catch (err) {
      setError('Ocurrió un error procesando la carpeta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-2">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Carpeta Tributaria</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">Adjunta tu PDF, ingresa RUT y consulta deuda vigente y crédito a otorgar.</p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">RUT</label>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-logo-start/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            placeholder="12.345.678-5"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            onBlur={() => setRut((r) => formatRut(r))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Carpeta Tributaria (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            className="mt-1 w-full rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-logo-start via-logo-mid to-logo-end px-4 py-2 text-sm font-semibold text-white shadow-card hover:opacity-95 disabled:opacity-70"
          >
            {loading ? 'Consultando…' : 'Consultar'}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="text-sm text-slate-500 dark:text-slate-400">Deuda vigente</div>
            <div className="text-xl font-semibold text-slate-800 dark:text-slate-100">{result.deudaVigente}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="text-sm text-slate-500 dark:text-slate-400">Crédito a otorgar</div>
            <div className="text-xl font-semibold text-slate-800 dark:text-slate-100">{result.creditoOtorgar}</div>
          </div>
        </div>
      )}
    </div>
  );
}
