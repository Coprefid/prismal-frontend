import Link from 'next/link';
import type { Route } from 'next';

type Card = { title: string; desc: string; href: Route };

export default function ProductsPage() {
  const cards: readonly Card[] = [
    {
      title: 'Datarisk',
      desc: 'Automatización del análisis de la carpeta tributaria: extracción de datos, clasificación y validación en segundos.',
      href: '/evaluations',
    },
    {
      title: 'Datainsight',
      desc: 'El informe comercial más completo del mercado, usando solo el RUT.',
      href: '/datainsight',
    },
    {
      title: 'Risk alert',
      desc: 'Seguimiento programado de cartera y alertas.',
      href: '/risk-alert',
    },
    {
      title: 'Prismal AI',
      desc: 'Plataforma inteligente que combina Datarisk y Datainsight con sugerencias generadas por IA para evaluar carpetas tributarias y recomendar acciones.',
      href: '/carpeta-tributaria',
    },
  ] as const;
  return (
    <div className="py-2">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Productos</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Selecciona un producto para comenzar</p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.title} href={c.href} className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-card hover:shadow-lg transition dark:border-slate-800 dark:bg-slate-900">
            <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">{c.title}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{c.desc}</div>
            <div className="mt-3 inline-flex items-center gap-2 text-sm text-logo-start">Ir
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

