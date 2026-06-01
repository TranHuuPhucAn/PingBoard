const TOKEN_KEY = 'pb_token';
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days 

export function setToken(token: string): void {
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${TOKEN_MAX_AGE}; SameSite=Lax`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`${TOKEN_KEY}=([^;]+)`));
  return match ? match[1] : null;
}

export function clearToken(): void {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

export function getTokenPayload<T = Record<string, unknown>>(): T | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)) as T;
  } catch {
    return null;
  }
}