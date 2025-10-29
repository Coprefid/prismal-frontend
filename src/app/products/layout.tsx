"use client";
import React, { useState } from 'react';
import LoggedNavbar from '@/components/layout/LoggedNavbar';
import Sidebar from '@/components/layout/Sidebar';

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <main className="min-h-screen app-bg">
      <LoggedNavbar onHamburger={() => setSidebarOpen((v) => !v)} variant="pill" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pb-10 px-4 md:px-6 md:pl-72 pt-28">
        <div className="mx-auto w-full max-w-6xl">
          {children}
        </div>
      </div>
    </main>
  );
}
