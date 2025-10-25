"use client";

export type StepTab = {
  key: string;
  title: string;
};

export default function StepTabs({ steps, current, onChange }: {
  steps: StepTab[];
  current: string;
  onChange: (key: string) => void;
}) {
  const idx = steps.findIndex(s => s.key === current);
  return (
    <div className="mb-4 flex items-center gap-2 text-sm">
      {steps.map((s, i) => (
        <div key={s.key} className={`flex items-center gap-2 ${i <= idx ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
          <div className={`h-6 w-6 rounded-full ${i <= idx ? 'bg-gradient-to-r from-logo-start via-logo-mid to-logo-end text-white' : 'bg-slate-200 dark:bg-slate-800'} flex items-center justify-center text-xs`}>{i+1}</div>
          <button type="button" className="font-medium" onClick={() => onChange(s.key)}>{s.title}</button>
          {i < steps.length - 1 && <div className="mx-2 h-[2px] w-10 bg-slate-200 dark:bg-slate-700" />}
        </div>
      ))}
    </div>
  );
}
