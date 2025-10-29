"use client";
import { useState, useEffect } from 'react';
import { apiPost } from '@/lib/api';

type ResumenIA = {
  executive_summary: string;
  key_highlights: string[];
  key_considerations: string[];
  risk_indicators?: {
    level: 'bajo' | 'medio' | 'alto';
    factors?: string[];
  };
  generated_at?: string;
};

type Props = {
  reportId: string;
  registroId: string;
  detalleEscritura: string;
  resumenExistente?: ResumenIA | null;
  onResumenGenerado?: (resumen: ResumenIA) => void;
  onLoadingChange?: (loading: boolean) => void;
};

export default function EscrituraAIResumen({ reportId, registroId, detalleEscritura, resumenExistente, onResumenGenerado, onLoadingChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumen, setResumen] = useState<ResumenIA | null>(resumenExistente || null);
  const [mostrarResumen, setMostrarResumen] = useState(true);

  // Actualizar resumen si cambia resumenExistente (cuando se carga desde backend)
  useEffect(() => {
    if (resumenExistente && !resumen) {
      setResumen(resumenExistente);
    }
  }, [resumenExistente, resumen]);

  const generarResumen = async () => {
    if (!detalleEscritura || detalleEscritura.length < 50) {
      setError('El texto es demasiado corto para generar un resumen');
      return;
    }

    setLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    setError(null);

    try {
      const response = await apiPost<{ ok: boolean; data: { resumen: ResumenIA; generated_at: string } }>(
        `/api/datainsight/${reportId}/resumir-escritura`,
        { registroId, detalleEscritura }
      );

      if (response?.data?.resumen) {
        const nuevoResumen = {
          ...response.data.resumen,
          generated_at: response.data.generated_at,
        };
        setResumen(nuevoResumen);
        if (onResumenGenerado) {
          onResumenGenerado(nuevoResumen);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Error al generar resumen');
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  const getNivelRiesgoColor = (nivel?: string) => {
    switch (nivel) {
      case 'bajo':
        return 'text-cyan-600 dark:text-cyan-400';
      case 'medio':
        return 'text-purple-600 dark:text-purple-400';
      case 'alto':
        return 'text-fuchsia-600 dark:text-fuchsia-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getNivelRiesgoBg = (nivel?: string) => {
    switch (nivel) {
      case 'bajo':
        return 'bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-700';
      case 'medio':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700';
      case 'alto':
        return 'bg-fuchsia-50 border-fuchsia-200 dark:bg-fuchsia-900/20 dark:border-fuchsia-700';
      default:
        return 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-3">
      {/* Botón de generar resumen */}
      {!resumen && (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={generarResumen}
            disabled={loading}
            className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analizando con IA...</span>
              </>
            ) : (
              <>
                {/* Ícono de IA futurista */}
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="1.5" fill="currentColor" />
                </svg>
                <span>Resumir con IA</span>
              </>
            )}
            {!loading && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-cyan-400 opacity-0 group-hover:opacity-30 blur transition-opacity" />
            )}
          </button>
        </div>
      )}

      {/* Efecto Aurora Boreal mientras carga */}
      {loading && (
        <div className="relative overflow-hidden rounded-2xl border border-purple-300 bg-gradient-to-br from-purple-50 via-cyan-50 to-fuchsia-50 p-6 dark:border-purple-700 dark:from-purple-900/30 dark:via-cyan-900/30 dark:to-fuchsia-900/30">
          <div className="aurora-effect absolute inset-0 opacity-50" />
          <div className="relative z-10 flex items-center justify-center gap-3 text-center">
            <svg className="animate-spin h-6 w-6 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Analizando escritura con IA</p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Procesando información relevante para riesgo crediticio...</p>
            </div>
          </div>
          <style jsx>{`
            @keyframes aurora {
              0%, 100% { transform: translateX(-50%) translateY(-50%) rotate(0deg); }
              25% { transform: translateX(-45%) translateY(-48%) rotate(90deg); }
              50% { transform: translateX(-50%) translateY(-52%) rotate(180deg); }
              75% { transform: translateX(-55%) translateY(-48%) rotate(270deg); }
            }
            .aurora-effect {
              background: linear-gradient(135deg, 
                rgba(168, 85, 247, 0.4) 0%,
                rgba(6, 182, 212, 0.4) 25%,
                rgba(217, 70, 239, 0.4) 50%,
                rgba(99, 102, 241, 0.3) 75%,
                rgba(168, 85, 247, 0.4) 100%
              );
              background-size: 200% 200%;
              animation: aurora 8s ease-in-out infinite;
              filter: blur(40px);
            }
          `}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Resumen generado */}
      {resumen && mostrarResumen && (
        <div className={`rounded-2xl border-2 ${getNivelRiesgoBg(resumen.risk_indicators?.level)} p-5 shadow-sm transition-all`}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Análisis con IA</h3>
            </div>
            <button
              onClick={() => setMostrarResumen(false)}
              className="rounded-lg p-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Ocultar sugerencia"
            >
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Resumen ejecutivo */}
          <div className="mb-4">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{resumen.executive_summary}</p>
          </div>

          {/* Indicadores de riesgo */}
          {resumen.risk_indicators && (
            <div className="mb-4 rounded-xl border bg-white/50 p-3 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">Nivel de riesgo</span>
              </div>
              <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${getNivelRiesgoColor(resumen.risk_indicators.level)}`}>
                {resumen.risk_indicators.level.toUpperCase()}
              </div>
              {resumen.risk_indicators.factors && resumen.risk_indicators.factors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {resumen.risk_indicators.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">•</span>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Grid de puntos clave */}
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Puntos a destacar */}
            <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-3 dark:border-cyan-700 dark:bg-cyan-900/20">
              <div className="mb-2 flex items-center gap-2">
                <svg className="h-4 w-4 text-cyan-600 dark:text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h4 className="text-xs font-semibold text-cyan-800 dark:text-cyan-300">Puntos a destacar</h4>
              </div>
              <ul className="space-y-1.5">
                {resumen.key_highlights.map((punto, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-cyan-700 dark:text-cyan-200">
                    <span className="text-cyan-500 dark:text-cyan-400">✓</span>
                    <span className="flex-1">{punto}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Puntos a considerar */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3 dark:border-purple-700 dark:bg-purple-900/20">
              <div className="mb-2 flex items-center gap-2">
                <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h4 className="text-xs font-semibold text-purple-800 dark:text-purple-300">Puntos a considerar</h4>
              </div>
              <ul className="space-y-1.5">
                {resumen.key_considerations.map((punto, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-purple-700 dark:text-purple-200">
                    <span className="text-purple-500 dark:text-purple-400">⚠</span>
                    <span className="flex-1">{punto}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Timestamp */}
          {resumen.generated_at && (
            <div className="mt-3 text-right text-xs text-slate-500 dark:text-slate-400">
              Generado el {new Date(resumen.generated_at).toLocaleString('es-CL')}
            </div>
          )}
        </div>
      )}

      {/* Botón para volver a mostrar si está oculto */}
      {resumen && !mostrarResumen && (
        <div className="flex justify-end">
          <button
            onClick={() => setMostrarResumen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Mostrar análisis con IA
          </button>
        </div>
      )}
    </div>
  );
}
