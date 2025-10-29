"use client";
import React, { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoggedNavbar from '@/components/layout/LoggedNavbar';
import Sidebar from '@/components/layout/Sidebar';

export default function DatainsightLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isListView = useMemo(() => pathname === '/datainsight', [pathname]);
  const isDetailView = useMemo(() => pathname?.startsWith('/datainsight/') === true, [pathname]);
  return (
    <main className="min-h-screen app-bg">
      <LoggedNavbar onHamburger={() => setSidebarOpen((v) => !v)} variant="pill" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`pb-10 px-4 md:px-6 md:pl-72 ${isDetailView ? 'pt-28' : 'pt-28'}`}>
        <div className="mx-auto w-full max-w-6xl">
          {children}
        </div>
      </div>
    </main>
  );
}
