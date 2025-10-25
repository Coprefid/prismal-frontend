"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import ThemeToggle from '@/components/ThemeToggle';
import { validateRutCL, formatRutCL, normalizeRutCL } from '@/lib/validators';
import { apiGet, apiPost } from '@/lib/api';
import { extractPdfTextFirstPages, extractRutFromText, extractRazonSocialHeuristic } from '@/lib/pdf-extract';
import Sidebar from '@/components/layout/Sidebar';
import QuickActions from '@/components/chat/QuickActions';
// removed InfoTooltip badge (redundant)

type ChatMsg = { role: 'user' | 'ai'; text: string; meta?: { intent?: string; missing?: string[]; policyMissing?: string[]; collected?: { rut?: string; razon_social?: string }; suggestions?: Array<{ key: string; docs: string[]; reason?: string }>; eval?: { id: string; summaryCard?: { score: number; lineSuggestedCLP: number; riskPct: number; riskLabel: string } } } };

export default function ChatPage() {
  const router = useRouter();
  const search = useSearchParams();
  const forceLLMFromQuery = (search?.get('llm') === '1' || search?.get('forceLLM') === '1');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [messages, setMessages] = useState<Array<ChatMsg>>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Array<{ id: string; file: File }>>([]);
  const [profile, setProfile] = useState<{ email: string; name: string; role: 'admin' | 'user'; credits: number } | null>(null);
  const [needsPolicies, setNeedsPolicies] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Array<{ _id: string; name: string }>>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [extractedHints, setExtractedHints] = useState<{ rut?: string; razon_social?: string; ct_rut?: string }>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [rutInput, setRutInput] = useState('');
  const [analysis, setAnalysis] = useState<{ features?: Record<string, any>; found?: string[]; missing?: string[] } | null>(null);
  const [attachmentDataShown, setAttachmentDataShown] = useState(false);
  const [lastDocumentId, setLastDocumentId] = useState<string | null>(null);
  const [classifiedUploads, setClassifiedUploads] = useState<Array<{ name: string; type: string; documentId: string }>>([]);
  const [docStatus, setDocStatus] = useState<{ status: 'pending' | 'extracted' | 'extract_failed' | 'unknown'; recommendation?: string } | null>(null);
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080');
  const [forceLLM, setForceLLM] = useState<boolean>(forceLLMFromQuery);
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);
  const hideDebug = (process.env.NEXT_PUBLIC_HIDE_DEBUG_JSON === '1' || process.env.NEXT_PUBLIC_HIDE_DEBUG_JSON === 'true');
  const hasUserTurn = messages.some((m) => m.role === 'user');

  async function processCarpetaTributaria(file: File) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('prismal_token') : null;
      if (!token) return;
      const company = companyId || (typeof window !== 'undefined' ? localStorage.getItem('currentCompanyId') : null) || '';
      if (!company) {
        setMessages((msgs) => [...msgs, { role: 'ai', text: 'Selecciona una empresa antes de adjuntar la Carpeta Tributaria.' }]);
        return;
      }

  

      // 1) Create signed upload for carpeta_tributaria
      const signedResp = await fetch(`${apiBase}/api/uploads/signed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'application/pdf',
          type: 'carpeta_tributaria',
          companyId: company,
          // optional hints (rut only for now; deuda y crédito se pedirán en el flujo)
          rut: extractedHints.rut,
        }),
      });
      const signed = await signedResp.json().catch(() => ({} as any));
      if (!signedResp.ok || !signed?.ok) {
        setMessages((msgs) => [...msgs, { role: 'ai', text: 'No pude iniciar la carga de la Carpeta Tributaria.' }]);
        return;
      }
      const documentId = signed.data.documentId as string;
      setLastDocumentId(documentId);
      const upload = signed.data.upload as { url: string; method: string; headers?: Record<string, string> };
      // record this classified attachment for evaluation context
      setClassifiedUploads((arr) => [...arr, { name: file.name, type: 'carpeta_tributaria', documentId }]);

      // 2) Upload file to signed URL (or local dev endpoint)
      let uploadOk = false;
      try {
        const isLocal = /\/api\/uploads\/.+\/local$/.test(upload.url);
        if (isLocal) {
          const fd = new FormData();
          fd.append('file', file);
          const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;
          const respLocal = await fetch(upload.url, { method: upload.method || 'POST', headers: authHeaders, body: fd });
          uploadOk = respLocal.ok;
        } else {
          const resp = await fetch(upload.url, { method: upload.method || 'PUT', headers: upload.headers || {}, body: file });
          uploadOk = resp.ok;
        }
      } catch {}
      if (!uploadOk) {
        setMessages((msgs) => [...msgs, { role: 'ai', text: 'No se pudo subir el archivo al almacenamiento.' }]);
        return;
      }

      // 3) Confirm upload -> enqueues extraction
      const confirmResp = await fetch(`${apiBase}/api/uploads/${documentId}/confirm`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      await confirmResp.json().catch(() => ({}));

      // 4) Poll extraction result
      setMessages((msgs) => [...msgs, { role: 'ai', text: '::loader::' }]);
      const startedAt = Date.now();
      let done = false;
      while (!done && Date.now() - startedAt < 180_000) {
        await new Promise((r) => setTimeout(r, 2000));
        const ts = Date.now();
        const statusResp = await fetch(`${apiBase}/api/uploads/${documentId}?ts=${ts}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: 'no-store',
        });
        const statusJson = await statusResp.json().catch(() => ({} as any));
        if (!statusResp.ok || !statusJson?.ok) continue;
        const d = statusJson.data as { status: string; meta?: any };
        if (d.status === 'extracted') {
          // Replace last loader with success and display variables
          setDocStatus({ status: 'extracted' });
          const variables = d.meta?.variables || {};
          const pretty = '```json\n' + JSON.stringify(variables, null, 2) + '\n```';
          setMessages((msgs) => {
            const copy = msgs.slice();
            const idx = copy.findIndex((m, i) => m.text === '::loader::' && i === copy.length - 1);
            if (idx >= 0) {
              if (!hideDebug) copy[idx] = { role: 'ai', text: 'Variables extraídas de Carpeta Tributaria.' };
              else copy.splice(idx, 1);
            }
            return copy;
          });
          if (!hideDebug) setMessages((msgs) => [...msgs, { role: 'ai', text: pretty }]);
          // Optional debug logs from extractor
          const out = (d.meta?.extractStdout || '').toString().trim();
          const err = (d.meta?.extractStderr || '').toString().trim();
          if (!hideDebug && out) setMessages((msgs) => [...msgs, { role: 'ai', text: '```log\n' + out + '\n```' }]);
          if (!hideDebug && err) setMessages((msgs) => [...msgs, { role: 'ai', text: '```log\n' + err + '\n```' }]);
          // Persist extracted identity hints for later evaluation + UI chips
          try {
            const normalizeRut = (raw?: any) => {
              if (!raw) return '';
              let s = String(raw).trim().replace(/[\u2010-\u2015\u2212]/g, '-').replace(/[\.\s]/g, '').toUpperCase();
              if (!s.includes('-')) {
                const m = s.match(/^(\d+)([0-9K])$/i);
                if (m) s = `${m[1]}-${m[2].toUpperCase()}`;
              }
              return s;
            };
            const emisorRut = normalizeRut(variables?.identificacion?.emisor_rut || variables?.inputs?.rut);
            const emisorNombre = (variables?.identificacion?.emisor_nombre || '').toString().trim();
            setExtractedHints((prev) => ({
              ...prev,
              // No sobreescribir el RUT declarado por el usuario en el chat
              rut: prev.rut,
              ct_rut: emisorRut || prev.ct_rut,
              razon_social: emisorNombre || prev.razon_social,
            }));
            // Show a meta status so the UI displays captured identity chips
            if (emisorRut || emisorNombre) {
              setMessages((msgs) => [...msgs, { role: 'ai', text: '::meta::', meta: { collected: { rut: emisorRut, razon_social: emisorNombre }, missing: [] } }]);
            }
          } catch {}
          // Release gating so user can send next message
          setAttachmentDataShown(true);
          done = true;
          break;
        }
        if (d.status === 'extract_failed') {
          const err = d.meta?.extractError || { code: 'E_UNKNOWN', message: 'No fue posible procesar la carpeta.' };
          setDocStatus({ status: 'extract_failed', recommendation: (d.meta?.recommendation || '').toString().trim() || undefined });
          setMessages((msgs) => {
            const copy = msgs.slice();
            const idx = copy.findIndex((m, i) => m.text === '::loader::' && i === copy.length - 1);
            if (idx >= 0) copy[idx] = { role: 'ai', text: `Error al analizar Carpeta Tributaria (${err.code}): ${err.message}` };
            return copy;
          });
          const out = (d.meta?.extractStdout || '').toString().trim();
          const stderr = (d.meta?.extractStderr || '').toString().trim();
          if (out) setMessages((msgs) => [...msgs, { role: 'ai', text: '```log\n' + out + '\n```' }]);
          if (stderr) setMessages((msgs) => [...msgs, { role: 'ai', text: '```log\n' + stderr + '\n```' }]);
          const rec = (d.meta?.recommendation || '').toString().trim();
          if (rec) setMessages((msgs) => [...msgs, { role: 'ai', text: rec }]);
          setAttachmentDataShown(true);
          done = true;
          break;
        }
      }
      // timeout fallback
      if (!done) {
        setMessages((msgs) => {
          const copy = msgs.slice();
          const idx = copy.findIndex((m, i) => m.text === '::loader::' && i === copy.length - 1);
          if (idx >= 0) copy[idx] = { role: 'ai', text: 'El análisis de la Carpeta Tributaria está tardando más de lo esperado. Intenta nuevamente en unos minutos.' };
          else copy.push({ role: 'ai', text: 'El análisis de la Carpeta Tributaria está tardando más de lo esperado.' });
          return copy;
        });
        setAttachmentDataShown(true);
        setDocStatus({ status: 'unknown' });
      }
    } catch (e: any) {
      setMessages((msgs) => [...msgs, { role: 'ai', text: 'Ocurrió un error al procesar la Carpeta Tributaria.' }]);
      setAttachmentDataShown(true);
      setDocStatus({ status: 'unknown' });
    }
  }

  // Simple client-side guard + onboarding/policy gating
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('prismal_token') : null;
    if (!token) {
      router.push('/login' as Route);
      return;
    }
    (async () => {
      try {
        const res = await apiGet<{ ok: boolean; data: { email: string; name: string; role: 'admin' | 'user'; credits: number; isFirstLogin?: boolean } }>('/api/auth/me');
        if (res?.ok) setProfile(res.data);
        // Check company + policy completion
        const my = await apiGet<{ ok: boolean; data: Array<{ _id: string; name: string; onboardingCompleted?: boolean }> }>('/api/companies/my');
        const myCompanies = my?.data || [];
        setCompanies(myCompanies.map(c => ({ _id: c._id, name: (c as any).name })));
        if (myCompanies.length === 0) {
          // Fallback: if we have a recently created company in localStorage, do not bounce back to onboarding.
          const storedId = typeof window !== 'undefined' ? localStorage.getItem('currentCompanyId') : null;
          if (storedId) {
            setNeedsPolicies(true);
            setLoading(false);
            return;
          }
          router.push('/onboarding' as Route);
          return;
        }
        // pick selected company (prefer localStorage) or fallback to first
        const storedCompanyId = typeof window !== 'undefined' ? localStorage.getItem('currentCompanyId') : null;
        const targetCompanyId = (storedCompanyId && myCompanies.some(c => c._id === storedCompanyId))
          ? storedCompanyId
          : myCompanies[0]._id;
        setCompanyId(targetCompanyId);
        const pol = await apiGet<{ ok: boolean; data: { completed?: boolean } | null }>(`/api/company-policy/${targetCompanyId}`);
        if (!pol?.data || !pol.data.completed) setNeedsPolicies(true); else setNeedsPolicies(false);
        setLoading(false);
      } catch {
        // token inválido
        localStorage.removeItem('prismal_token');
        router.push('/login' as Route);
      }
    })();
  }, [router]);

  // If we come from Evaluations -> Enriquecer, auto-load evaluation and trigger a guidance turn
  useEffect(() => {
    const evalId = search?.get('evalId');
    if (!evalId) return;
    (async () => {
      try {
        const evalResp = await apiGet<any>(`/api/evaluations/${evalId}`);
        const data = (evalResp as any)?.data || {};
        const feats = data?.features || {};
        setAnalysis((prev) => ({ features: { ...(prev?.features || {}), ...feats }, found: Object.keys(feats), missing: [] }));
        if (data?.companyId) setCompanyId(data.companyId);
        // Post a guidance message so backend computes missingPolicyFeatures + suggestions
        const res = await apiPost<any>('/api/chat/messages', {
          message: 'Enriquecer evaluación',
          context: { companyId: data?.companyId, analysis: { features: feats }, attachments: [] },
          thinkingBudget: 0,
        });
        const aiMsg = res?.data?.message || 'Listo para enriquecer.';
        setMessages((msgs) => [...msgs, { role: 'ai', text: aiMsg }]);
        const policyMissing = (res as any)?.data?.debug?.missingPolicyFeatures || [];
        setMessages((msgs) => [...msgs, { role: 'ai', text: '::meta::', meta: { intent: res?.data?.intent, missing: res?.data?.missing || [], policyMissing, collected: res?.data?.collected } }]);
        if ((res as any)?.data?.debug) {
          const raw = JSON.stringify((res as any).data.debug, null, 2);
          setMessages((msgs) => [...msgs, { role: 'ai', text: '```json\n' + raw + '\n```' }]);
        }
      } catch {}
    })();
  }, [search]);
  // Change company handler
  const onChangeCompany = async (id: string) => {
    setCompanyId(id);
    if (typeof window !== 'undefined') localStorage.setItem('currentCompanyId', id);
    try {
      const pol = await apiGet<{ ok: boolean; data: { completed?: boolean } | null }>(`/api/company-policy/${id}`);
      setNeedsPolicies(!(pol?.data && pol.data.completed));
    } catch {
      setNeedsPolicies(true);
    }
  };

  // Generic early-AI upload flow: single file at a time, send as 'otro', confirm, show AI detection bubble
  async function processUploadGeneric(file: File) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('prismal_token') : null;
    if (!token) return;
    const company = companyId || (typeof window !== 'undefined' ? localStorage.getItem('currentCompanyId') : null) || '';
    if (!company) {
      setMessages((msgs) => [...msgs, { role: 'ai', text: 'Selecciona una empresa antes de adjuntar un documento.' }]);
      return;
    }
    try {
      setUploadingDoc(true);
      // 0) Classify-first with Gemini
      const fd = new FormData();
      fd.append('file', file);
      const classifyResp = await fetch(`${apiBase}/api/classify`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      const classifyJson = await classifyResp.json().catch(() => ({} as any));
      if (!classifyResp.ok || !classifyJson?.ok) {
        setMessages((msgs) => [...msgs, { role: 'ai', text: 'No pude clasificar el documento con IA.' }]);
        return;
      }
      const data = classifyJson.data as { document_type?: string; confidence?: number; method?: string; explain?: any };
      const decidedType = (data?.document_type as any) || 'otro';
      const confTxt = data?.confidence != null ? ` (confianza ${(data.confidence * 100).toFixed(0)}%)` : '';
      const methodTag = data?.method && data.method.startsWith('gemini') ? '[IA: Gemini]' : (data?.method || '').includes('fallback') ? '[Fallback: Heurística]' : '[IA]';
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      if (!hideDebug) setMessages((msgs) => [...msgs, { role: 'ai', text: `${methodTag} Documento detectado: tipo ${decidedType}${confTxt}. Extensión: .${ext}` }]);
      if (!hideDebug && (data as any)?.explain) {
        const pretty = '```json\n' + JSON.stringify((data as any).explain, null, 2) + '\n```';
        setMessages((msgs) => [...msgs, { role: 'ai', text: pretty }]);
      }

      // 1) Create signed upload with decided type
      const signedResp = await fetch(`${apiBase}/api/uploads/signed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          type: decidedType,
          companyId: company,
          rut: extractedHints.rut,
        }),
      });
      const signed = await signedResp.json().catch(() => ({} as any));
      if (!signedResp.ok || !signed?.ok) {
        setMessages((msgs) => [...msgs, { role: 'ai', text: 'No pude iniciar la carga del documento.' }]);
        return;
      }
      const documentId = signed.data.documentId as string;
      setLastDocumentId(documentId);
      const upload = signed.data.upload as { url: string; method: string; headers?: Record<string, string> };

      // 2) Upload file to signed URL (or local dev endpoint)
      let uploadOk = false;
      try {
        const isLocal = /\/api\/uploads\/.+\/local$/.test(upload.url);
        if (isLocal) {
          const fd2 = new FormData();
          fd2.append('file', file);
          const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;
          const respLocal = await fetch(upload.url, { method: upload.method || 'POST', headers: authHeaders, body: fd2 });
          uploadOk = respLocal.ok;
        } else {
          const resp = await fetch(upload.url, { method: upload.method || 'PUT', headers: upload.headers || {}, body: file });
          uploadOk = resp.ok;
        }
      } catch {}
      if (!uploadOk) {
        setMessages((msgs) => [...msgs, { role: 'ai', text: 'No se pudo subir el archivo al almacenamiento.' }]);
        return;
      }

      // 3) Confirm upload (record uploadedAt)
      await fetch(`${apiBase}/api/uploads/${documentId}/confirm`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }).catch(() => ({} as any));

      if (!hideDebug) setMessages((msgs) => [...msgs, { role: 'ai', text: 'Documento subido y registrado.' }]);
      setAttachmentDataShown(true);
    } finally {
      setAttachmentDataShown(true);
      setUploadingDoc(false);
    }
  }

  // RUT helpers delegating to shared validators (reuse from policies page)
  function normalizeRutLocal(raw?: any): string {
    if (!raw) return '';
    const n = normalizeRutCL(String(raw));
    return n || '';
  }
  function isValidRutLocal(rut?: string): boolean {
    if (!rut) return false;
    return validateRutCL(rut);
  }

  const handleSend = async () => {
    if (needsPolicies || sending) return; // gated / avoid double send
    // Block send if there are attachments but we haven't yet shown the preloaded data from them
    if (attachments.length > 0 && !attachmentDataShown) return;
    const text = input.trim();
    const attachNames = attachments.map(a => a.file.name);
    const attachMap = new Map(classifiedUploads.map(x => [x.name, x] as const));
    const documentIds = classifiedUploads.map(x => x.documentId);
    // Require non-empty text to send, regardless of attachments
    if (!text) return;

    // 1) Push user message (include a compact list of attachment names)
    const userText = attachNames.length ? `${text}\nAdjuntos: ${attachNames.join(', ')}` : text;
    setMessages((msgs) => [...msgs, { role: 'user', text: userText }]);

    // 2) Clear composer state (keep attachments buffer after send if you prefer; here we keep them for reutilizar)
    setInput('');
    setSending(true);

    // 3) Add a temporary AI loader bubble
    setMessages((msgs) => [...msgs, { role: 'ai', text: '::loader::' }]);

    // 3.1) If we already extracted hints locally, show a tiny meta message immediately
    if (extractedHints.rut || extractedHints.razon_social) {
      setMessages((msgs) => [...msgs, { role: 'ai', text: '::meta::', meta: { collected: { ...extractedHints }, missing: [] } }]);
    }

    // 3.9) Quick local RUT validation: if we have a rut hint and it looks invalid, ask for correction before calling backend
    const hintRut = extractedHints.rut ? normalizeRutLocal(extractedHints.rut) : '';
    if (hintRut && !isValidRutLocal(hintRut)) {
      setMessages((msgs) => {
        const copy = msgs.slice();
        const idx = copy.findIndex((m, i) => m.text === '::loader::' && i === copy.length - 1);
        const txt = 'El RUT parece inválido. ¿Podrías confirmarlo en formato 12.345.678-9?';
        if (idx >= 0) copy[idx] = { role: 'ai', text: txt };
        else copy.push({ role: 'ai', text: txt });
        return copy;
      });
      setSending(false);
      return;
    }

    try {
      const res = await apiPost<any>(
        '/api/chat/messages',
        {
          message: text,
          context: {
            companyId,
            attachments: attachNames,
            documentIds,
            attachmentsClassified: classifiedUploads,
            extracted: extractedHints,
            analysis,
            documentId: lastDocumentId || undefined,
            // Dev/testing: force LLM path (bypasses heuristics/guardrails)
            debugForceLLM: forceLLM || undefined,
          },
          thinkingBudget: 0,
        },
      );
      const aiMsg = res?.data?.message || 'Procesado.';
      // Replace last loader with the real message
      setMessages((msgs) => {
        const copy = msgs.slice();
        const idx = copy.findIndex((m, i) => m.text === '::loader::' && i === copy.length - 1);
        if (idx >= 0) copy[idx] = { role: 'ai', text: aiMsg };
        else copy.push({ role: 'ai', text: aiMsg });
        return copy;
      });

      // Push a meta summary message with collected/missing
      const debugBlock = (res as any)?.data?.debug || {};
      const policyMissing = debugBlock?.missingPolicyFeatures || [];
      const suggestions = debugBlock?.suggestions || [];
      const aiSource = debugBlock?.aiSource as string | undefined;
      const signals = (res as any)?.data?.signals || null;
      const collectedCompanyId = (res as any)?.data?.collected?.companyId || (res as any)?.data?.debug?.extracted?.companyId;
      if (collectedCompanyId && !companyId) setCompanyId(collectedCompanyId);
      setMessages((msgs) => [...msgs, { role: 'ai', text: '::meta::', meta: {
        intent: res?.data?.intent,
        mode: (res as any)?.data?.mode,
        missing: res?.data?.missing || [],
        policyMissing,
        suggestions,
        aiSource,
        signals: signals || undefined,
        requiredAttachments: Array.isArray(signals?.requiredAttachments) ? signals.requiredAttachments : undefined,
        stage: signals?.stage,
        collected: { ...extractedHints, ...(res?.data?.collected || {}) },
      } }]);

      // Optional: if the model signals that attachments are required and none were provided, nudge the user.
      try {
        const attachCount = attachments.length + (Array.isArray(classifiedUploads) ? classifiedUploads.length : 0);
        const needAttach = Boolean(signals && signals.stage === 'need_attachments' && Array.isArray(signals.requiredAttachments) && signals.requiredAttachments.length > 0 && attachCount === 0);
        if (needAttach) {
          const list = (signals.requiredAttachments as string[]).join(', ');
          setMessages((msgs) => [...msgs, { role: 'ai', text: `Puedes adjuntar evidencia con el clip. Requerido: ${list}.` }]);
        }
      } catch {}

      // Merge enriched features coming from backend debug into our analysis state
      try {
        const debugFeatures = (res as any)?.data?.debug?.analysis?.features || {};
        if (debugFeatures && Object.keys(debugFeatures).length > 0) {
          setAnalysis((prev) => ({
            features: { ...(prev?.features || {}), ...debugFeatures },
            found: Array.from(new Set([...(prev?.found || []), ...Object.keys(debugFeatures)])),
            missing: (prev?.missing || []).filter((k) => !(k in debugFeatures)),
          }));
        }
      } catch {}

      // If backend sent debug summary (policy + extracted + attachments), render as raw JSON for auditing
      if (!hideDebug && (res as any)?.data?.debug ) {
        const raw = JSON.stringify((res as any).data.debug, null, 2);
        setMessages((msgs) => [...msgs, { role: 'ai', text: '```json\n' + raw + '\n```' }]);
      }
      // If backend provided an antifraud recommendation, show it clearly
      if ((res as any)?.data?.recommendation) {
        const rec = String((res as any).data.recommendation);
        setMessages((msgs) => [...msgs, { role: 'ai', text: rec }]);
      }
    } catch (e: any) {
      setMessages((msgs) => {
        const copy = msgs.slice();
        const idx = copy.findIndex((m, i) => m.text === '::loader::' && i === copy.length - 1);
        const fallback = 'No pude procesar tu consulta en este momento.';
        if (idx >= 0) copy[idx] = { role: 'ai', text: fallback };
        else copy.push({ role: 'ai', text: fallback });
        return copy;
      });
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('prismal_token');
    router.push('/login');
  };

  return (
    <main className="min-h-screen app-bg">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 md:left-64 z-40 px-4 sm:px-6 lg:px-8 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-card backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-2">
            {/* Hamburger (solo mobile) */}
            <button className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden" aria-label="Abrir menú" onClick={() => setSidebarOpen((v) => !v)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
            {/* Selector de empresa (navbar left) */}
            <div className="relative">
              <select
                className="appearance-none rounded-full border border-slate-200 bg-white/70 px-3 py-1 pr-8 text-xs shadow-sm outline-none hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800"
                value={companyId || ''}
                onChange={(e) => onChangeCompany(e.target.value)}
              >
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1.5 text-slate-400">▾</span>
            </div>
            {/* brand removida del top bar, se movió al sidebar */}
          </div>
          <div className="relative flex items-center gap-2">
            <ThemeToggle />
            {/* Force LLM toggle (testing) */}
            <button
              title={forceLLM ? 'Forzar IA (ON)' : 'Forzar IA (OFF)'}
              className={`rounded-full border px-2 py-1 text-xs shadow-sm transition-colors ${forceLLM ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200' : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
              onClick={() => setForceLLM((v) => !v)}
            >LLM</button>
            {/* Profile button */}
            <button className="rounded-full border border-slate-200 bg-white/60 px-3 py-2 text-sm shadow-sm hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" onClick={() => setProfileOpen((v) => !v)}>
              {profile?.name || profile?.email || 'Perfil'}
            </button>

            {/* Anchored dropdown under the button */}
            {profileOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="px-2 py-1 text-sm text-slate-600 dark:text-slate-300">
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{profile?.name || 'Mi perfil'}</div>
                  <div className="text-xs text-slate-500">{profile?.email}</div>
                </div>
                <div className="mt-2 rounded-xl bg-slate-50 p-2 text-xs dark:bg-slate-800/60">
                  <div>Rol: <span className="font-semibold">{profile?.role}</span></div>
                  <div>Créditos: <span className="font-semibold">{profile?.credits ?? '-'}</span></div>
                </div>
                <div className="mt-3 grid gap-2 text-sm">
                  <button className="rounded-xl px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => { if (typeof window!== 'undefined') { localStorage.setItem('navigatingToPolicies','1'); window.location.href = '/policies'; } }}>Configurar políticas de riesgo</button>
                  <button className="rounded-xl px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800">Cambiar contraseña</button>
                  <button className="rounded-xl px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800" onClick={handleLogout}>Cerrar sesión</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* (Dropdown now anchored inside the top bar container) */}

      {/* Chat area */}
      <div className="md:ml-64">
        {/* aumenta padding top para bajar contenido central */}
        <div className="container-page pt-36 md:pt-44 pb-32">
          <div className="mx-auto max-w-3xl">
            {/* Header cluster aligned to AI bubble left edge */}
            <div className="mb-5 space-y-3">
              {needsPolicies && (
                <div className="flex justify-center md:justify-start">
                  <div className="w-fit md:max-w-[85%] mx-auto md:mx-0 flex flex-col items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-center text-xs leading-snug text-amber-800 shadow-sm md:flex-row md:items-center md:gap-2 md:rounded-full md:px-4 md:text-left md:text-sm dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                    <div className="inline-flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-500 md:h-4 md:w-4"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01"/></svg>
                      <span>Para comenzar a usar Prismal AI define tus políticas de riesgo.</span>
                    </div>
                    <button
                      className="rounded-full bg-gradient-to-r from-logo-start via-logo-mid to-logo-end px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:opacity-90 md:text-xs"
                      onClick={() => {
                        if (typeof window!== 'undefined') { localStorage.setItem('navigatingToPolicies','1'); window.location.href = '/policies'; }
                      }}
                    >Ir a Políticas</button>
                  </div>
                </div>
              )}
            </div>
            {/* Quick actions centered, independent row */}
            <div className="mb-2 flex justify-center">
              <div className={`${needsPolicies ? 'pointer-events-none opacity-60' : ''} inline-block`}>
                <QuickActions onPick={(text) => {
                  if (needsPolicies) return;
                  // insert as user message inmediatamente
                  setMessages((msgs) => [...msgs, { role: 'user', text }]);
                  setTimeout(() => {
                    setMessages((msgs) => [
                      ...msgs,
                      { role: 'ai', text: 'Ejecutando acción predefinida… (placeholder)' },
                    ]);
                  }, 300);
                }} />
              </div>
            </div>
            {/* Intro bubble under quick actions until first user message */}
            {!hasUserTurn && (
              <div className="mb-6 flex justify-center">
                <div className="max-w-[90%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-card ring-1 bg-white/80 ring-slate-200 text-slate-700 dark:bg-slate-900/60 dark:ring-slate-800 dark:text-slate-200">
                  <span className="whitespace-pre-wrap">¡Bienvenido! ¿En qué evaluación de crédito te ayudo hoy?</span>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-card ring-1 ${m.role === 'ai' ? 'bg-white/80 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-800' : 'bg-gradient-to-r from-logo-start via-logo-mid to-logo-end text-white ring-transparent'}`}>
                    {m.text === '::loader::' ? (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                        <span className="relative inline-flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-logo-mid opacity-60"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-logo-end"></span>
                        </span>
                        <span>Procesando solicitud…</span>
                      </div>
                    ) : m.text === '::meta::' && m.meta ? (
                      <div className="space-y-2 text-sm">
                        {/* Progress (only in evaluate mode) */}
                        {(() => {
                          const mode = (m as any)?.meta?.mode || 'conversation';
                          if (mode !== 'evaluate') return null;
                          // Hide when inline inputs (RUT + monto) will be shown
                          const missNorm = (m.meta?.missing || []).map((k: any) => String(k || '')
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/\s+/g, ' ')
                            .trim());
                          const amountAliases = ['monto_credito','monto credito','monto de credito','monto de crédito','monto','monto solicitado','credito solicitado','crédito solicitado'];
                          const attachmentsPresentUI = (attachments.length > 0) || (classifiedUploads.length > 0) || !!lastDocumentId || ((docStatus?.status || '') === 'extracted');
                          const showInlineInputs = missNorm.some((k: string) => amountAliases.includes(k)) && attachmentsPresentUI;
                          if (showInlineInputs) return null;
                          const collected = m.meta?.collected || {};
                          const have = ['rut','razon_social','monto_credito'].filter((k) => (collected as any)[k] || (k !== 'monto_credito' && (extractedHints as any)[k]));
                          const total = 3;
                          return (
                            <div className="mb-1 text-slate-600 dark:text-slate-300">Capturados {have.length}/{total}</div>
                          );
                        })()}
                        {/* Collected chips (prefer meta, fallback to hints) */}
                        {(() => {
                          const mode = (m as any)?.meta?.mode || 'conversation';
                          if (mode === 'evaluate') {
                            const missNorm = (m.meta?.missing || []).map((k: any) => String(k || '')
                              .toLowerCase()
                              .normalize('NFD')
                              .replace(/[\u0300-\u036f]/g, '')
                              .replace(/\s+/g, ' ')
                              .trim());
                            const amountAliases = ['monto_credito','monto credito','monto de credito','monto de crédito','monto','monto solicitado','credito solicitado','crédito solicitado'];
                            const attachmentsPresentUI = (attachments.length > 0) || (classifiedUploads.length > 0) || !!lastDocumentId || ((docStatus?.status || '') === 'extracted');
                            const showInlineInputs = missNorm.some((k: string) => amountAliases.includes(k)) && attachmentsPresentUI;
                            if (showInlineInputs) return null;
                          }
                          const rutChip = (m.meta?.collected?.rut) || extractedHints.rut;
                          const rsChip = (m.meta?.collected?.razon_social) || extractedHints.razon_social;
                          if (!rutChip && !rsChip) return null;
                          return (
                            <div className="flex flex-wrap items-center gap-2">
                              {rutChip && (
                                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                  RUT: <strong>{rutChip}</strong>
                                </span>
                              )}
                              {rsChip && (
                                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                  Razón Social: <strong className="truncate max-w-[220px]">{rsChip}</strong>
                                </span>
                              )}
                            </div>
                          );
                        })()}
                        {/* Source chip (aiSource) */}
                        {(() => {
                          const mode = (m as any)?.meta?.mode || 'conversation';
                          if (mode === 'evaluate') {
                            const missNorm = (m.meta?.missing || []).map((k: any) => String(k || '')
                              .toLowerCase()
                              .normalize('NFD')
                              .replace(/[\u0300-\u036f]/g, '')
                              .replace(/\s+/g, ' ')
                              .trim());
                            const amountAliases = ['monto_credito','monto credito','monto de credito','monto de crédito','monto','monto solicitado','credito solicitado','crédito solicitado'];
                            const attachmentsPresentUI = (attachments.length > 0) || (classifiedUploads.length > 0) || !!lastDocumentId || ((docStatus?.status || '') === 'extracted');
                            const showInlineInputs = missNorm.some((k: string) => amountAliases.includes(k)) && attachmentsPresentUI;
                            if (showInlineInputs) return null;
                          }
                          const src = (m as any)?.meta?.aiSource as string | undefined;
                          if (!src) return null;
                          const label = src === 'llm' ? 'Fuente: LLM' : src === 'guardrail' ? 'Fuente: Guardrail' : src === 'heuristic' ? 'Fuente: Heurística' : src === 'llm+tool' ? 'Fuente: LLM+Tool' : `Fuente: ${src}`;
                          return (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
                                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                                {label}
                              </span>
                            </div>
                          );
                        })()}
                        {/* Missing chips (core) - only in evaluate mode */}
                        {(() => {
                          const mode = (m as any)?.meta?.mode || 'conversation';
                          if (mode !== 'evaluate') return null;
                          // If we're going to render the inline inputs (RUT + monto), hide these chips
                          const missNorm = (m.meta?.missing || []).map((k: any) => String(k || '')
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/\s+/g, ' ')
                            .trim());
                          const amountAliases = [
                            'monto_credito', 'monto credito', 'monto de credito', 'monto de crédito',
                            'monto', 'monto solicitado', 'credito solicitado', 'crédito solicitado',
                          ];
                          const attachmentsPresentUI = (attachments.length > 0) || (classifiedUploads.length > 0) || !!lastDocumentId || ((docStatus?.status || '') === 'extracted');
                          const hideBecauseInlineInputs = missNorm.some((k: string) => amountAliases.includes(k)) && attachmentsPresentUI;
                          if (hideBecauseInlineInputs) return null;
                          if (!m.meta.missing || m.meta.missing.length === 0) return null;
                          return (
                            <div className="flex flex-wrap items-center gap-2">
                              {m.meta.missing.map((k, i) => (
                                <span key={i} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                                  Falta: <strong>{k.replace('_',' ')}</strong>
                                </span>
                              ))}
                            </div>
                          );
                        })()}

                        {/* Missing chips (policy-driven) - only in evaluate mode */}
                        {(() => {
                          const mode = (m as any)?.meta?.mode || 'conversation';
                          if (mode !== 'evaluate') return null;
                          // Hide policy chips when inline inputs (RUT + monto) will show
                          const missNorm = (m.meta?.missing || []).map((k: any) => String(k || '')
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/\s+/g, ' ')
                            .trim());
                          const amountAliases = [
                            'monto_credito', 'monto credito', 'monto de credito', 'monto de crédito',
                            'monto', 'monto solicitado', 'credito solicitado', 'crédito solicitado',
                          ];
                          const attachmentsPresentUI = (attachments.length > 0) || (classifiedUploads.length > 0) || !!lastDocumentId || ((docStatus?.status || '') === 'extracted');
                          const hideBecauseInlineInputs = missNorm.some((k: string) => amountAliases.includes(k)) && attachmentsPresentUI;
                          if (hideBecauseInlineInputs) return null;
                          if (!m.meta.policyMissing || m.meta.policyMissing.length === 0) return null;
                          return (
                            <div className="flex flex-wrap items-center gap-2">
                              {m.meta.policyMissing.map((k, i) => (
                                <span key={i} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                                  Falta (política): <strong>{k}</strong>
                                </span>
                              ))}
                            </div>
                          );
                        })()}

                        {/* Evaluation chips from signals: score, grade, and alerts */}
                        {(() => {
                          const mode = (m as any)?.meta?.mode || 'conversation';
                          if (mode === 'evaluate') {
                            const missNorm = (m.meta?.missing || []).map((k: any) => String(k || '')
                              .toLowerCase()
                              .normalize('NFD')
                              .replace(/[\u0300-\u036f]/g, '')
                              .replace(/\s+/g, ' ')
                              .trim());
                            const amountAliases = ['monto_credito','monto credito','monto de credito','monto de crédito','monto','monto solicitado','credito solicitado','crédito solicitado'];
                            const attachmentsPresentUI = (attachments.length > 0) || (classifiedUploads.length > 0) || !!lastDocumentId || ((docStatus?.status || '') === 'extracted');
                            const showInlineInputs = missNorm.some((k: string) => amountAliases.includes(k)) && attachmentsPresentUI;
                            if (showInlineInputs) return null;
                          }
                          const sig = (m as any)?.meta?.signals || null;
                          if (!sig) return null;
                          const hasEval = sig.stage === 'evaluated' || sig.score != null || sig.grade != null;
                          if (!hasEval) return null;
                          const alerts: string[] = Array.isArray(sig.alerts) ? sig.alerts : [];
                          const showRutCTA = (() => {
                            try {
                              const ctRut = extractedHints.ct_rut || '';
                              const chosenRut = extractedHints.rut || '';
                              if (!ctRut) return false;
                              if (!chosenRut) return true; // no chosen yet, propose adopt ct
                              return ctRut && chosenRut && ctRut !== chosenRut;
                            } catch { return false; }
                          })();
                          return (
                            <div className="mt-2 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                {sig.score != null && (
                                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                    Score: <strong>{sig.score}</strong>
                                  </span>
                                )}
                                {sig.grade && (
                                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
                                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                                    Grade: <strong>{sig.grade}</strong>
                                  </span>
                                )}
                              </div>
                              {alerts.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                  {alerts.slice(0, 6).map((a, i) => (
                                    <span key={i} title={a} className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200 max-w-[280px] truncate">
                                      <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                                      <span className="truncate">{a}</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                              {showRutCTA && (
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    className="rounded-full bg-gradient-to-r from-logo-start via-logo-mid to-logo-end px-3 py-1 text-xs font-semibold text-white shadow-card hover:opacity-90"
                                    onClick={() => {
                                      const ctRut = extractedHints.ct_rut || '';
                                      if (!ctRut) return;
                                      setExtractedHints((prev) => ({ ...prev, rut: ctRut }));
                                      setMessages((msgs) => [...msgs, { role: 'ai', text: `Usaré el RUT de la Carpeta (${ctRut}) para los siguientes pasos.` }]);
                                    }}
                                  >Usar RUT de la Carpeta ({extractedHints.ct_rut})</button>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Inline identity (RUT) + amount + proceed evaluation */}
                        {(() => {
                          const missing = m.meta?.missing || [];
                          const mode = (m as any)?.meta?.mode || 'conversation';
                          const collected = m.meta?.collected || {};
                          const hasIdentity = !!collected.rut || !!collected.razon_social || !!extractedHints.rut || !!extractedHints.razon_social;
                          const missNorm = (missing || []).map((k: any) => String(k || '')
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '') // remove accents
                            .replace(/\s+/g, ' ')
                            .trim());
                          const amountAliases = [
                            'monto_credito',
                            'monto credito',
                            'monto de credito',
                            'monto de crédito',
                            'monto',
                            'monto solicitado',
                            'credito solicitado',
                            'crédito solicitado',
                          ].map(s => s
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .trim());
                          // Determine if attachments are required and whether they are present in UI
                          const sigAny = (m as any)?.meta?.signals || {};
                          const requiresAttachments = (() => {
                            try {
                              if (Array.isArray(sigAny.requiredAttachments) && sigAny.requiredAttachments.length > 0) return true;
                              return missNorm.includes('informe_comercial') || missNorm.includes('carpeta_tributaria');
                            } catch { return false; }
                          })();
                          const attachmentsPresentUI = (attachments.length > 0) || (classifiedUploads.length > 0) || !!lastDocumentId || ((docStatus?.status || '') === 'extracted');
                          if (requiresAttachments && !attachmentsPresentUI) {
                            return (
                              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                                Para continuar, adjunta primero los documentos requeridos con el clip
                                {(Array.isArray(sigAny.requiredAttachments) && sigAny.requiredAttachments.length > 0) ? ` (${sigAny.requiredAttachments.join(', ')})` : ''}.
                              </div>
                            );
                          }
                          const showAmountInput = (mode === 'evaluate') && missNorm.some((k: string) => amountAliases.includes(k)) && attachmentsPresentUI;
                          if (!showAmountInput) return null;
                          return (
                            <div className="mt-2 flex flex-col gap-2">
                              {/* RUT input (helps identity validation and enrich back-end features) */}
                              <label className="text-xs text-slate-500 dark:text-slate-400">RUT del cliente</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  className={`w-56 rounded-lg border bg-white/70 px-3 py-1 text-sm outline-none dark:bg-slate-800 ${rutInput && !isValidRutLocal(rutInput) ? 'border-rose-400 dark:border-rose-600' : 'border-slate-300 dark:border-slate-700'}`}
                                  value={rutInput}
                                  onChange={(e) => setRutInput(formatRutCL(e.target.value))}
                                  placeholder={extractedHints.rut || '12.345.678-5'}
                                />
                                {rutInput && !isValidRutLocal(rutInput) && (
                                  <span className="text-xs text-rose-600 dark:text-rose-400">Formato inválido</span>
                                )}
                                {rutInput && isValidRutLocal(rutInput) && (
                                  <span className="text-xs text-emerald-600 dark:text-emerald-400">✓ Válido</span>
                                )}
                              </div>
                              <label className="text-xs text-slate-500 dark:text-slate-400">Monto de crédito (CLP)</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  className="w-56 rounded-lg border border-slate-300 bg-white/70 px-3 py-1 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
                                  value={amountInput}
                                  onChange={(e) => {
                                    const digits = e.target.value.replace(/[^0-9]/g, '');
                                    const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                                    setAmountInput(formatted);
                                  }}
                                  placeholder="Ej: 15.000.000"
                                />
                                <button
                                  className="rounded-full bg-gradient-to-r from-logo-start via-logo-mid to-logo-end px-3 py-1.5 text-sm font-semibold text-white shadow-card disabled:opacity-50"
                                  disabled={sending || !amountInput || !isValidRutLocal(rutInput)}
                                  onClick={async () => {
                                    const val = parseInt(amountInput.replace(/\./g, ''), 10);
                                    if (!Number.isFinite(val) || val <= 0) return;
                                    // Determine RUT to use: prefer user input, fallback to extracted hint
                                    const rutCandidate = rutInput.trim() || extractedHints.rut || '';
                                    const rutNorm = rutCandidate ? normalizeRutLocal(rutCandidate) : '';
                                    if (!rutNorm || !isValidRutLocal(rutNorm)) {
                                      setMessages((msgs) => [...msgs, { role: 'ai', text: 'El RUT parece inválido. ¿Podrías confirmarlo en formato 12.345.678-9?' }]);
                                      return;
                                    }
                                    setSending(true);
                                    try {
                                      let targetCompanyId = companyId;
                                      // Resolve or create company by provided RUT (+ optional name)
                                      if (!targetCompanyId && (rutNorm || (extractedHints.rut && extractedHints.razon_social))) {
                                        try {
                                          const resolved = await apiPost<any>('/api/companies/resolve-or-create', {
                                            rut: rutNorm || extractedHints.rut,
                                            name: extractedHints.razon_social,
                                            metadata: { source: 'chat' },
                                          });
                                          targetCompanyId = (resolved as any)?.data?.companyId || targetCompanyId;
                                          if (targetCompanyId) setCompanyId(targetCompanyId);
                                        } catch {}
                                      }
                                      if (!targetCompanyId) {
                                        setMessages((msgs) => [...msgs, { role: 'ai', text: 'No pude identificar la empresa automáticamente. Selecciona una empresa o ingresa RUT y Razón Social.' }]);
                                        setSending(false);
                                        return;
                                      }
                                      const identity = {
                                        rut: rutNorm,
                                        razon_social: extractedHints.razon_social,
                                        company: (rutNorm || extractedHints.razon_social) ? { rut: rutNorm, name: extractedHints.razon_social } : undefined,
                                      } as any;
                                      // Persist chosen RUT hint for subsequent turns
                                      setExtractedHints((prev) => ({ ...prev, rut: rutNorm }));
                                      const resp = await apiPost<{ ok: boolean; data: any }>(
                                        '/api/evaluations',
                                        {
                                          companyId: targetCompanyId,
                                          documentId: lastDocumentId || undefined,
                                          // Ensure evaluated identity reaches backend
                                          extracted: identity,
                                          collected: identity,
                                          features: { requestedAmount: val, ...(analysis?.features || {}) },
                                        },
                                      );
                                      const d: any = resp?.data || {};
                                      const evalId = d._id || d.evaluationId;
                                      const summary = d.summaryCard || { score: d.score, lineSuggestedCLP: 0, riskPct: 0, riskLabel: '—' };
                                      setMessages((msgs) => [
                                        ...msgs,
                                        { role: 'ai', text: '::eval-card::', meta: { eval: { id: String(evalId || ''), summaryCard: summary } } },
                                      ]);
                                      if (!hideDebug) {
                                        const rawEval = JSON.stringify(resp, null, 2);
                                        setMessages((msgs) => [...msgs, { role: 'ai', text: '```json\n' + rawEval + '\n```' }]);
                                      }
                                    } catch (e) {
                                      setMessages((msgs) => [...msgs, { role: 'ai', text: 'No fue posible crear la evaluación en este momento.' }]);
                                    } finally {
                                      setSending(false);
                                    }
                                  }}
                                >Continuar</button>
                              </div>
                              {/* Hide suggestions and extra guidance to keep only inputs + Continuar */}
                            </div>
                          );
                        })()}
                      </div>
                    ) : m.text === '::eval-card::' ? (
                      <div className="space-y-2">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-sm text-slate-300">Evaluación de Riesgo</div>
                          <span className="rounded-full bg-emerald-900/40 px-2 py-0.5 text-xs text-emerald-300">{m.meta?.eval?.summaryCard?.riskLabel}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-xl bg-slate-800/60 p-3 text-center">
                            <div className="text-3xl font-bold">{m.meta?.eval?.summaryCard?.score}</div>
                            <div className="text-xs text-slate-400">Score Crediticio</div>
                          </div>
                          <div className="rounded-xl bg-slate-800/60 p-3 text-center">
                            <div className="text-2xl font-bold text-emerald-300">${(m.meta?.eval?.summaryCard?.lineSuggestedCLP ?? 0).toLocaleString('es-CL')}</div>
                            <div className="text-xs text-slate-400">Línea Sugerida</div>
                          </div>
                          <div className="rounded-xl bg-slate-800/60 p-3 text-center">
                            <div className="text-2xl font-bold">{m.meta?.eval?.summaryCard?.riskPct}%</div>
                            <div className="text-xs text-slate-400">Riesgo Estimado</div>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button onClick={() => router.push(`/evaluations/${m.meta?.eval?.id}` as any)} className="rounded-full bg-gradient-to-r from-logo-start via-logo-mid to-logo-end px-3 py-1.5 text-sm font-semibold text-white shadow-card">Ver resultado</button>
                        </div>
                      </div>
                    ) : m.text.startsWith('```') ? (
                      <pre className="whitespace-pre-wrap rounded-xl bg-slate-900/70 p-3 text-xs ring-1 ring-white/10">
                        {m.text.replace(/^```[a-zA-Z]*\n?/,'').replace(/```$/,'')}
                      </pre>
                    ) : (
                      <span className="whitespace-pre-wrap">{m.text}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="fixed bottom-6 z-40 left-0 right-0 md:left-64 px-4 sm:px-6 lg:px-8">
        <div className={`mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white/80 px-2 py-2 shadow-card backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 ${needsPolicies ? 'opacity-60' : ''}`}>
          {/* Attachment strip */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 px-2">
              {attachments.map((a) => (
                <div key={a.id} className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 shadow-sm hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-logo-mid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 01-7.78-7.78l8.49-8.49a3.5 3.5 0 015 5l-8.49 8.49a1.5 1.5 0 01-2.12-2.12l7.78-7.78"/></svg>
                  <span className="max-w-[180px] truncate">{a.file.name}</span>
                  <button className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700" onClick={() => setAttachments((list) => list.filter(x => x.id !== a.id))} title="Quitar">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            {/* Attachment */}
            <label className={`rounded-xl p-2 ${needsPolicies || uploadingDoc ? 'pointer-events-none opacity-60' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Adjuntar archivo">
              <input ref={fileInputRef} type="file" className="hidden" onChange={async (e) => {
                if (needsPolicies || uploadingDoc) return;
                const f = e.target.files?.[0];
                if (f) {
                  // one-file per selection, but accumulate across selections
                  setAttachments((list) => [...list, { id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`, file: f }]);
                  setAttachmentDataShown(false);
                  // quick local text sniff (pdf first pages) to prefill RUT/razon_social
                  try {
                    if (f.type === 'application/pdf') {
                      const txt = await extractPdfTextFirstPages(f, 2);
                      const rut = extractRutFromText(txt) || extractedHints.rut;
                      const razon = extractRazonSocialHeuristic(txt) || extractedHints.razon_social;
                      setExtractedHints((prev) => ({ ...prev, rut: rut || prev.rut, razon_social: razon || prev.razon_social }));
                    }
                  } catch {}
                  // generic early-AI flow
                  await processUploadGeneric(f);
                }
                if (fileInputRef.current) fileInputRef.current.value = '';
              }} />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 01-7.78-7.78l8.49-8.49a3.5 3.5 0 015 5l-8.49 8.49a1.5 1.5 0 01-2.12-2.12l7.78-7.78"/></svg>
            </label>
            <input
              className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-slate-400"
              placeholder={attachments.length ? `${attachments.length} adjunto(s) listo(s)` : 'Escribe tu consulta sobre evaluación crediticia…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const t = input.trim();
                  if (!t) { e.preventDefault(); return; }
                  if (attachments.length > 0 && !attachmentDataShown) { e.preventDefault(); return; }
                  handleSend();
                }
              }}
              readOnly={needsPolicies}
            />
            <button className="rounded-full bg-gradient-to-r from-logo-start via-logo-mid to-logo-end px-4 py-2 text-sm font-semibold text-white shadow-card hover:opacity-90 disabled:opacity-50" onClick={handleSend} disabled={needsPolicies || sending || !input.trim() || (attachments.length > 0 && !attachmentDataShown)} title={!input.trim() ? 'Escribe un mensaje para enviar' : ((attachments.length > 0 && !attachmentDataShown) ? 'Primero se mostrarán los datos precargados del PDF' : undefined)}>
              Enviar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
