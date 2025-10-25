"use client";
import { useEffect } from "react";

export default function ThemeInit() {
  useEffect(() => {
    const root = document.documentElement;
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const enableDark = stored ? stored === 'dark' : prefersDark;
    root.classList.toggle('dark', !!enableDark);
  }, []);
  return null;
}
