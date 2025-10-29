export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('prismal_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && (data.error || data.message)) || 'Request failed');
  }
  return data as T;
}

export async function postFormToUrl<T = any>(url: string, form: FormData): Promise<T> {
  const headers: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('prismal_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { method: 'POST', headers, body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && (data.error || data.message)) || 'Request failed');
  }
  return data as T;
}

export async function putBlobToUrl(url: string, blob: Blob, contentType = 'application/pdf'): Promise<void> {
  const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': contentType }, body: blob });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Upload failed (${res.status}): ${txt || res.statusText}`);
  }
}

export async function apiPostForm<T = any>(path: string, form: FormData): Promise<T> {
  const headers: Record<string, string> = { 'Cache-Control': 'no-cache' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('prismal_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers, // do NOT set Content-Type; browser will set correct boundary
    body: form,
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && (data.error || data.message)) || 'Request failed');
  }
  return data as T;
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const headers: Record<string, string> = { 'Cache-Control': 'no-cache' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('prismal_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { headers, cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && (data.error || data.message)) || 'Request failed');
  }
  return data as T;
}

export async function apiPut<T = any>(path: string, body: any): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('prismal_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && (data.error || data.message)) || 'Request failed');
  }
  return data as T;
}

export async function apiPatch<T = any>(path: string, body: any): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('prismal_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && (data.error || data.message)) || 'Request failed');
  }
  return data as T;
}

// Local API helpers (Next.js API routes on the same origin)
export async function apiLocalPost<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && (data.error || data.message)) || 'Request failed');
  }
  return data as T;
}

export async function apiLocalGet<T = any>(path: string): Promise<T> {
  const res = await fetch(path);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && (data.error || data.message)) || 'Request failed');
  }
  return data as T;
}
