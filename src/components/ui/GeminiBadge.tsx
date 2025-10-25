import React from 'react';

interface GeminiBadgeProps {
  className?: string;
  minimal?: boolean; // minimal: smaller, subtle text
}

/**
 * GeminiBadge: Inline SVG badge "Powered by Gemini" with brand-like gradient.
 * - No external images or links.
 * - Works on light/dark backgrounds.
 */
export default function GeminiBadge({ className = '', minimal = false }: GeminiBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:ring-slate-700 ${className}`}
      aria-label="Powered by Gemini AI"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={minimal ? 14 : 16}
        height={minimal ? 14 : 16}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED"/>
            <stop offset="50%" stopColor="#2563EB"/>
            <stop offset="100%" stopColor="#06B6D4"/>
          </linearGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Stylized dual-orb motif reminiscent of Gemini, not an official mark */}
        <g fill="url(#geminiGrad)" filter="url(#softGlow)">
          <circle cx="9" cy="9" r="5" fillOpacity="0.9" />
          <circle cx="15" cy="15" r="5" fillOpacity="0.9" />
        </g>
      </svg>
      <span className={minimal ? 'text-[11px]' : ''}>
        {minimal ? 'Powered by Gemini' : 'Potenciado por Gemini AI'}
      </span>
    </span>
  );
}
