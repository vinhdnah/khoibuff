export * from './database';

export interface DashboardStats {
  balance: number;
  totalOrders: number;
  processingOrders: number;
  completedOrders: number;
  totalSpent: number;
}

export interface AdminDashboardStats {
  revenueToday: number;
  revenueThisMonth: number;
  totalRevenue: number;
  totalProfit: number;
  providerCost: number;
  totalOrders: number;
  processingOrders: number;
  completedOrders: number;
  failedOrders: number;
  totalUsers: number;
  totalDeposits: number;
  pendingDeposits: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
  profit: number;
}

export interface OrderDraft {
  platformId: string;
  platformSlug: string;
  serviceId?: string;
  serviceCode: string;
  serviceName: string;
  pricePer1000: number;
  minQuantity: number;
  maxQuantity: number;
  targetUrl: string;
  quantity: number;
  customComments?: string;
  totalPrice: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
