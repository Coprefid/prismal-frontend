"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoggedNavbar({ onHamburger, variant = 'pill' }: { onHamburger?: () => void; variant?: 'pill' | 'ghost' }) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const handleLogout = () => {
    if (typeof window !== 'undefined') localStorage.removeItem('prismal_token');
    router.push('/login');
  };
  return (
    <div className={`fixed inset-x-0 top-0 z-40 py-3 pl-4 pr-4 ${onHamburger ? 'md:pl-72' : 'md:pl-4'}`}>
      <div
        className={
          `mx-auto flex max-w-6xl items-center justify-between ` +
          (variant === 'pill'
            ? 'rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-card backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70'
            : 'px-1 md:px-2')
        }
      >
        <div className="flex items-center gap-2">
          {/* Hamburger (mobile) */}
          {onHamburger && (
            <button className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden" aria-label="Abrir menú" onClick={onHamburger}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
          )}
          {/* Brand */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/isotipo.png" alt="Prismal AI" className="h-6 w-6" />
          <div className="font-semibold text-slate-800 dark:text-slate-100">Prismal AI</div>
        </div>
        <div className="relative flex items-center gap-2">
          <ThemeToggle />
          {/* Profile button */}
          <button className="rounded-full border border-slate-200 bg-white/60 px-3 py-2 text-sm shadow-sm hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" onClick={() => setProfileOpen((v) => !v)}>
            Perfil
          </button>
          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="px-2 py-1 text-sm text-slate-600 dark:text-slate-300">
                <div className="font-semibold text-slate-800 dark:text-slate-100">Mi perfil</div>
              </div>
              <div className="mt-3 grid gap-2 text-sm">
                <button className="rounded-xl px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => { if (typeof window!== 'undefined') { localStorage.setItem('navigatingToPolicies','1'); window.location.href = '/policies'; } }}>Configurar políticas de riesgo</button>
                <button className="rounded-xl px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800" onClick={handleLogout}>Cerrar sesión</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
