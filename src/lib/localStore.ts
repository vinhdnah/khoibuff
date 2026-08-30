import { Profile, Platform, Service, ServiceCombo, Order, WalletTransaction, Deposit, Ticket, TicketMessage, AdminLog, NotificationItem } from '../types';
import { PLATFORMS_CONFIG } from '../config/platforms';
import { getAllDefaultServices, SERVICE_COMBOS, COMBOS_CONFIG, calculateOrderPrice } from '../config/services';

const STORAGE_KEY_PREFIX = 'smm_live_db_';

// Auto-cleanup legacy test keys
try {
  if (typeof window !== 'undefined' && localStorage) {
    const legacyKeys = [
      'smm_db_orders',
      'smm_db_transactions',
      'smm_db_deposits',
      'smm_db_tickets',
      'smm_db_ticket_messages',
      'smm_db_notifications',
      'smm_db_admin_logs',
      'smm_db_profiles',
      'smm_db_passwords',
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  }
} catch {
  // ignore
}

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// Initial Admin Profile (vinhdnah / Vinh3608@)
const initialProfiles: Profile[] = [
  {
    id: 'usr_admin_vinhdnah',
    email: 'vinhdnah@gmail.com',
    username: 'vinhdnah',
    full_name: 'Hoàng Thế Vinh',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '0353633308',
    balance: 0,
    role: 'admin',
    status: 'active',
    deposit_code: 'SMM888999',
    api_key: 'smm_live_adm_vinhdnah_3608',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialPasswords: Record<string, string> = {
  vinhdnah: 'Vinh3608@',
  'vinhdnah@gmail.com': 'Vinh3608@',
};

export class LocalStore {
  // Profiles
  static getProfiles(): Profile[] {
    const profiles = getStored<Profile[]>('profiles', initialProfiles);
    let changed = false;
    for (const p of profiles) {
      if (!p.deposit_code) {
        p.deposit_code = `SMM${Math.floor(100000 + Math.random() * 900000)}`;
        changed = true;
      }
    }
    if (changed) {
      setStored('profiles', profiles);
    }
    return profiles;
  }

  static saveProfiles(profiles: Profile[]): void {
    setStored('profiles', profiles);
  }

  static getProfileById(id: string): Profile | undefined {
    return this.getProfiles().find((p) => p.id === id);
  }

  static getOrCreateUserDepositCode(userId: string): string {
    const profile = this.getProfileById(userId);
    if (profile && profile.deposit_code) {
      return profile.deposit_code;
    }
    const newCode = `SMM${Math.floor(100000 + Math.random() * 900000)}`;
    if (profile) {
      this.updateProfile(userId, { deposit_code: newCode });
    }
    return newCode;
  }

  static getProfileByEmailOrUsername(identifier: string): Profile | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.getProfiles().find(
      (p) => (p.email && p.email.toLowerCase() === clean) || (p.username && p.username.toLowerCase() === clean)
    );
  }

  static getProfileByEmail(email: string): Profile | undefined {
    return this.getProfileByEmailOrUsername(email);
  }

  static updateProfile(id: string, updates: Partial<Profile>): Profile {
    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Không tìm thấy người dùng');
    profiles[index] = { ...profiles[index], ...updates, updated_at: new Date().toISOString() };
    this.saveProfiles(profiles);
    return profiles[index];
  }

  // Passwords
  static getPasswords(): Record<string, string> {
    return getStored<Record<string, string>>('passwords', initialPasswords);
  }

  static savePassword(identifier: string, password: string): void {
    const passwords = this.getPasswords();
    passwords[identifier.toLowerCase()] = password;
    setStored('passwords', passwords);
  }

  static verifyPassword(identifier: string, passwordAttempt: string): boolean {
    const passwords = this.getPasswords();
    const stored = passwords[identifier.toLowerCase()];
    if (!stored) return true; // Default allow if no password was recorded
    return stored === passwordAttempt;
  }

  // Platforms
  static getPlatforms(): Platform[] {
    const defaults: Platform[] = PLATFORMS_CONFIG.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      icon: p.icon || p.slug,
      description: p.description,
      active: true,
      sort_order: p.sortOrder,
      created_at: new Date().toISOString(),
    }));
    return getStored<Platform[]>('platforms', defaults);
  }

  // Services
  static getServices(): Service[] {
    const defaults: Service[] = getAllDefaultServices().map((s, idx) => ({
      id: `srv_${s.serviceCode.toLowerCase()}`,
      platform_id: s.platformSlug,
      service_code: s.serviceCode,
      name: s.name,
      slug: s.serviceCode.toLowerCase().replace(/_/g, '-'),
      description: s.description,
      category: s.category,
      min_quantity: s.min,
      max_quantity: s.max,
      price_per_1000: s.pricePer1000,
      provider_price_per_1000: s.providerCostPer1000,
      provider_service_id: `prov_${s.serviceCode.toLowerCase()}`,
      provider_id: 'mock-internal',
      active: s.active,
      refill_supported: s.refillSupported,
      cancel_supported: s.cancelSupported,
      average_speed: s.averageSpeed,
      sort_order: idx + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    return getStored<Service[]>('services', defaults);
  }

  static saveServices(services: Service[]): void {
    setStored('services', services);
  }

  // Combos
  static getCombos(): ServiceCombo[] {
    const defaults: ServiceCombo[] = SERVICE_COMBOS.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      badge: c.badge,
      description: c.description,
      price: c.price,
      original_price: c.originalPrice,
      items: c.items,
      active: c.active,
      sort_order: c.sortOrder,
      created_at: new Date().toISOString(),
    }));
    return getStored<ServiceCombo[]>('combos', defaults);
  }

  // Orders (Cleaned: 0 default test orders)
  static getOrders(): Order[] {
    return getStored<Order[]>('orders', []);
  }

  static saveOrders(orders: Order[]): void {
    setStored('orders', orders);
  }

  static createOrderAtomic(params: {
    userId: string;
    serviceId: string;
    targetUrl: string;
    quantity: number;
    customComments?: string;
  }): { success: boolean; orderId: string; totalAmount: number; balanceAfter: number } {
    const profile = this.getProfileById(params.userId);
    if (!profile) throw new Error('Không tìm thấy người dùng');

    const services = this.getServices();
    const combos = this.getCombos();
    const service = services.find((s) => s.id === params.serviceId || s.service_code === params.serviceId || s.slug === params.serviceId);
    const combo = combos.find((c) => c.id === params.serviceId || c.slug === params.serviceId);

    if (!service && !combo) {
      throw new Error('Dịch vụ không tồn tại');
    }

    let unitPrice = 0;
    let totalAmount = 0;
    let providerCost = 0;
    let serviceName = '';
    let serviceCode = '';
    let platformSlug = '';

    if (combo) {
      unitPrice = combo.price;
      totalAmount = combo.price;
      providerCost = Math.round(combo.price / 1.35);
      serviceName = combo.name;
      serviceCode = combo.slug;
      platformSlug = 'tiktok';
    } else if (service) {
      unitPrice = service.price_per_1000;
      totalAmount = Math.round((params.quantity * service.price_per_1000) / 1000);
      providerCost = Math.round((params.quantity * (service.provider_price_per_1000 || 0)) / 1000);
      serviceName = service.name;
      serviceCode = service.service_code;
      platformSlug = service.platform_id;
    }

    if (profile.balance < totalAmount) {
      throw new Error(`Số dư không đủ để thực hiện đơn hàng (Cần: ${totalAmount.toLocaleString('vi-VN')} đ, Có: ${profile.balance.toLocaleString('vi-VN')} đ)`);
    }

    const balanceBefore = profile.balance;
    const balanceAfter = balanceBefore - totalAmount;
    this.updateProfile(profile.id, { balance: balanceAfter });

    const newOrderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newOrder: Order = {
      id: newOrderId,
      user_id: profile.id,
      service_id: service?.id || combo?.id || params.serviceId,
      service_code: serviceCode,
      service_name: serviceName,
      platform_slug: platformSlug,
      target_url: params.targetUrl,
      quantity: params.quantity,
      unit_price: unitPrice,
      total_amount: totalAmount,
      provider_cost: providerCost,
      profit: totalAmount - providerCost,
      start_count: 0,
      current_count: 0,
      remains: params.quantity,
      progress_percentage: 0,
      status: 'pending',
      custom_comments: params.customComments,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: profile,
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    this.saveOrders(orders);

    const txs = this.getTransactions();
    txs.unshift({
      id: `tx_${Date.now()}`,
      user_id: profile.id,
      type: 'order',
      amount: -totalAmount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      status: 'completed',
      transaction_code: `ORD_${newOrderId}`,
      description: `Thanh toán đơn hàng #${newOrderId.substring(0, 8)} (${serviceName})`,
      created_at: new Date().toISOString(),
    });
    this.saveTransactions(txs);

    return {
      success: true,
      orderId: newOrderId,
      totalAmount,
      balanceAfter,
    };
  }

  // Wallet Transactions (Cleaned: 0 default test transactions)
  static getTransactions(): WalletTransaction[] {
    return getStored<WalletTransaction[]>('transactions', []);
  }

  static saveTransactions(transactions: WalletTransaction[]): void {
    setStored('transactions', transactions);
  }

  // Deposits (Cleaned: 0 default test deposits)
  static getDeposits(): Deposit[] {
    return getStored<Deposit[]>('deposits', []);
  }

  static saveDeposits(deposits: Deposit[]): void {
    setStored('deposits', deposits);
  }

  static createDeposit(userId: string, amount: number, memo: string, qrUrl: string, bankName: string, bankAccount: string): Deposit {
    const newDep: Deposit = {
      id: `dep_${Date.now()}`,
      user_id: userId,
      amount,
      transfer_content: memo,
      qr_url: qrUrl,
      payment_method: 'vietqr',
      bank_name: bankName,
      bank_account: bankAccount,
      account_holder: 'HOANG THE VINH',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const deps = this.getDeposits();
    deps.unshift(newDep);
    this.saveDeposits(deps);
    return newDep;
  }

  static processDepositCompleted(depositId: string): Deposit {
    const deps = this.getDeposits();
    const dep = deps.find((d) => d.id === depositId);
    if (!dep) throw new Error('Không tìm thấy giao dịch nạp');
    if (dep.status === 'completed') return dep;

    dep.status = 'completed';
    dep.verified_at = new Date().toISOString();
    dep.updated_at = new Date().toISOString();
    this.saveDeposits(deps);

    // Cộng số dư cho user
    const profile = this.getProfileById(dep.user_id);
    if (profile) {
      const newBal = profile.balance + dep.amount;
      this.updateProfile(profile.id, { balance: newBal });

      // Ghi log ví
      const txs = this.getTransactions();
      txs.unshift({
        id: `tx_${Date.now()}`,
        user_id: profile.id,
        type: 'deposit',
        amount: dep.amount,
        balance_before: profile.balance,
        balance_after: newBal,
        status: 'completed',
        payment_method: 'vietqr',
        transaction_code: dep.transaction_code || `DEP_${dep.id}`,
        description: `Nạp tiền thành công VietQR (+${dep.amount.toLocaleString('vi-VN')} đ)`,
        created_at: new Date().toISOString(),
      });
      this.saveTransactions(txs);
    }
    return dep;
  }

  static getProcessedSepayTxIds(): string[] {
    return getStored<string[]>('processed_sepay_tx_ids', []);
  }

  static markSepayTxProcessed(txId: string): void {
    const ids = this.getProcessedSepayTxIds();
    if (!ids.includes(txId)) {
      ids.push(txId);
      setStored('processed_sepay_tx_ids', ids);
    }
  }

  static processIncomingSepayTransaction(tx: {
    id?: string | number;
    reference_number?: string;
    amount_in?: string | number;
    transaction_content?: string;
    body?: string;
    bank_brand_name?: string;
    account_number?: string;
    transaction_date?: string;
  }): { success: boolean; userId?: string; amount?: number; memo?: string } | null {
    const txId = String(tx.id || tx.reference_number || '');
    if (!txId) return null;

    const processed = this.getProcessedSepayTxIds();
    if (processed.includes(txId)) return null;

    const amountIn = Number(tx.amount_in || 0);
    if (amountIn <= 0) return null;

    const content = (tx.transaction_content || tx.body || '').toUpperCase();
    const profiles = this.getProfiles();

    // Tìm tài khoản user có mã memo khớp với nội dung chuyển khoản
    const matchedProfile = profiles.find((p) => {
      if (!p.deposit_code) return false;
      return content.includes(p.deposit_code.toUpperCase());
    });

    if (!matchedProfile) return null;

    // Cộng số dư ví an toàn
    const balanceBefore = matchedProfile.balance;
    const balanceAfter = balanceBefore + amountIn;
    this.updateProfile(matchedProfile.id, { balance: balanceAfter });

    // Đánh dấu giao dịch đã cộng tiền để không bị cộng lặp
    this.markSepayTxProcessed(txId);

    // Cập nhật đơn nạp pending nếu có, hoặc tạo mới một đơn nạp thành công
    const deposits = this.getDeposits();
    const existingDeposit = deposits.find(
      (d) =>
        d.user_id === matchedProfile.id &&
        d.status === 'pending' &&
        content.includes((d.transfer_content || '').toUpperCase())
    );

    if (existingDeposit) {
      existingDeposit.status = 'completed';
      existingDeposit.amount = amountIn;
      existingDeposit.transaction_code = txId;
      existingDeposit.verified_at = new Date().toISOString();
      existingDeposit.updated_at = new Date().toISOString();
      this.saveDeposits(deposits);
    } else {
      const newDep: Deposit = {
        id: `dep_auto_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        user_id: matchedProfile.id,
        amount: amountIn,
        transfer_content: matchedProfile.deposit_code || 'SMM888999',
        payment_method: 'vietqr',
        status: 'completed',
        bank_name: tx.bank_brand_name || 'MBBank',
        bank_account: tx.account_number || '0353633308',
        account_holder: 'HOANG THE VINH',
        transaction_code: txId,
        verified_at: new Date().toISOString(),
        created_at: tx.transaction_date ? new Date(tx.transaction_date).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      deposits.unshift(newDep);
      this.saveDeposits(deposits);
    }

    // Ghi log lịch sử biến động số dư
    const txs = this.getTransactions();
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      user_id: matchedProfile.id,
      type: 'deposit',
      amount: amountIn,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      status: 'completed',
      payment_method: 'vietqr',
      transaction_code: txId,
      description: `Nạp tiền tự động VietQR SePay (${tx.bank_brand_name || 'MBBank'}) - ${matchedProfile.deposit_code}`,
      created_at: new Date().toISOString(),
    };
    txs.unshift(newTx);
    this.saveTransactions(txs);

    return {
      success: true,
      userId: matchedProfile.id,
      amount: amountIn,
      memo: matchedProfile.deposit_code,
    };
  }

  // Tickets & Messages (Cleaned: 0 default tickets)
  static getTickets(): Ticket[] {
    return getStored<Ticket[]>('tickets', []);
  }

  static saveTickets(tickets: Ticket[]): void {
    setStored('tickets', tickets);
  }

  static getTicketMessages(): TicketMessage[] {
    return getStored<TicketMessage[]>('ticket_messages', []);
  }

  static saveTicketMessages(messages: TicketMessage[]): void {
    setStored('ticket_messages', messages);
  }

  // Notifications (Cleaned: 0 default notifications)
  static getNotifications(userId?: string): NotificationItem[] {
    const all = getStored<NotificationItem[]>('notifications', []);
    if (userId) {
      return all.filter((n) => n.user_id === userId);
    }
    return all;
  }

  static saveNotifications(notifications: NotificationItem[]): void {
    setStored('notifications', notifications);
  }

  // Admin Logs (Cleaned: 0 default logs)
  static getAdminLogs(): AdminLog[] {
    return getStored<AdminLog[]>('admin_logs', []);
  }

  static saveAdminLogs(logs: AdminLog[]): void {
    setStored('admin_logs', logs);
  }

  // Admin Actions
  static approveAndDispatchOrder(orderId: string, adminId: string, providerOrderId?: string): Order {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Không tìm thấy đơn hàng');

    order.status = 'processing';
    if (providerOrderId) {
      order.provider_order_id = providerOrderId;
    }
    order.updated_at = new Date().toISOString();
    this.saveOrders(orders);

    // Ghi admin log
    const logs = this.getAdminLogs();
    logs.unshift({
      id: `log_${Date.now()}`,
      admin_id: adminId,
      action: 'approve_order',
      resource: 'orders',
      resource_id: orderId,
      new_data: { status: 'processing', providerOrderId },
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    });
    this.saveAdminLogs(logs);

    return order;
  }

  static cancelAndRefundOrder(orderId: string, adminId: string, reason: string): { success: boolean; refundAmount: number } {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Không tìm thấy đơn hàng');
    if (order.status === 'canceled' || order.status === 'refunded') {
      throw new Error('Đơn hàng đã được hủy trước đó');
    }

    const refundAmount = order.total_amount;
    order.status = 'canceled';
    order.notes = reason;
    order.updated_at = new Date().toISOString();
    this.saveOrders(orders);

    // Hoàn tiền vào ví user
    const profile = this.getProfileById(order.user_id);
    if (profile) {
      const balanceAfter = profile.balance + refundAmount;
      this.updateProfile(profile.id, { balance: balanceAfter });

      // Ghi log hoàn tiền
      const txs = this.getTransactions();
      txs.unshift({
        id: `tx_${Date.now()}`,
        user_id: profile.id,
        type: 'refund',
        amount: refundAmount,
        balance_before: profile.balance,
        balance_after: balanceAfter,
        status: 'completed',
        transaction_code: `REFUND_${order.id}`,
        description: `Hoàn tiền đơn hàng #${order.id.substring(0, 8)} (${reason})`,
        created_at: new Date().toISOString(),
      });
      this.saveTransactions(txs);
    }

    // Ghi admin log
    const logs = this.getAdminLogs();
    logs.unshift({
      id: `log_${Date.now()}`,
      admin_id: adminId,
      action: 'cancel_order',
      resource: 'orders',
      resource_id: orderId,
      new_data: { status: 'canceled', reason, refundAmount },
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    });
    this.saveAdminLogs(logs);

    return { success: true, refundAmount };
  }

  static adminAdjustBalance(
    adminId: string,
    targetUserId: string,
    amount: number,
    type: 'adjustment' | 'bonus',
    reason: string
  ): { success: boolean; balanceAfter: number } {
    const profile = this.getProfileById(targetUserId);
    if (!profile) throw new Error('Không tìm thấy người dùng');

    const balanceBefore = profile.balance;
    const balanceAfter = Math.max(0, balanceBefore + amount);
    this.updateProfile(targetUserId, { balance: balanceAfter });

    // Ghi log giao dịch
    const txs = this.getTransactions();
    txs.unshift({
      id: `tx_${Date.now()}`,
      user_id: targetUserId,
      type: type === 'bonus' ? 'bonus' : 'adjustment',
      amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      status: 'completed',
      transaction_code: `ADJ_${Date.now()}`,
      description: `Điều chỉnh số dư bởi Admin: ${reason}`,
      created_at: new Date().toISOString(),
    });
    this.saveTransactions(txs);

    // Ghi admin log
    const logs = this.getAdminLogs();
    logs.unshift({
      id: `log_${Date.now()}`,
      admin_id: adminId,
      action: 'adjust_balance',
      resource: 'profiles',
      resource_id: targetUserId,
      old_data: { balance: balanceBefore },
      new_data: { balance: balanceAfter, amount, reason },
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    });
    this.saveAdminLogs(logs);

    return { success: true, balanceAfter };
  }

  // Helper to reset all data if needed
  static resetAllData(): void {
    try {
      localStorage.removeItem('smm_current_user_id');
      const keys = ['orders', 'transactions', 'deposits', 'tickets', 'ticket_messages', 'notifications', 'admin_logs'];
      keys.forEach((k) => localStorage.removeItem(STORAGE_KEY_PREFIX + k));
      setStored('profiles', initialProfiles);
      setStored('passwords', initialPasswords);
    } catch (e) {
      console.error(e);
    }
  }
}
