import { Order, OrderStatus } from '../types';
import { LocalStore } from '../lib/localStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProviderFactory } from '../lib/providers/ProviderFactory';

export const orderService = {
  /**
   * Tạo đơn hàng mới từ phía khách hàng (Trạng thái: PENDING - Chờ Admin duyệt)
   * KHÔNG tự động gọi API nhà cung cấp ngay lập tức.
   */
  async createOrder(params: {
    userId: string;
    serviceId: string;
    serviceName?: string;
    targetUrl: string;
    quantity: number;
    totalAmount?: number;
    pricePer1000?: number;
    providerCost?: number;
    comments?: string;
    customComments?: string;
  }): Promise<{ success: boolean; orderId: string; totalAmount: number; balanceAfter: number }> {
    const comments = params.comments || params.customComments;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('create_order_atomic', {
          p_user_id: params.userId,
          p_service_id: params.serviceId,
          p_target_url: params.targetUrl,
          p_quantity: params.quantity,
          p_custom_comments: comments || null,
        });

        if (!error && data) {
          return {
            success: true,
            orderId: data.order_id,
            totalAmount: data.total_amount,
            balanceAfter: data.balance_after,
          };
        }
      } catch (err) {
        console.warn('Supabase create_order_atomic failed, fallback to LocalStore:', err);
      }
    }

    // Local Store atomic order creation (Status: pending)
    const result = LocalStore.createOrderAtomic({
      userId: params.userId,
      serviceId: params.serviceId,
      targetUrl: params.targetUrl,
      quantity: params.quantity,
      customComments: comments,
    });

    return result;
  },

  /**
   * Admin Duyệt Đơn Hàng & Bắn API sang Nhà Cung Cấp (Site Social)
   */
  async approveAndDispatchOrder(orderId: string, adminId: string): Promise<{ success: boolean; providerOrderId?: string | number }> {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error('Không tìm thấy đơn hàng');
    if (order.status !== 'pending') throw new Error(`Đơn hàng đang ở trạng thái "${order.status}", không thể duyệt lại.`);

    // Gọi API Provider tại thời điểm Admin bấm duyệt
    const provider = ProviderFactory.getProvider();
    const services = LocalStore.getServices();
    const matchedSrv = services.find(
      (s) => s.id === order.service_id || s.service_code === order.service_code
    );
    const targetServiceId = matchedSrv?.provider_service_id || order.service_code || order.service_id || '';

    let provRes;
    try {
      provRes = await provider.createOrder({
        serviceId: targetServiceId,
        target: order.target_url,
        quantity: order.quantity,
        comments: order.custom_comments || undefined,
      });
    } catch (err: any) {
      // Lỗi network / timeout: ném lỗi ra để Admin biết, đơn vẫn ở 'pending'
      throw new Error(`[Provider] Lỗi kết nối khi dispatch đơn: ${err.message}`);
    }

    if (!provRes.success) {
      // Provider trả về lỗi logic (ví dụ: link không hợp lệ, hết số dư)
      throw new Error(`[Provider] Không thể tạo đơn: ${provRes.error || 'Lỗi không xác định từ nhà cung cấp'}`);
    }

    const providerOrderId = provRes.orderId;

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'processing',
          provider_order_id: providerOrderId ? String(providerOrderId) : `PROV_${Date.now()}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;
      return { success: true, providerOrderId };
    }

    LocalStore.approveAndDispatchOrder(orderId, adminId, providerOrderId ? String(providerOrderId) : undefined);
    return { success: true, providerOrderId };
  },


  async getUserOrders(userId: string): Promise<Order[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }

    // Sync mock statuses first to simulate real-time progress
    await this.syncActiveOrders();
    return LocalStore.getOrders().filter((o) => o.user_id === userId);
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      if (error) return null;
      return data;
    }

    await this.syncActiveOrders();
    const found = LocalStore.getOrders().find((o) => o.id === orderId);
    return found || null;
  },

  async getAllOrders(): Promise<Order[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles:user_id (email, username, full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }

    await this.syncActiveOrders();
    return LocalStore.getOrders();
  },

  /**
   * Đồng bộ trạng thái đơn hàng từ Provider (Mô phỏng Cron / Edge Function)
   */
  async syncActiveOrders(): Promise<void> {
    const orders = LocalStore.getOrders();
    let hasChanges = false;
    const provider = ProviderFactory.getProvider();

    for (const order of orders) {
      if (order.status === 'processing') {
        const provStatus = await provider.getOrderStatus(order.provider_order_id || order.id);
        if (provStatus.status !== order.status || provStatus.progressPercentage !== order.progress_percentage) {
          order.status = provStatus.status;
          order.progress_percentage = provStatus.progressPercentage;
          order.current_count = provStatus.currentCount;
          order.remains = provStatus.remains;
          order.updated_at = new Date().toISOString();
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      localStorage.setItem('smm_orders', JSON.stringify(orders));
    }
  },

  async requestRefill(orderId: string): Promise<{ success: boolean; refillId?: string | number }> {
    const provider = ProviderFactory.getProvider();
    if (provider.refillOrder) {
      return provider.refillOrder(orderId);
    }
    return { success: true, refillId: `refill_${Date.now()}` };
  },

  async cancelOrder(orderId: string, adminId: string, reason: string): Promise<{ success: boolean; refundAmount: number }> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('cancel_and_refund_order', {
        p_order_id: orderId,
        p_admin_id: adminId,
        p_refund_reason: reason,
      });

      if (error) throw new Error(error.message);
      return {
        success: true,
        refundAmount: data?.refund_amount || 0,
      };
    }

    return LocalStore.cancelAndRefundOrder(orderId, adminId, reason);
  },
};
