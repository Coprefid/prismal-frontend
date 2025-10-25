"use client";
import { useState } from 'react';
import InfoTooltip from '@/components/ui/InfoTooltip';
import MultiChipsSelect, { type Option } from '@/components/ui/MultiChipsSelect';
import MacroHelpModal from '@/components/policy/MacroHelpModal';
import NumericInput from '@/components/ui/NumericInput';

export type MacroWeights = {
  inflation: number;
  inflation_accumulated: number;
  fx: number;
  uf: number;
  tpm: number;
  pib: number;
  unemployment: number;
  commodities: number;
};

export const MACRO_DESCRIPTIONS: Record<keyof MacroWeights, string> = {
  inflation: 'Inflación: variación de precios. Afecta poder adquisitivo y costos.',
  inflation_accumulated: 'Inflación acumulada 12m: presión inflacionaria anual.',
  fx: 'Tipo de cambio: sensibilidad a moneda extranjera.',
  uf: 'UF: indexación de contratos y deuda.',
  tpm: 'TPM: costo del dinero, impacto en financiamiento.',
  pib: 'PIB: ciclo económico general, demanda agregada.',
  unemployment: 'Desempleo: salud del mercado laboral.',
  commodities: 'Commodities: insumos y precios internacionales (elige cuáles observar).',
};

