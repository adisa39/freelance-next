'use client';
import { useCallback, useEffect, useState } from 'react';

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const isForm = typeof FormData !== 'undefined' && opts.body instanceof FormData;
  const res = await fetch(path, {
    method: opts.method ?? (opts.body ? 'POST' : 'GET'),
    headers: opts.body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: opts.body ? (isForm ? (opts.body as FormData) : JSON.stringify(opts.body)) : undefined,
  });
  const json = await res.json().catch(() => ({ ok: false, error: 'Bad response' }));
  if (!json.ok) throw new Error(json.error || 'Request failed');
  return json.data as T;
}

/** GET + reload helper. Pass null to skip fetching. */
export function useApi<T = any>(path: string | null) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!!path);
  const load = useCallback(async () => {
    if (!path) return;
    try { setData(await api<T>(path)); setError(''); } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  }, [path]);
  useEffect(() => { setLoading(!!path); load(); }, [load, path]);
  return { data, error, loading, reload: load };
}

export const fmtDate = (d?: string | Date) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—');
export const fmtMoney = (n?: number) => (n ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
export const fullName = (u?: { firstname?: string; lastname?: string; username?: string }) => (u ? `${u.firstname ?? ''} ${u.lastname ?? ''}`.trim() || u.username || '—' : '—');
