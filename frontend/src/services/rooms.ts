import { api } from './api';
import type { Room } from '@/types';

export const roomsService = {
  getAll() {
    return api<Room[]>('/api/rooms');
  },

  getAccessible() {
    return api<Room[]>('/api/rooms/accessible');
  },

  getById(id: number) {
    return api<Room & { gpioDevices: unknown[] }>(`/api/rooms/${id}`);
  },

  create(data: { nom: string; type: string; pinRelais: number; pinInterrupteur: number; icone?: string }) {
    return api<Room>('/api/rooms', { method: 'POST', body: data });
  },

  update(id: number, data: Partial<{ nom: string; type: string; pinRelais: number; pinInterrupteur: number; icone: string }>) {
    return api<Room>(`/api/rooms/${id}`, { method: 'PATCH', body: data });
  },

  toggle(id: number, etat: boolean) {
    return api<Room>(`/api/rooms/${id}/toggle`, { method: 'PATCH', body: { etat } });
  },

  delete(id: number) {
    return api<{ message: string }>(`/api/rooms/${id}`, { method: 'DELETE' });
  },
};
