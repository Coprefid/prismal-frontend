"use client";
import React from 'react';

export default function Loader({ label = 'Cargando…', fullScreen = false }: { label?: string; fullScreen?: boolean }) {
  const content = (
    <div className="flex items-center justify-center gap-3 text-slate-600 dark:text-slate-300">
      <svg className="h-5 w-5 animate-spin text-slate-400" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      <span className="text-sm">{label}</span>
    </div>
  );
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
        {content}
      </div>
    );
  }
  return <div className="p-6">{content}</div>;
}
