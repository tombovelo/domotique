import { api } from './api';

export type GpioDevice = {
  id: number;
  pin: number;
  type: string;
  nom: string;
  actif: boolean;
  etat: boolean;
  roomId: number | null;
  createdAt: string;
  updatedAt: string;
  room: { id: number; nom: string } | null;
};

export const gpioService = {
  getAll() {
    return api<GpioDevice[]>('/api/gpio');
  },

  create(data: { pin: number; type: string; nom: string; roomId?: number | null; actif?: boolean }) {
    return api<GpioDevice>('/api/gpio', { method: 'POST', body: data });
  },

  update(id: number, data: Partial<{ pin: number; type: string; nom: string; roomId: number | null; actif: boolean }>) {
    return api<GpioDevice>(`/api/gpio/${id}`, { method: 'PATCH', body: data });
  },

  toggle(id: number) {
    return api<GpioDevice>(`/api/gpio/${id}/toggle`, { method: 'POST' });
  },

  delete(id: number) {
    return api<{ message: string }>(`/api/gpio/${id}`, { method: 'DELETE' });
  },
};
