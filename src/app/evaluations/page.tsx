"use client";
import { useEffect, useState } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, postFormToUrl, putBlobToUrl } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import { formatRutCL, validateRutCL, hasRutStructureCL } from '@/lib/validators';
import Loader from '@/components/ui/Loader';
import ProductSwitch from '@/components/ProductSwitch';

export default function EvaluationsListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  // Modal state
  const [open, setOpen] = useState(false);
  const [rut, setRut] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [debt, setDebt] = useState<string>('');
  const [pdf, setPdf] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const formatCLP = (raw: string) => {
    const digits = (raw || '').replace(/[^0-9]/g, '');
    if (!digits) return '';
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };
  const isRutValid = !!rut && validateRutCL(rut);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await apiGet(`/api/uploads/ct`);
        const data = (resp as any)?.data || [];
        setItems(Array.isArray(data) ? data : []);
        setErr(null);
      } catch (e: any) {
        setErr('No fue posible cargar las carpetas.');
      } finally {
        setLoading(false);
      }
    };
    load();
    const onVis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { document.removeEventListener('visibilitychange', onVis); };
  }, []);

  if (loading) return <Loader fullScreen label="Cargando carpetas…" />;
  if (err) return <div className="p-6 text-rose-500">{err}</div>;

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">DataRisk</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300 text-sm">Automatiza el análisis de riesgo de crédito de tus clientes usando la carpeta tributaria.</p>
        </div>
        <div className="flex items-center gap-2">
          <ProductSwitch className="hidden sm:inline-flex mr-2" />
          <button
            className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 dark:bg-white/10"
            onClick={() => { setLoading(true); setErr(null); (async () => { try { const r = await apiGet(`/api/uploads/ct`); const d = (r as any)?.data || []; setItems(Array.isArray(d) ? d : []); } catch { setErr('No fue posible cargar las carpetas.'); } finally { setLoading(false); } })(); }}
          >Actualizar</button>
          <button
            className="rounded-full bg-gradient-to-r from-logo-start via-logo-mid to-logo-end px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
            onClick={() => { setFormError(null); setOpen(true); }}
          >Evaluar</button>
        </div>
      </div>
      <div className="sm:hidden mb-3"><ProductSwitch /></div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">No hay carpetas todavía.</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-[880px] w-full text-sm">
            <thead>
              <tr className="bg-slate-800/70 text-slate-100 dark:bg-slate-800">
                <th className="px-3 py-2 text-left">Empresa</th>
                <th className="px-3 py-2 text-left">RUT</th>
                <th className="px-3 py-2 text-right">Solicitado</th>
                <th className="px-3 py-2 text-right">Sugerido</th>
                <th className="px-3 py-2 text-right">Alertas</th>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => {
                const createdAt = it?.createdAt ? new Date(it.createdAt).toLocaleString() : '';
                const alerts = Number(it?.alerts ?? 0);
                const title = it?.razonSocial || (it?.companyId || '').toString();
                const rut = it?.rut || '—';
                const requested = Number(it?.requestedAmountCLP || 0).toLocaleString('es-CL');
                const suggested = Number(it?.suggestedAmountCLP || 0).toLocaleString('es-CL');
                return (
                  <tr key={String(it.id)} className={i < items.length - 1 ? 'border-b border-slate-200/60 dark:border-white/10' : ''}>
                    <td className="px-3 py-2 max-w-[280px] truncate" title={title}>{title}</td>
                    <td className="px-3 py-2">{rut}</td>
                    <td className="px-3 py-2 text-right">{requested}</td>
                    <td className="px-3 py-2 text-right">{suggested}</td>
                    <td className="px-3 py-2 text-right">{alerts}</td>
                    <td className="px-3 py-2">{createdAt}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => router.push(`/uploads/${it.id}` as Route)}
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

      {/* Modal: Evaluar carpeta */}
      <Modal open={open} onClose={() => setOpen(false)} title="Evaluar carpeta tributaria">
        <div className="grid gap-4">
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
            <label className="label">Monto solicitado (opcional)</label>
            <input
              className="input"
              inputMode="numeric"
              placeholder="ej: 3.000.000"
              value={amount}
              onChange={(e) => setAmount(formatCLP(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Deuda vigente (CLP)</label>
            <input
              className="input"
              inputMode="numeric"
              placeholder="ej: 1.500.000"
              value={debt}
              onChange={(e) => setDebt(formatCLP(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Carpeta Tributaria (PDF)</label>
            <div
              className={`rounded-2xl border-2 border-dashed p-4 text-sm cursor-pointer transition ${dragActive ? 'border-logo-start bg-logo-start/5' : 'border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'}`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files?.[0]; if (f && f.type === 'application/pdf') setPdf(f); }}
              onClick={() => { const input = document.getElementById('pdf-input-hidden') as HTMLInputElement | null; input?.click(); }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-logo-start via-logo-mid to-logo-end text-white shadow-card">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M12 5v14M5 12h14"/></svg>
                  </span>
                  <div>
                    <div className="font-medium">{pdf ? pdf.name : 'Selecciona o arrastra un PDF'}</div>
                    <div className="subtle-muted text-xs">Sólo PDF</div>
                  </div>
                </div>
                <button type="button" className="btn-secondary">Examinar</button>
              </div>
            </div>
            <input id="pdf-input-hidden" type="file" accept="application/pdf" className="hidden" onChange={(e) => setPdf(e.target.files?.[0] || null)} />
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
                if (!pdf) { setFormError('Debes adjuntar la carpeta en PDF'); return; }
                if (pdf.type !== 'application/pdf') { setFormError('Sólo se permite PDF'); return; }
                setSubmitting(true);
                try {
                  // Resolve companyId (create if needed) using the RUT
                  let companyId = (typeof window !== 'undefined' ? localStorage.getItem('currentCompanyId') : null) || '';
                  try {
                    const resolved = await apiPost<any>('/api/companies/resolve-or-create', { rut });
                    const cid = resolved?.data?.companyId;
                    if (cid) {
                      companyId = cid;
                      if (typeof window !== 'undefined') localStorage.setItem('currentCompanyId', cid);
                    }
                  } catch {}
                  if (!companyId) { setFormError('No fue posible resolver la empresa por RUT.'); setSubmitting(false); return; }

                  // 1) Solicitar signed upload y crear Document
                  const signed = await apiPost<any>('/api/uploads/signed', {
                    filename: pdf.name,
                    contentType: 'application/pdf',
                    type: 'carpeta_tributaria',
                    companyId,
                    rut,
                    deudaVigente: debt || undefined,
                    creditoSolicitado: amount || undefined,
                    meses: 12,
                  });
                  const documentId: string = signed?.data?.documentId;
                  const upload = signed?.data?.upload;
                  if (!documentId || !upload?.url) { setFormError('No se pudo preparar la carga del archivo.'); setSubmitting(false); return; }

                  // 2) Subir archivo al signed URL (POST local o PUT cloud)
                  if (String(upload.method || 'PUT').toUpperCase() === 'POST') {
                    const upForm = new FormData();
                    upForm.append('file', pdf);
                    await postFormToUrl(upload.url, upForm);
                  } else {
                    await putBlobToUrl(upload.url, pdf, 'application/pdf');
                  }

                  // 3) Confirmar upload para disparar extracción
                  await apiPost(`/api/uploads/${documentId}/confirm`, { status: 'uploaded' });

                  // 4) Redirigir al detalle del documento para ver variables extraídas
                  setOpen(false);
                  router.push((`/uploads/${documentId}`) as Route);
                } catch (e: any) {
                  setFormError(e?.message || 'Error creando evaluación');
                } finally {
                  setSubmitting(false);
                }
              }}
            >{submitting ? 'Procesando…' : 'Iniciar evaluación'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
