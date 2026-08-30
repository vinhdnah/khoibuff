import { supabase } from '../lib/supabase';
import { LocalStore } from '../lib/localStore';
import { Deposit, WalletTransaction } from '../types';
import { SEPAY_CONFIG, sepayService } from './sepayService';

export const BANK_CONFIG = {
  bankName: SEPAY_CONFIG.bankName,
  accountNo: SEPAY_CONFIG.bankAccount,
  accountName: SEPAY_CONFIG.accountHolder,
};

export const walletService = {
  /**
   * Tạo yêu cầu nạp tiền VietQR kèm mã Memo duy nhất
   */
  async createDepositRequest(userId: string, amount: number): Promise<Deposit> {
    const memo = LocalStore.getOrCreateUserDepositCode(userId);
    const qrUrl = sepayService.getQrImageUrl(amount, memo);

    if (!supabase) {
      return LocalStore.createDeposit(userId, amount, memo, qrUrl, BANK_CONFIG.bankName, BANK_CONFIG.accountNo);
    }

    try {
      const { data, error } = await supabase
        .from('deposits')
        .insert([
          {
            user_id: userId,
            amount,
            transfer_content: memo,
            qr_url: qrUrl,
            bank_name: BANK_CONFIG.bankName,
            bank_account: BANK_CONFIG.accountNo,
            account_holder: BANK_CONFIG.accountName,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch {
      return LocalStore.createDeposit(userId, amount, memo, qrUrl, BANK_CONFIG.bankName, BANK_CONFIG.accountNo);
    }
  },

  /**
   * Tự động kiểm tra hoặc xác nhận nạp tiền thành công
   */
  async confirmDepositPayment(depositId: string): Promise<{ success: boolean; balanceAfter: number }> {
    if (!supabase) {
      const dep = LocalStore.processDepositCompleted(depositId);
      const profile = LocalStore.getProfileById(dep.user_id);
      return { success: true, balanceAfter: profile?.balance || 0 };
    }

    try {
      const { data, error } = await supabase.rpc('process_deposit_completed', {
        p_deposit_id: depositId,
      });

      if (error) throw error;
      return {
        success: true,
        balanceAfter: data?.balance_after || 0,
      };
    } catch {
      const dep = LocalStore.processDepositCompleted(depositId);
      const profile = LocalStore.getProfileById(dep.user_id);
      return { success: true, balanceAfter: profile?.balance || 0 };
    }
  },

  /**
   * Lấy lịch sử biến động số dư của người dùng
   */
  async getUserTransactions(userId: string): Promise<WalletTransaction[]> {
    if (!supabase) {
      return LocalStore.getTransactions().filter((t) => t.user_id === userId);
    }

    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch {
      return LocalStore.getTransactions().filter((t) => t.user_id === userId);
    }
  },

  /**
   * Lấy danh sách yêu cầu nạp tiền của người dùng
   */
  async getUserDeposits(userId: string): Promise<Deposit[]> {
    if (!supabase) {
      return LocalStore.getDeposits().filter((d) => d.user_id === userId);
    }

    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch {
      return LocalStore.getDeposits().filter((d) => d.user_id === userId);
    }
  },

  /**
   * Lấy tất cả yêu cầu nạp tiền (Admin)
   */
  async getAllDeposits(): Promise<Deposit[]> {
    if (!supabase) {
      return LocalStore.getDeposits();
    }

    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch {
      return LocalStore.getDeposits();
    }
  },
};
