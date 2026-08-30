import { create } from 'zustand';
import { Profile } from '../types';
import { LocalStore } from '../lib/localStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthState {
  user: Profile | null;
  token: string | null;
  isLoading: boolean;
  role: 'user' | 'admin';
  setUser: (user: Profile | null) => void;
  setRole: (role: 'user' | 'admin') => void;
  updateBalance: (newBalance: number) => void;
  logout: () => void;
  checkSession: () => Promise<void>;
}

const getInitialUser = (): Profile | null => {
  try {
    const stored = localStorage.getItem('smm_current_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.id) return parsed;
    }
  } catch (e) {}
  return null;
};

const initialUser = getInitialUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  token: null,
  role: initialUser?.role || 'user',
  isLoading: false,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('smm_current_user', JSON.stringify(user));
      localStorage.setItem('smm_current_user_id', user.id);
    } else {
      localStorage.removeItem('smm_current_user');
      localStorage.removeItem('smm_current_user_id');
    }
    set({ user, role: user?.role || 'user', isLoading: false });
  },

  setRole: (role) => {
    set((state) => {
      if (state.user) {
        const updated = { ...state.user, role };
        localStorage.setItem('smm_current_user', JSON.stringify(updated));
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
      localStorage.setItem('smm_current_user', JSON.stringify(updated));
      LocalStore.updateProfile(updated.id, { balance: newBalance });
      return { user: updated };
    });
  },

  logout: async () => {
    localStorage.removeItem('smm_current_user');
    localStorage.removeItem('smm_current_user_id');
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    set({ user: null, token: null, role: 'user', isLoading: false });
  },

  checkSession: async () => {
    // 1. Kiểm tra profile đã lưu trong localStorage
    const storedUserStr = localStorage.getItem('smm_current_user');
    if (storedUserStr) {
      try {
        const storedUser: Profile = JSON.parse(storedUserStr);
        if (storedUser && storedUser.id) {
          set({ user: storedUser, role: storedUser.role || 'user', isLoading: false });

          // Cập nhật ngầm từ Supabase nếu có
          if (isSupabaseConfigured) {
            try {
              const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', storedUser.id)
                .maybeSingle();

              if (data) {
                localStorage.setItem('smm_current_user', JSON.stringify(data));
                set({ user: data, role: data.role || 'user' });
              }
            } catch (err) {
              // Ignore background fetch error
            }
          }
          return;
        }
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }

    // 2. Kiểm tra session Supabase Auth
    if (isSupabaseConfigured) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUser = sessionData?.session?.user;
        if (sessionUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .maybeSingle();

          if (profile) {
            localStorage.setItem('smm_current_user', JSON.stringify(profile));
            set({ user: profile, role: profile.role || 'user', isLoading: false });
            return;
          }
        }
      } catch (e) {}
    }

    set({ user: null, role: 'user', isLoading: false });
  },
}));
