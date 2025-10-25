"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';
import Loader from '@/components/ui/Loader';

export default function EvaluationsListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiGet(`/api/evaluations`);
        const data = (resp as any)?.data || [];
        setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr('No fue posible cargar las evaluaciones.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader fullScreen label="Cargando evaluaciones…" />;
  if (err) return <div className="p-6 text-rose-500">{err}</div>;

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Mis Evaluaciones</h1>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">No hay evaluaciones todavía.</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-[880px] w-full text-sm">
            <thead>
              <tr className="bg-slate-800/70 text-slate-100 dark:bg-slate-800">
                <th className="px-3 py-2 text-left">Empresa</th>
                <th className="px-3 py-2 text-right">Monto</th>
                <th className="px-3 py-2 text-right">Score</th>
                <th className="px-3 py-2 text-right">Alertas</th>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((ev, i) => {
                const createdAt = ev?.createdAt ? new Date(ev.createdAt).toLocaleString() : '';
                const score = ev?.score ?? '—';
                const amount = (ev?.features?.requestedAmount ?? 0);
                const alerts = Array.isArray(ev?.alerts) ? ev.alerts.length : 0;
                const companyId = (ev?.companyId || '').toString();
                const title = ev?.companyName
                  || ev?.features?.company?.name
                  || ev?.features?.razon_social
                  || ev?.company?.name
                  || companyId;
                return (
                  <tr key={String(ev._id)} className={i < items.length - 1 ? 'border-b border-slate-200/60 dark:border-white/10' : ''}>
                    <td className="px-3 py-2 max-w-[280px] truncate" title={title}>{title}</td>
                    <td className="px-3 py-2 text-right">{amount.toLocaleString('es-CL')}</td>
                    <td className="px-3 py-2 text-right font-semibold">{score}</td>
                    <td className="px-3 py-2 text-right">{alerts}</td>
                    <td className="px-3 py-2">{createdAt}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => router.push(`/evaluations/${ev._id}`)}
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
    </div>
  );
}
