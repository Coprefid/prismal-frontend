'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState<'black' | 'background' | 'text-in' | 'text-out' | 'done'>('black');

  useEffect(() => {
    // Timeline de animaciones (5 segundos total)
    const timeline = [
      { delay: 0, stage: 'black' },        // 0-0.5s: Pantalla negra
      { delay: 500, stage: 'background' }, // 0.5-2s: Fondo aparece (más lento)
      { delay: 2000, stage: 'text-in' },   // 2-3.5s: Texto fade in y permanece
      { delay: 3500, stage: 'text-out' },  // 3.5-5s: Texto fade out (más lento)
      { delay: 5000, stage: 'done' },      // 5s: Finaliza
    ];

    const timeouts = timeline.map(({ delay, stage }) =>
      setTimeout(() => setStage(stage as any), delay)
    );

    // Llamar a onComplete cuando termine
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  if (stage === 'done') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Pantalla negra base */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${
          stage === 'black' ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Fondo con efecto nebula giratorio - aparece después de la pantalla negra */}
      <div 
        className={`absolute inset-0 bg-slate-950 transition-opacity ${
          stage === 'background' || stage === 'text-in' 
            ? 'opacity-100 duration-[1500ms]' 
            : stage === 'text-out'
            ? 'opacity-0 duration-[2000ms]'
            : 'opacity-0 duration-[1500ms]'
        }`}
      >
        {/* Efecto nebula giratorio */}
        <div className="splash-nebula" />
        
        {/* Gradientes de fondo adicionales para más profundidad */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-fuchsia-500/15 rounded-full blur-[140px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      {/* Logo y texto Prismal AI con gradiente animado */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`relative transition-all ${
            stage === 'text-in' 
              ? 'opacity-100 scale-100 duration-[1500ms]' 
              : stage === 'text-out'
              ? 'opacity-0 scale-95 duration-[2000ms]'
              : 'opacity-0 scale-90 duration-[1500ms]'
          }`}
        >
          {/* Glow detrás del logo y texto */}
          <div className="absolute inset-0 blur-3xl opacity-60">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] lg:w-[100px] lg:h-[100px]">
                <Image 
                  src="/isotipo.png" 
                  alt="Prismal AI" 
                  width={100}
                  height={100}
                  className="w-full h-full"
                />
              </div>
              <div className="text-[60px] md:text-[80px] lg:text-[100px] font-bold tracking-tight">
                <span className="bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Prismal AI
                </span>
              </div>
            </div>
          </div>
          
          {/* Logo y texto principal con gradiente animado */}
          <div className="relative flex items-center gap-4 md:gap-6">
            <div className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] lg:w-[100px] lg:h-[100px]">
              <Image 
                src="/isotipo.png" 
                alt="Prismal AI" 
                width={100}
                height={100}
                className="w-full h-full"
              />
            </div>
            <div className="text-[60px] md:text-[80px] lg:text-[100px] font-bold tracking-tight leading-none">
              <span className="animated-gradient-text">
                Prismal AI
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos inline para las animaciones */}
      <style jsx>{`
        @keyframes splash-nebula-rotate {
          0%, 100% { 
            transform: translate(0%, 0%) scale(1) rotate(0deg); 
            opacity: 0.7; 
          }
          25% { 
            transform: translate(-3%, -2%) scale(1.08) rotate(90deg); 
            opacity: 0.9; 
          }
          50% { 
            transform: translate(3%, 1%) scale(0.95) rotate(180deg); 
            opacity: 0.8; 
          }
          75% { 
            transform: translate(-1%, 3%) scale(1.05) rotate(270deg); 
            opacity: 0.95; 
          }
        }

        .splash-nebula {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 30%, rgba(168,85,247,0.35) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(6,182,212,0.30) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(217,70,239,0.28) 0%, transparent 60%),
            radial-gradient(ellipse at 30% 80%, rgba(99,102,241,0.25) 0%, transparent 50%);
          filter: blur(80px);
          animation: splash-nebula-rotate 8s ease-in-out infinite;
          mix-blend-mode: normal;
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animated-gradient-text {
          background: linear-gradient(
            90deg,
            #9333ea 0%,
            #06b6d4 50%,
            #9333ea 100%
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 3s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
