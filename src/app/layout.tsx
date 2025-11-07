import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import ThemeInit from '@/components/ThemeInit';
import HideNextDevtools from '@/components/HideNextDevtools';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Prismal AI — Evaluación de riesgo crediticio B2B',
  description:
    'Plataforma B2B para evaluación de riesgo crediticio con IA. Carga documentos, extrae features y obtiene un score con explicaciones.',
  icons: {
    icon: '/isotipo.png',
    shortcut: '/isotipo.png',
    apple: '/isotipo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className}`}>
        <ThemeInit />
        <HideNextDevtools />
        {/* Global animated nebula background (behind all content but above body bg) */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="nebula-overlay" />
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
