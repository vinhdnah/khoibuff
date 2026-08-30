import { SmmProvider, CreateOrderParams, ProviderOrderResponse, ProviderOrderStatusResponse, ProviderBalanceResponse } from '../../lib/providers/types';
import { SiteSocialResponse, SiteSocialBalanceResponse } from './types';
import { OrderStatus } from '../../types';
import { COMBOS_CONFIG } from '../../config/services';

export interface SiteSocialConfig {
  apiUrl: string; // e.g. https://domain.com/api
  token: string;
}

/**
 * Adapter chuẩn cho "API Site Social" dựa trên tài liệu Postman chính thức:
 * https://documenter.getpostman.com/view/7443180/2sA3XWdeSc
 */
export class SiteSocialProvider implements SmmProvider {
  name = 'API Site Social (Official Provider)';
  slug = 'site-social';
  isMock = false;

  private apiUrl: string;
  private token: string;

  constructor(config: SiteSocialConfig) {
    this.apiUrl = (config.apiUrl || '').replace(/\/+$/, '');
    this.token = config.token;
  }

  private async makeRequest<T = any>(endpoint: string, bodyParams: Record<string, any>): Promise<T> {
    const url = `${this.apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const formData = new URLSearchParams();
    formData.append('token', this.token);

    Object.entries(bodyParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && k !== 'token') {
        formData.append(k, String(v));
      }
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      throw new Error(`Site Social API HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  }

  /**
   * POST /me
   * Lấy số dư tài khoản nhà cung cấp
   */
  async getBalance(): Promise<ProviderBalanceResponse> {
    try {
      const res = await this.makeRequest<SiteSocialBalanceResponse>('/me', {});
      if (res && res.status === 1 && typeof res.balance === 'number') {
        return {
          balance: res.balance,
          currency: 'VND',
        };
      }
      return { balance: 0, currency: 'VND' };
    } catch (err: any) {
      console.warn('SiteSocial getBalance error:', err);
      return { balance: 0, currency: 'VND' };
    }
  }

