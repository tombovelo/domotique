import { create } from 'zustand';
import { authService } from '@/services/auth';
import { saveToken, saveRefreshToken, clearTokens, loadToken } from '@/services/api';
import type { User } from '@/types';

type AuthStore = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (codeAcces: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasAccess: (roomId: number) => boolean;
  getAccessibleRoomIds: () => number[];
};

export const useAuth = create<AuthStore>((set, get) => ({
  isAuthenticated: false,
  user: null,
  loading: true,

  login: async (codeAcces: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await authService.login(codeAcces, { signal: controller.signal });
      await saveToken(res.accessToken);
      await saveRefreshToken(res.refreshToken);
      const user = await authService.me({ signal: controller.signal });
      set({ isAuthenticated: true, user });
      return true;
    } catch (e: any) {
      if (e?.status === 408 || e?.name === 'AbortError') {
        console.log('[LOGIN TIMEOUT]', e?.message);
      } else {
        console.log('[LOGIN ERROR]', e?.status, e?.message, e?.data);
      }
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  logout: async () => {
    authService.logout().catch(() => {});
    await clearTokens();
    set({ isAuthenticated: false, user: null });
  },

  loadUser: async () => {
    try {
      const token = await loadToken();
      if (!token) {
        set({ loading: false });
        return;
      }
      const user = await authService.me();
      set({ isAuthenticated: true, user, loading: false });
    } catch {
      await clearTokens();
      set({ loading: false });
    }
  },

  refreshUser: async () => {
    try {
      const user = await authService.me();
      set({ user });
    } catch {}
  },

  hasAccess: (roomId: number) => {
    const { user } = get();
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return user.permissions.some((p) => p.room.id === roomId && p.acces);
  },

  getAccessibleRoomIds: () => {
    const { user } = get();
    if (!user) return [];
    if (user.role === 'ADMIN') return [];
    return user.permissions.filter((p) => p.acces).map((p) => p.room.id);
  },
}));
