export default function HeroSampleCard() {
  return (
    <div className="card mx-auto w-full max-w-3xl px-6 py-5">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">Evaluación de Riesgo – Cliente ABC S.A.</span>
        <span className="badge">Riesgo Bajo</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-slate-50 p-4 text-center ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
          <div className="text-3xl font-bold text-brand-600 dark:text-brand-200">850</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Score Crediticio</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 text-center ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-300">$2.5M</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Línea Sugerida</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 text-center ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-300">2.1%</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Riesgo Estimado</div>
        </div>
      </div>
    </div>
  );
}
