import { OrderStatus } from '../../types';

export interface CreateOrderParams {
  serviceId: string;
  target: string;
  quantity: number;
  comments?: string;
  runs?: number;
  interval?: number;
}

export interface ProviderOrderResponse {
  success: boolean;
  orderId?: string | number;
  error?: string;
  charge?: number;
  currency?: string;
}

export interface ProviderOrderStatusResponse {
  orderId: string | number;
  status: OrderStatus;
  startCount: number;
  currentCount: number;
  remains: number;
  progressPercentage: number;
  charge?: number;
  currency?: string;
  error?: string;
}

export interface ProviderBalanceResponse {
  balance: number;
  currency: string;
}

export interface ProviderServiceItem {
  service: string | number;
  name: string;
  type: string;
  category: string;
  rate: number;
  min: number;
  max: number;
  refill: boolean;
  cancel: boolean;
}

/**
 * Provider Abstraction Interface
 */
export interface SmmProvider {
  name: string;
  slug: string;
  isMock: boolean;
  
  createOrder(params: CreateOrderParams): Promise<ProviderOrderResponse>;
  getOrderStatus(orderId: string | number): Promise<ProviderOrderStatusResponse>;
  getOrderStatuses?(orderIds: (string | number)[]): Promise<Record<string | number, ProviderOrderStatusResponse>>;
  cancelOrder(orderId: string | number): Promise<{ success: boolean; error?: string }>;
  refillOrder(orderId: string | number): Promise<{ success: boolean; refillId?: string | number; error?: string }>;
  getBalance(): Promise<ProviderBalanceResponse>;
  getServices?(): Promise<ProviderServiceItem[]>;
}
