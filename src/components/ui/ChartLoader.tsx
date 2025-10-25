"use client";
import React from 'react';

export default function ChartLoader({ label = 'Cargando gráfico…' }: { label?: string }) {
  return (
    <div className="flex h-[260px] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-600 dark:text-slate-300">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/isotipo.png" alt="Prismal" className="h-8 w-8 animate-pulse" />
        <div className="flex items-center gap-2 text-sm">
          <svg className="h-4 w-4 animate-spin text-slate-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span>{label}</span>
        </div>
      </div>
    </div>
  );
}
