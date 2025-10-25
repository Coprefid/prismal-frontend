"use client";
import { useEffect, useMemo, useState } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import PolicyMacroForm, { type MacroWeights as MacroWeightsType } from '@/components/policy/PolicyMacroForm';
import PolicyMicroForm, { defaultMicroConfig, type MicroConfig } from '@/components/policy/PolicyMicroForm';
import HardStopsForm, { defaultHardStops, defaultHardStopsParams, type HardStops, type HardStopsParams } from '@/components/policy/HardStopsForm';
import InfoTooltip from '@/components/ui/InfoTooltip';
import Modal from '@/components/ui/Modal';
import MacroHelpModal from '@/components/policy/MacroHelpModal';
import GiroSelect from '@/components/GiroSelect';
import { hasRutStructureCL, validateRutCL, normalizeRutCL, formatRutCL, ventasRangeUFFromTramo, capitalPropioTramoLabel } from '@/lib/validators';

// Defaults (same spirit as onboarding)
type MacroWeights = {
  inflation: number;
  inflation_accumulated: number;
  fx: number;
  uf: number;
  tpm: number;
  pib: number;
  unemployment: number;
  commodities: number;
};

const SUGGESTED_MACRO: MacroWeights = {
  inflation: 0.12,
  inflation_accumulated: 0.03,
  fx: 0.10,
  uf: 0.10,
  tpm: 0.15,
  pib: 0.15,
  unemployment: 0.10,
  commodities: 0.10,
};

