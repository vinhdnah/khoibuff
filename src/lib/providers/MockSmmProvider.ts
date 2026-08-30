import { SmmProvider, CreateOrderParams, ProviderOrderResponse, ProviderOrderStatusResponse, ProviderBalanceResponse } from './types';
import { OrderStatus } from '../../types';

interface MockOrderState {
  orderId: string;
  serviceId: string;
  target: string;
  quantity: number;
  startCount: number;
  currentCount: number;
  remains: number;
  status: OrderStatus;
  createdAt: number;
}

export class MockSmmProvider implements SmmProvider {
  name = 'Mock SMM Provider (Local Simulation)';
  slug = 'mock-provider';
  isMock = true;

  private orders: Map<string, MockOrderState> = new Map();
  private balance: number = 50000000; // 50 triệu VNĐ giả lập

  constructor() {
    // Tải orders từ localStorage nếu có (để giữ trạng thái giữa các lần reload)
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('smm_mock_provider_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([k, v]) => {
          this.orders.set(k, v as MockOrderState);
        });
      }
    } catch {
      // Ignore in non-browser or test environments
    }
  }

  private saveToStorage() {
    try {
      const obj: Record<string, MockOrderState> = {};
      this.orders.forEach((v, k) => {
        obj[k] = v;
      });
      localStorage.setItem('smm_mock_provider_orders', JSON.stringify(obj));
    } catch {
      // Ignore
    }
  }

  async createOrder(params: CreateOrderParams): Promise<ProviderOrderResponse> {
    // Giả lập network delay nhỏ
    await new Promise((res) => setTimeout(res, 300));

    const mockOrderId = `MOCK_${Math.floor(100000 + Math.random() * 900000)}`;
    const randomStart = Math.floor(Math.random() * 500);

    const newOrder: MockOrderState = {
      orderId: mockOrderId,
      serviceId: params.serviceId,
      target: params.target,
      quantity: params.quantity,
      startCount: randomStart,
      currentCount: randomStart,
      remains: params.quantity,
      status: 'processing',
      createdAt: Date.now(),
    };

    this.orders.set(mockOrderId, newOrder);
    this.saveToStorage();

    return {
      success: true,
      orderId: mockOrderId,
      charge: (params.quantity * 10) / 1000,
      currency: 'VND',
    };
  }

  async getOrderStatus(orderId: string | number): Promise<ProviderOrderStatusResponse> {
    const key = String(orderId);
    let order = this.orders.get(key);

    if (!order) {
      // Tạo mock state nếu chưa có
      order = {
        orderId: key,
        serviceId: 'MOCK_SERVICE',
        target: 'https://...',
        quantity: 1000,
        startCount: 100,
        currentCount: 100,
        remains: 1000,
        status: 'processing',
        createdAt: Date.now() - 60000,
      };
      this.orders.set(key, order);
    }

    // Mô phỏng tiến trình tăng dần theo thời gian trôi qua (1 phút = 35% tiến độ)
    const elapsedSeconds = (Date.now() - order.createdAt) / 1000;
    let progress = Math.min(100, Math.floor(elapsedSeconds * 2.5));

    let status: OrderStatus = 'processing';
    if (progress >= 100) {
      status = 'completed';
      progress = 100;
    } else if (progress === 0) {
      status = 'pending';
    }

    const currentCount = order.startCount + Math.floor((order.quantity * progress) / 100);
    const remains = Math.max(0, order.quantity - (currentCount - order.startCount));

    order.currentCount = currentCount;
    order.remains = remains;
    order.status = status;
    this.saveToStorage();

    return {
      orderId: key,
      status,
      startCount: order.startCount,
      currentCount,
      remains,
      progressPercentage: progress,
      charge: 0,
      currency: 'VND',
    };
  }

  async cancelOrder(orderId: string | number): Promise<{ success: boolean; error?: string }> {
    const key = String(orderId);
    const order = this.orders.get(key);
    if (order) {
      order.status = 'canceled';
      this.saveToStorage();
    }
    return { success: true };
  }

  async refillOrder(orderId: string | number): Promise<{ success: boolean; refillId?: string | number; error?: string }> {
    return {
      success: true,
      refillId: `REFILL_${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }

  async getBalance(): Promise<ProviderBalanceResponse> {
    return {
      balance: this.balance,
      currency: 'VND',
    };
  }
}
