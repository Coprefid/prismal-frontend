"use client";
import { useState } from "react";

export default function InfoTooltip({ title, children }: { title: string; children: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label={title}
        className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 100 2 1 1 0 000-2zm-1 4a1 1 0 000 2h1v2a1 1 0 102 0v-2a2 2 0 00-2-2h-1z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="pointer-events-none absolute left-0 z-30 mt-2 w-80 max-w-[22rem] rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="font-medium mb-1">{title}</div>
          <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{children}</div>
        </div>
      )}
    </span>
  );
}