export default function PoliciesPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [tab, setTab] = useState<'macro' | 'micro' | 'hardstops'>('macro');
  const isPlaceholder = !companyId || companyId === 'placeholder';
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Array<{ _id: string; name: string; rut: string; giroName?: string }>>([]);
  const [addingOpen, setAddingOpen] = useState(false);
  const [rutInput, setRutInput] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [prefill, setPrefill] = useState<any | null>(null);
  const [addGiro, setAddGiro] = useState<{ code: string; name: string } | null>(null);
  const [addSearched, setAddSearched] = useState(false);
  const [addName, setAddName] = useState<string>('');
  const [showMacroGuide, setShowMacroGuide] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [introDone, setIntroDone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('policies_intro_done') === '1';
  });

  // Macro state
  const [macroWeights, setMacroWeights] = useState<MacroWeights>(SUGGESTED_MACRO);
  const [macroGlobalWeight, setMacroGlobalWeight] = useState<number>(0.05);
  const [macroOmit, setMacroOmit] = useState<Record<string, boolean>>({
    inflation: false,
    inflation_accumulated: false,
    fx: false,
    uf: false,
    tpm: false,
    pib: false,
    unemployment: false,
    commodities: false,
  });
  const [macroPenalties, setMacroPenalties] = useState<Record<string, { warnPenaltyPct: number; riskPenaltyPct: number }>>({
    inflation: { warnPenaltyPct: 30, riskPenaltyPct: 100 },
    inflation_accumulated: { warnPenaltyPct: 20, riskPenaltyPct: 60 },
  });
  const [macroThresholds, setMacroThresholds] = useState<Record<string, { warn: number; risk: number; unit: string; frequency?: 'daily' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' }>>({
    inflation: { warn: 8, risk: 10, unit: '%', frequency: 'monthly' },
    inflation_accumulated: { warn: 4, risk: 6, unit: '%', frequency: 'annual' },
    fx: { warn: 5, risk: 10, unit: '%', frequency: 'daily' },
    uf: { warn: 0.3, risk: 0.5, unit: '%', frequency: 'monthly' },
    tpm: { warn: 0.5, risk: 1, unit: '%', frequency: 'semiannual' },
    pib: { warn: -1, risk: -3, unit: '%', frequency: 'quarterly' },
    unemployment: { warn: 1, risk: 2, unit: '%', frequency: 'quarterly' },
    commodities: { warn: -5, risk: -10, unit: '%', frequency: 'daily' },
  });
  const [macroCountries, setMacroCountries] = useState<string[]>(['CL']);
  const [macroFxCurrencies, setMacroFxCurrencies] = useState<string[]>(['USD']);
  const [macroCommodityItems, setMacroCommodityItems] = useState<string[]>(['COPPER']);

  // Micro
  const [microCfg, setMicroCfg] = useState<MicroConfig>(defaultMicroConfig());
  const [microPenalties, setMicroPenalties] = useState<Record<string, { warnPenaltyPct: number; riskPenaltyPct: number }>>({});

  // HardStops
  const [hsToggles, setHsToggles] = useState<HardStops>(defaultHardStops());
  const [hsParams, setHsParams] = useState<HardStopsParams>(defaultHardStopsParams());
  const [extraHardStops, setExtraHardStops] = useState<string[]>([]);

  const availableIndicators = useMemo(() => {
    const mac: string[] = [];
    (Object.keys(macroWeights) as Array<keyof MacroWeights>).forEach((k) => {
      if (!macroOmit[k as string] && (macroWeights as any)[k] > 0) mac.push(`macro:${k}`);
    });
    const mic: string[] = [];
    if (!microCfg.estructurales.antiguedad.omit) mic.push('micro:antiguedad');
    if (!microCfg.estructurales.trabajadores.omit) mic.push('micro:trabajadores');
    if (!microCfg.estructurales.giro.omit) mic.push('micro:giro');
    if (!microCfg.financieros.ventas.omit) mic.push('micro:ventas');
    if (!microCfg.financieros.rentabilidad.omit) mic.push('micro:rentabilidad');
    if (!microCfg.financieros.liquidez.omit) mic.push('micro:liquidez');
    if (!microCfg.financieros.endeudamiento.omit) mic.push('micro:endeudamiento');
    if (!microCfg.financieros.capitalPropio.omit) mic.push('micro:capital_propio');
    if (!microCfg.tributarios.cumplimiento.omit) mic.push('micro:cumplimiento_tributario');
    if (!microCfg.tributarios.carpetaDesactualizada.omit) mic.push('micro:carpeta_desactualizada');
    if (!microCfg.comerciales.morosidad.omit) mic.push('micro:morosidad');
    if (!microCfg.activosRespaldo.activosDeclarados.omit) mic.push('micro:activos_declarados');
    if (!microCfg.activosRespaldo.diversificacionClientes.omit) mic.push('micro:diversificacion_clientes');
    return [...mac, ...mic];
  }, [macroWeights, macroOmit, microCfg]);

  // Micro validations: total weight <= 100% and penalties defined for all active variables
  const microValidation = useMemo(() => {
    // total micro weights (only included ones)
    const weights: Array<{ key: string; weight: number; omit?: boolean }> = [
      { key: 'estructurales.antiguedad', weight: microCfg.estructurales.antiguedad.weight, omit: microCfg.estructurales.antiguedad.omit },
      { key: 'estructurales.trabajadores', weight: microCfg.estructurales.trabajadores.weight, omit: microCfg.estructurales.trabajadores.omit },
      { key: 'estructurales.giro', weight: microCfg.estructurales.giro.weight, omit: microCfg.estructurales.giro.omit },
      { key: 'financieros.ventas', weight: microCfg.financieros.ventas.weight, omit: microCfg.financieros.ventas.omit },
      { key: 'financieros.rentabilidad', weight: microCfg.financieros.rentabilidad.weight, omit: microCfg.financieros.rentabilidad.omit },
      { key: 'financieros.liquidez', weight: microCfg.financieros.liquidez.weight, omit: microCfg.financieros.liquidez.omit },
      { key: 'financieros.endeudamiento', weight: microCfg.financieros.endeudamiento.weight, omit: microCfg.financieros.endeudamiento.omit },
      { key: 'financieros.capitalPropio', weight: microCfg.financieros.capitalPropio.weight, omit: microCfg.financieros.capitalPropio.omit },
      { key: 'tributarios.cumplimiento', weight: microCfg.tributarios.cumplimiento.weight, omit: microCfg.tributarios.cumplimiento.omit },
      { key: 'tributarios.carpetaDesactualizada', weight: 0, omit: microCfg.tributarios.carpetaDesactualizada.omit },
      { key: 'comerciales.morosidad', weight: microCfg.comerciales.morosidad.weight, omit: microCfg.comerciales.morosidad.omit },
      { key: 'activosRespaldo.activosDeclarados', weight: microCfg.activosRespaldo.activosDeclarados.weight, omit: microCfg.activosRespaldo.activosDeclarados.omit },
      { key: 'activosRespaldo.diversificacionClientes', weight: microCfg.activosRespaldo.diversificacionClientes.weight, omit: microCfg.activosRespaldo.diversificacionClientes.omit },
    ];
    const total = Math.round(((weights.reduce((acc, w) => acc + (w.omit ? 0 : (w.weight || 0)), 0)) * 100 + Number.EPSILON) * 100) / 100;
    const over = total > 100;

    // penalties required keys (only active variables)
    const usedKeys: string[] = [];
    if (!microCfg.estructurales.antiguedad.omit) usedKeys.push('antiguedad');
    if (!microCfg.estructurales.trabajadores.omit) usedKeys.push('trabajadores');
    if (!microCfg.estructurales.giro.omit) usedKeys.push('giro');
    if (!microCfg.financieros.ventas.omit) usedKeys.push('ventas');
    if (!microCfg.financieros.rentabilidad.omit) usedKeys.push('rentabilidad');
    if (!microCfg.financieros.liquidez.omit) usedKeys.push('liquidez');
    if (!microCfg.financieros.endeudamiento.omit) usedKeys.push('endeudamiento');
    if (!microCfg.financieros.capitalPropio.omit) usedKeys.push('capitalPropio');
    if (!microCfg.tributarios.cumplimiento.omit) usedKeys.push('cumplimiento');
    if (!microCfg.tributarios.carpetaDesactualizada.omit) usedKeys.push('carpetaDesactualizada');
    if (!microCfg.comerciales.morosidad.omit) usedKeys.push('morosidad');
    if (!microCfg.activosRespaldo.activosDeclarados.omit) usedKeys.push('activosDeclarados');
    if (!microCfg.activosRespaldo.diversificacionClientes.omit) usedKeys.push('diversificacionClientes');

    const missing: string[] = usedKeys.filter(k => {
      const p = microPenalties[k] || {} as any;
      if (k === 'giro') {
        return typeof p.riskPenaltyPct !== 'number';
      }
      return typeof p.warnPenaltyPct !== 'number' || typeof p.riskPenaltyPct !== 'number';
    });

    return { total, over, missing };
  }, [microCfg, microPenalties]);

  // Guard + determine current company and load policy (non-blocking, no redirects)
  useEffect(() => {
    (async () => {
      try {
        await apiGet<{ ok: boolean }>("/api/auth/me").catch(() => null);
        // Load my companies to render chips
        let myCompanies: Array<{ _id: string; name: string; rut: string; giroName?: string }> = [];
        try {
          const my = await apiGet<{ ok: boolean; data: Array<{ _id: string; name: string; rut: string; giroName?: string }> }>("/api/companies/my");
          myCompanies = my?.data || [];
        } catch {}

        // determine company (allow placeholder)
        const storedId = typeof window !== 'undefined' ? localStorage.getItem('currentCompanyId') : null;
        let id = storedId || null;
        if (!id || id === 'placeholder') {
          id = myCompanies[0]?._id || (storedId || null);
        }
        // If storedId exists but not in myCompanies (legacy or imported), try to fetch it to display as chip
        if (id && myCompanies.findIndex(c => c._id === id) === -1) {
          try {
            const byId = await apiGet<{ ok: boolean; data: { _id: string; name: string; rut: string; giroName?: string } }>(`/api/companies/${id}`);
            if (byId?.ok && byId.data) {
              myCompanies = [...myCompanies, byId.data];
            }
          } catch {}
        }
        setCompanies(myCompanies);
        if (!id) return; // keep page, but skip loading policy
        setCompanyId(id);

        // load policy when company exists
        const res = await apiGet<{ ok: boolean; data: any }>(`/api/company-policy/${id}`).catch(() => null as any);
        if (res?.ok && res.data) {
          const m = res.data.macro || {};
          if (m.weights) setMacroWeights((w) => ({ ...w, ...m.weights }));
          if (typeof m.globalWeight === 'number') setMacroGlobalWeight(m.globalWeight);
          if (m.omit) setMacroOmit((prev) => ({ ...prev, ...m.omit }));
          if (m.penalties) setMacroPenalties(m.penalties);
          if (m.thresholds) setMacroThresholds((prev) => ({ ...prev, ...m.thresholds }));
          if (Array.isArray(m.countries)) setMacroCountries(m.countries);
          if (Array.isArray(m.fxCurrencies)) setMacroFxCurrencies(m.fxCurrencies);
          if (Array.isArray(m.commodityItems)) setMacroCommodityItems(m.commodityItems);

          const mi = res.data.micro || {};
          if (mi.config) setMicroCfg(mi.config);
          if (mi.penalties) setMicroPenalties(mi.penalties);
          if (mi.hardStopsParams) setHsParams(mi.hardStopsParams);

          const hs: string[] = Array.isArray(res.data.hardStops) ? res.data.hardStops : [];
          if (hs.length) {
            const defaults: (keyof typeof hsToggles)[] = ['proceso_concursal','contactabilidad_invalida','direccion_no_comprobable','deterioro_comercial'];
            const nextToggles: any = { ...hsToggles };
            defaults.forEach((k) => { nextToggles[k] = hs.includes(k); });
            setHsToggles(nextToggles);
            const extras = hs.filter((k) => !defaults.includes(k as any));
            setExtraHardStops(extras);
          }
        }
        // If policy missing or not completed, trigger intro (but do not navigate)
        const shouldIntro = !res?.data || !res.data.completed;
        if (shouldIntro && !introDone) setShowExample(true);
      } catch {
        // keep page rendered; do not redirect to avoid flicker
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPolicyFor(id: string) {
    try {
      setCompanyId(id);
      if (typeof window !== 'undefined') localStorage.setItem('currentCompanyId', id);
      const res = await apiGet<{ ok: boolean; data: any }>(`/api/company-policy/${id}`);
      if (res?.ok && res.data) {
        const m = res.data.macro || {};
        if (m.weights) setMacroWeights((w) => ({ ...w, ...m.weights }));
        if (typeof m.globalWeight === 'number') setMacroGlobalWeight(m.globalWeight);
        if (m.omit) setMacroOmit((prev) => ({ ...prev, ...m.omit }));
        if (m.penalties) setMacroPenalties(m.penalties);
        if (m.thresholds) setMacroThresholds((prev) => ({ ...prev, ...m.thresholds }));
        if (Array.isArray(m.countries)) setMacroCountries(m.countries);
        if (Array.isArray(m.fxCurrencies)) setMacroFxCurrencies(m.fxCurrencies);
        if (Array.isArray(m.commodityItems)) setMacroCommodityItems(m.commodityItems);
        const mi = res.data.micro || {};
        if (mi.config) setMicroCfg(mi.config);
        if (mi.penalties) setMicroPenalties(mi.penalties);
        if (mi.hardStopsParams) setHsParams(mi.hardStopsParams);
        const hs: string[] = Array.isArray(res.data.hardStops) ? res.data.hardStops : [];
        if (hs.length) {
          const defaults: (keyof typeof hsToggles)[] = ['proceso_concursal','contactabilidad_invalida','direccion_no_comprobable','deterioro_comercial'];
          const nextToggles: any = { ...hsToggles };
          defaults.forEach((k) => { nextToggles[k] = hs.includes(k); });
          setHsToggles(nextToggles);
          const extras = hs.filter((k) => !defaults.includes(k as any));
          setExtraHardStops(extras);
        }
      } else {
        // reset to defaults if no policy yet
        setMacroWeights(SUGGESTED_MACRO);
        setMacroGlobalWeight(0.05);
        setMacroOmit({ inflation:false, inflation_accumulated:false, fx:false, uf:false, tpm:false, pib:false, unemployment:false, commodities:false });
        setMacroPenalties({ inflation: { warnPenaltyPct: 30, riskPenaltyPct: 100 }, inflation_accumulated: { warnPenaltyPct: 20, riskPenaltyPct: 60 } });
        setMacroThresholds({
          inflation: { warn: 8, risk: 10, unit: '%', frequency: 'monthly' },
          inflation_accumulated: { warn: 4, risk: 6, unit: '%', frequency: 'annual' },
          fx: { warn: 5, risk: 10, unit: '%', frequency: 'daily' },
          uf: { warn: 0.3, risk: 0.5, unit: '%', frequency: 'monthly' },
          tpm: { warn: 0.5, risk: 1, unit: '%', frequency: 'semiannual' },
          pib: { warn: -1, risk: -3, unit: '%', frequency: 'quarterly' },
          unemployment: { warn: 1, risk: 2, unit: '%', frequency: 'quarterly' },
          commodities: { warn: -5, risk: -10, unit: '%', frequency: 'daily' },
        });
        setMacroCountries(['CL']);
        setMacroFxCurrencies(['USD']);
        setMacroCommodityItems(['COPPER']);
        setMicroCfg(defaultMicroConfig());
        setMicroPenalties({});
        setHsToggles(defaultHardStops());
        setHsParams(defaultHardStopsParams());
        setExtraHardStops([]);
      }
    } catch {}
  }

  useEffect(() => {
    if (showExample === false && !introDone) {
      // mark as shown once user closes the example
      if (typeof window !== 'undefined') localStorage.setItem('policies_intro_done', '1');
      setIntroDone(true);
    }
  }, [showExample, introDone]);

  const onSave = async () => {
    if (!companyId || companyId === 'placeholder') {
      setSaveMsg('Para guardar políticas necesitas una empresa creada. Por ahora esta vista funciona como guía.');
      return;
    }
    const hardStopsArr: string[] = Object.entries(hsToggles)
      .filter(([, v]) => !!v)
      .map(([k]) => k);
    const mergedHardStops = Array.from(new Set([...hardStopsArr, ...extraHardStops]));
    // Normalize micro penalties: for 'giro' set warnPenaltyPct to 0 if missing (risk-only indicator)
    const normalizedMicroPenalties = { ...microPenalties } as Record<string, { warnPenaltyPct: number; riskPenaltyPct: number }>;
    if (!microCfg.estructurales.giro.omit) {
      const p = normalizedMicroPenalties['giro'] || ({} as any);
      normalizedMicroPenalties['giro'] = {
        warnPenaltyPct: typeof p.warnPenaltyPct === 'number' ? p.warnPenaltyPct : 0,
        riskPenaltyPct: typeof p.riskPenaltyPct === 'number' ? p.riskPenaltyPct : 0,
      };
    }

    const payload = {
      macro: {
        weights: macroWeights as unknown as MacroWeightsType,
        globalWeight: macroGlobalWeight,
        omit: macroOmit,
        penalties: macroPenalties,
        thresholds: macroThresholds,
        countries: macroCountries,
        fxCurrencies: macroFxCurrencies,
        commodityItems: macroCommodityItems,
      },
      micro: {
        config: microCfg,
        hardStopsParams: hsParams,
        penalties: normalizedMicroPenalties,
      },
      hardStops: mergedHardStops,
      completed: true,
    } as any;
    const res = await apiPut(`/api/company-policy/${companyId}`, payload);
    // Navegar al chat tras guardar correctamente
    router.push('/chat' as Route);
  };

  return (
    <main className="min-h-screen app-bg">
      <section className="container-page py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          {/* Brand top-left inside this page */}
          <div className="mb-4 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/isotipo.png" alt="Prismal AI" className="h-7 w-7" />
            <span className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Prismal AI</span>
          </div>
          {/* Company chips and add company */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {companies.map((c) => (
              <button
                key={c._id}
                className={`rounded-full border px-3 py-1 text-xs ${companyId===c._id ? 'border-logo-start bg-gradient-to-r from-logo-start via-logo-mid to-logo-end text-white' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                onClick={() => loadPolicyFor(c._id)}
                title={c.rut}
              >{c.name || c.rut}</button>
            ))}
            <button
              className="rounded-full border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              onClick={() => { setAddingOpen(true); setRutInput(''); setPrefill(null); setAddError(null); setAddGiro(null); setAddName(''); setAddSearched(false); }}
              disabled={companies.length >= 3}
            >Agregar empresa</button>
            {companies.length >= 3 && (
              <span className="text-xs text-slate-500">(Límite: 3 empresas)</span>
            )}
          </div>
          <div className="mb-2 flex items-center gap-2">
            <h1 className="text-2xl font-bold">Políticas de riesgo</h1>
            <InfoTooltip title="Guía de inicio">
{`Abre la guía para comprender las variables macro definidas. También puedes revisar el ejemplo para entender Warn, Risk, Peso y Observabilidad.`}
            </InfoTooltip>
            <button className="ml-1 rounded-full border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" onClick={() => setShowMacroGuide(true)}>
              Abrir guía
            </button>
            <button className="rounded-full border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" onClick={() => setShowExample(true)}>
              Ver ejemplo
            </button>
          </div>
          <div className="hint mb-6">Estos parámetros se aplicarán a cada evaluación de tus clientes. Puedes ajustar macro, micro y hard stops sin pasar por el onboarding.</div>

          {/* Tabs + Theme toggle */}
          <div className="mb-6 flex items-center gap-3">
            <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              {(['macro','micro','hardstops'] as const).map((t) => (
                <button key={t} className={`px-4 py-2 text-sm ${tab===t? 'bg-gradient-to-r from-logo-start via-logo-mid to-logo-end text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`} onClick={()=>setTab(t)}>
                  {t==='macro'?'Política Macro':t==='micro'?'Política Micro':'Hard Stops'}
                </button>
              ))}
            </div>
            <div className="ml-auto"><ThemeToggle /></div>
          </div>

          {isPlaceholder && (
            <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
              No hay una empresa creada aún. Puedes revisar y definir tu criterio aquí como guía, pero para guardar políticas primero necesitarás crear una empresa.
            </div>
          )}

          {tab === 'macro' && (
            <div className={`space-y-6 ${isPlaceholder ? 'pointer-events-none opacity-60' : ''}`}>
              <PolicyMacroForm
                value={macroWeights as any}
                globalWeight={macroGlobalWeight}
                omit={macroOmit}
                penalties={macroPenalties}
                thresholds={macroThresholds}
                countries={macroCountries}
                fxCurrencies={macroFxCurrencies}
                commodityItems={macroCommodityItems}
                onChange={(next) => setMacroWeights((w) => ({ ...w, ...next }))}
                onChangeGlobal={(w) => setMacroGlobalWeight(w)}
                onChangeOmit={(key, checked) => setMacroOmit((m) => ({ ...m, [key]: checked }))}
                onChangePenalty={(key, p) => setMacroPenalties((mp) => ({ ...mp, [key]: { warnPenaltyPct: p.warnPenaltyPct ?? (mp[key]?.warnPenaltyPct || 0), riskPenaltyPct: p.riskPenaltyPct ?? (mp[key]?.riskPenaltyPct || 0) } }))}
                onChangeThreshold={(key, t) => setMacroThresholds((mt) => ({
                  ...mt,
                  [key]: {
                    warn: t.warn ?? (mt[key]?.warn ?? 0),
                    risk: t.risk ?? (mt[key]?.risk ?? 0),
                    unit: t.unit ?? (mt[key]?.unit ?? ''),
                    frequency: t.frequency ?? (mt[key]?.frequency),
                  },
                }))}
                onChangeCountries={setMacroCountries}
                onChangeFxCurrencies={setMacroFxCurrencies}
                onChangeCommodityItems={setMacroCommodityItems}
              />
              <div className="flex items-center gap-2">
                <button className="btn-primary" onClick={onSave} disabled={isPlaceholder}>Guardar cambios</button>
                <button className="btn-secondary" onClick={() => router.push('/chat' as Route)}>Volver a chat</button>
              </div>
            </div>
          )}

          {tab === 'micro' && (
            <div className={`space-y-6 ${isPlaceholder ? 'pointer-events-none opacity-60' : ''}`}>
              <PolicyMicroForm
                value={microCfg}
                penalties={microPenalties}
                onChange={setMicroCfg}
                onChangePenalty={(key, p) => setMicroPenalties((mp) => ({
                  ...mp,
                  [key]: {
                    warnPenaltyPct: (p.warnPenaltyPct !== undefined) ? p.warnPenaltyPct : (mp[key]?.warnPenaltyPct),
                    riskPenaltyPct: (p.riskPenaltyPct !== undefined) ? p.riskPenaltyPct : (mp[key]?.riskPenaltyPct),
                  },
                }))}
                globalWeight={Math.max(0, 1 - (macroGlobalWeight || 0))}
                onChangeGlobal={() => { /* read-only: auto-calculado como 100% - macro */ }}
              />
              {(microValidation.over || microValidation.missing.length > 0) && (
                <div className={`rounded-xl border p-3 text-sm ${microValidation.over ? 'border-rose-400 bg-rose-50/40 dark:border-rose-400/70 dark:bg-rose-900/20' : 'border-amber-300 bg-amber-50 dark:border-amber-500/60 dark:bg-amber-900/20'}`}>
                  {microValidation.over && (
                    <div className="mb-1 font-semibold text-rose-600 dark:text-rose-300">Las ponderaciones micro superan 100%. Ajusta alguna variable.</div>
                  )}
                  {microValidation.missing.length > 0 && (
                    <div>
                      <div className="font-semibold">Faltan penalizaciones en:</div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{microValidation.missing.join(', ')}</div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <button className="btn-primary disabled:opacity-50" onClick={onSave} disabled={microValidation.over || microValidation.missing.length > 0}>Guardar cambios</button>
                <button className="btn-secondary" onClick={() => router.push('/chat' as Route)}>Volver a chat</button>
              </div>
            </div>
          )}

          {tab === 'hardstops' && (
            <div className={`space-y-6 ${isPlaceholder ? 'pointer-events-none opacity-60' : ''}`}>
              <HardStopsForm
                value={hsToggles}
                params={hsParams}
                available={availableIndicators}
                extras={extraHardStops}
                onChange={setHsToggles}
                onChangeParams={setHsParams}
                onChangeExtras={setExtraHardStops}
              />
              <div className="flex items-center gap-2">
                <button className="btn-primary" onClick={onSave}>Guardar cambios</button>
                <button className="btn-secondary" onClick={() => router.push('/chat' as Route)}>Volver a chat</button>
              </div>
            </div>
          )}
          {/* Macro guide modal */}
          <MacroHelpModal open={showMacroGuide} onClose={() => setShowMacroGuide(false)} />

          {/* Example modal explaining warn, risk, weight, observability */}
          <Modal open={showExample} onClose={() => setShowExample(false)} title="Ejemplo: cómo definir una variable">
            <div className="space-y-4 text-sm">
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="font-semibold mb-1">Variable de ejemplo: Inflación mensual (IPC)</div>
                <ul className="list-disc space-y-1 pl-5">
                  <li><span className="font-semibold">Warn</span>: Umbral de advertencia. Ej.: 8% mensual acumulado. Al superarse, aumenta el score de alerta.</li>
                  <li><span className="font-semibold">Risk</span>: Umbral de riesgo alto. Ej.: 10%. Sobre este valor, aplica penalizaciones máximas.</li>
                  <li><span className="font-semibold">Peso</span>: Importancia relativa de la variable en el score final. Ej.: 12% del componente macro.</li>
                  <li><span className="font-semibold">Observabilidad</span>: Frecuencia y fuente de actualización. Ej.: mensual, fuente INE.</li>
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="font-semibold mb-1">Buenas prácticas</div>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Define <span className="font-semibold">Warn</span> como el punto donde necesitas atención preventiva.</li>
                  <li>Define <span className="font-semibold">Risk</span> como el nivel que te lleva a restringir crédito o endurecer condiciones.</li>
                  <li>Asigna <span className="font-semibold">Peso</span> mayor a variables más relevantes para tu rubro.</li>
                  <li>Comprueba la <span className="font-semibold">Observabilidad</span> para que la variable tenga datos confiables y frecuentes.</li>
                </ul>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button className="btn-secondary" onClick={() => setShowExample(false)}>Cerrar</button>
                <button className="btn-primary" onClick={() => { setShowExample(false); setShowMacroGuide(true); }}>Abrir guía macro</button>
              </div>
            </div>
          </Modal>

          {/* Add company modal */}
          <Modal open={addingOpen} onClose={() => setAddingOpen(false)} title="Agregar empresa">
            <div className="space-y-4 text-sm">
              <div>
                <label className="label">RUT de la empresa</label>
                <div className="flex items-center gap-2">
                  <div className={`relative flex-1`}>
                    <input
                      className={`input w-full ${validateRutCL(rutInput || '') && !addSearched ? 'ring-2 ring-emerald-400 border-emerald-400' : ''}`}
                    placeholder="12.345.678-5"
                    value={rutInput}
                    onChange={(e) => { setRutInput(formatRutCL(e.target.value)); setAddError(null); setAddSearched(false); }}
                  />
                    {validateRutCL(rutInput || '') && !addSearched && (
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-emerald-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z"/></svg>
                      </span>
                    )}
                  </div>
                  <button
                    className="btn-secondary"
                    disabled={!validateRutCL(rutInput || '')}
                    onClick={async () => {
                      setAddError(null); setAddLoading(true); setPrefill(null);
                      try {
                        const rutNorm = normalizeRutCL(rutInput);
                        if (!rutNorm || !validateRutCL(rutNorm)) { setAddError('RUT inválido'); setAddLoading(false); return; }
                        const res = await apiGet<{ ok: boolean; data: any }>(`/api/companies/by-rut/${encodeURIComponent(rutNorm)}`);
                        if (res?.ok) { setPrefill(res.data); setAddName((res.data?.name || '').toString().toUpperCase()); }
                      } catch (err: any) {
                        // No bloquear flujo si no hay data para ese RUT
                        setAddError('No encontramos datos para ese RUT. Puedes continuar seleccionando el rubro y guardar.');
                      } finally { setAddLoading(false); setAddSearched(true); }
                    }}
                  >Buscar</button>
                </div>
                {!validateRutCL(rutInput || '') && rutInput && (<div className="hint text-rose-400">RUT no válido</div>)}
              </div>

              {prefill && (
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="font-semibold">{prefill.name || 'Empresa'}</div>
                  <div className="text-xs text-slate-500">RUT: {prefill.rut}</div>
                  {typeof prefill.workers === 'number' && (<div className="text-xs text-slate-500">Trabajadores: {prefill.workers}</div>)}
                  {prefill.companySize && (<div className="text-xs text-slate-500">Tamaño: {prefill.companySize}</div>)}
                  {/* Rango de ventas anual si hay tramo disponible */}
                  {(() => {
                    const tramo = prefill?.metadata?.ventasTramo;
                    if (!tramo) return null;
                    const r = ventasRangeUFFromTramo(tramo);
                    return (<div className="text-xs text-slate-500">Ventas (anual): {r.label}</div>);
                  })()}
                  {/* CPTS sign y tramo */}
                  {(() => {
                    const sign = prefill?.cptsSign as ('positivo'|'negativo'|'desconocido'|undefined);
                    if (!sign || sign === 'desconocido') return null;
                    const trPos = prefill?.metadata?.capitalPropioTramoPositivo;
                    const trNeg = prefill?.metadata?.capitalPropioTramoNegativo;
                    const tramo = sign === 'positivo' ? trPos : trNeg;
                    const label = tramo ? capitalPropioTramoLabel(tramo) : null;
                    return (
                      <div className="text-xs text-slate-500">
                        CPTS: {sign}{label ? ` — ${label}` : ''}
                      </div>
                    );
                  })()}
                </div>
              )}

              <div>
                <label className="label">Rubro (Giro)</label>
                <GiroSelect value={addGiro} onChange={setAddGiro} placeholder="Busca por código o nombre" />
              </div>

              {addSearched && !prefill && (
                <div>
                  <label className="label">Nombre de la empresa</label>
                  <input
                    className="input w-full uppercase"
                    placeholder="NOMBRE LEGAL O FANTASÍA"
                    maxLength={60}
                    value={addName}
                    onChange={(e) => setAddName(e.target.value.toUpperCase())}
                  />
                </div>
              )}

              {addError && <div className="hint text-rose-400">{addError}</div>}

              <div className="flex items-center justify-end gap-2">
                <button className="btn-secondary" onClick={() => setAddingOpen(false)}>Cancelar</button>
                <button
                  className="btn-primary disabled:opacity-50"
                  disabled={!validateRutCL(rutInput || '') || !addSearched || !addGiro || (!prefill && addName.trim().length === 0) || addLoading || companies.length >= 3}
                  onClick={async () => {
                    try {
                      setAddLoading(true); setAddError(null);
                      const rutNorm = normalizeRutCL(rutInput)!;
                      const payload: any = {
                        rut: rutNorm,
                        name: (prefill?.name || addName || 'EMPRESA').toString().toUpperCase(),
                        giroCode: addGiro?.code,
                        giroName: addGiro?.name,
                        metadata: { source: 'policies_add_company_modal' },
                      };
                      const res = await apiPost<{ ok: boolean; data: { _id: string; name: string; rut: string; giroName?: string } }>("/api/companies", payload);
                      if (res?.ok) {
                        const newList = [...companies, res.data].slice(0, 3);
                        setCompanies(newList);
                        await loadPolicyFor(res.data._id);
                        setAddingOpen(false);
                      }
                    } catch (err: any) {
                      setAddError(err?.message || 'No pudimos crear la empresa');
                    } finally { setAddLoading(false); }
                  }}
                >Guardar</button>
              </div>
            </div>
          </Modal>
        </div>
      </section>
    </main>
  );
}