  /**
   * POST /prices
   * Lấy danh sách giá dịch vụ nhà cung cấp
   */
  async getServices(): Promise<any[]> {
    try {
      const res = await this.makeRequest<any>('/prices', {});
      if (res && res.status === 1 && Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Mua dịch vụ tương ứng dựa trên endpoint được cấu hình trong hệ thống
   */
  async createOrder(params: CreateOrderParams): Promise<ProviderOrderResponse> {
    try {
      // 1. Nếu là Gói Combo: Gọi API đồng thời cho TẤT CẢ các dịch vụ trong combo
      if (params.serviceId.startsWith('combo-')) {
        const combo = COMBOS_CONFIG.find((c) => c.id === params.serviceId || c.slug === params.serviceId);
        if (combo) {
          const subOrderIds: (string | number)[] = [];
          for (const item of combo.items) {
            let itemEndpoint = '/tiktok/like_tiktok';
            const itemNameLower = item.name.toLowerCase();
            if (itemNameLower.includes('view') || itemNameLower.includes('xem')) {
              itemEndpoint = '/tiktok/view_tiktok';
            } else if (itemNameLower.includes('lưu') || itemNameLower.includes('yêu thích') || itemNameLower.includes('save')) {
              itemEndpoint = '/tiktok/favorite_tiktok';
            } else if (itemNameLower.includes('share') || itemNameLower.includes('chia sẻ')) {
              itemEndpoint = '/tiktok/share_live_tiktok';
            } else if (itemNameLower.includes('follow')) {
              itemEndpoint = '/tiktok/follow_tiktok';
            } else if (itemNameLower.includes('bình luận') || itemNameLower.includes('cmt') || itemNameLower.includes('comment')) {
              itemEndpoint = '/tiktok/comment_tiktok';
            }

            const itemPayload: Record<string, any> = {
              link: params.target,
              count: item.qty,
              server: 'server_1',
              note: `Combo ${combo.name} - ${item.name}`,
            };
            if (itemEndpoint === '/tiktok/comment_tiktok') {
              itemPayload.comments = 'Tuyệt vời ạ!\nVideo hay quá\nỦng hộ bạn\nĐẹp quá\nQuá đỉnh';
            }

            try {
              const subRes = await this.makeRequest<SiteSocialResponse>(itemEndpoint, itemPayload);
              if (subRes && subRes.status === 1 && subRes.order_id) {
                subOrderIds.push(subRes.order_id);
              }
            } catch (subErr) {
              console.warn(`Failed to dispatch combo sub-item ${item.name}:`, subErr);
            }
          }

          return {
            success: true,
            orderId: subOrderIds.length > 0 ? subOrderIds.join(',') : `COMBO_${Date.now()}`,
          };
        }
      }

      // 2. Dịch vụ đơn lẻ thông thường
      const endpoint = this.determineEndpoint(params.serviceId);
      const payload: Record<string, any> = {
        count: params.quantity,
        note: `Order from SMM Client Web`,
      };

      // Handle URL / Link / UID param formats
      if (endpoint.includes('/facebook/') || endpoint.includes('/fb_speed/')) {
        payload.uid = params.target;
        payload.url = params.target;
        payload.server = 'server_1';
        payload.reaction = 'like';
        if (params.comments) {
          payload.list_comment = params.comments;
        }
      } else {
        payload.link = params.target;
        payload.server = 'server_1';
        if (params.comments) {
          payload.comments = params.comments;
        }
      }

      const res = await this.makeRequest<SiteSocialResponse>(endpoint, payload);

      if (res && res.status === 1) {
        return {
          success: true,
          orderId: res.order_id,
        };
      }

      return {
        success: false,
        error: res.msg || 'Không thể tạo đơn hàng từ nhà cung cấp',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Lỗi kết nối API Site Social',
      };
    }
  }

  /**
   * POST /orders hoặc POST /facebook/get_orders
   * Tra cứu trạng thái đơn hàng
   */
  async getOrderStatus(orderId: string | number): Promise<ProviderOrderStatusResponse> {
    try {
      const res = await this.makeRequest<any>('/orders', {
        id: orderId,
      });

      if (res && res.status === 1 && res.data) {
        const item = Array.isArray(res.data) ? res.data[0] : res.data;
        const statusMap: Record<string, OrderStatus> = {
          '0': 'pending',
          '1': 'processing',
          '2': 'completed',
          '3': 'failed',
          '4': 'canceled',
          '5': 'refunded',
          pending: 'pending',
          processing: 'processing',
          completed: 'completed',
          success: 'completed',
          failed: 'failed',
          refunded: 'refunded',
          canceled: 'canceled',
        };

        const rawStatus = String(item.status || item.order_status || '1').toLowerCase();
        const normalizedStatus: OrderStatus = statusMap[rawStatus] || 'processing';

        const startCount = Number(item.start_count || item.original || 0);
        const currentCount = Number(item.current_count || startCount);
        const quantity = Number(item.count || item.quantity || 1000);
        const remains = Number(item.remains || Math.max(0, quantity - (currentCount - startCount)));
        const progress = normalizedStatus === 'completed' ? 100 : Math.min(95, Math.floor(((quantity - remains) / quantity) * 100));

        return {
          orderId,
          status: normalizedStatus,
          startCount,
          currentCount,
          remains,
          progressPercentage: Math.max(0, progress),
        };
      }

      return {
        orderId,
        status: 'processing',
        startCount: 0,
        currentCount: 0,
        remains: 0,
        progressPercentage: 50,
      };
    } catch (err: any) {
      return {
        orderId,
        status: 'processing',
        startCount: 0,
        currentCount: 0,
        remains: 0,
        progressPercentage: 0,
        error: err.message,
      };
    }
  }

  /**
   * POST /facebook/warranty
   * Gửi yêu cầu bảo hành
   */
  async refillOrder(orderId: string | number): Promise<{ success: boolean; refillId?: string | number; error?: string }> {
    try {
      const res = await this.makeRequest<SiteSocialResponse>('/facebook/warranty', {
        id: orderId,
      });
      if (res && res.status === 1) {
        return { success: true, refillId: orderId };
      }
      return { success: false, error: res.msg || 'Không thể yêu cầu bảo hành' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * POST /facebook/refund
   * Yêu cầu hoàn tiền
   */
  async cancelOrder(orderId: string | number): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await this.makeRequest<SiteSocialResponse>('/facebook/refund', {
        id: orderId,
      });
      if (res && res.status === 1) {
        return { success: true };
      }
      return { success: false, error: res.msg || 'Không thể hủy/hoàn tiền đơn này' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Map Service Code hoặc Service ID sang endpoint thực tế của Site Social
   */
  private determineEndpoint(serviceCodeOrId: string): string {
    const code = (serviceCodeOrId || '').toUpperCase();

    // TikTok Mapping
    if (code.includes('TT_LIKE') || code.includes('TIKTOK_LIKE')) return '/tiktok/like_tiktok';
    if (code.includes('TT_VIEW') || code.includes('TIKTOK_VIEW')) return '/tiktok/view_tiktok';
    if (code.includes('TT_FOLLOW') || code.includes('TIKTOK_FOLLOW')) return '/tiktok/follow_tiktok';
    if (code.includes('TT_CMT') || code.includes('TIKTOK_COMMENT')) return '/tiktok/comment_tiktok';
    if (code.includes('TT_FAV') || code.includes('TIKTOK_FAVORITE')) return '/tiktok/favorite_tiktok';
    if (code.includes('TT_SHARE') || code.includes('TIKTOK_SHARE')) return '/tiktok/share_live_tiktok';
    if (code.includes('TT_LIVE_LIKE')) return '/tiktok/like_live_tiktok';
    if (code.includes('TT_LIVE')) return '/tiktok/live_tiktok';

    // Facebook Mapping
    if (code.includes('FB_LIKE_POST') || code.includes('FB_SPEED')) return '/fb_speed/s_like';
    if (code.includes('FB_VIEW')) return '/facebook/reactions';
    if (code.includes('FB_FOLLOW')) return '/facebook/follow';
    if (code.includes('FB_CMT') || code.includes('FB_COMMENT')) return '/facebook/comment';
    if (code.includes('FB_SHARE')) return '/facebook/share';
    if (code.includes('FB_GROUP') || code.includes('FB_MEMBER')) return '/facebook/buff_group';

    // Instagram Mapping
    if (code.includes('IG_LIKE')) return '/instagram/like_instagram';
    if (code.includes('IG_FOLLOW')) return '/instagram/follow_instagram';
    if (code.includes('IG_VIEW')) return '/instagram/view_instagram';
    if (code.includes('IG_CMT')) return '/instagram/comment_instagram';

    // YouTube Mapping
    if (code.includes('YT_LIKE')) return '/youtube/like_youtube';
    if (code.includes('YT_VIEW_4K')) return '/youtube/view_youtube_4k';
    if (code.includes('YT_VIEW_SHORT')) return '/youtube/view_youtube_short';
    if (code.includes('YT_VIEW')) return '/youtube/view_youtube';
    if (code.includes('YT_SUB')) return '/youtube/sub_youtube';
    if (code.includes('YT_CMT')) return '/youtube/comment_youtube';

    // Telegram Mapping
    if (code.includes('TG_MEMBER')) return '/telegram/member_telegram';
    if (code.includes('TG_POST_VIEW')) return '/telegram/view_telegram';

    // Twitter / X Mapping
    if (code.includes('X_FOLLOW') || code.includes('TWITTER_FOLLOW')) return '/twitter/follow_twitter';
    if (code.includes('X_LIKE') || code.includes('TWITTER_LIKE')) return '/twitter/like_twitter';
    if (code.includes('X_VIEW') || code.includes('TWITTER_VIEW')) return '/twitter/view_twitter';
    if (code.includes('X_RETWEET')) return '/twitter/retweet_twitter';

    // Không tìm thấy endpoint → ném lỗi rõ ràng thay vì fallback ngầm sai dịch vụ
    throw new Error(
      `[SiteSocialProvider] Không tìm thấy endpoint cho serviceId: "${serviceCodeOrId}". ` +
      `Vui lòng kiểm tra lại service_code trong database hoặc cập nhật determineEndpoint().`
    );
  }
}

