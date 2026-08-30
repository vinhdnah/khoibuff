import { useEffect, useRef } from 'react';
import { sepayService } from '../services/sepayService';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/ui/Toast';
import { LocalStore } from '../lib/localStore';
import { formatVND } from '../lib/formatters';
import confetti from 'canvas-confetti';

/**
 * Global background hook tự động quét giao dịch SePay mỗi 30 giây
 * Tự động cộng tiền vào tài khoản và bắn thông báo ngay khi ngân hàng nhận tiền
 */
export function useSepayAutoSync() {
  const { user, updateBalance } = useAuthStore();
  const { success } = useToast();
  const isCheckingRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const performSync = async () => {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;
      try {
        const creditedList = await sepayService.checkAndProcessIncomingTransactions();

        if (creditedList && creditedList.length > 0) {
          const myCredits = creditedList.filter((item) => item.userId === user.id);
          if (myCredits.length > 0) {
            const updatedProfile = LocalStore.getProfileById(user.id);
            if (updatedProfile) {
              updateBalance(updatedProfile.balance);
            }

            for (const item of myCredits) {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
              });
              success(
                'Nạp tiền tự động thành công! 🎉',
                `Đã cộng +${formatVND(item.amount)} vào số dư ví của bạn qua VietQR SePay.`
              );
            }
          }
        }
      } catch (err) {
        console.warn('Auto sync check error:', err);
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Chạy kiểm tra ngay khi mở trang
    performSync();

    // Thiết lập chu kỳ kiểm tra tự động mỗi 30 giây
    const interval = setInterval(performSync, 30000);

    return () => clearInterval(interval);
  }, [user?.id, updateBalance, success]);
}
