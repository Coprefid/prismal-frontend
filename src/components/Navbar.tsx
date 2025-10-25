"use client";
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <div className="fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <nav className="w-full max-w-6xl rounded-full border border-slate-200 bg-white/80 px-4 py-2 shadow-card backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex h-12 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
            <Image src="/isotipo.png" alt="Prismal AI" width={24} height={24} className="h-6 w-6" />
            <span>Prismal AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <a href="#features" className="rounded-full px-3 py-2 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800">Funciones</a>
              <a href="#benefits" className="rounded-full px-3 py-2 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800">Beneficios</a>
              <a href="#pricing" className="rounded-full px-3 py-2 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800">Precios</a>
            </nav>
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/#pricing" className="btn-secondary">Ver precios</Link>
              <Link href="/login" className="btn-primary">Iniciar sesión</Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

