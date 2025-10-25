import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSampleCard from '@/components/HeroSampleCard';
import GeminiBadge from '@/components/ui/GeminiBadge';

export default function HomePage() {
  return (
    <main className="min-h-screen app-bg">
      <Navbar />

      {/* Hero */}
      <section className="section pt-28 md:pt-36">
        <div className="container-page text-center">
          <h1 className="heading-hero">
            Prismal AI: tu agente de crédito B2B
          </h1>
          <div className="mt-3 flex justify-center">
            <GeminiBadge />
          </div>
          <p className="mx-auto mt-6 max-w-2xl subtle-muted">
            Centraliza la evaluación, políticas, cobranza y trazabilidad en un solo lugar. Adjunta documentos,
            aplica tus políticas de riesgo y decide cuánto vender y cómo cobrar en minutos.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <a href="#cta" className="btn-primary">Probar gratis</a>
            <a href="#demo" className="btn-secondary">Ver demo en vivo</a>
          </div>

          <div className="mt-12">
            <HeroSampleCard />
          </div>
        </div>
      </section>

      {/* Qué es Prismal AI */}
      <section id="features" className="section">
        <div className="container-page">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Qué es Prismal AI</h2>
          <p className="subtle-muted mx-auto mt-4 max-w-3xl text-center">
            Prismal es un agente de IA diseñado para apoyar a las empresas que venden a crédito. Centraliza todas las
            herramientas que usas para evaluar en un solo lugar y entrega una respuesta integral en segundos.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { t: 'Evaluación integral con IA', d: 'Combina estados financieros, carpeta tributaria e informes comerciales.', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><rect x="3" y="13" width="7" height="7" rx="1"/><path d="M14 17h7"/></svg>
              )},
              { t: 'Políticas de riesgo claras', d: 'Define macro, micro y hard-stops para revisión automática de cada prospecto o cliente.', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>
              )},
              { t: 'Registro y trazabilidad de créditos', d: 'Almacena evaluaciones y haz seguimiento de pago y sanidad de cartera.', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M3 5h14l4 4v10a2 2 0 0 1-2 2H3z"/><path d="M17 5v4h4"/><path d="M7 13h10"/><path d="M7 17h6"/></svg>
              )},
              { t: 'Cobranza automatizada', d: 'Notificación por correo a un clic; publicación y bloqueo en la red de clientes.', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M4 4h16v16H4z"/><path d="M4 7l8 6 8-6"/></svg>
              )},
              { t: 'Consulta de crédito en la red Prismal', d: 'Verifica si tu cliente ya tiene línea activa en el comercio asociado.', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/><path d="M9 12h6"/></svg>
              )},
              { t: 'Notificación de línea aprobada', d: 'Informa al cliente cuando es sujeto de crédito y su línea disponible.', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M20 6l-11 11-5-5"/></svg>
              )},
            ].map((f) => (
              <div key={f.t} className="card p-6">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-logo-start via-logo-mid to-logo-end text-white shadow-sm">
                    {f.icon}
                  </span>
                  <div>
                    <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">{f.t}</div>
                    <div className="mt-2 text-sm subtle-muted">{f.d}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="section bg-white dark:bg-transparent" id="como-funciona">
        <div className="container-page">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Cómo funciona</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: 1, t: 'Adjunta evidencia', d: 'Liquidaciones de sueldo, balance, EERR, carpeta tributaria, informe comercial.' },
              { n: 2, t: 'Aplica tus políticas', d: 'La IA evalúa contra tu política y construye una respuesta integral.' },
              { n: 3, t: 'Decide y comunica', d: 'Aprobar/rechazar, definir línea y notificar al cliente.' },
              { n: 4, t: 'Haz seguimiento y cobra', d: 'Registro del cliente, trazabilidad de créditos y cobranza automatizada.' },
            ].map((s) => (
              <div key={s.n} className="card p-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-bold dark:bg-slate-800 dark:text-brand-300">
                  {s.n}
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-100">{s.t}</div>
                <div className="mt-1 text-sm subtle-muted">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Casos de uso */}
      <section className="section" id="casos-de-uso">
        <div className="container-page">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Casos de uso</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { t: 'Vender o no', d: 'Decide con evidencia si otorgar o rechazar crédito.', icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M20 6l-11 11-5-5"/></svg>) },
              { t: 'Cuánto vender', d: 'Define una línea de crédito y condiciones asociadas.', icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M3 12h18"/><path d="M12 3v18"/></svg>) },
              { t: 'Cómo cobrar', d: 'Genera recordatorios y gestiona cobranza con un clic.', icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M4 4h16v16H4z"/><path d="M4 8h16"/><path d="M8 12h8"/></svg>) },
              { t: 'Trazabilidad de créditos', d: 'Sigue cada evaluación y pago con auditoría completa.', icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-5"/></svg>) },
              { t: 'Sanidad de cartera', d: 'Monitorea cartera y alertas para prevenir riesgos.', icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M12 2v20"/><path d="M5 9l7-7 7 7"/></svg>) },
              { t: 'Reducir incobrabilidad', d: 'Bloqueo en red y políticas firmes para proteger tu negocio.', icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>) },
            ].map((c) => (
              <div key={c.t} className="card p-6">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-logo-start via-logo-mid to-logo-end text-white shadow-sm">
                    {c.icon}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{c.t}</div>
                    <div className="mt-2 text-sm subtle-muted">{c.d}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funciones clave */}
      <section className="section" id="funciones-clave">
        <div className="container-page">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Funciones clave</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              'Agente conversacional para evaluar a crédito',
              'Repositorio de clientes evaluados y seguimiento de pago',
              'Definición de líneas de crédito y condiciones',
              'Notificaciones de cobranza y bloqueo en red Prismal',
              'Consulta de crédito en comercio asociado',
              'Trazabilidad y auditoría de cada evaluación',
            ].map((t) => (
              <div key={t} className="card p-6">
                <div className="font-semibold">{t}</div>
                <div className="mt-2 text-sm subtle-muted">Diseñado para flujos B2B de venta a crédito.</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section id="benefits" className="section bg-white dark:bg-transparent">
        <div className="container-page grid gap-10 md:grid-cols-2">
          <div className="space-y-6">
            {[
              { t: 'Reduce incobrabilidad', d: 'Decide con evidencia y políticas claras.' },
              { t: 'Respuesta integral en segundos', d: 'Consolida todas las fuentes y documentos para decidir rápido.' },
              { t: 'Seguimiento de cartera', d: 'Trazabilidad de créditos y recordatorios automáticos.' },
            ].map((b) => (
              <div key={b.t} className="card p-6">
                <div className="font-semibold text-slate-800 dark:text-slate-100">{b.t}</div>
                <div className="mt-1 text-sm subtle-muted">{b.d}</div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {[
              { t: 'Más información, mejor resultado', d: 'Adjunta liquidaciones, balance, EERR, carpeta tributaria e informes.' },
              { t: 'Bloqueo en red de clientes', d: 'Protege el ecosistema de comercios asociados de Prismal.' },
              { t: 'Notificación de línea de crédito', d: 'Comunica al cliente su línea aprobada y condiciones.' },
            ].map((b) => (
              <div key={b.t} className="card p-6">
                <div className="font-semibold text-slate-800 dark:text-slate-100">{b.t}</div>
                <div className="mt-1 text-sm subtle-muted">{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing mejorado */}
      <section id="pricing" className="section">
        <div className="container-page">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Planes</h2>
          <p className="subtle-muted mx-auto mt-3 max-w-2xl text-center">
            Modelo por créditos que se adapta a tu volumen de evaluaciones y cobranzas.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {/* Starter */}
            <div className="card p-6">
              <div className="text-sm font-medium text-brand-700 dark:text-brand-200">Starter</div>
              <div className="mt-2 text-3xl font-extrabold">$19.990</div>
              <div className="subtle-muted text-sm">hasta 5 evaluaciones/mes</div>
              <ul className="mt-4 space-y-2 text-sm">
                <li>• 5 créditos incluidos</li>
                <li>• Email soporte</li>
                <li>• Acceso a panel</li>
              </ul>
              <a href="#cta" className="btn-primary mt-6 w-full">Elegir Starter</a>
            </div>

            {/* Pro - destacado */}
            <div className="card p-6 ring-2 ring-brand-200 dark:ring-brand-500/30">
              <div className="text-sm font-medium text-brand-700 dark:text-brand-200">Pro</div>
              <div className="mt-2 text-3xl font-extrabold">$229.000</div>
              <div className="subtle-muted text-sm">hasta 100 evaluaciones/mes</div>
              <ul className="mt-4 space-y-2 text-sm">
                <li>• 100 créditos incluidos</li>
                <li>• Soporte prioritario</li>
                <li>• Integraciones Webpay/SendGrid</li>
              </ul>
              <a href="#cta" className="btn-primary mt-6 w-full">Elegir Pro</a>
            </div>

            {/* Enterprise */}
            <div className="card p-6">
              <div className="text-sm font-medium text-brand-700 dark:text-brand-200">Enterprise</div>
              <div className="mt-2 text-3xl font-extrabold">Custom</div>
              <div className="subtle-muted text-sm">volumen alto y soporte dedicado</div>
              <ul className="mt-4 space-y-2 text-sm">
                <li>• Multi-tenant y SSO</li>
                <li>• SLA y Onboarding</li>
                <li>• Integraciones personalizadas</li>
              </ul>
              <a href="#cta" className="btn-secondary mt-6 w-full">Contactar ventas</a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Seguridad */}
      <section className="section bg-white dark:bg-transparent">
        <div className="container-page">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Confianza y seguridad</h2>
          <p className="subtle-muted mx-auto mt-3 max-w-2xl text-center">
            Infraestructura en Google Cloud, cifrado y cumplimiento. Trazabilidad completa por evaluación.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { t: 'Cifrado extremo a extremo', d: 'Protección total de datos sensibles.' },
              { t: 'Google Cloud Infrastructure', d: 'Infraestructura empresarial confiable.' },
              { t: 'Cumplimiento normativo', d: 'Estándares de seguridad empresarial.' },
            ].map((i) => (
              <div key={i.t} className="card p-6 text-center">
                <div className="font-semibold text-slate-800 dark:text-slate-100">{i.t}</div>
                <div className="mt-2 text-sm subtle-muted">{i.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section id="cta" className="section">
        <div className="container-page text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Evalúa riesgos con claridad. Potencia tu negocio con Prismal AI.</h2>
          <div className="mt-6 flex items-center justify-center gap-4">
            <a className="btn-primary" href="#">Crear cuenta gratis</a>
            <a className="btn-secondary" href="#">Agendar demo personalizada</a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
