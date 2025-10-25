"use client";
import React, { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoggedNavbar from '@/components/layout/LoggedNavbar';
import Sidebar from '@/components/layout/Sidebar';

export default function EvaluationsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isListView = useMemo(() => pathname === '/evaluations', [pathname]);
  const isDetailView = useMemo(() => pathname?.startsWith('/evaluations/') === true, [pathname]);
  return (
    <main className="min-h-screen app-bg">
      {/* Top navbar (logged-in): use pill + hamburger across list and detail */}
      <LoggedNavbar onHamburger={() => setSidebarOpen((v) => !v)} variant="pill" />

      {/* Sidebar on both list and detail */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content container with sidebar spacing and extra top padding to avoid collision */}
      <div className={`pb-10 px-4 md:px-6 md:pl-72 ${isDetailView ? 'pt-28' : 'pt-28'}`}>
        <div className="mx-auto w-full max-w-6xl">
          {children}
        </div>
      </div>
    </main>
  );
}
