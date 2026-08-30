import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { walletService, BANK_CONFIG } from '../services/walletService';
import { Deposit } from '../types';
import { formatVND, formatDateTime, getDepositStatusInfo } from '../lib/formatters';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import {
  CreditCard,
  QrCode,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Clock,
  ArrowDownCircle,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000, 5000000];

export const DepositPage: React.FC = () => {
  const { user, updateBalance } = useAuthStore();
  const { success, error } = useToast();

  const [amount, setAmount] = useState<number>(100000);
  const [activeDeposit, setActiveDeposit] = useState<Deposit | null>(null);
  const [depositHistory, setDepositHistory] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDepositHistory();
    }
  }, [user]);

  const loadDepositHistory = async () => {
    if (!user) return;
    try {
      const data = await walletService.getUserDeposits(user.id);
      setDepositHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    success('Đã sao chép vào bộ nhớ tạm');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCreateQR = async () => {
    if (!user) return;
    if (amount < 10000) {
      error('Số tiền nạp tối thiểu là 10.000 VNĐ');
      return;
    }

    setIsLoading(true);
    try {
      const dep = await walletService.createDepositRequest(user.id, amount);
      setActiveDeposit(dep);
      loadDepositHistory();
      success('Đã tạo mã QR thanh toán!');
    } catch (err: any) {
      error(err.message || 'Không thể tạo yêu cầu nạp tiền');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPaid = async (depositId: string) => {
    setIsVerifying(true);
    try {
      const res = await walletService.confirmDepositPayment(depositId);
      updateBalance(res.balanceAfter);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      success('Nạp tiền thành công!', 'Số dư của bạn đã được cộng ngay lập tức.');
      setActiveDeposit(null);
      loadDepositHistory();
    } catch (err: any) {
      error(err.message || 'Không thể xác thực nạp tiền');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary-light" /> Nạp Tiền Tự Động VietQR
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Nạp tiền tự động 24/7 qua cổng thanh toán mã VietQR. Tiền vào tài khoản trong 3-10 giây không mất phí.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Select amount & VietQR Display (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-surface/90 border border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Chọn Số Tiền Cần Nạp
            </h3>

            {/* Presets */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                    amount === amt
                      ? 'bg-primary/20 text-primary-light border-primary/50 shadow-glow-primary'
                      : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {formatVND(amt)}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <Input
              label="Hoặc nhập số tiền tùy chỉnh (VNĐ)"
              type="number"
              min={10000}
              step={10000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Tối thiểu 10.000 đ"
            />

            <Button
              variant="glow"
              size="lg"
              className="w-full py-3.5"
              onClick={handleCreateQR}
              isLoading={isLoading}
              leftIcon={<QrCode className="w-5 h-5" />}
            >
              Tạo Mã VietQR Nạp {formatVND(amount)}
            </Button>
          </div>

          {/* Active Deposit QR Box */}
          {activeDeposit && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-surface to-surface border border-indigo-500/40 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> Quét Mã Thanh Toán VietQR
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  Mã: #{activeDeposit.id.substring(0, 8)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                {/* QR Image */}
                <div className="relative p-2 bg-white rounded-2xl shadow-xl shrink-0">
                  <img
                    src={activeDeposit.qr_url || ''}
                    alt={`VietQR ${BANK_CONFIG.bankName}`}
                    className="w-48 h-48 object-contain rounded-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                    Auto 24/7
                  </div>
                </div>

                {/* Transfer Info */}
                <div className="w-full space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/50">
                    <span className="text-slate-400">Ngân hàng:</span>
                    <span className="font-bold text-slate-100">{BANK_CONFIG.bankName}</span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/50">
                    <span className="text-slate-400">Số tài khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-primary-light">{BANK_CONFIG.accountNo}</span>
                      <button onClick={() => handleCopy(BANK_CONFIG.accountNo, 'acc')} className="p-1 text-slate-400 hover:text-white">
                        {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/50">
                    <span className="text-slate-400">Chủ tài khoản:</span>
                    <span className="font-bold text-emerald-400">{BANK_CONFIG.accountName}</span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30">
                    <span className="text-indigo-300 font-semibold">Số tiền:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-emerald-400 text-sm">{formatVND(activeDeposit.amount)}</span>
                      <button onClick={() => handleCopy(String(activeDeposit.amount), 'amt')} className="p-1 text-slate-400 hover:text-white">
                        {copiedField === 'amt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30">
                    <div>
                      <span className="text-rose-300 font-semibold block text-[11px]">Nội dung chuyển khoản (Bắt buộc):</span>
                      <span className="font-mono font-black text-rose-400 text-sm">{activeDeposit.transfer_content}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(activeDeposit.transfer_content, 'memo')}
                      className="p-1.5 rounded-lg bg-rose-900/50 text-rose-200 hover:bg-rose-800"
                    >
                      {copiedField === 'memo' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                variant="glow"
                size="lg"
                className="w-full py-3.5"
                onClick={() => handleConfirmPaid(activeDeposit.id)}
                isLoading={isVerifying}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Tôi Đã Chuyển Khoản (Xác Nhận Nạp)
              </Button>
            </div>
          )}
        </div>

        {/* Right Info: Instructions & Recent Deposits (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Instructions */}
          <div className="p-6 rounded-2xl bg-surface/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary-light" /> Hướng Dẫn Nạp Tiền
            </h3>
            <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
              <li>Mở ứng dụng ngân hàng hoặc ví điện tử bất kỳ hỗ trợ quét mã QR (VietQR).</li>
              <li>Quét mã QR được tạo bên trái, số tiền và nội dung chuyển khoản sẽ được tự động điền.</li>
              <li>Kiểm tra đúng thông tin người nhận: <b>{BANK_CONFIG.accountName}</b>.</li>
              <li>Hoàn tất chuyển khoản, số dư tài khoản của bạn sẽ được cộng tự động trong 3-10 giây.</li>
            </ol>
          </div>

          {/* Deposit History */}
          <div className="p-6 rounded-2xl bg-surface/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-light" /> Lịch Sử Nạp Gần Đây
            </h3>

            {depositHistory.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Chưa có lịch sử nạp tiền.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {depositHistory.slice(0, 5).map((dep) => {
                  const statusInfo = getDepositStatusInfo(dep.status);
                  return (
                    <div
                      key={dep.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-emerald-400 block text-sm">
                          +{formatVND(dep.amount)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDateTime(dep.created_at)} • Memo: {dep.transfer_content}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
