import { api } from './api';
import type { User } from '@/types';

export const usersService = {
  getAll() {
    return api<User[]>('/api/users');
  },

  getById(id: number) {
    return api<User>(`/api/users/${id}`);
  },

  create(data: {
    nom: string;
    codeAcces: string;
    role?: string;
    dateExpiration?: string | null;
    permissions?: { roomId: number; acces: boolean }[];
  }) {
    return api<User>('/api/users', { method: 'POST', body: data });
  },

  update(
    id: number,
    data: Partial<{
      nom: string;
      codeAcces: string;
      role: string;
      isActive: boolean;
      dateExpiration: string | null;
      permissions: { roomId: number; acces: boolean }[];
    }>,
  ) {
    return api<User>(`/api/users/${id}`, { method: 'PATCH', body: data });
  },

  delete(id: number) {
    return api<{ message: string }>(`/api/users/${id}`, { method: 'DELETE' });
  },
};
