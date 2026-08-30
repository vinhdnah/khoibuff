export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'banned';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'partial'
  | 'canceled'
  | 'refunded'
  | 'failed';

export type TransactionType = 'deposit' | 'order' | 'refund' | 'bonus' | 'adjustment';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'canceled';
export type DepositStatus = 'pending' | 'completed' | 'expired' | 'failed';

export type TicketCategory = 'order' | 'payment' | 'service' | 'api' | 'other';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'pending' | 'answered' | 'closed';

export type NotificationType = 'order' | 'deposit' | 'refund' | 'system' | 'ticket';

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  balance: number;
  role: UserRole;
  status: UserStatus;
  deposit_code?: string;
  api_key?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Platform {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Service {
  id: string;
  platform_id: string;
  service_code: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  min_quantity: number;
  max_quantity: number;
  price_per_1000: number;
  provider_price_per_1000: number;
  provider_service_id?: string | null;
  provider_id?: string | null;
  active: boolean;
  refill_supported: boolean;
  cancel_supported: boolean;
  average_speed: string | null;
  badge?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  platform?: Platform;
}

export interface ServiceCombo {
  id: string;
  name: string;
  slug: string;
  badge: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  items: { name: string; qty: number }[];
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface SmmProvider {
  id: string;
  name: string;
  slug: string;
  api_url: string;
  api_key?: string | null;
  balance: number;
  currency: string;
  active: boolean;
  is_mock: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  service_id?: string | null;
  service_code: string;
  service_name: string;
  platform_slug: string;
  target_url: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  provider_cost: number;
  profit?: number;
  start_count: number;
  current_count: number;
  remains: number;
  progress_percentage: number;
  status: OrderStatus;
  provider_id?: string | null;
  provider_order_id?: string | null;
  provider_status?: string | null;
  error_message?: string | null;
  refill_status?: string | null;
  custom_comments?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  status: TransactionStatus;
  payment_method?: string | null;
  transaction_code: string;
  reference_id?: string | null;
  description?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  user?: Profile;
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  transfer_content: string;
  payment_method: string;
  status: DepositStatus;
  bank_account: string;
  bank_name: string;
  account_holder: string;
  qr_url?: string | null;
  transaction_code?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  order_id?: string | null;
  created_at: string;
  updated_at: string;
  messages_count?: number;
  user?: Profile;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: UserRole;
  message: string;
  attachment_url?: string | null;
  created_at: string;
  sender?: Profile;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link?: string | null;
  created_at: string;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  resource: string;
  resource_id?: string | null;
  old_data?: Record<string, any> | null;
  new_data?: Record<string, any> | null;
  ip_address?: string | null;
  created_at: string;
  admin?: Profile;
}
