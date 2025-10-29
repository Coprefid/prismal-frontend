"use client";
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

export default function ProductSwitch({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const isDI = pathname?.startsWith('/datainsight');
  const isDR = pathname?.startsWith('/evaluations') || pathname?.startsWith('/uploads');

  const btnBase = 'px-4 py-1.5 text-sm font-semibold rounded-full transition';
  const active = 'bg-gradient-to-r from-logo-start via-logo-mid to-logo-end text-white shadow-card';
  const inactive = 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/10';

  return (
    <div className={`inline-flex items-center gap-1 rounded-full bg-white/60 p-1 backdrop-blur-md ring-1 ring-white/40 dark:bg-slate-900/50 dark:ring-white/10 ${className}`}>
      <button
        className={`${btnBase} ${isDR ? active : inactive}`}
        onClick={() => { if (!isDR) router.push('/evaluations'); }}
        aria-pressed={!!isDR}
      >DataRisk</button>
      <button
        className={`${btnBase} ${isDI ? active : inactive}`}
        onClick={() => { if (!isDI) router.push('/datainsight'); }}
        aria-pressed={!!isDI}
      >DataInsight</button>
    </div>
  );
}
