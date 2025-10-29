"use client";
import { useEffect, useMemo, useState } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/ui/Loader';
import { apiGet, apiPost } from '@/lib/api';
import { formatRutCL, validateRutCL } from '@/lib/validators';
import ProductSwitch from '@/components/ProductSwitch';

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

export default function DatainsightPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<DIItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [rut, setRut] = useState('');
  const [tipo, setTipo] = useState<'1' | '2'>('2');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setErr(null);
        const token = typeof window !== 'undefined' ? localStorage.getItem('prismal_token') : null;
        if (!token) {
          setErr('Debes iniciar sesión para ver Datainsight.');
          setItems([]);
          return;
        }
        const res = await apiGet<any>('/api/datainsight/list');
        const list = Array.isArray(res?.data?.items) ? res.data.items : [];
        const mapped: DIItem[] = list.map((d: any) => ({
          id: String(d?._id || ''),
          createdAt: d?.createdAt || new Date().toISOString(),
          rut: d?.rut,
          tipoUsuario: (d?.tipoUsuario === '1' || d?.tipoUsuario === '2') ? d.tipoUsuario : '2',
          nombre: d?.variables?.antecedentes?.razon_social || d?.variables?.razon_social || d?.rut,
          score: typeof d?.scoring?.total_ponderado_0a10 === 'number' ? d.scoring.total_ponderado_0a10 : (typeof d?.scoring?.score_1a1000 === 'number' ? d.scoring.score_1a1000 / 100 : undefined),
          interpretacion: d?.scoring?.interpretacion,
          payload: { data: { variables: d?.variables, scoring: d?.scoring, meta: d?.meta, rut: d?.rut, tipoUsuario: d?.tipoUsuario } },
        }));
        setItems(mapped);
      } catch (e: any) {
        const msg = e?.message || 'No fue posible cargar Datainsight';
        setErr(msg);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isRutValid = useMemo(() => !!rut && validateRutCL(rut), [rut]);
  const tipoLabel = (t: '1' | '2') => (t === '1' ? 'Persona natural' : 'Empresa');

  const persist = (list: DIItem[]) => {
    setItems(list);
    try { if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Datainsight</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">Informes comerciales. Mantiene estilo actual, con identidad Prismal.</p>
        </div>
        <div className="flex items-center gap-2">
          <ProductSwitch className="hidden sm:inline-flex mr-2" />
          <button
            className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 dark:bg-white/10"
            onClick={async () => {
              setLoading(true);
              try {
                const res = await apiGet<any>('/api/datainsight/list');
                const list = Array.isArray(res?.data?.items) ? res.data.items : [];
                const mapped: DIItem[] = list.map((d: any) => ({
                  id: String(d?._id || ''),
                  createdAt: d?.createdAt || new Date().toISOString(),
                  rut: d?.rut,
                  tipoUsuario: (d?.tipoUsuario === '1' || d?.tipoUsuario === '2') ? d.tipoUsuario : '2',
                  nombre: d?.variables?.antecedentes?.razon_social || d?.variables?.razon_social || d?.rut,
                  score: typeof d?.scoring?.total_ponderado_0a10 === 'number' ? d.scoring.total_ponderado_0a10 : (typeof d?.scoring?.score_1a1000 === 'number' ? d.scoring.score_1a1000 / 100 : undefined),
                  interpretacion: d?.scoring?.interpretacion,
                  payload: { data: { variables: d?.variables, scoring: d?.scoring, meta: d?.meta, rut: d?.rut, tipoUsuario: d?.tipoUsuario } },
                }));
                setErr(null);
                setItems(mapped);
              } finally {
                setLoading(false);
              }
            }}
          >Actualizar</button>
          <button
            className="rounded-full bg-gradient-to-r from-logo-start via-logo-mid to-logo-end px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
            onClick={() => { setFormError(null); setRut(''); setTipo('2'); setOpen(true); }}
          >Evaluar</button>
        </div>
      </div>
      <div className="sm:hidden mb-3"><ProductSwitch /></div>

      {loading ? (
        <Loader fullScreen={false} label="Cargando evaluaciones…" />
      ) : err ? (
        <div className="rounded-xl border border-rose-200 p-6 text-sm text-rose-600 dark:border-rose-900/60 dark:text-rose-300">
          {err}
          <div className="mt-2">
            <button className="btn-secondary" onClick={() => router.push('/login' as Route)}>Ir a iniciar sesión</button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">Aún no hay evaluaciones.</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-[880px] w-full text-sm">
            <thead>
              <tr className="bg-slate-800/70 text-slate-100 dark:bg-slate-800">
                <th className="px-3 py-2 text-left">Nombre</th>
                <th className="px-3 py-2 text-left">RUT</th>
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-right">Scoring</th>
                <th className="px-3 py-2 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => {
                const createdAt = it?.createdAt ? new Date(it.createdAt).toLocaleString() : '';
                const score = (typeof it.score === 'number') ? it.score.toFixed(2) : '—';
                return (
                  <tr key={it.id} className={i < items.length - 1 ? 'border-b border-slate-200/60 dark:border-white/10' : ''}>
                    <td className="px-3 py-2 max-w-[320px] truncate" title={it.nombre || it.rut}>{it.nombre || it.rut}</td>
                    <td className="px-3 py-2">{it.rut}</td>
                    <td className="px-3 py-2">{tipoLabel(it.tipoUsuario)}</td>
                    <td className="px-3 py-2">{createdAt}</td>
                    <td className="px-3 py-2 text-right">{score}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => router.push((`/datainsight/${it.id}`) as Route)}
                        className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:opacity-90 dark:bg-white dark:text-slate-900"
                      >Ver</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Evaluar RUT (Datainsight)">
        <div className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="label">RUT</label>
              <input
                className={`input ${isRutValid ? '!border-emerald-400 !ring-2 !ring-emerald-300 !ring-offset-0' : ''} transition-shadow`}
                placeholder="12.345.678-5"
                value={rut}
                onChange={(e) => setRut(formatRutCL(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={tipo} onChange={(e) => setTipo((e.target.value as '1' | '2') || '2')}>
                <option value="1">Persona natural</option>
                <option value="2">Empresa</option>
              </select>
            </div>
          </div>
          {formError && <div className="hint text-rose-400">{formError}</div>}
          <div className="flex items-center justify-end gap-2">
            <button className="btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
            <button
              className="btn-primary"
              disabled={submitting}
              onClick={async () => {
                setFormError(null);
                if (!validateRutCL(rut)) { setFormError('RUT inválido'); return; }
                if (!tipo) { setFormError('Selecciona el tipo'); return; }
                setSubmitting(true);
                try {
                  const res = await apiPost<any>('/api/datainsight/evaluation', { rut, tipoUsuario: tipo });
                  const data = (res as any)?.data || {};
                  const vars = data?.variables || {};
                  const nombre = vars?.antecedentes?.razon_social || vars?.razon_social || rut;
                  const score = (data?.scoring?.total_ponderado_0a10 ?? (typeof data?.scoring?.score_1a1000 === 'number' ? data.scoring.score_1a1000 / 100 : undefined)) as number | undefined;
                  const id = String(data?.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
                  const createdAt = new Date().toISOString();
                  const item: DIItem = { id, createdAt, rut: data?.rut || rut, tipoUsuario: (data?.tipoUsuario || tipo) as '1' | '2', nombre, score, interpretacion: data?.scoring?.interpretacion, payload: data };
                  const next = [item, ...items].slice(0, 200);
                  persist(next);
                  setOpen(false);
                  router.push((`/datainsight/${id}`) as Route);
                } catch (e: any) {
                  setFormError(e?.message || 'Error ejecutando evaluación');
                } finally {
                  setSubmitting(false);
                }
              }}
            >{submitting ? 'Evaluando…' : 'Evaluar'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
