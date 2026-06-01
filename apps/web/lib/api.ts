import { getToken } from './auth';
import type { Monitor, CheckResult, Alert, CreateMonitorInput } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error ?? 'Request failed');
  }

  if (res.status === 204) return null as T;
  return res.json();
}

export const api = {
  monitors: {
    list: () =>
      apiFetch<Monitor[]>('/monitors'),
    get: (id: string) =>
      apiFetch<Monitor>(`/monitors/${id}`),
    checks: (id: string, limit = 50) =>
      apiFetch<CheckResult[]>(`/monitors/${id}/checks?limit=${limit}`),
    create: (data: CreateMonitorInput) =>
      apiFetch<Monitor>('/monitors', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateMonitorInput>) =>
      apiFetch<Monitor>(`/monitors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<void>(`/monitors/${id}`, { method: 'DELETE' }),
  },
  alerts: {
    list: () =>
      apiFetch<Alert[]>('/alerts'),
  },
};