"use client";
import Image from 'next/image';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  // close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/evaluations') return pathname === '/evaluations' || pathname.startsWith('/evaluations/');
    return pathname === href;
  };

  return (
    <div
      className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-white/90 p-4 shadow-xl backdrop-blur-xl transition-transform dark:bg-slate-900/90 ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:z-30 md:shadow-none md:bg-transparent md:backdrop-blur-0`}
      aria-label="Sidebar de navegación"
    >
      <div className="mt-10 md:mt-20 pb-24 h-full flex flex-col">
        {/* Brand inside sidebar */}
        <div className="mb-6 flex items-center justify-center gap-3 px-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/isotipo.png" alt="Prismal AI" className="h-9 w-9" />
          <div className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Prismal AI</div>
        </div>
        <div className="text-xs uppercase tracking-wide text-slate-400 px-1">Navegación</div>
        <nav className="mt-2 space-y-1 overflow-auto pr-1">
          <Link className={`block rounded-xl px-3 py-2 ${isActive('/chat') ? 'bg-gradient-to-r from-logo-start/10 to-logo-end/10 text-slate-800 dark:text-slate-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} href="/chat">Chat</Link>
          <a className={`block rounded-xl px-3 py-2 ${isActive('/clients') ? 'bg-gradient-to-r from-logo-start/10 to-logo-end/10 text-slate-800 dark:text-slate-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} href="#">Clientes</a>
          <Link className={`block rounded-xl px-3 py-2 ${isActive('/evaluations') ? 'bg-gradient-to-r from-logo-start/10 to-logo-end/10 text-slate-800 dark:text-slate-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} href="/evaluations">Evaluaciones</Link>
          <a className={`block rounded-xl px-3 py-2 ${isActive('/notifications') ? 'bg-gradient-to-r from-logo-start/10 to-logo-end/10 text-slate-800 dark:text-slate-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} href="#">Notificaciones</a>
        </nav>
        {/* CTA Bottom */}
        <div className="mt-auto pt-4 sticky bottom-2 md:bottom-6">
          <button
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-logo-start via-logo-mid to-logo-end px-4 py-3 text-sm font-extrabold text-white shadow-card hover:opacity-95"
            title="Mejorar a Plus"
            onClick={() => {
              // placeholder: dirigir a pricing o checkout
              window.location.href = '/pricing';
            }}
          >
            {/* AI icon (sparkles) */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M5 3l1.5 3L10 7.5 6.5 9 5 12 3.5 9 0 7.5 3.5 6 5 3Zm12 1l1.2 2.4L21 6.6l-2.8 1.2L17 10l-1.2-2.2L13 6.6l2.8-1.2L17 4Zm-3 6l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z"/>
            </svg>
            <span>Mejorar a Plus</span>
            {/* Arrow right icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
