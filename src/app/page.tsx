'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSampleCard from '@/components/HeroSampleCard';
import GeminiBadge from '@/components/ui/GeminiBadge';
import FadeIn from '@/components/ui/FadeIn';
import SplashScreen from '@/components/SplashScreen';
import { 
  BadgeCheck, 
  DollarSign, 
  FileText, 
  Users, 
  ShieldAlert,
  Zap,
  Brain,
  Lock,
  BarChart3,
  TrendingUp,
  Target,
  Bell,
  Mail,
  FileCheck,
  Gauge,
  Gift,
  Bot,
  Upload,
  Search,
  CreditCard,
  FolderKanban,
  AlertTriangle,
  Handshake,
  Lightbulb,
  FileEdit,
  Shield,
  Cloud,
  RefreshCw,
  Megaphone,
  Wallet,
  Scale,
  Banknote
} from 'lucide-react';

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}
      
      <div 
        className={`transition-opacity duration-500 ${
          showSplash ? 'opacity-0' : 'opacity-100'
        }`}
      >
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="section pt-28 md:pt-36">
        <div className="container-page text-center relative">
          <div className="relative z-10">
          <h1 className="heading-hero">
            El ecosistema B2B que transforma tu gestión crediticia
          </h1>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <GeminiBadge />
            {[
              'Informes comerciales',
              'Capacidad de crédito',
              'Automatización de riesgo',
              'Monitoreo continuo',
              'Portal publicación',
              'Red de factoring',
              'Red de abogados',
            ].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:ring-slate-700"
              >
                {label}
              </span>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-3xl text-base text-slate-700 dark:text-slate-300">
            El primer ecosistema B2B de gestión crediticia con colaboración real y automatizada:
            IA para evaluar, alertas para monitorear y cobranza integrada, conectado a una red de
            empresas que comparten señales en tiempo real para decisiones más seguras.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-4">
              <a href="#cta" className="btn-primary">Crea tu cuenta gratuita</a>
              <a href="#demo" className="btn-secondary">Ver demo</a>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300">Recibe 1 consulta sin costo de Datarisk</div>
            <a href="#beneficios-verificados" className="text-[11px] text-slate-600 underline hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 inline-flex items-center gap-1.5">
              → Empresas verificadas
              <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 ring-1 ring-purple-400/30 shadow-lg shadow-purple-500/50">
                <BadgeCheck className="h-[18px] w-[18px] fill-white text-emerald-400 stroke-purple-300 drop-shadow-[0_2px_8px_rgba(52,211,153,0.8)]" />
              </span>
              acceden a Datarisk Plus gratis y a beneficios exclusivos
            </a>
          </div>

          <div className="mt-12 relative">
            <HeroSampleCard />
          </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <FadeIn>
        <section className="section py-12 md:py-16">
          <div className="container-page">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { n: '+$700 mil millones', l: 'En créditos evaluados', Icon: Banknote, color: 'from-purple-500 to-fuchsia-500', lightColor: 'from-purple-100 to-fuchsia-100', darkColor: 'from-purple-500/20 to-fuchsia-500/10' },
                { n: '+1,000', l: 'Evaluaciones mensuales', Icon: FileText, color: 'from-cyan-500 to-blue-500', lightColor: 'from-cyan-100 to-blue-100', darkColor: 'from-cyan-500/20 to-blue-500/10' },
                { n: '50+', l: 'Clientes activos', Icon: Users, color: 'from-indigo-500 to-purple-500', lightColor: 'from-indigo-100 to-purple-100', darkColor: 'from-indigo-500/20 to-purple-500/10' },
                { n: '20+', l: 'Fraudes detectados/mes', Icon: ShieldAlert, color: 'from-emerald-500 to-teal-500', lightColor: 'from-emerald-100 to-teal-100', darkColor: 'from-emerald-500/20 to-teal-500/10' },
              ].map((stat, idx) => (
                <FadeIn key={stat.l} delay={idx * 0.1} direction="up">
                  <div className="group relative card p-6 text-center transition-all duration-300 hover:scale-105 hover:ring-white/30 cursor-default">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(6,182,212,0.03) 100%)` }} />
                    <div className="relative">
                      {/* Ícono flotante minimalista */}
                      <div className="relative inline-block mb-3 group/icon">
                        {/* Glow de fondo */}
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${stat.color} opacity-40 blur-xl group-hover:opacity-70 group-hover:blur-2xl transition-all duration-700`} />
                        
                        {/* Ícono directo */}
                        <div className="relative transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                          <stat.Icon 
                            className="h-10 w-10 drop-shadow-2xl"
                            strokeWidth={1.5}
                            style={{
                              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 0 24px rgba(255,255,255,0.4))',
                              stroke: `url(#stat-${stat.l.replace(/\s+/g, '-')})`,
                            }}
                          />
                          <svg width="0" height="0" className="absolute">
                            <defs>
                              <linearGradient id={`stat-${stat.l.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: stat.color.includes('purple') ? '#a855f7' : stat.color.includes('cyan') ? '#06b6d4' : stat.color.includes('indigo') ? '#6366f1' : '#10b981', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: stat.color.includes('purple') ? '#d946ef' : stat.color.includes('cyan') ? '#3b82f6' : stat.color.includes('indigo') ? '#a855f7' : '#14b8a6', stopOpacity: 1 }} />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                      <div className="min-h-[34px] sm:min-h-[40px] flex items-center justify-center mb-1">
                        <span className="text-2xl sm:text-3xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-600 dark:from-purple-400 dark:via-fuchsia-400 dark:to-cyan-400">
                          {stat.n}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                        {stat.l}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Valor rápido */}
      <FadeIn>
        <section id="features" className="section">
        <div className="container-page">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">¿Por qué Prismal AI?</h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-3">
            {[
              { 
                Icon: Zap, 
                title: 'Velocidad', 
                desc: 'Reduce hasta un 95% los tiempos de evaluación con lenguaje natural. Pasa de horas a ~5 segundos y enfócate en vender, sin barreras técnicas.',
                lightColor: 'from-amber-100 to-yellow-100', 
                darkColor: 'from-amber-500/20 to-yellow-500/10' 
              },
              { 
                Icon: FolderKanban, 
                title: 'Ecosistema', 
                desc: 'Evaluación potenciada con IA, gestión de cartera completa, marketplace de factoring y cobranza judicial con un clic, más cobro preventivo automatizado (emails, cartas, recordatorios).',
                lightColor: 'from-pink-100 to-fuchsia-100', 
                darkColor: 'from-pink-500/20 to-fuchsia-500/10' 
              },
              { 
                Icon: Shield, 
                title: 'Seguridad y Datos', 
                desc: 'Infraestructura Google Cloud robusta. Tú controlas tus datos: comparte señales de crédito para obtener mejores condiciones o elige no compartir. Siempre tu decisión.',
                lightColor: 'from-emerald-100 to-teal-100', 
                darkColor: 'from-emerald-500/20 to-teal-500/10' 
              },
            ].map((item) => (
              <div key={item.title} className="text-center card p-6 hover:scale-105 transition-transform duration-300">
                {/* Ícono flotante minimalista */}
                <div className="relative inline-block mb-4 group/icon">
                  {/* Glow de fondo */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.lightColor.replace('100', '500')} opacity-40 blur-xl group-hover:opacity-70 group-hover:blur-2xl transition-all duration-700`} />
                  
                  {/* Ícono directo */}
                  <div className="relative transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                    <item.Icon 
                      className="h-12 w-12 drop-shadow-2xl"
                      strokeWidth={1.5}
                      style={{
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 0 24px rgba(255,255,255,0.4))',
                        stroke: `url(#valor-${item.title.replace(/\s+/g, '-')})`,
                      }}
                    />
                    <svg width="0" height="0" className="absolute">
                      <defs>
                        <linearGradient id={`valor-${item.title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: item.lightColor.includes('amber') ? '#f59e0b' : item.lightColor.includes('pink') ? '#ec4899' : '#10b981', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: item.lightColor.includes('amber') ? '#eab308' : item.lightColor.includes('pink') ? '#d946ef' : '#14b8a6', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">{item.title}</div>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </FadeIn>

      {/* Ecosistema Prismal AI */}
      <FadeIn>
        <section className="section" id="como-funciona">
        <div className="container-page">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Ecosistema Prismal AI
          </h2>
          <p className="text-center text-slate-700 dark:text-slate-300 max-w-2xl mx-auto mb-16">
            Un ciclo completo que simplifica la gestión de créditos: desde la evaluación inicial hasta el cobro
          </p>
          
          {/* Layout con círculo central y tarjetas a los lados */}
          <div className="max-w-6xl mx-auto">
            {/* Mobile: Stack vertical */}
            <div className="lg:hidden space-y-6">
              {/* Círculo Prismal AI móvil */}
              <FadeIn>
                <div className="relative group cursor-default max-w-[200px] mx-auto">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 via-fuchsia-400 to-cyan-400 opacity-50 blur-xl group-hover:opacity-70 transition-opacity duration-300" />
                  <div className="relative aspect-square rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm ring-2 ring-purple-300 dark:ring-purple-600 shadow-xl p-6 flex flex-col items-center justify-center">
                    <Brain className="h-10 w-10 text-purple-600 dark:text-purple-400 mb-2" strokeWidth={2.5} />
                    <div className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-600 dark:from-purple-400 dark:via-fuchsia-400 dark:to-cyan-400">
                      Prismal AI
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 text-center mt-1">El núcleo de tu gestión</div>
                  </div>
                </div>
              </FadeIn>

              {/* Todas las tarjetas en móvil */}
              <div className="grid gap-4 grid-cols-2">
                {[
                  { Icon: Search, title: 'Evaluar', desc: 'Servicios de análisis', lightColor: 'from-cyan-100 to-blue-100', darkColor: 'from-cyan-500/30 to-blue-500/20', ringColor: 'ring-cyan-300 dark:ring-cyan-600', iconColor: 'text-cyan-700 dark:text-cyan-300', delay: 0.1 },
                  { Icon: FolderKanban, title: 'Mantener', desc: 'Carga tus créditos', lightColor: 'from-purple-100 to-fuchsia-100', darkColor: 'from-purple-500/30 to-fuchsia-500/20', ringColor: 'ring-purple-300 dark:ring-purple-600', iconColor: 'text-purple-700 dark:text-purple-300', delay: 0.2 },
                  { Icon: Bell, title: 'Monitorear', desc: 'Con Risk Alert', lightColor: 'from-amber-100 to-orange-100', darkColor: 'from-amber-500/30 to-orange-500/20', ringColor: 'ring-amber-300 dark:ring-amber-600', iconColor: 'text-amber-700 dark:text-amber-300', delay: 0.3 },
                  { Icon: Megaphone, title: 'Publicar', desc: 'Declara y acelera', lightColor: 'from-emerald-100 to-teal-100', darkColor: 'from-emerald-500/30 to-teal-500/20', ringColor: 'ring-emerald-300 dark:ring-emerald-600', iconColor: 'text-emerald-700 dark:text-emerald-300', delay: 0.4 },
                  { Icon: Wallet, title: 'Cobrar', desc: 'Mediante alianzas', lightColor: 'from-green-100 to-emerald-100', darkColor: 'from-green-500/30 to-emerald-500/20', ringColor: 'ring-green-300 dark:ring-green-600', iconColor: 'text-green-700 dark:text-green-300', delay: 0.5 },
                  { Icon: RefreshCw, title: 'Ciclo continuo', desc: 'Mejora constante', lightColor: 'from-indigo-100 to-purple-100', darkColor: 'from-indigo-500/30 to-purple-500/20', ringColor: 'ring-indigo-300 dark:ring-indigo-600', iconColor: 'text-indigo-700 dark:text-indigo-300', delay: 0.6 },
                ].map((item) => (
                  <FadeIn key={item.title} delay={item.delay}>
                    <div className="card p-4 text-center hover:scale-105 transition-transform duration-300">
                      {/* Ícono flotante minimalista */}
                      <div className="relative inline-block mb-2 mx-auto group/icon">
                        {/* Glow de fondo */}
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.lightColor.replace('100', '500')} opacity-40 blur-lg group-hover:opacity-70 group-hover:blur-xl transition-all duration-700`} />
                        
                        {/* Ícono directo */}
                        <div className="relative transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                          <item.Icon 
                            className="h-10 w-10 drop-shadow-2xl"
                            strokeWidth={1.5}
                            style={{
                              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.3)) drop-shadow(0 0 20px rgba(255,255,255,0.4))',
                              stroke: `url(#eco-mobile-${item.title.replace(/\s+/g, '-')})`,
                            }}
                          />
                          <svg width="0" height="0" className="absolute">
                            <defs>
                              <linearGradient id={`eco-mobile-${item.title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: item.lightColor.includes('cyan') ? '#06b6d4' : item.lightColor.includes('purple') ? '#a855f7' : item.lightColor.includes('amber') ? '#f59e0b' : item.lightColor.includes('emerald') ? '#10b981' : item.lightColor.includes('green') ? '#22c55e' : '#6366f1', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: item.lightColor.includes('cyan') ? '#3b82f6' : item.lightColor.includes('purple') ? '#d946ef' : item.lightColor.includes('amber') ? '#f97316' : item.lightColor.includes('emerald') ? '#14b8a6' : item.lightColor.includes('green') ? '#10b981' : '#a855f7', stopOpacity: 1 }} />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">{item.title}</div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400">{item.desc}</div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>

            {/* Desktop: 3 columnas con círculo al centro */}
            <div className="hidden lg:flex items-center justify-center gap-8">
              {/* Columna Izquierda - 3 tarjetas */}
              <div className="flex flex-col gap-6 flex-1 max-w-[220px]">
                <FadeIn delay={0.1}>
                  <div className="card p-5 text-center hover:scale-105 transition-transform duration-300">
                    {/* Ícono flotante minimalista */}
                    <div className="relative inline-block mb-3 mx-auto group/icon">
                      {/* Glow de fondo */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 opacity-40 blur-xl group-hover:opacity-70 group-hover:blur-2xl transition-all duration-700" />
                      
                      {/* Ícono directo */}
                      <div className="relative transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                        <Search 
                          className="h-12 w-12 drop-shadow-2xl"
                          strokeWidth={1.5}
                          style={{
                            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 0 24px rgba(255,255,255,0.4))',
                            stroke: 'url(#eco-evaluar)',
                          }}
                        />
                        <svg width="0" height="0" className="absolute">
                          <defs>
                            <linearGradient id="eco-evaluar" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                              <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">Evaluar</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">Servicios de análisis</div>
                    <a href="#evaluar" className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium">Saber más →</a>
                  </div>
                </FadeIn>

                <FadeIn delay={0.2}>
                  <div className="card p-5 text-center hover:scale-105 transition-transform duration-300">
                    {/* Ícono flotante minimalista */}
                    <div className="relative inline-block mb-3 mx-auto group/icon">
                      {/* Glow de fondo */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 opacity-40 blur-xl group-hover:opacity-70 group-hover:blur-2xl transition-all duration-700" />
                      
                      {/* Ícono directo */}
                      <div className="relative transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                        <FolderKanban 
                          className="h-12 w-12 drop-shadow-2xl"
                          strokeWidth={1.5}
                          style={{
                            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 0 24px rgba(255,255,255,0.4))',
                            stroke: 'url(#eco-mantener)',
                          }}
                        />
                        <svg width="0" height="0" className="absolute">
                          <defs>
                            <linearGradient id="eco-mantener" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
                              <stop offset="100%" style={{ stopColor: '#d946ef', stopOpacity: 1 }} />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">Mantener</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">Carga tus créditos</div>
                    <a href="#mantener" className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium">Saber más →</a>
                  </div>
                </FadeIn>

                <FadeIn delay={0.3}>
                  <div className="card p-5 text-center hover:scale-105 transition-transform duration-300">
                    {/* Ícono flotante minimalista */}
                    <div className="relative inline-block mb-3 mx-auto group/icon">
                      {/* Glow de fondo */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 opacity-40 blur-xl group-hover:opacity-70 group-hover:blur-2xl transition-all duration-700" />
                      
                      {/* Ícono directo */}
                      <div className="relative transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                        <Megaphone 
                          className="h-12 w-12 drop-shadow-2xl"
                          strokeWidth={1.5}
                          style={{
                            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 0 24px rgba(255,255,255,0.4))',
                            stroke: 'url(#eco-publicar)',
                          }}
                        />
                        <svg width="0" height="0" className="absolute">
                          <defs>
                            <linearGradient id="eco-publicar" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                              <stop offset="100%" style={{ stopColor: '#14b8a6', stopOpacity: 1 }} />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">Publicar</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">Declara y acelera</div>
                    <a href="#publicar" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">Saber más →</a>
                  </div>
                </FadeIn>
              </div>

              {/* Centro - Círculo Prismal AI */}
              <FadeIn delay={0}>
                <div className="relative group cursor-default flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 via-fuchsia-400 to-cyan-400 opacity-50 blur-2xl group-hover:opacity-70 transition-opacity duration-300" />
                  <div className="relative w-[240px] h-[240px] rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm ring-4 ring-purple-300 dark:ring-purple-600 shadow-2xl flex flex-col items-center justify-center">
                    <Brain className="h-14 w-14 text-purple-600 dark:text-purple-400 mb-3" strokeWidth={2.5} />
                    <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-600 dark:from-purple-400 dark:via-fuchsia-400 dark:to-cyan-400">
                      Prismal AI
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 text-center mt-1 px-4">El núcleo de tu gestión</div>
                  </div>
                </div>
              </FadeIn>

              {/* Columna Derecha - 3 tarjetas */}
              <div className="flex flex-col gap-6 flex-1 max-w-[220px]">
                <FadeIn delay={0.4}>
                  <div className="card p-5 text-center hover:scale-105 transition-transform duration-300">
                    {/* Ícono flotante minimalista */}
                    <div className="relative inline-block mb-3 mx-auto group/icon">
                      {/* Glow de fondo */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 opacity-40 blur-xl group-hover:opacity-70 group-hover:blur-2xl transition-all duration-700" />
                      
                      {/* Ícono directo */}
                      <div className="relative transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                        <Bell 
                          className="h-12 w-12 drop-shadow-2xl"
                          strokeWidth={1.5}
                          style={{
                            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 0 24px rgba(255,255,255,0.4))',
                            stroke: 'url(#eco-monitorear)',
                          }}
                        />
                        <svg width="0" height="0" className="absolute">
                          <defs>
                            <linearGradient id="eco-monitorear" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
                              <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">Monitorear</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">Con Risk Alert</div>
                    <a href="#monitorear" className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium">Saber más →</a>
                  </div>
                </FadeIn>

                <FadeIn delay={0.5}>
                  <div className="card p-5 text-center hover:scale-105 transition-transform duration-300">
                    {/* Ícono flotante minimalista */}
                    <div className="relative inline-block mb-3 mx-auto group/icon">
                      {/* Glow de fondo */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 opacity-40 blur-xl group-hover:opacity-70 group-hover:blur-2xl transition-all duration-700" />
                      
                      {/* Ícono directo */}
                      <div className="relative transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                        <Wallet 
                          className="h-12 w-12 drop-shadow-2xl"
                          strokeWidth={1.5}
                          style={{
                            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 0 24px rgba(255,255,255,0.4))',
                            stroke: 'url(#eco-cobrar)',
                          }}
                        />
                        <svg width="0" height="0" className="absolute">
                          <defs>
                            <linearGradient id="eco-cobrar" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{ stopColor: '#22c55e', stopOpacity: 1 }} />
                              <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">Cobrar</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">Mediante alianzas</div>
                    <a href="#mantener" className="text-xs text-green-600 dark:text-green-400 hover:underline font-medium">Saber más →</a>
                  </div>
                </FadeIn>

                <FadeIn delay={0.6}>
                  <div className="card p-5 text-center hover:scale-105 transition-transform duration-300">
                    {/* Ícono flotante minimalista */}
                    <div className="relative inline-block mb-3 mx-auto group/icon">
                      {/* Glow de fondo */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 opacity-40 blur-xl group-hover:opacity-70 group-hover:blur-2xl transition-all duration-700" />
                      
                      {/* Ícono directo */}
                      <div className="relative transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                        <RefreshCw 
                          className="h-12 w-12 drop-shadow-2xl"
                          strokeWidth={1.5}
                          style={{
                            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 0 24px rgba(255,255,255,0.4))',
                            stroke: 'url(#eco-ciclo)',
                          }}
                        />
                        <svg width="0" height="0" className="absolute">
                          <defs>
                            <linearGradient id="eco-ciclo" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                              <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">Ciclo continuo</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">Mejora constante</div>
                    <a href="#como-funciona" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Ver flujo →</a>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>

          {/* Descripción del ciclo - Versión mejorada */}
          <div className="mt-20 max-w-6xl mx-auto">
            {/* Título principal con efecto */}
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-600 dark:from-purple-400 dark:via-fuchsia-400 dark:to-cyan-400 mb-4">
                Simplifica la venta con nuestro ecosistema completo
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Un flujo de trabajo integrado que cubre cada etapa de tu gestión crediticia
              </p>
            </div>

            {/* Grid de tarjetas mejorado */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Tarjeta 1: Evalúa */}
              <FadeIn delay={0.1}>
                <div className="group relative card p-6 hover:scale-[1.03] transition-all duration-300 cursor-default overflow-hidden">
                  {/* Background gradient animado */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Badge numérico */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    1
                  </div>

                  <div className="relative">
                    {/* Ícono grande */}
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-500/30 dark:to-blue-500/20 ring-2 ring-cyan-300 dark:ring-cyan-600/50 shadow-lg group-hover:shadow-cyan-500/50 group-hover:scale-110 transition-all duration-300">
                      <Search className="h-8 w-8 text-cyan-700 dark:text-cyan-300" strokeWidth={2.5} />
                    </div>

                    {/* Título con gradiente */}
                    <h4 className="text-xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400">
                      Evalúa
                    </h4>

                    {/* Descripción */}
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                      el riesgo de tus clientes con nuestros servicios de análisis inteligente <span className="font-semibold">(Datarisk, DataInsight, Datarisk Plus)</span>.
                    </p>

                    {/* Tags o features destacadas */}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
                        IA Powered
                      </span>
                      <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        Capacidad de crédito
                      </span>
                      <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
                        Info comercial
                      </span>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Tarjeta 2: Mantén */}
              <FadeIn delay={0.2}>
                <div className="group relative card p-6 hover:scale-[1.03] transition-all duration-300 cursor-default overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    2
                  </div>

                  <div className="relative">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 dark:from-purple-500/30 dark:to-fuchsia-500/20 ring-2 ring-purple-300 dark:ring-purple-600/50 shadow-lg group-hover:shadow-purple-500/50 group-hover:scale-110 transition-all duration-300">
                      <FolderKanban className="h-8 w-8 text-purple-700 dark:text-purple-300" strokeWidth={2.5} />
                    </div>

                    <h4 className="text-xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400">
                      Mantén
                    </h4>

                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                      tu cartera organizada cargando todos tus <span className="font-semibold">créditos vigentes, vencidos y morosos</span> en un solo lugar.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        Centralizado
                      </span>
                      <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300">
                        Organizado
                      </span>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Tarjeta 3: Monitorea */}
              <FadeIn delay={0.3}>
                <div className="group relative card p-6 hover:scale-[1.03] transition-all duration-300 cursor-default overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    3
                  </div>

                  <div className="relative">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/30 dark:to-orange-500/20 ring-2 ring-amber-300 dark:ring-amber-600/50 shadow-lg group-hover:shadow-amber-500/50 group-hover:scale-110 transition-all duration-300">
                      <Bell className="h-8 w-8 text-amber-700 dark:text-amber-300" strokeWidth={2.5} />
                    </div>

                    <h4 className="text-xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">
                      Monitorea
                    </h4>

                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                      proactivamente con <span className="font-semibold">Risk Alert</span>, recibiendo alertas automáticas de deterioro y cambios en el estado de tus clientes.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                        Tiempo real
                      </span>
                      <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                        Alertas automáticas
                      </span>
                      <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                        Deterioro comercial
                      </span>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Tarjeta 4: Publica */}
              <FadeIn delay={0.4}>
                <div className="group relative card p-6 hover:scale-[1.03] transition-all duration-300 cursor-default overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    4
                  </div>

                  <div className="relative">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-500/30 dark:to-teal-500/20 ring-2 ring-emerald-300 dark:ring-emerald-600/50 shadow-lg group-hover:shadow-emerald-500/50 group-hover:scale-110 transition-all duration-300">
                      <Megaphone className="h-8 w-8 text-emerald-700 dark:text-emerald-300" strokeWidth={2.5} />
                    </div>

                    <h4 className="text-xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
                      Publica
                    </h4>

                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                      tus créditos en la <span className="font-semibold">Red Coprefid</span> y accede a opciones de aceleración mediante nuestras alianzas estratégicas.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                        Red Coprefid
                      </span>
                      <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                        Red factoring
                      </span>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Tarjeta 5: Cobra */}
              <FadeIn delay={0.5}>
                <div className="group relative card p-6 hover:scale-[1.03] transition-all duration-300 cursor-default overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    5
                  </div>

                  <div className="relative">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-500/30 dark:to-emerald-500/20 ring-2 ring-green-300 dark:ring-green-600/50 shadow-lg group-hover:shadow-green-500/50 group-hover:scale-110 transition-all duration-300">
                      <Wallet className="h-8 w-8 text-green-700 dark:text-green-300" strokeWidth={2.5} />
                    </div>

                    <h4 className="text-xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
                      Cobra
                    </h4>

                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                      eficientemente con <span className="font-semibold">recordatorios automáticos</span> y gestión de cobranza, potenciado por nuestras alianzas.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        Automatizado
                      </span>
                      <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                        Red cobranza judicial
                      </span>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Tarjeta 6: Ciclo continuo */}
              <FadeIn delay={0.6}>
                <div className="group relative card p-6 hover:scale-[1.03] transition-all duration-300 cursor-default overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    ∞
                  </div>

                  <div className="relative">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/30 dark:to-purple-500/20 ring-2 ring-indigo-300 dark:ring-indigo-600/50 shadow-lg group-hover:shadow-indigo-500/50 group-hover:scale-110 transition-all duration-300">
                      <RefreshCw className="h-8 w-8 text-indigo-700 dark:text-indigo-300" strokeWidth={2.5} />
                    </div>

                    <h4 className="text-xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                      Ciclo continuo
                    </h4>

                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                      cada evaluación mejora tu proceso de <span className="font-semibold">venta y gestión crediticia</span>. El aprendizaje nunca se detiene.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                        Mejora continua
                      </span>
                      <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        Optimización
                      </span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* CTA final con efecto glassmorphism */}
            <FadeIn delay={0.8}>
              <div className="mt-12 relative group">
                {/* Fondo con blur */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                
                <div className="relative card p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-purple-200 dark:border-purple-800/50">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse" />
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        Sistema integrado · Flujo continuo · Resultados medibles
                      </p>
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse" />
                    </div>
                    <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                      Cada componente del ecosistema trabaja en armonía para <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400">maximizar tu eficiencia y minimizar el riesgo</span> en toda la cadena de crédito.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

        </div>
      </section>
      </FadeIn>

      {/* 1. EVALUAR - Productos de análisis */}
      <FadeIn>
        <section className="section" id="evaluar">
        <div className="container-page">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 dark:from-cyan-400 dark:via-blue-400 dark:to-cyan-400">
              Evalúa el riesgo con IA
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-slate-700 dark:text-slate-300">
              Nuestros servicios de análisis inteligente para tomar decisiones de crédito informadas
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                t: 'DataInsight', 
                Icon: TrendingUp,
                d: 'Informe comercial completo en 1 consulta: identificación de empresa, direcciones, contactabilidad, deterioro comercial, activos, malla societaria, modificaciones societarias, extracto escritura, consultas al RUT y detalle de bienes raíces.',
                features: ['Todo en una sola consulta consolidada', 'Indicadores de riesgo y antecedentes comerciales', 'Scoring inteligente con insights de IA', 'Carga masiva de RUTs vía Excel', 'Evaluación rápida en volumen'],
                lightColor: 'from-cyan-100 to-blue-100',
                darkColor: 'from-cyan-500/30 to-blue-500/20' 
              },
              { 
                t: 'Datarisk', 
                Icon: BarChart3,
                d: 'Determina la capacidad de crédito real de tus clientes. Responde si vender o no, y cuánto vender, con respuestas claras: Aprobado, Disminuido o Rechazado según el crédito solicitado.',
                features: ['Detección automática de fraude y carpetas adulteradas', 'Procesa hasta 10 carpetas simultáneamente', 'Hasta 10 alertas automáticas de riesgo por entidad', 'Recomendaciones inteligentes de crédito', 'Informe descargable en PDF'],
                lightColor: 'from-purple-100 to-fuchsia-100',
                darkColor: 'from-purple-500/30 to-fuchsia-500/20' 
              },
              { 
                t: 'Datarisk Plus', 
                Icon: Target,
                d: 'Simplifica tu tarea con un consolidado completo de Datarisk + DataInsight, más análisis especializado con IA en riesgo de crédito. Obtén resúmenes inteligentes y recomendaciones expertas en un solo informe.',
                features: ['Consolidado Datarisk + DataInsight en un solo lugar', 'Análisis especializado con agente de IA en riesgo de crédito', 'Resúmenes inteligentes y explicaciones automatizadas', 'Visión 360º perfecta para decisiones complejas', 'Informes profesionales listos para compartir'],
                lightColor: 'from-indigo-100 to-purple-100',
                darkColor: 'from-indigo-500/30 to-purple-500/20' 
              },
            ].map((c) => (
              <div key={c.t} className="group relative card p-6 transition-all duration-300 hover:scale-[1.02] hover:ring-white/30 cursor-pointer">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(6,182,212,0.06) 100%)` }} />
                <div className="relative">
                  <div className="flex items-start gap-4">
                    {/* Ícono flotante minimalista */}
                    <div className="relative inline-block mt-0.5 flex-shrink-0 group/icon">
                      {/* Glow de fondo */}
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${c.lightColor.replace('100', '500')} opacity-40 blur-xl group-hover:opacity-70 group-hover:blur-2xl transition-all duration-700`} />
                      
                      {/* Ícono directo */}
                      <div className="relative transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                        <c.Icon 
                          className="h-10 w-10 drop-shadow-2xl"
                          strokeWidth={1.5}
                          style={{
                            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 0 24px rgba(255,255,255,0.4))',
                            stroke: `url(#evaluar-${c.t.replace(/\s+/g, '-')})`,
                          }}
                        />
                        <svg width="0" height="0" className="absolute">
                          <defs>
                            <linearGradient id={`evaluar-${c.t.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{ stopColor: c.lightColor.includes('cyan') ? '#06b6d4' : c.lightColor.includes('purple') ? '#a855f7' : '#6366f1', stopOpacity: 1 }} />
                              <stop offset="100%" style={{ stopColor: c.lightColor.includes('cyan') ? '#3b82f6' : c.lightColor.includes('purple') ? '#d946ef' : '#a855f7', stopOpacity: 1 }} />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-all duration-300">
                        {c.t}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {c.d}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {c.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <svg className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </FadeIn>

      {/* 2. MONITOREAR - Risk Alert */}
      <FadeIn>
        <section className="section bg-gradient-to-b from-slate-50/50 to-amber-50/50 dark:from-slate-900/10 dark:to-orange-900/10" id="monitorear">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 dark:from-amber-400 dark:via-orange-400 dark:to-amber-400">
              Monitorea tu cartera con Risk Alert
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-slate-700 dark:text-slate-300">
              Mantente al tanto del deterioro de tus clientes con alertas automáticas y monitoreo proactivo
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="card p-8 lg:p-10 bg-white dark:bg-slate-900">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/30 dark:to-orange-500/20 ring-2 ring-amber-300 dark:ring-amber-600 shadow-lg mb-6">
                    <Bell className="h-8 w-8 text-amber-700 dark:text-amber-300" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Alertas inteligentes en tiempo real
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                    Risk Alert monitorea continuamente a tus clientes y te avisa cuando detecta cambios críticos: deterioro comercial, protestos, morosidad, quiebras y más. Configura la frecuencia de alertas según tus necesidades.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Carga masiva por Excel</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Sube todos tus RUTs en un solo archivo y monitoréalos automáticamente</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Frecuencia personalizable</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Recibe alertas semanales, quincenales o mensuales según prefieras</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Panel de deterioro detallado</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Visualiza el tipo de deterioro y acciones recomendadas para cada cliente</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="card p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-3 mb-3">
                      <Gift className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="font-bold text-emerald-900 dark:text-emerald-100">Beneficio Verificados</h4>
                    </div>
                    <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-4">
                      ¿Eres empresa verificada? <span className="font-bold">Obtén 1 seguimiento mensual gratis</span> para monitorear a tu cliente más importante sin costo adicional.
                    </p>
                    <a href="#beneficios-verificados" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                      Ver cómo verificarse
                      <BadgeCheck className="h-4 w-4" />
                    </a>
                  </div>

                  <div className="card p-6">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3">Lo que detecta Risk Alert:</h4>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Protestos y morosidad
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Quiebras y deterioro comercial
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Cambios en scoring crediticio
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Modificaciones societarias
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Nuevas demandas judiciales
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </FadeIn>

      {/* 3. MANTENER - Gestión de cartera + Cobro */}
      <FadeIn>
        <section className="section bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-900/10" id="mantener">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 dark:from-purple-400 dark:via-fuchsia-400 dark:to-purple-400">
              Mantén y Cobra tu Cartera
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-slate-700 dark:text-slate-300">
              Gestiona todos tus créditos y automatiza el cobro preventivo y reactivo desde un solo lugar
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-8">
            {/* Gestión de cartera */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="card p-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 dark:from-purple-500/30 dark:to-fuchsia-500/20 ring-2 ring-purple-300 dark:ring-purple-600 shadow-lg mb-6">
                  <FolderKanban className="h-8 w-8 text-purple-700 dark:text-purple-300" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Gestiona tu cartera completa</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-6">
                  Carga y administra todos tus créditos vigentes, vencidos y morosos. Controla cada detalle desde un panel centralizado.
                </p>
                <ul className="space-y-3">
                  {[
                    'Carga individual o masiva por Excel',
                    'Seguimiento de pagos y abonos',
                    'Cambio automático de estados (vigente → vencido → moroso)',
                    'Historial completo de cada crédito',
                    'Notificaciones de vencimientos próximos',
                    'Reportes y métricas de cartera'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <svg className="h-5 w-5 mt-0.5 flex-shrink-0 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-500/30 dark:to-emerald-500/20 ring-2 ring-green-300 dark:ring-green-600 shadow-lg mb-6">
                  <Wallet className="h-8 w-8 text-green-700 dark:text-green-300" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Automatiza el cobro</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-6">
                  Configura correos preventivos antes del vencimiento y reactivos para créditos morosos. Acelera el cobro con alianzas estratégicas.
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-500" />
                      Cobro preventivo
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Recordatorios automáticos antes del vencimiento con botones de pago integrados</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-orange-500" />
                      Cobro reactivo
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Envío de emails y cartas certificadas automatizadas para morosos</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                      <Handshake className="h-5 w-5 text-emerald-500" />
                      Marketplace de alianzas
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Acelera créditos con factorings o activa cobranza judicial con un clic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </FadeIn>

      {/* 4. PUBLICAR - Red Coprefid */}
      <FadeIn>
        <section className="section bg-gradient-to-b from-purple-100/70 to-emerald-50/50 dark:from-purple-900/20 dark:to-teal-900/10" id="publicar">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 dark:from-purple-400 dark:via-fuchsia-400 dark:to-purple-400">
              Publica en la Red Coprefid
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-slate-700 dark:text-slate-300">
              Declara tus créditos morosos y hazlos visibles en toda la plataforma para acelerar el cobro y reducir riesgo
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="card p-8 lg:p-10">
              <div className="grid lg:grid-cols-2 gap-8 items-start">
                <div>
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-500/30 dark:to-teal-500/20 ring-2 ring-emerald-300 dark:ring-emerald-600 shadow-lg mb-6">
                    <Megaphone className="h-8 w-8 text-emerald-700 dark:text-emerald-300" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Visibilidad en todos los productos
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                    Cuando publicas un crédito moroso en la Red Coprefid, aparece automáticamente en <span className="font-bold">Datarisk, DataInsight, Datarisk Plus y Risk Alert</span>. Todos los usuarios que evalúen a ese RUT verán el deterioro declarado.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-500 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Envío automatizado de email y carta certificada al moroso</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-500 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Gestión masiva: publica múltiples créditos simultáneamente</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-500 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Presión social: el RUT aparece en todas las evaluaciones de la red</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-500 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Acelera el cobro al dificultar nuevas operaciones del moroso</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="card p-6 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-purple-500" />
                      ¿Por qué publicar?
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      La publicación en Red Coprefid genera presión natural: cuando otros evaluadores detectan el deterioro declarado, el cliente moroso enfrenta dificultades para obtener crédito en otras empresas, incentivándolo a regularizar su situación.
                    </p>
                  </div>

                  <div className="card p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3">Aparece en:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                        DataInsight
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        Datarisk
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        Datarisk Plus
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        Risk Alert
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
                      + Todas las evaluaciones de otros clientes Prismal
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </FadeIn>

      {/* Herramientas Avanzadas */}
      <FadeIn>
        <section className="section bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-900/10">
        <div className="container-page">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Herramientas que Potencian tu Gestión</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-700 dark:text-slate-300">
              Funcionalidades avanzadas para optimizar tu flujo de trabajo
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                Icon: Upload, 
                title: 'Carga Masiva por Excel', 
                desc: 'Disponible para DataInsight y Risk Alert. Evalúa o monitorea grandes volúmenes en segundos.',
                lightColor: 'from-blue-100 to-cyan-100',
                darkColor: 'from-blue-500/20 to-cyan-500/10'
              },
              { 
                Icon: Gauge, 
                title: 'Procesamiento Simultáneo', 
                desc: 'Datarisk permite cargar hasta 10 carpetas tributarias en paralelo para máxima eficiencia.',
                lightColor: 'from-purple-100 to-fuchsia-100',
                darkColor: 'from-purple-500/20 to-fuchsia-500/10'
              },
              { 
                Icon: CreditCard, 
                title: 'Gestión de Créditos Otorgados', 
                desc: 'Seguimiento de pagos, estados (vigente, vencido, moroso) y cobranza automática vía email.',
                lightColor: 'from-green-100 to-emerald-100',
                darkColor: 'from-green-500/20 to-emerald-500/10'
              },
              { 
                Icon: Mail, 
                title: 'Recordatorios Automáticos', 
                desc: 'Activa avisos y cobranza automática con botones de pago integrados en correos.',
                lightColor: 'from-cyan-100 to-blue-100',
                darkColor: 'from-cyan-500/20 to-blue-500/10'
              },
              { 
                Icon: FileEdit, 
                title: 'Informes Personalizables', 
                desc: 'Genera y descarga reportes en PDF con tu marca y formato profesional.',
                lightColor: 'from-fuchsia-100 to-pink-100',
                darkColor: 'from-fuchsia-500/20 to-pink-500/10'
              },
              { 
                Icon: Bell, 
                title: 'Alertas Inteligentes', 
                desc: 'Configura frecuencia (semanal, quincenal, mensual) y recibe notificaciones de cambios críticos.',
                lightColor: 'from-orange-100 to-amber-100',
                darkColor: 'from-orange-500/20 to-amber-500/10'
              },
            ].map((tool) => (
              <div key={tool.title} className="card p-6 hover:scale-105 transition-transform duration-300">
                {/* Ícono flotante minimalista */}
                <div className="relative inline-block mb-3 group/icon">
                  {/* Glow de fondo */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${tool.lightColor.replace('100', '500')} opacity-40 blur-xl group-hover:opacity-70 group-hover:blur-2xl transition-all duration-700`} />
                  
                  {/* Ícono directo */}
                  <div className="relative transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                    <tool.Icon 
                      className="h-10 w-10 drop-shadow-2xl"
                      strokeWidth={1.5}
                      style={{
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 0 24px rgba(255,255,255,0.4))',
                        stroke: `url(#tool-${tool.title.replace(/\s+/g, '-')})`,
                      }}
                    />
                    <svg width="0" height="0" className="absolute">
                      <defs>
                        <linearGradient id={`tool-${tool.title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: tool.lightColor.includes('blue') ? '#3b82f6' : tool.lightColor.includes('purple') ? '#a855f7' : tool.lightColor.includes('green') ? '#22c55e' : tool.lightColor.includes('cyan') ? '#06b6d4' : tool.lightColor.includes('fuchsia') ? '#d946ef' : '#f97316', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: tool.lightColor.includes('blue') ? '#06b6d4' : tool.lightColor.includes('purple') ? '#d946ef' : tool.lightColor.includes('green') ? '#10b981' : tool.lightColor.includes('cyan') ? '#3b82f6' : tool.lightColor.includes('fuchsia') ? '#ec4899' : '#f59e0b', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{tool.title}</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </FadeIn>

      {/* Beneficios de Verificación */}
      <FadeIn>
        <section className="section" id="beneficios-verificados">
        <div className="container-page">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 ring-1 ring-purple-500/30 dark:ring-purple-400/30 mb-4">
              <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 ring-1 ring-purple-300/30 shadow-lg shadow-purple-500/50">
                <BadgeCheck className="h-[22px] w-[22px] fill-white text-emerald-400 stroke-purple-300 drop-shadow-[0_2px_8px_rgba(52,211,153,0.8)]" />
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">VERIFICA TU EMPRESA</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-fuchsia-600 to-cyan-600 dark:from-purple-600 dark:via-fuchsia-500 dark:to-cyan-500">
              Beneficios Exclusivos para Empresas Verificadas
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-slate-700 dark:text-slate-300">
              Obtén tu insignia de verificación <span className="inline-flex items-center gap-1 align-middle">
                <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 ring-1 ring-purple-400/30 shadow-md shadow-purple-500/40">
                  <BadgeCheck className="h-[14px] w-[14px] fill-white text-emerald-400 stroke-purple-300 drop-shadow-[0_1px_4px_rgba(52,211,153,0.8)]" />
                </span>
              </span> en menos de 24 horas y accede a funcionalidades premium sin costo adicional
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Proceso de Verificación */}
            <div className="card p-8 mb-8 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 ring-2 ring-purple-200 dark:ring-purple-800">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-lg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    ¿Cómo verificar mi empresa?
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                      100% Gratis
                    </span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 text-white text-sm font-bold">1</span>
                      <p className="text-slate-700 dark:text-slate-300 pt-1"><span className="font-semibold">Crea tu cuenta</span> en Prismal AI</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 text-white text-sm font-bold">2</span>
                      <p className="text-slate-700 dark:text-slate-300 pt-1"><span className="font-semibold">Dirígete a &quot;Verificar mi cuenta&quot;</span> en tu perfil</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 text-white text-sm font-bold">3</span>
                      <p className="text-slate-700 dark:text-slate-300 pt-1"><span className="font-semibold">Completa el formulario:</span> RUT de la empresa, adjunta el e-RUT y CI del representante legal</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-bold">✓</span>
                      <p className="text-slate-700 dark:text-slate-300 pt-1"><span className="font-semibold text-emerald-600 dark:text-emerald-400">¡Listo!</span> En menos de 24 horas recibirás tu insignia de verificación</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Beneficios Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  Icon: Gift,
                  title: '1 Datarisk Mensual Gratis',
                  desc: 'Análisis completo de carpeta tributaria SII cada mes sin costo.',
                  lightColor: 'from-purple-100 to-fuchsia-100',
                  darkColor: 'from-purple-500/20 to-fuchsia-500/10'
                },
                {
                  Icon: Bot,
                  title: 'Sugerencias de Prismal AI',
                  desc: 'Obtén recomendaciones inteligentes y análisis potenciado por IA.',
                  lightColor: 'from-cyan-100 to-blue-100',
                  darkColor: 'from-cyan-500/20 to-blue-500/10'
                },
                {
                  Icon: Upload,
                  title: 'Publicación de Créditos',
                  desc: 'Carga y publica tus créditos vigentes, morosos y vencidos en la Red Coprefid.',
                  lightColor: 'from-indigo-100 to-purple-100',
                  darkColor: 'from-indigo-500/20 to-purple-500/10'
                },
                {
                  Icon: Search,
                  title: 'Consulta de RUTs',
                  desc: 'Accede a consultar RUTs y revisar créditos vigentes en el comercio tras tu primera publicación.',
                  lightColor: 'from-emerald-100 to-teal-100',
                  darkColor: 'from-emerald-500/20 to-teal-500/10'
                },
                {
                  Icon: Mail,
                  title: 'Cobranza Automatizada',
                  desc: 'Notificaciones vía email con carta adjunta sobre mora al deudor de forma automática.',
                  lightColor: 'from-orange-100 to-amber-100',
                  darkColor: 'from-orange-500/20 to-amber-500/10'
                },
                {
                  Icon: FolderKanban,
                  title: 'Seguimiento de Cartera',
                  desc: '1 alerta mensual para monitorear el estado de tu cartera de clientes.',
                  lightColor: 'from-pink-100 to-rose-100',
                  darkColor: 'from-pink-500/20 to-rose-500/10'
                },
                {
                  Icon: Banknote,
                  title: 'Factoring en 1 Click',
                  desc: 'Conectamos Factorings a tus créditos aprobados en 1 click si lo deseas. Acelera tu flujo de caja sin complicaciones.',
                  lightColor: 'from-green-100 to-emerald-100',
                  darkColor: 'from-green-500/20 to-emerald-500/10'
                },
                {
                  Icon: Scale,
                  title: 'Red de Abogados Especializados',
                  desc: 'Créditos que requieren cobranza prejudicial y judicial, te conectamos con una red de abogados especializados a 1 click.',
                  lightColor: 'from-slate-100 to-gray-100',
                  darkColor: 'from-slate-500/20 to-gray-500/10'
                },
              ].map((benefit, idx) => {
                const isNew = benefit.title === 'Factoring en 1 Click' || benefit.title === 'Red de Abogados Especializados';
                
                // Define el color principal para cada beneficio basado en lightColor
                const getMainGradient = (lightColor: string) => {
                  if (lightColor.includes('purple')) return 'from-purple-500 to-fuchsia-500';
                  if (lightColor.includes('cyan')) return 'from-cyan-500 to-blue-500';
                  if (lightColor.includes('indigo')) return 'from-indigo-500 to-purple-500';
                  if (lightColor.includes('emerald')) return 'from-emerald-500 to-teal-500';
                  if (lightColor.includes('orange')) return 'from-orange-500 to-amber-500';
                  if (lightColor.includes('pink')) return 'from-pink-500 to-rose-500';
                  if (lightColor.includes('green')) return 'from-green-500 to-emerald-500';
                  if (lightColor.includes('slate')) return 'from-slate-500 to-gray-500';
                  return 'from-purple-500 to-fuchsia-500';
                };

                const getShadowColor = (lightColor: string) => {
                  if (lightColor.includes('purple')) return 'shadow-purple-500/50 dark:shadow-purple-400/40';
                  if (lightColor.includes('cyan')) return 'shadow-cyan-500/50 dark:shadow-cyan-400/40';
                  if (lightColor.includes('indigo')) return 'shadow-indigo-500/50 dark:shadow-indigo-400/40';
                  if (lightColor.includes('emerald')) return 'shadow-emerald-500/50 dark:shadow-emerald-400/40';
                  if (lightColor.includes('orange')) return 'shadow-orange-500/50 dark:shadow-orange-400/40';
                  if (lightColor.includes('pink')) return 'shadow-pink-500/50 dark:shadow-pink-400/40';
                  if (lightColor.includes('green')) return 'shadow-green-500/50 dark:shadow-green-400/40';
                  if (lightColor.includes('slate')) return 'shadow-slate-500/50 dark:shadow-slate-400/40';
                  return 'shadow-purple-500/50 dark:shadow-purple-400/40';
                };

                return (
                <FadeIn key={benefit.title} delay={idx * 0.1} direction="up">
                  <div className={`group relative card p-6 h-full transition-all duration-300 hover:scale-[1.02] cursor-default ${isNew ? 'ring-2 ring-emerald-400/40 dark:ring-emerald-500/40 hover:ring-emerald-400/60' : 'hover:ring-white/30'}`}>
                    {isNew && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/50 animate-pulse">
                          <Zap className="h-3 w-3" />
                          NUEVO
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(236,72,153,0.06) 100%)` }} />
                    <div className="relative">
                      {/* Ícono flotante minimalista */}
                      <div className="relative inline-block mb-5 group/icon">
                        {/* Glow de fondo con el color del gradiente */}
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getMainGradient(benefit.lightColor)} opacity-40 blur-xl group-hover:opacity-70 group-hover:blur-2xl transition-all duration-700`} />
                        
                        {/* Ícono directo sin contenedor */}
                        <div className="relative transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                          <benefit.Icon 
                            className={`h-12 w-12 drop-shadow-2xl ${getShadowColor(benefit.lightColor)}`}
                            strokeWidth={1.5}
                            style={{
                              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 0 24px rgba(255,255,255,0.4))',
                              stroke: `url(#${benefit.title.replace(/\s+/g, '-')})`,
                            }}
                          />
                          {/* Gradiente SVG único por ícono */}
                          <svg width="0" height="0" className="absolute">
                            <defs>
                              <linearGradient id={benefit.title.replace(/\s+/g, '-')} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: benefit.lightColor.includes('purple') ? '#a855f7' : benefit.lightColor.includes('cyan') ? '#06b6d4' : benefit.lightColor.includes('indigo') ? '#6366f1' : benefit.lightColor.includes('emerald') ? '#10b981' : benefit.lightColor.includes('orange') ? '#f97316' : benefit.lightColor.includes('pink') ? '#ec4899' : benefit.lightColor.includes('green') ? '#22c55e' : '#94a3b8', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: benefit.lightColor.includes('purple') ? '#d946ef' : benefit.lightColor.includes('cyan') ? '#3b82f6' : benefit.lightColor.includes('indigo') ? '#a855f7' : benefit.lightColor.includes('emerald') ? '#14b8a6' : benefit.lightColor.includes('orange') ? '#f59e0b' : benefit.lightColor.includes('pink') ? '#f43f5e' : benefit.lightColor.includes('green') ? '#10b981' : '#64748b', stopOpacity: 1 }} />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-fuchsia-400 transition-all duration-300">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                </FadeIn>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-10 text-center">
              <div className="card p-8 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 dark:from-purple-500/20 dark:to-fuchsia-500/20">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                  ¿Listo para obtener tu insignia?
                </h3>
                <p className="text-slate-700 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
                  Únete a las empresas verificadas y accede a todos estos beneficios exclusivos sin ningún costo adicional.
                </p>
                <a href="#cta" className="btn-primary inline-flex items-center gap-2">
                  Crear cuenta y verificar
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      </FadeIn>

      {/* Red Coprefid */}
      <FadeIn>
        <section className="section" id="coprefid">
        <div className="container-page">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 ring-1 ring-purple-500/30 dark:ring-purple-400/30 mb-4">
              <span className="text-2xl">🔗</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 inline-flex items-center gap-2">
                EXCLUSIVO PARA EMPRESAS VERIFICADAS
                <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 ring-1 ring-purple-300/30 dark:ring-purple-400/30 shadow-xl shadow-purple-500/60 animate-pulse">
                  <BadgeCheck className="h-[22px] w-[22px] fill-white text-emerald-400 stroke-purple-300 drop-shadow-[0_2px_8px_rgba(52,211,153,0.8)]" />
                </span>
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-fuchsia-600 to-cyan-600 dark:from-purple-600 dark:via-fuchsia-500 dark:to-cyan-500">Red Coprefid</h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-slate-700 dark:text-slate-300">
              Inteligencia Crediticia Colaborativa: La red nacional donde empresas comparten información de créditos para reducir riesgos
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Qué es */}
            <div className="card p-8 mb-6 bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-purple-900/20 dark:to-cyan-900/20 ring-2 ring-purple-200 dark:ring-purple-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">¿Qué es la Red Coprefid?</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Una red nacional donde empresas registradas pueden <span className="font-semibold text-purple-600 dark:text-purple-400">publicar y consultar créditos otorgados</span>. 
                Detecta sobreendeudamiento o historial riesgoso invisible para otras fuentes. Acceso exclusivo para <span className="inline-flex items-center gap-1.5">empresas verificadas <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 ring-1 ring-purple-400/30 shadow-lg shadow-purple-500/50">
                  <BadgeCheck className="h-[18px] w-[18px] fill-white text-emerald-400 stroke-purple-300 drop-shadow-[0_2px_8px_rgba(52,211,153,0.8)]" />
                </span></span> en Prismal AI.
              </p>
            </div>

            {/* Beneficios */}
            <div className="grid gap-5 md:grid-cols-2 mb-6">
              {[
                { 
                  Icon: FileCheck, 
                  title: 'Publica Gratuitamente', 
                  desc: 'Registra tus créditos activos o morosos sin costo adicional',
                  lightColor: 'from-blue-100 to-cyan-100',
                  darkColor: 'from-blue-500/20 to-cyan-500/10'
                },
                { 
                  Icon: Search, 
                  title: 'Consulta en Tiempo Real', 
                  desc: 'Verifica si un RUT tiene créditos reportados por otras empresas',
                  lightColor: 'from-purple-100 to-fuchsia-100',
                  darkColor: 'from-purple-500/20 to-fuchsia-500/10'
                },
                { 
                  Icon: AlertTriangle, 
                  title: 'Detecta Sobreendeudamiento', 
                  desc: 'Identifica riesgos ocultos antes de otorgar crédito',
                  lightColor: 'from-orange-100 to-red-100',
                  darkColor: 'from-orange-500/20 to-red-500/10'
                },
                { 
                  Icon: Handshake, 
                  title: 'Red Colaborativa', 
                  desc: (
                    <span className="inline-flex items-center gap-1.5">
                      Información real compartida entre empresas verificadas
                      <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 ring-1 ring-purple-400/30 shadow-md shadow-purple-500/40">
                        <BadgeCheck className="h-[14px] w-[14px] fill-white text-emerald-400 stroke-purple-300 drop-shadow-[0_1px_4px_rgba(52,211,153,0.8)]" />
                      </span>
                    </span>
                  ),
                  lightColor: 'from-emerald-100 to-teal-100',
                  darkColor: 'from-emerald-500/20 to-teal-500/10'
                },
              ].map((benefit) => (
                <div key={benefit.title} className="card p-6">
                  {/* Ícono flotante minimalista */}
                  <div className="relative inline-block mb-3 group/icon">
                    {/* Glow de fondo */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${benefit.lightColor.replace('100', '500')} opacity-40 blur-xl group-hover:opacity-70 group-hover:blur-2xl transition-all duration-700`} />
                    
                    {/* Ícono directo */}
                    <div className="relative transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                      <benefit.Icon 
                        className="h-10 w-10 drop-shadow-2xl"
                        strokeWidth={1.5}
                        style={{
                          filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 0 24px rgba(255,255,255,0.4))',
                          stroke: `url(#coprefid-${benefit.title.replace(/\s+/g, '-')})`,
                        }}
                      />
                      <svg width="0" height="0" className="absolute">
                        <defs>
                          <linearGradient id={`coprefid-${benefit.title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: benefit.lightColor.includes('blue') ? '#3b82f6' : benefit.lightColor.includes('purple') ? '#a855f7' : benefit.lightColor.includes('orange') ? '#f97316' : '#10b981', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: benefit.lightColor.includes('blue') ? '#06b6d4' : benefit.lightColor.includes('purple') ? '#d946ef' : benefit.lightColor.includes('orange') ? '#dc2626' : '#14b8a6', stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{benefit.title}</h4>
                  <div className="text-sm text-slate-700 dark:text-slate-300">{benefit.desc}</div>
                </div>
              ))}
            </div>

            {/* Impacto */}
            <div className="card p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 border-l-4 border-emerald-500">
              <div className="flex items-start gap-4">
                {/* Ícono flotante minimalista */}
                <div className="relative inline-block flex-shrink-0 group/icon">
                  {/* Glow de fondo */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 opacity-40 blur-xl group-hover:opacity-70 group-hover:blur-2xl transition-all duration-700" />
                  
                  {/* Ícono directo */}
                  <div className="relative transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                    <Lightbulb 
                      className="h-10 w-10 drop-shadow-2xl"
                      strokeWidth={1.5}
                      style={{
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 0 24px rgba(255,255,255,0.4))',
                        stroke: 'url(#lightbulb-gradient)',
                      }}
                    />
                    <svg width="0" height="0" className="absolute">
                      <defs>
                        <linearGradient id="lightbulb-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#14b8a6', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">Impacto en tu Negocio</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    Mejora la toma de decisiones con información real y compartida. <span className="font-semibold">Reduce el riesgo de impagos</span> al saber si un cliente ya tiene otros compromisos financieros que no aparecen en fuentes tradicionales.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Gratuito y sin planes requeridos</span> • Solo para <span className="inline-flex items-center gap-1.5">empresas verificadas <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 ring-1 ring-purple-400/30 shadow-lg shadow-purple-500/50">
                  <BadgeCheck className="h-[18px] w-[18px] fill-white text-emerald-400 stroke-purple-300 drop-shadow-[0_2px_8px_rgba(52,211,153,0.8)]" />
                </span></span>
              </p>
            </div>
          </div>
        </div>
      </section>
      </FadeIn>

      {/* Beneficios */}
      <FadeIn>
        <section id="benefits" className="section">
        <div className="container-page">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Visualiza tu cartera</h2>
          <div className="mx-auto mt-6 grid max-w-5xl gap-6 md:grid-cols-2">
            <div className="card p-6">
              <div className="font-semibold text-slate-900 dark:text-slate-100">Control total de tu riesgo</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>Dashboards con historial de consultas</li>
                <li>Seguimiento del estado de tus clientes</li>
                <li>Registro de créditos otorgados</li>
                <li>Estados de cobranza y avisos automáticos</li>
              </ul>
            </div>
            <div className="card p-6">
              <div className="font-semibold text-slate-900 dark:text-slate-100">Todo en un solo lugar</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>Evaluación con IA integrada</li>
                <li>Informes comerciales y tributarios</li>
                <li>Políticas y hard stops aplicados</li>
                <li>Seguimiento de cartera con alertas</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      </FadeIn>

      {/* Pricing mejorado */}
      <FadeIn>
        <section id="pricing" className="section">
        <div className="container-page text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Planes y Precios</h2>
          <p className="text-slate-700 dark:text-slate-300 mx-auto mt-3 max-w-2xl">
            Ofrecemos planes escalables desde 10 consultas al mes. Contrata online con Webpay o solicita precios.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <a href="#ver-planes" className="btn-secondary">Ver planes</a>
            <a href="#demo" className="btn-primary">Pide una demo</a>
          </div>
        </div>
      </section>
      </FadeIn>

      {/* Trust & Seguridad */}
      <FadeIn>
        <section className="section">
        <div className="container-page">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100">Confianza y seguridad</h2>
            <p className="text-slate-700 dark:text-slate-300 mx-auto mt-4 max-w-2xl text-sm md:text-base">
              Infraestructura empresarial en Google Cloud con los más altos estándares de protección
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { t: 'Cifrado extremo a extremo', d: 'Protección total de datos sensibles con encriptación de grado empresarial.', Icon: Lock, lightColor: 'from-emerald-100 to-teal-100', darkColor: 'from-emerald-500/30 to-teal-500/20' },
              { t: 'Google Cloud Infrastructure', d: 'Infraestructura escalable y confiable con 99.9% de disponibilidad garantizada.', Icon: Cloud, lightColor: 'from-cyan-100 to-blue-100', darkColor: 'from-cyan-500/30 to-blue-500/20' },
              { t: 'Cumplimiento normativo', d: 'Adherencia a estándares internacionales de seguridad y privacidad de datos.', Icon: Shield, lightColor: 'from-teal-100 to-emerald-100', darkColor: 'from-teal-500/30 to-emerald-500/20' },
            ].map((i) => (
              <div key={i.t} className="group relative card p-5 sm:p-6 text-center transition-all duration-300 hover:scale-[1.02] hover:ring-white/30 cursor-pointer">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(6,182,212,0.06) 100%)` }} />
                <div className="relative">
                  {/* Ícono flotante minimalista */}
                  <div className="relative inline-block mb-4 group/icon">
                    {/* Glow de fondo */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${i.lightColor.replace('100', '500')} opacity-40 blur-xl group-hover:opacity-70 group-hover:blur-2xl transition-all duration-700`} />
                    
                    {/* Ícono directo */}
                    <div className="relative transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                      <i.Icon 
                        className="h-10 w-10 drop-shadow-2xl"
                        strokeWidth={1.5}
                        style={{
                          filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 0 24px rgba(255,255,255,0.4))',
                          stroke: `url(#security-${i.t.replace(/\s+/g, '-')})`,
                        }}
                      />
                      <svg width="0" height="0" className="absolute">
                        <defs>
                          <linearGradient id={`security-${i.t.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: i.lightColor.includes('emerald') ? '#10b981' : i.lightColor.includes('cyan') ? '#06b6d4' : '#14b8a6', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: i.lightColor.includes('emerald') ? '#14b8a6' : i.lightColor.includes('cyan') ? '#3b82f6' : '#10b981', stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-cyan-400 transition-all duration-300">
                    {i.t}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{i.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </FadeIn>

      {/* CTA final */}
      <FadeIn>
        <section id="cta" className="section py-20 md:py-28">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-100 via-fuchsia-100 to-cyan-100 dark:from-purple-600/10 dark:via-fuchsia-600/10 dark:to-cyan-600/10 p-8 sm:p-12 md:p-16 ring-1 ring-purple-200/50 dark:ring-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 via-fuchsia-100/20 to-cyan-200/30 dark:from-purple-500/5 dark:via-transparent dark:to-cyan-500/5" />
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 ring-1 ring-purple-300/40 dark:bg-white/10 dark:ring-white/20 text-xs sm:text-sm font-medium text-purple-900 dark:text-slate-200 mb-6">
                <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>+50 empresas ya confían en Prismal AI</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Transforma tu gestión de riesgo
                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-fuchsia-700 to-cyan-700 dark:from-purple-400 dark:via-fuchsia-400 dark:to-cyan-400">
                  con IA en segundos
                </span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                Únete a las empresas que están revolucionando su evaluación crediticia.
                Análisis inteligente, decisiones más rápidas, riesgo bajo control.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="#" className="group relative btn-primary px-8 py-4 text-base sm:text-lg font-bold shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
                  <span className="relative z-10">Empieza gratis ahora</span>
                  <svg className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </a>
                <a href="#" className="btn-secondary px-8 py-4 text-base sm:text-lg font-semibold ring-2 ring-slate-300 hover:ring-slate-400 dark:ring-white/20 dark:hover:ring-white/40 backdrop-blur-sm">
                  Ver demo en vivo
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>1 consulta gratis incluida</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Configuración en 5 minutos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </FadeIn>

      <Footer />
    </main>
      </div>
    </>
  );
}
