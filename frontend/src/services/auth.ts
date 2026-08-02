import { api } from './api';
import type { User } from '@/types';

type RequestOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export type LoginResponse = {
  user: { id: number; nom: string; codeAcces: string; role: string };
  accessToken: string;
  refreshToken: string;
};

export type RegisterResponse = {
  id: number;
  nom: string;
  codeAcces: string;
  role: string;
};

export const authService = {
  login(codeAcces: string, options: RequestOptions = {}) {
    return api<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: { codeAcces },
      noAuth: true,
      signal: options.signal,
      timeoutMs: options.timeoutMs,
    });
  },

  register(data: { nom: string; codeAcces: string; role?: string }) {
    return api<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: data,
    });
  },

  refresh() {
    return api<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', {
      method: 'POST',
    });
  },

  logout() {
    return api<{ message: string }>('/api/auth/logout', { method: 'POST' });
  },

  me(options: RequestOptions = {}) {
    return api<User>('/api/auth/me', {
      signal: options.signal,
      timeoutMs: options.timeoutMs,
    });
  },

  verify() {
    return api<{ authenticated: boolean; user?: User }>('/api/auth/verify');
  },

  changeCode(newCode: string) {
    return api<{ id: number; nom: string; codeAcces: string; role: string }>('/api/auth/me/code', {
      method: 'PATCH',
      body: { newCode },
    });
  },
};