export default function PolicyMacroForm({
  value,
  globalWeight,
  omit,
  penalties,
  thresholds,
  countries,
  fxCurrencies,
  commodityItems,
  onChange,
  onChangeGlobal,
  onChangeOmit,
  onChangePenalty,
  onChangeThreshold,
  onChangeCountries,
  onChangeFxCurrencies,
  onChangeCommodityItems,
}: {
  value: MacroWeights;
  globalWeight: number;
  omit: Record<string, boolean>;
  penalties: Record<string, { warnPenaltyPct: number; riskPenaltyPct: number }>;
  thresholds: Record<string, { warn: number; risk: number; unit: string; frequency?: 'daily' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' }>;
  countries: string[];
  fxCurrencies: string[];
  commodityItems: string[];
  onChange: (next: Partial<MacroWeights>) => void;
  onChangeGlobal: (w: number) => void;
  onChangeOmit: (key: string, checked: boolean) => void;
  onChangePenalty: (key: string, p: { warnPenaltyPct?: number; riskPenaltyPct?: number }) => void;
  onChangeThreshold: (key: string, t: { warn?: number; risk?: number; unit?: string; frequency?: 'daily' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' }) => void;
  onChangeCountries: (next: string[]) => void;
  onChangeFxCurrencies: (next: string[]) => void;
  onChangeCommodityItems: (next: string[]) => void;
}) {
  const [helpOpen, setHelpOpen] = useState(false);
  const countryOptions: Option[] = [
    { value: 'CL', label: 'Chile' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'EU', label: 'Zona Euro' },
    { value: 'CN', label: 'China' },
    { value: 'BR', label: 'Brasil' },
    { value: 'PE', label: 'Perú' },
    { value: 'AR', label: 'Argentina' },
    { value: 'MX', label: 'México' },
  ];
  const fxOptions: Option[] = [
    { value: 'USD', label: 'USD/CLP' },
    { value: 'EUR', label: 'EUR/CLP' },
    { value: 'CNY', label: 'CNY/CLP' },
    { value: 'BRL', label: 'BRL/CLP' },
  ];
  const commodityOptions: Option[] = [
    { value: 'COPPER', label: 'Cobre' },
    { value: 'OIL', label: 'Petróleo' },
    { value: 'GOLD', label: 'Oro' },
    { value: 'WHEAT', label: 'Trigo' },
    { value: 'SOY', label: 'Soya' },
  ];

  // Observabilidad/frecuencia coherente por indicador
  const freqOptionsByKey: Record<string, Array<'daily' | 'monthly' | 'quarterly' | 'semiannual' | 'annual'>> = {
    inflation: ['monthly'],
    inflation_accumulated: ['annual'],
    fx: ['daily', 'monthly', 'semiannual'],
    uf: ['daily', 'monthly'],
    tpm: ['monthly', 'semiannual'],
    pib: ['quarterly', 'annual'],
    unemployment: ['quarterly'],
    commodities: ['daily', 'monthly', 'semiannual'],
  };

  const freqLabel: Record<string, string> = {
    daily: 'Diaria',
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    semiannual: 'Semestral (6 meses)',
    annual: 'Anual',
  } as const;

  // Total ponderación (solo indicadores incluidos)
  const totalPct = Math.round(((Object.entries(value).reduce((acc, [k, v]) => acc + (omit[k] ? 0 : (v || 0)), 0)) * 100 + Number.EPSILON) * 100) / 100;
  const totalPctDisplay = Number.isFinite(totalPct) ? totalPct : 0;
  const over = totalPctDisplay > 100;

  return (
    <div className="space-y-6">
      <div className="card p-6 space-y-4">
        <div className="font-semibold flex items-center">
          Política macroeconómica
          <InfoTooltip title="¿Qué es?">{`Conjunto de variables macro que afectan transversalmente el riesgo.
Cada indicador tiene:
• Ponderación óptima (en %)
• Umbrales Warn/Risk (valor y unidad)
• Penalización cuando cae en Warn o Risk (reducción del porcentaje de la ponderación).
Ejemplo Inflación: ponderación 15% — Warn 8% (−30% de la ponderación) — Risk 10% (−100% de la ponderación).`}</InfoTooltip>
          <button type="button" className="ml-auto rounded-full border px-3 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" onClick={()=>setHelpOpen(true)}>Ver guía</button>
        </div>
        <div className="hint">Valores sugeridos. La suma de ponderaciones puede ser 100%. Puedes omitir indicadores para no considerarlos.</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Países observados</label>
            <MultiChipsSelect options={countryOptions} value={countries} onChange={onChangeCountries} placeholder="Selecciona países (por defecto Chile)" />
          </div>
          <div>
            <label className="label">Divisas a observar</label>
            <MultiChipsSelect options={fxOptions} value={fxCurrencies} onChange={onChangeFxCurrencies} placeholder="Ej.: USD/CLP, EUR/CLP" />
          </div>
          <div>
            <label className="label">Commodities a observar</label>
            <MultiChipsSelect options={commodityOptions} value={commodityItems} onChange={onChangeCommodityItems} placeholder="Ej.: Cobre, Petróleo" />
          </div>
          <div className="grid grid-cols-2 items-center gap-2">
            <label className="label flex items-center">Ponderación global de macro en el score total
              <InfoTooltip title="Ponderación global de macro">
{`Este porcentaje define la importancia total de la política macroeconómica sobre el score final de cada evaluación.
Si defines 5%, el aporte combinado de los indicadores macro al score total será 5%.
La distribución interna entre indicadores se hace según las ponderaciones individuales de cada indicador.`}
              </InfoTooltip>
            </label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                className="input"
                inputMode="decimal"
                value={Number.isFinite(globalWeight) ? Math.round((globalWeight * 100 + Number.EPSILON) * 100) / 100 : 0}
                onChange={(e) => {
                  const pct = Number(e.target.value);
                  onChangeGlobal(Number.isFinite(pct) ? pct / 100 : 0);
                }}
              />
              <div className="input flex items-center justify-center text-slate-500">%</div>
            </div>
          </div>
          {/* Total de ponderaciones de indicadores macro */}
          <div className="md:col-span-2">
            <label className="label">Total ponderaciones (macro)</label>
            <div className={`rounded-xl border p-2 ${over ? 'border-rose-300 bg-rose-50/40 dark:border-rose-400/60 dark:bg-rose-900/20' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span>{totalPctDisplay}%</span>
                <span>100%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className={`${over ? 'bg-rose-400' : 'bg-gradient-to-r from-logo-start via-logo-mid to-logo-end'} h-full`} style={{ width: `${Math.min(totalPctDisplay, 100)}%` }} />
              </div>
              {over && <div className="mt-1 text-xs text-rose-400">Supera 100%. Ajusta alguna ponderación.</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <button
          type="button"
          className={`btn-secondary text-xs ${Object.values(omit).every(Boolean) ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => {
            const next = !Object.values(omit).every(Boolean);
            (Object.keys(value) as Array<keyof MacroWeights>).forEach(k=>onChangeOmit(k, next));
          }}
        >{Object.values(omit).every(Boolean) ? 'Incluir todos' : 'Omitir todos los indicadores macro'}</button>

        <div className="space-y-6">
          {Object.entries(value).map(([k, v]) => {
            const freqOpts = freqOptionsByKey[k] || ['monthly'];
            const hasSelect = freqOpts.length > 1;
            const currentFreq = thresholds[k]?.frequency || freqOpts[0];
            return (
            <div key={k} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 capitalize">{k.replace('_',' ')}</div>
                  <InfoTooltip title={`Indicador: ${k}`}>{MACRO_DESCRIPTIONS[k as keyof MacroWeights]}</InfoTooltip>
                </div>
                <button type="button" className={`rounded-full px-3 py-1 text-xs ${omit[k] ? 'bg-slate-700 text-white' : 'bg-slate-200 dark:bg-slate-800'}`} onClick={()=>onChangeOmit(k, !omit[k])}>{omit[k] ? 'Omitido' : 'Incluido'}</button>
              </div>

              {/* Row 1: Ponderación + Observabilidad */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="label">Ponderación (%)</label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input
                      className="input"
                      inputMode="decimal"
                      value={Number.isFinite(v) ? Math.round(((v || 0) * 100 + Number.EPSILON) * 100) / 100 : 0}
                      onChange={(e) => {
                        const pct = Number(e.target.value);
                        const desired = Number.isFinite(pct) ? Math.max(0, pct) / 100 : 0;
                        // Cap so total does not exceed 1.0
                        const others = (Object.entries(value) as Array<[string, number]>).reduce((acc, [kk, vv]) => acc + (kk===k || omit[kk] ? 0 : (vv || 0)), 0);
                        const maxForThis = Math.max(0, 1 - others);
                        const capped = Math.min(desired, maxForThis);
                        onChange({ [k]: capped } as Partial<MacroWeights>);
                      }}
                      disabled={omit[k]}
                    />
                    <div className="input flex items-center justify-center text-slate-500">%</div>
                  </div>
                </div>
                <div>
                  <label className="label">Observabilidad</label>
                  {hasSelect ? (
                    <select className="input" value={currentFreq} onChange={(e)=>onChangeThreshold(k, { frequency: e.target.value as any })} disabled={omit[k]}>
                      {freqOpts.map(op => <option key={op} value={op}>{freqLabel[op]}</option>)}
                    </select>
                  ) : (
                    <div className="input flex items-center text-slate-500">{freqLabel[currentFreq]}</div>
                  )}
                </div>
                <div className="hidden md:block" />
              </div>

              {/* Row 2: Warn/Risk + Penalización */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="label font-semibold !text-amber-600">Warn (variación %)</label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <NumericInput
                      className="input ring-amber-400 focus:ring-amber-500"
                      value={thresholds[k]?.warn ?? 0}
                      onCommit={(n)=>onChangeThreshold(k, { warn: (n ?? 0) })}
                      disabled={omit[k]}
                      allowNegative
                      allowDecimal
                      acceptComma
                    />
                    <div className="input flex items-center justify-center text-slate-500">%</div>
                  </div>
                </div>
                <div>
                  <label className="label font-semibold !text-rose-600">Risk (variación %)</label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <NumericInput
                      className="input ring-rose-400 focus:ring-rose-500"
                      value={thresholds[k]?.risk ?? 0}
                      onCommit={(n)=>onChangeThreshold(k, { risk: (n ?? 0) })}
                      disabled={omit[k]}
                      allowNegative
                      allowDecimal
                      acceptComma
                    />
                    <div className="input flex items-center justify-center text-slate-500">%</div>
                  </div>
                </div>
                <div>
                  <label className="label">Penalización</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input" inputMode="decimal" placeholder="Warn −% peso" value={penalties[k]?.warnPenaltyPct ?? 0} onChange={(e)=>onChangePenalty(k, { warnPenaltyPct: Number(e.target.value) || 0 })} disabled={omit[k]} />
                    <input className="input" inputMode="decimal" placeholder="Risk −% peso" value={penalties[k]?.riskPenaltyPct ?? 0} onChange={(e)=>onChangePenalty(k, { riskPenaltyPct: Number(e.target.value) || 0 })} disabled={omit[k]} />
                  </div>
                </div>
              </div>
            </div>
            );})}
        </div>
      </div>
      <MacroHelpModal open={helpOpen} onClose={()=>setHelpOpen(false)} />
    </div>
  );
}
