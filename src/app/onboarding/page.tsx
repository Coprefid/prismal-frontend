"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { apiGet, apiPatch } from '@/lib/api';
import GiroSelect from '@/components/GiroSelect';

// Types
// (Policy configuration removed from onboarding)

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<'giro' | 'contact' | 'intro' | 'done'>('giro');

  // Minimal onboarding data
  const [companyId, setCompanyId] = useState<string | null>(null); // retained for future use
  const [giro, setGiro] = useState<{ code: string; name: string } | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // (Policy state and hard stops removed from onboarding)

  // Guard: require auth
  useEffect(() => {
    (async () => {
      try {
        const me = await apiGet<{ ok: boolean; data: { isFirstLogin?: boolean } }>('/api/auth/me');
        if (!me?.ok) {
          router.push('/login' as Route);
          return;
        }
      } catch {
        router.push('/login' as Route);
      }
    })();
  }, [router]);

  // (Policy loading removed from onboarding)
  const onStart = async () => {
    setErrMsg(null);
    try {
      const payload: any = {
        profile: {
          giroCode: giro?.code,
          giroName: giro?.name,
          phone: phoneNumber ? `+569${phoneNumber}` : undefined,
        },
      };
      await apiPatch('/api/auth/me', payload);
      // Para evitar rebotes en chat mientras no usamos companies, fija un placeholder
      if (typeof window !== 'undefined') localStorage.setItem('currentCompanyId', 'placeholder');
      setStep('done');
      setTimeout(() => router.push('/chat' as Route), 600);
      return;
    } catch (e: any) {
      // Fallback: si no pudimos crear, revisar si ya existe alguna empresa del usuario
      try {
        const my = await apiGet<{ ok: boolean; data: Array<{ _id: string }> }>('/api/companies/my');
        const companies = my?.data || [];
        if (companies.length > 0) {
          const id = companies[0]._id;
          setCompanyId(id);
          if (typeof window !== 'undefined') localStorage.setItem('currentCompanyId', id);
          setStep('done');
          setTimeout(() => router.push('/chat' as Route), 600);
          return;
        }
      } catch {}
      // Como último recurso, permitir avanzar al chat con un ID placeholder para no bloquear la experiencia inicial.
      try {
        if (typeof window !== 'undefined') localStorage.setItem('currentCompanyId', 'placeholder');
        setStep('done');
        setTimeout(() => router.push('/chat' as Route), 600);
        return;
      } catch {}
      setErrMsg(e?.message || 'No pudimos crear la empresa. Intenta nuevamente.');
      return;
    }
  };

  return (
    <main className="min-h-screen app-bg">
      <section className="container-page py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-2xl font-bold">Onboarding de Empresa</h1>

          {/* Stepper */}
          <div className="mb-8 flex items-center gap-2 text-sm">
            {['Rubro', 'Contacto', 'Introducción'].map((t, idx) => (
              <div key={t} className={`flex items-center gap-2 ${idx <= (step === 'giro' ? 0 : step === 'contact' ? 1 : step === 'intro' ? 2 : 3) ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                <div className={`h-6 w-6 rounded-full ${idx <= (step === 'giro' ? 0 : step === 'contact' ? 1 : step === 'intro' ? 2 : 3) ? 'bg-gradient-to-r from-logo-start via-logo-mid to-logo-end text-white' : 'bg-slate-200 dark:bg-slate-800' } flex items-center justify-center text-xs`}>{idx+1}</div>
                <div>{t}</div>
                {idx < 2 && <div className="mx-2 h-[2px] w-10 bg-slate-200 dark:bg-slate-700" />}
              </div>
            ))}
          </div>

          {step === 'giro' && (
            <div className="space-y-6">
              <div className="card p-6 space-y-2">
                <label className="label">Cuéntanos, ¿cuál es el principal rubro de tu empresa?</label>
                <GiroSelect value={giro} onChange={setGiro} />
                <div className="hint">Escribe para buscar por código o nombre. Mostramos resultados limitados para facilitar.</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-primary" onClick={() => setStep('contact')} disabled={!giro}>Siguiente</button>
              </div>
            </div>
          )}

          {step === 'contact' && (
            <div className="space-y-6">
              <div className="card p-6 space-y-4">
                <div>
                  <label className="label">Ingresa un contacto</label>
                  <div className="flex gap-2">
                    <div className="flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-3 text-sm text-slate-600 ring-1 ring-slate-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700 select-none">+569</div>
                    <input
                      className="input"
                      value={phoneNumber}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d]/g, '').slice(0, 9);
                        setPhoneNumber(v);
                      }}
                      inputMode="numeric"
                      placeholder="9 dígitos"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary" onClick={() => setStep('giro')}>Volver</button>
                <button className="btn-primary" onClick={() => setStep('intro')} disabled={phoneNumber.length !== 9}>Siguiente</button>
              </div>
            </div>
          )}

          {step === 'intro' && (
            <div className="space-y-6">
              <div className="card p-6 space-y-3">
                <div className="text-lg font-semibold">Estás por comenzar a utilizar Prismal AI</div>
                <div className="subtle-muted">Una herramienta pensada para simplificar el trabajo de la evaluación de riesgo de crédito B2B. Potenciada con IA, podrás definir una política de riesgo para la evaluación de cada potencial prospecto o cliente vigente.</div>
                <div className="mt-2 font-medium">Algunas herramientas:</div>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Evaluación integral de riesgo potenciada con AI.</li>
                  <li>Registro de clientes evaluados.</li>
                  <li>Notificación de cobranza a un click.</li>
                  <li>Notificación de apertura de crédito a un click.</li>
                  <li>Creación de equipo para compartir cuenta.</li>
                  <li>Publicación de morosos en red interna.</li>
                  <li>Consulta de créditos vigentes/morosos por RUT.</li>
                  <li>Carga masiva de créditos.</li>
                </ul>
                {errMsg && <div className="hint text-rose-400">{errMsg}</div>}
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary" onClick={() => setStep('contact')}>Volver</button>
                <button className="btn-primary" onClick={onStart} disabled={!giro || phoneNumber.length !== 9}>Comenzar</button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="card p-6 text-center">
              <div className="text-lg font-semibold">¡Listo! Tu perfil quedó guardado.</div>
              <div className="hint">Te llevaremos al chat…</div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
