import {
  SmmProvider,
  CreateOrderParams,
  ProviderOrderResponse,
  ProviderOrderStatusResponse,
  ProviderBalanceResponse,
  ProviderServiceItem,
} from './types';
import { OrderStatus } from '../../types';

export interface StandardSmmProviderConfig {
  name: string;
  slug: string;
  apiUrl: string;
  apiKey: string;
}

export class StandardSmmProvider implements SmmProvider {
  name: string;
  slug: string;
  isMock = false;
  private apiUrl: string;
  private apiKey: string;

  constructor(config: StandardSmmProviderConfig) {
    this.name = config.name;
    this.slug = config.slug;
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
  }

  private async makeRequest<T = any>(data: Record<string, any>): Promise<T> {
    const formData = new URLSearchParams();
    formData.append('key', this.apiKey);
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        formData.append(key, String(val));
      }
    });

    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      throw new Error(`Provider API error: ${res.statusText}`);
    }

    return await res.json();
  }

  async createOrder(params: CreateOrderParams): Promise<ProviderOrderResponse> {
    try {
      const payload: Record<string, any> = {
        action: 'add',
        service: params.serviceId,
        link: params.target,
        quantity: params.quantity,
      };

      if (params.comments) {
        payload.comments = params.comments;
      }
      if (params.runs) {
        payload.runs = params.runs;
      }
      if (params.interval) {
        payload.interval = params.interval;
      }

      const res = await this.makeRequest<{ order?: number | string; error?: string }>(payload);

      if (res.error) {
        return { success: false, error: res.error };
      }

      return {
        success: true,
        orderId: res.order,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Lỗi kết nối tới nhà cung cấp API',
      };
    }
  }

  async getOrderStatus(orderId: string | number): Promise<ProviderOrderStatusResponse> {
    try {
      const res = await this.makeRequest<{
        charge?: string | number;
        start_count?: string | number;
        status?: string;
        remains?: string | number;
        currency?: string;
        error?: string;
      }>({
        action: 'status',
        order: orderId,
      });

      if (res.error) {
        return {
          orderId,
          status: 'failed',
          startCount: 0,
          currentCount: 0,
          remains: 0,
          progressPercentage: 0,
          error: res.error,
        };
      }

      const startCount = Number(res.start_count) || 0;
      const remains = Number(res.remains) || 0;
      const statusMap: Record<string, OrderStatus> = {
        pending: 'pending',
        in_progress: 'processing',
        processing: 'processing',
        completed: 'completed',
        partial: 'partial',
        canceled: 'canceled',
        refunded: 'refunded',
        failed: 'failed',
      };

      const normalizedStatus = statusMap[(res.status || '').toLowerCase()] || 'processing';

      return {
        orderId,
        status: normalizedStatus,
        startCount,
        currentCount: startCount,
        remains,
        progressPercentage: normalizedStatus === 'completed' ? 100 : 50,
        charge: Number(res.charge) || 0,
        currency: res.currency || 'USD',
      };
    } catch (err: any) {
      return {
        orderId,
        status: 'failed',
        startCount: 0,
        currentCount: 0,
        remains: 0,
        progressPercentage: 0,
        error: err.message,
      };
    }
  }

  async cancelOrder(orderId: string | number): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await this.makeRequest<{ cancel?: number | string; error?: string }>({
        action: 'cancel',
        orders: orderId,
      });
      if (res.error) return { success: false, error: res.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async refillOrder(orderId: string | number): Promise<{ success: boolean; refillId?: string | number; error?: string }> {
    try {
      const res = await this.makeRequest<{ refill?: number | string; error?: string }>({
        action: 'refill',
        order: orderId,
      });
      if (res.error) return { success: false, error: res.error };
      return { success: true, refillId: res.refill };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async getBalance(): Promise<ProviderBalanceResponse> {
    try {
      const res = await this.makeRequest<{ balance: string | number; currency: string }>({
        action: 'balance',
      });
      return {
        balance: Number(res.balance) || 0,
        currency: res.currency || 'USD',
      };
    } catch (err: any) {
      return {
        balance: 0,
        currency: 'USD',
      };
    }
  }

  async getServices(): Promise<ProviderServiceItem[]> {
    try {
      const res = await this.makeRequest<ProviderServiceItem[]>({
        action: 'services',
      });
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }
}
