import { walletService } from './walletService';
import { LocalStore } from '../lib/localStore';

export const SEPAY_CONFIG = {
  apiKey: import.meta.env?.VITE_SEPAY_API_KEY || '',
  bankAccount: import.meta.env?.VITE_SEPAY_BANK_ACCOUNT || '',
  bankName: import.meta.env?.VITE_SEPAY_BANK_NAME || 'MBBank',
  accountHolder: import.meta.env?.VITE_SEPAY_ACCOUNT_HOLDER || 'BAN QUẢN TRỊ',
  apiUrl: 'https://my.sepay.vn/userapi/transactions/list',
};

export interface SepayTransaction {
  id: number | string;
  bank_brand_name: string;
  account_number: string;
  transaction_date: string;
  amount_in: number | string;
  amount_out: number | string;
  accumulated: number | string;
  code: string | null;
  transaction_content: string;
  reference_number: string;
  body: string;
}

export const sepayService = {
  /**
   * Sinh link ảnh mã QR Sepay VietQR động
   */
  getQrImageUrl(amount: number, memo: string): string {
    const acc = SEPAY_CONFIG.bankAccount;
    const bank = SEPAY_CONFIG.bankName;
    const des = encodeURIComponent(memo);
    return `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${des}`;
  },

  /**
   * Tra cứu danh sách giao dịch gần nhất từ API SePay
   */
  async fetchRecentTransactions(): Promise<SepayTransaction[]> {
    try {
      const url = `${SEPAY_CONFIG.apiUrl}?limit=30`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${SEPAY_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`SePay API error: ${res.status}`);
      }

      const data = await res.json();
      if (data && Array.isArray(data.transactions)) {
        return data.transactions;
      }
      if (data && Array.isArray(data.messages)) {
        return data.messages;
      }
      return [];
    } catch (err: any) {
      console.warn('SePay fetch transactions error:', err.message);
      return [];
    }
  },

  /**
   * Kiểm tra giao dịch và tự động cộng tiền cho các tài khoản có mã chuyển tiền tương ứng
   * Chạy định kỳ mỗi 30 giây trong background
   */
  async checkAndProcessIncomingTransactions(): Promise<Array<{ userId: string; amount: number; memo: string }>> {
    try {
      const transactions = await this.fetchRecentTransactions();
      const credited: Array<{ userId: string; amount: number; memo: string }> = [];

      for (const tx of transactions) {
        const result = LocalStore.processIncomingSepayTransaction(tx);
        if (result && result.success && result.userId && result.amount) {
          credited.push({
            userId: result.userId,
            amount: result.amount,
            memo: result.memo || '',
          });
        }
      }

      return credited;
    } catch (err) {
      console.warn('SePay auto-sync error:', err);
      return [];
    }
  },

  /**
   * Kiểm tra thủ công đơn nạp tiền khi khách ấn nút Xác nhận
   */
  async verifyDepositWithSepay(depositId: string, expectedAmount: number, memo: string): Promise<{ verified: boolean; transaction?: SepayTransaction }> {
    try {
      // 1. Quét trước tất cả giao dịch tự động
      await this.checkAndProcessIncomingTransactions();

      // 2. Tra cứu riêng đơn này
      const transactions = await this.fetchRecentTransactions();
      const normalizedMemo = memo.toUpperCase().trim();

      const matched = transactions.find((tx) => {
        const content = (tx.transaction_content || tx.body || '').toUpperCase();
        const amountIn = Number(tx.amount_in || 0);
        return content.includes(normalizedMemo) && amountIn > 0;
      });

      if (matched) {
        return { verified: true, transaction: matched };
      }

      return { verified: false };
    } catch (err) {
      console.error('Error verifying deposit with SePay:', err);
      return { verified: false };
    }
  },
};
