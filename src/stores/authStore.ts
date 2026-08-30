import { create } from 'zustand';
import { Profile } from '../types';
import { LocalStore } from '../lib/localStore';

interface AuthState {
  user: Profile | null;
  token: string | null;
  isLoading: boolean;
  role: 'user' | 'admin';
  setUser: (user: Profile | null) => void;
  setRole: (role: 'user' | 'admin') => void;
  updateBalance: (newBalance: number) => void;
  logout: () => void;
  checkSession: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  role: 'user',
  isLoading: true,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('smm_current_user_id', user.id);
    } else {
      localStorage.removeItem('smm_current_user_id');
    }
    set({ user, role: user?.role || 'user', isLoading: false });
  },

  setRole: (role) => {
    set((state) => {
      if (state.user) {
        const updated = { ...state.user, role };
        LocalStore.updateProfile(state.user.id, { role });
        return { role, user: updated };
      }
      return { role };
    });
  },

  updateBalance: (newBalance) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, balance: newBalance };
      LocalStore.updateProfile(updated.id, { balance: newBalance });
      return { user: updated };
    });
  },

  logout: () => {
    localStorage.removeItem('smm_current_user_id');
    set({ user: null, token: null, isLoading: false });
  },

  checkSession: () => {
    const storedId = localStorage.getItem('smm_current_user_id');
    if (storedId) {
      const profile = LocalStore.getProfileById(storedId);
      if (profile) {
        set({ user: profile, role: profile.role || 'user', isLoading: false });
        return;
      }
    }
    set({ user: null, role: 'user', isLoading: false });
  },
}));
