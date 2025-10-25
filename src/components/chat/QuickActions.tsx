"use client";

interface QuickActionsProps {
  onPick: (text: string) => void;
}

const ACTIONS: { label: string; text: string }[] = [
  { label: 'Evaluar crédito', text: 'Por favor evalúa el riesgo de esta solicitud de crédito.' },
  { label: 'Resumir PDFs', text: 'Resume los documentos adjuntos destacando riesgos y hallazgos clave.' },
  { label: 'Generar oferta', text: 'Genera una oferta preliminar de crédito con montos y tasas sugeridas.' },
  { label: 'Notificar cliente', text: 'Redacta un correo para notificar al cliente el estado de su evaluación.' },
];

export default function QuickActions({ onPick }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap justify-center md:justify-start gap-2 text-center md:text-left">
      {ACTIONS.map((a) => (
        <button
          key={a.label}
          type="button"
          className="rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
          onClick={() => onPick(a.text)}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
