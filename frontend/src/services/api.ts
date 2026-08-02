import AsyncStorage from '@react-native-async-storage/async-storage';

const PORT = 3000;
const IP_KEY = 'serverIp';

let serverIp = '127.0.0.1';

let baseUrl = `http://${serverIp}:${PORT}`;

export async function loadIp(): Promise<string> {
  const stored = await AsyncStorage.getItem(IP_KEY);
  if (stored && stored !== '127.0.0.1' && stored !== 'localhost') {
    serverIp = stored;
    baseUrl = `http://${serverIp}:${PORT}`;
    return serverIp;
  }

  try {
    const res = await fetch(`http://localhost:${PORT}/health`);
    const data = await res.json();
    if (data.ip && data.ip !== '127.0.0.1') {
      serverIp = data.ip;
      baseUrl = `http://${serverIp}:${PORT}`;
      await AsyncStorage.setItem(IP_KEY, serverIp);
    }
  } catch {}

  return serverIp;
}

export async function saveIp(ip: string): Promise<void> {
  serverIp = ip;
  baseUrl = `http://${ip}:${PORT}`;
  await AsyncStorage.setItem(IP_KEY, ip);
}

export function getBaseUrl(): string {
  return baseUrl;
}

const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

let accessToken: string | null = null;

export async function loadToken(): Promise<string | null> {
  accessToken = await AsyncStorage.getItem(TOKEN_KEY);
  return accessToken;
}

export async function saveToken(token: string): Promise<void> {
  accessToken = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function saveRefreshToken(token: string): Promise<void> {
  await AsyncStorage.setItem(REFRESH_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_KEY);
}

export async function clearTokens(): Promise<void> {
  accessToken = null;
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY]);
}

export function getAccessToken(): string | null {
  return accessToken;
}

type ApiOptions = {
  method?: string;
  body?: unknown;
  noAuth?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, noAuth = false, signal, timeoutMs } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!noAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const controller = timeoutMs ? new AbortController() : null;
  const timeoutId = timeoutMs
    ? setTimeout(() => controller?.abort(), timeoutMs)
    : null;

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: signal ?? controller?.signal,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new ApiError(res.status, data?.error || `Erreur ${res.status}`, data);
    }

    return data as T;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new ApiError(408, 'Délai dépassé');
    }
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
