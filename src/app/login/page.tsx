"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { isValidEmail, isValidName, isValidPhoneCL, isStrongPassword } from '@/lib/validators';
import { apiPost, apiGet } from '@/lib/api';
import PrismalCrystalBG from '@/components/PrismalCrystalBG';
import ThemeToggle from '@/components/ThemeToggle';
import GeminiBadge from '@/components/ui/GeminiBadge';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'verify' | 'verified'>('form');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMsg, setLoginMsg] = useState<string | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  // If already authenticated, redirect to products
  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('prismal_token') : null;
        if (!token) return;
        const me = await apiGet<{ ok: boolean }>('/api/auth/me');
        if (me?.ok) router.push('/products' as Route);
      } catch {
        // ignore
      }
    })();
  }, [router]);

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!isValidName(firstName)) e.firstName = 'Nombre inválido (2–50 caracteres)';
    if (!isValidName(lastName)) e.lastName = 'Apellido inválido (2–50 caracteres)';
    if (!isValidEmail(email)) e.email = 'Correo inválido';
    if (!isValidPhoneCL('+569', phoneNumber)) e.phoneNumber = 'Teléfono debe ser +569 y 9 dígitos';
    if (password && !isStrongPassword(password)) {
      e.password = 'La contraseña debe tener 8–64, mayúsculas, minúsculas, dígitos y símbolo.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onCreateAccount = async () => {
    setMsg(null);
    if (!validateForm()) return;
    setLoading(true);
    try {
      await apiPost('/api/auth/email/code', {
        firstName,
        lastName,
        email,
        phonePrefix: '+569',
        phoneNumber,
        password: password || undefined,
      });
      setStep('verify');
      setMsg('Te enviamos un código de 6 dígitos a tu correo. Revisa tu bandeja.');
    } catch (err: any) {
      setMsg(err?.message || 'Error enviando código');
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    setMsg(null);
    if (!/^\d{6}$/.test(code)) {
      setErrors({ code: 'Código de 6 dígitos' });
      return;
    }
    setLoading(true);
    try {
      const data = await apiPost<{ ok: boolean; token?: string }>(
        '/api/auth/email/verify',
        { email, code }
      );
      if (typeof window !== 'undefined' && data?.token) {
        localStorage.setItem('prismal_token', data.token);
      }
      // Mostrar confirmación y permitir volver a login
      setMsg('¡Correo verificado con éxito! Ahora puedes iniciar sesión.');
      setStep('verified');
    } catch (err: any) {
      setMsg(err?.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen app-bg">
      <div className="fixed inset-x-0 top-0 h-24" />
      <section className="container-page py-16 md:py-24">
        <div className="grid min-h-[70vh] items-start gap-10 md:grid-cols-12 md:gap-16">
          {/* Left: Login card */}
          <div className="mx-auto w-full max-w-lg md:col-span-5 lg:col-span-4">
            <div className="relative login-glow-tilt rounded-2xl p-[1px] bg-gradient-to-r from-logo-start via-logo-mid to-logo-end">
              <div className="card ring-0 p-6 md:p-8">
              <div className="absolute right-3 top-3">
                {/* Dark mode toggle */}
                <div className="flex items-center justify-end">
                  <ThemeToggle />
                </div>
              </div>
              <div className="mb-6 flex flex-col items-center text-center">
                <Link href="/" className="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity">
                  <Image src="/isotipo.png" alt="Prismal AI" width={40} height={40} className="h-10 w-10" />
                  <span className="text-xl font-semibold text-slate-800 dark:text-slate-100">Prismal AI</span>
                </Link>
                <div className="text-lg font-medium text-slate-700 dark:text-slate-200">Inicia sesión</div>
                <div className="mt-2"><GeminiBadge minimal /></div>
              </div>
              <p className="subtle-muted mb-6 text-sm" style={{ textAlign: 'justify' }}>
                Centraliza tus evaluaciones de clientes, políticas de riesgo y herramientas de cobranza. Adjunta
                documentos, define líneas y haz seguimiento de pagos para reducir la incobrabilidad.
              </p>

              <button
                className="mb-3 flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-white hover:shadow transition dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-900"
                onClick={() => (window.location.href = '/products')}
              >
                <svg viewBox="0 0 48 48" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.4 29.4 36 24 36 16.8 36 11 30.2 11 23S16.8 10 24 10c3.5 0 6.7 1.3 9.1 3.5l5.7-5.7C35.4 4 29.9 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c12.2 0 22-9.8 22-22 0-1.3-.1-2.5-.4-3.5z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.5 0 6.7 1.3 9.1 3.5l5.7-5.7C35.4 4 29.9 2 24 2 15.3 2 7.8 6.8 3.7 14.1z"/>
                  <path fill="#4CAF50" d="M24 46c5.3 0 10.2-2 13.9-5.2l-6.4-5.2C29.3 37 26.8 38 24 38c-5.3 0-9.8-3.6-11.3-8.5l-6.4 4.9C9.9 41.1 16.4 46 24 46z"/>
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.9-4.6 7-8.6 8.1l6.4 5.2C36 42.3 42 34.6 42 24c0-1.2-.1-2.4-.4-3.5z"/>
                </svg>
                Continuar con Google
              </button>

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wide">
                  <span className="bg-white px-3 text-slate-400 dark:bg-slate-900 dark:text-slate-500">o</span>
                </div>
              </div>
            {/* LOGIN FIRST (hidden when registerOpen=true) */}
            {!registerOpen && (
              <div className="space-y-4">
                <div>
                  <label className="label">Correo</label>
                  <input className={`input`} value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} inputMode="email" />
                </div>
                <div>
                  <label className="label">Contraseña</label>
                  <input type="password" className={`input`} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                </div>
                <button
                  disabled={loginLoading}
                  className="btn-primary w-full"
                  onClick={async () => {
                    setLoginMsg(null);
                    if (!isValidEmail(loginEmail) || !loginPassword) {
                      setLoginMsg('Ingresa tu correo y contraseña');
                      return;
                    }
                    setLoginLoading(true);
                    try {
                      const data = await apiPost<{ ok: boolean; token?: string }>('/api/auth/login', { email: loginEmail, password: loginPassword });
                      if (typeof window !== 'undefined' && data?.token) {
                        localStorage.setItem('prismal_token', data.token);
                      }
                      // fetch profile to decide onboarding route
                      try {
                        const prof = await apiGet<{ ok: boolean; data: { isFirstLogin?: boolean } }>('/api/auth/me');
                        if (prof?.ok && prof.data?.isFirstLogin) {
                          router.push('/onboarding' as Route);
                        } else {
                          router.push('/products' as Route);
                        }
                      } catch {
                        router.push('/products' as Route);
                      }
                    } catch (err: any) {
                      setLoginMsg(err?.message || 'Credenciales inválidas');
                    } finally {
                      setLoginLoading(false);
                    }
                  }}
                >
                  {loginLoading ? 'Ingresando...' : 'Iniciar sesión'}
                </button>
                {loginMsg && <div className="hint text-center">{loginMsg}</div>}

                <button
                  type="button"
                  className="btn-secondary w-full"
                  onClick={() => {
                    setRegisterOpen(true);
                    setStep('form');
                  }}
                >
                  Crear una cuenta
                </button>
              </div>
            )}

            {/* REGISTER SECTION (shown when registerOpen=true) */}
            {registerOpen && step === 'form' && (
              <div className="space-y-4">
                <div>
                  <label className="label">Nombre</label>
                  <input className={`input ${errors.firstName ? 'input-error' : ''}`} value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={50} />
                  {errors.firstName && <div className="hint text-rose-400">{errors.firstName}</div>}
                </div>
                <div>
                  <label className="label">Apellido</label>
                  <input className={`input ${errors.lastName ? 'input-error' : ''}`} value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={50} />
                  {errors.lastName && <div className="hint text-rose-400">{errors.lastName}</div>}
                </div>
                <div>
                  <label className="label">Correo</label>
                  <input className={`input ${errors.email ? 'input-error' : ''}`} value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" />
                  {errors.email && <div className="hint text-rose-400">{errors.email}</div>}
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <div className="flex gap-2">
                    <div className="flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-3 text-sm text-slate-600 ring-1 ring-slate-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700 select-none">+569</div>
                    <input
                      className={`input ${errors.phoneNumber ? 'input-error' : ''}`}
                      value={phoneNumber}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d]/g, '').slice(0, 9);
                        setPhoneNumber(v);
                      }}
                      inputMode="numeric"
                      placeholder="9 dígitos"
                    />
                  </div>
                  {errors.phoneNumber && <div className="hint text-rose-400">{errors.phoneNumber}</div>}
                </div>
                <div>
                  <label className="label">Contraseña (opcional)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mín. 8 caracteres, mezclar tipos"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 mr-2 flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.29 20.29 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a20.29 20.29 0 0 1-3.22 3.88M1 1l22 22"/></svg>
                      )}
                    </button>
                  </div>
                  <div className="hint text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Usa una contraseña fuerte: 8–64 caracteres, mayúsculas, minúsculas, número y símbolo. Solo un campo, puedes mostrar/ocultar con el ojo.
                  </div>
                  {errors.password && <div className="hint text-rose-400">{errors.password}</div>}
                </div>
                <button onClick={onCreateAccount} disabled={loading} className="btn-primary w-full">{loading ? 'Enviando...' : 'Crear cuenta'}</button>
                <button type="button" className="btn-secondary w-full" onClick={() => setRegisterOpen(false)}>Volver a iniciar sesión</button>
                {msg && <div className="hint text-center">{msg}</div>}
              </div>
            )}

            {registerOpen && step === 'verify' && (
              <div className="space-y-4">
                <div>
                  <label className="label">Código de verificación</label>
                  <input className={`input ${errors.code ? 'input-error' : ''}`} value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} inputMode="numeric" />
                  {errors.code && <div className="hint text-rose-400">{errors.code}</div>}
                </div>
                <button onClick={onVerify} disabled={loading} className="btn-primary w-full">{loading ? 'Verificando...' : 'Verificar'}</button>
                {msg && <div className="hint text-center">{msg}</div>}
              </div>
            )}

            {registerOpen && step === 'verified' && (
              <div className="space-y-4 text-center">
                <div className="text-sm subtle-muted">{msg || 'Correo verificado con éxito.'}</div>
                <button
                  onClick={() => {
                    setRegisterOpen(false);
                    setStep('form');
                    setLoginEmail(email);
                    setLoginPassword('');
                  }}
                  className="btn-primary w-full"
                >
                  Ir a iniciar sesión
                </button>
              </div>
            )}
              </div>
            </div>
          </div>

        <div className="relative hidden md:block md:col-span-7 lg:col-span-8 overflow-hidden isolate">
          <PrismalCrystalBG />
          <div className="relative z-10 mx-auto max-w-2xl space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
              Tu agente de crédito con respuesta integral en segundos
            </h2>
            <div><GeminiBadge /></div>
            <p className="subtle-muted max-w-prose">
              Adjunta liquidaciones, balance, EERR, carpeta tributaria e informes. Aplica políticas de riesgo claras,
              define líneas y notifica. Más información, mejor resultado. Trazabilidad completa por evaluación.
            </p>

            <ul className="grid gap-4">
              {[
                { t: 'Centraliza evaluación y cobranza', d: 'Un solo lugar para decidir cuánto vender y cómo cobrar.' },
                { t: 'Políticas de riesgo claras', d: 'Macro, micro y hard-stops para revisión automática.' },
                { t: 'Cobranza automatizada', d: 'Email a un clic, publicación y bloqueo en la red Prismal.' },
                { t: 'Consulta y notificación de crédito', d: 'Verifica líneas activas y notifica aprobaciones.' },
              ].map((f) => (
                <li key={f.t} className="card flex items-start gap-3 p-4">
                  <div className="mt-1 h-2.5 w-2.5 flex-none rounded-full bg-gradient-to-r from-logo-start via-logo-mid to-logo-end" />
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{f.t}</div>
                    <div className="subtle-muted text-sm">{f.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </div>
      </section>
    </main>
  );
}
