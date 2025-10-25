"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const enabled = stored ? stored === 'dark' : prefersDark;
    if (enabled) root.classList.add('dark');
    else root.classList.remove('dark');
    setIsDark(enabled);
  }, []);

  if (!mounted) return null;

  const toggle = () => {
    const root = document.documentElement;
    const next = !isDark;
    setIsDark(next);
    if (next) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar tema"
      className="rounded-full ring-1 ring-slate-200 bg-white/60 px-3 py-2 text-sm text-slate-700 hover:bg-white dark:ring-slate-700 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {isDark ? (
        // Sun icon
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm0-18a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm10 7h-1a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2ZM3 12H2a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2Zm16.24 7.07a1 1 0 0 1-1.41 0l-.71-.71a1 1 0 1 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41ZM6.88 6.88A1 1 0 0 1 5.46 5.46l.71-.71A1 1 0 0 1 7.6 6.16l-.71.71Zm10.95-2.13a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1-1.41-1.41l.71-.71ZM6.88 17.12a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71Z"/>
        </svg>
      ) : (
        // Moon icon
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 1 0 21 12.79Z" />
        </svg>
      )}
    </button>
  );
}
