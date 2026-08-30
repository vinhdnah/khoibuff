import { Platform, Service, ServiceCombo } from '../types';
import { LocalStore } from '../lib/localStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PLATFORMS_CONFIG } from '../config/platforms';
import { getAllDefaultServices, SERVICE_COMBOS } from '../config/services';

export const serviceCatalogService = {
  async getPlatforms(): Promise<Platform[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    }

    return LocalStore.getPlatforms();
  },

  async getServices(platformSlug?: string): Promise<Service[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('services').select('*, platforms:platform_id (*)').eq('active', true);
      if (platformSlug) {
        // Find platform id
        const { data: plat } = await supabase.from('platforms').select('id').eq('slug', platformSlug).single();
        if (plat) {
          query = query.eq('platform_id', plat.id);
        }
      }
      const { data, error } = await query.order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    }

    const services = LocalStore.getServices();
    if (platformSlug) {
      return services.filter((s) => s.platform_id === platformSlug && s.active);
    }
    return services.filter((s) => s.active);
  },

  async getAllServicesAdmin(): Promise<Service[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    }

    return LocalStore.getServices();
  },

  async getCombos(): Promise<ServiceCombo[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('service_combos')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    }

    return LocalStore.getCombos();
  },

  async updateService(serviceId: string, updates: Partial<Service>): Promise<Service> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', serviceId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const services = LocalStore.getServices();
    const idx = services.findIndex((s) => s.id === serviceId);
    if (idx === -1) throw new Error('Dịch vụ không tồn tại');
    services[idx] = { ...services[idx], ...updates, updated_at: new Date().toISOString() };
    LocalStore.saveServices(services);
    return services[idx];
  },
};
