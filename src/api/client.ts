/**
 * API client — single swap-in point between mock and real backend.
 *
 * When VITE_USE_MOCK_API=true all requests are handled in-memory.
 * When VITE_USE_MOCK_API=false, apiFetch delegates to the real backend
 * at VITE_API_BASE_URL, injecting the bearer token from HostContext.
 *
 * Assumptions: token injection uses the HostContext that is set up by
 * DevHostProvider (dev) or the host app (prod). The token getter is passed
 * explicitly to avoid a React-context import at the module level.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
export const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export interface FetchOptions extends RequestInit {
  getToken?: () => Promise<string>;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { getToken, ...fetchInit } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchInit.headers as Record<string, string> | undefined),
  };

  if (getToken) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchInit,
    headers,
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    const message =
      typeof body === 'object' && body !== null && 'title' in body
        ? (body as { title: string }).title
        : `HTTP ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) return undefined as unknown as T;
  return response.json() as Promise<T>;
}
