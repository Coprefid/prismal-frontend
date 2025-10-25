import React from 'react';

export default function PrismalCrystalBG() {
  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none select-none z-0 opacity-80 dark:opacity-95"
      viewBox="0 0 1200 800"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="gp1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="gp2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="50%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Large facets (shifted center/right) */}
      <polygon points="200,80 520,20 760,140 660,380 360,340" fill="url(#gp1)" stroke="url(#strokeGrad)" strokeWidth="1.2" opacity="0.5" filter="url(#glow)" />
      <polygon points="820,40 1200,20 1100,280 820,220" fill="url(#gp2)" stroke="url(#strokeGrad)" strokeWidth="1.2" opacity="0.42" filter="url(#glow)" />
      <polygon points="520,460 900,400 820,760 480,700" fill="url(#gp1)" stroke="url(#strokeGrad)" strokeWidth="1.2" opacity="0.46" filter="url(#glow)" />
      <polygon points="680,330 1140,520 980,800 620,720" fill="url(#gp2)" stroke="url(#strokeGrad)" strokeWidth="1.2" opacity="0.4" filter="url(#glow)" />
      <polygon points="940,220 1180,160 1120,460 900,420" fill="url(#gp1)" stroke="url(#strokeGrad)" strokeWidth="1.2" opacity="0.38" filter="url(#glow)" />

      {/* Medium facets (more towards right/center) */}
      <polygon points="360,180 620,120 580,310 360,270" fill="url(#gp2)" stroke="url(#strokeGrad)" strokeWidth="1" opacity="0.46" filter="url(#glow)" />
      <polygon points="680,150 920,110 860,300 640,260" fill="url(#gp1)" stroke="url(#strokeGrad)" strokeWidth="1" opacity="0.42" filter="url(#glow)" />
      <polygon points="300,380 580,340 520,560 280,510" fill="url(#gp1)" stroke="url(#strokeGrad)" strokeWidth="1" opacity="0.38" filter="url(#glow)" />
      <polygon points="720,430 1020,370 960,590 680,550" fill="url(#gp2)" stroke="url(#strokeGrad)" strokeWidth="1" opacity="0.44" filter="url(#glow)" />
      <polygon points="880,280 1060,260 1020,420 860,400" fill="url(#gp1)" stroke="url(#strokeGrad)" strokeWidth="1" opacity="0.42" filter="url(#glow)" />
      <polygon points="540,600 760,560 700,720 520,700" fill="url(#gp2)" stroke="url(#strokeGrad)" strokeWidth="1" opacity="0.4" filter="url(#glow)" />

      {/* Small fragments (denser right) */}
      <polygon points="520,220 620,200 600,280 500,260" fill="url(#gp1)" stroke="url(#strokeGrad)" strokeWidth="0.8" opacity="0.36" filter="url(#glow)" />
      <polygon points="1040,260 1160,240 1130,320 1010,300" fill="url(#gp2)" stroke="url(#strokeGrad)" strokeWidth="0.8" opacity="0.34" filter="url(#glow)" />
      <polygon points="660,640 820,620 790,720 640,690" fill="url(#gp1)" stroke="url(#strokeGrad)" strokeWidth="0.8" opacity="0.34" filter="url(#glow)" />
      <polygon points="900,680 1040,650 1010,750 880,720" fill="url(#gp2)" stroke="url(#strokeGrad)" strokeWidth="0.8" opacity="0.36" filter="url(#glow)" />
      <polygon points="740,360 800,350 790,390 730,380" fill="url(#gp1)" stroke="url(#strokeGrad)" strokeWidth="0.8" opacity="0.34" filter="url(#glow)" />
      <polygon points="950,500 1010,490 1000,530 940,520" fill="url(#gp2)" stroke="url(#strokeGrad)" strokeWidth="0.8" opacity="0.34" filter="url(#glow)" />
    </svg>
  );
}
