import { Profile } from '../types';
import { LocalStore } from '../lib/localStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const authService = {
  async register(data: { email: string; username: string; fullName: string; password?: string }): Promise<Profile> {
    if (isSupabaseConfigured) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password || 'Password123!',
        options: {
          data: {
            username: data.username,
            full_name: data.fullName,
          },
        },
      });
      if (authError) throw authError;

      const profile: Profile = {
        id: authData.user!.id,
        email: data.email,
        username: data.username,
        full_name: data.fullName,
        avatar_url: null,
        phone: null,
        balance: 0,
        role: 'user',
        status: 'active',
        api_key: `smm_live_${Math.random().toString(36).substring(2, 18)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await supabase.from('profiles').insert(profile);
      return profile;
    }

    // Local / Production Mode
    const existing = LocalStore.getProfileByEmailOrUsername(data.email) || LocalStore.getProfileByEmailOrUsername(data.username);
    if (existing) {
      throw new Error('Email hoặc tên đăng nhập này đã được sử dụng!');
    }

    const newProfile: Profile = {
      id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
      email: data.email,
      username: data.username,
      full_name: data.fullName,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.username}`,
      phone: null,
      balance: 0,
      role: 'user',
      status: 'active',
      api_key: `smm_live_usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const profiles = LocalStore.getProfiles();
    profiles.push(newProfile);
    LocalStore.saveProfiles(profiles);

    if (data.password) {
      LocalStore.savePassword(data.email, data.password);
      LocalStore.savePassword(data.username, data.password);
    }

    return newProfile;
  },

  async login(identifier: string, password?: string): Promise<Profile> {
    const clean = identifier.trim();

    // 1. Kiểm tra tài khoản Quản trị viên / LocalStore
    const localProfile = LocalStore.getProfileByEmailOrUsername(clean);
    if (localProfile) {
      if (password && !LocalStore.verifyPassword(clean, password)) {
        throw new Error('Mật khẩu không chính xác. Vui lòng kiểm tra lại!');
      }
      return localProfile;
    }

    // 2. Xác thực với Supabase nếu đã cấu hình
    if (isSupabaseConfigured) {
      const candidateEmails = clean.includes('@')
        ? [clean]
        : [`${clean}@gmail.com`, `${clean}1@gmail.com`];

      if (password) {
        let authRes = null;
        let lastError = null;

        for (const emailToAuth of candidateEmails) {
          authRes = await supabase.auth.signInWithPassword({
            email: emailToAuth,
            password,
          });

          if (!authRes.error) break;
          lastError = authRes.error;
        }

        if (!authRes || authRes.error) {
          throw new Error(
            lastError?.message === 'Invalid login credentials'
              ? 'Tài khoản hoặc mật khẩu không chính xác!'
              : `Lỗi kết nối Supabase: ${lastError?.message || 'Không thể đăng nhập'}`
          );
        }

        // Lấy profile khi đã có session đăng nhập thành công
        const userId = authRes.data.user?.id;
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error || !profile) {
          throw new Error('Không tìm thấy thông tin người dùng trong hệ thống!');
        }

        return profile;
      }
    }

    throw new Error('Tài khoản hoặc mật khẩu không chính xác!');
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    return LocalStore.updateProfile(userId, updates);
  },

  async regenerateApiKey(userId: string): Promise<string> {
    const newKey = `smm_live_${userId.substring(0, 4)}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 12)}`;
    await this.updateProfile(userId, { api_key: newKey });
    return newKey;
  },
};
