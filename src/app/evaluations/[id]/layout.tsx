"use client";
import React from 'react';

export default function EvaluationDetailLayout({ children }: { children: React.ReactNode }) {
  // The parent app/evaluations/layout.tsx handles navbar and container for both list and detail.
  // Render only children here to avoid double wrappers/borders.
  return <>{children}</>;
}
