import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { walletService, BANK_CONFIG } from '../services/walletService';
import { sepayService } from '../services/sepayService';
import { Deposit, WalletTransaction } from '../types';
import { formatVND, formatDateTime, getTransactionTypeInfo } from '../lib/formatters';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  Zap,
  PlusCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export const WalletPage: React.FC = () => {
  const { user, updateBalance } = useAuthStore();
  const { success, error, warning } = useToast();

  const [activeTab, setActiveTab] = useState<'deposit' | 'history'>('deposit');
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [activeDeposit, setActiveDeposit] = useState<Deposit | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    try {
      const data = await walletService.getUserTransactions(user.id);
      setTransactions(data);
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

  const handleGenerateDeposit = async () => {
    if (!user) {
      error('Vui lòng đăng nhập để nạp tiền');
      return;
    }
    if (depositAmount < 10000) {
      error('Số tiền nạp tối thiểu là 10.000 VNĐ');
      return;
    }

    setIsGenerating(true);
    try {
      const dep = await walletService.createDepositRequest(user.id, depositAmount);
      setActiveDeposit(dep);
    } catch (err: any) {
      error(err.message || 'Không thể tạo mã nạp tiền');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInstantConfirm = async () => {
    if (!activeDeposit) return;
    setIsVerifying(true);
    try {
      const res = await walletService.confirmDepositPayment(activeDeposit.id);
      updateBalance(res.balanceAfter);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      success('Nạp tiền thành công! 🎉', `Tài khoản đã được cộng +${formatVND(activeDeposit.amount)}`);
      setActiveDeposit(null);
      loadTransactions();
    } catch (err: any) {
      error(err.message || 'Xác nhận nạp tiền thất bại');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!activeDeposit) return;
    setIsVerifying(true);
    try {
      // 1. Kiểm tra qua API SePay MBBank
      const result = await sepayService.verifyDepositWithSepay(
        activeDeposit.id,
        activeDeposit.amount,
        activeDeposit.transfer_content
      );

      if (result.verified) {
        const res = await walletService.confirmDepositPayment(activeDeposit.id);
        updateBalance(res.balanceAfter);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        success('Nạp tiền thành công qua SePay MBBank! 🎉', `+${formatVND(activeDeposit.amount)}`);
        setActiveDeposit(null);
        loadTransactions();
      } else {
        warning(
          'Chưa nhận được giao dịch!',
          `Hệ thống chưa tìm thấy chuyển khoản với nội dung "${activeDeposit.transfer_content}". Vui lòng chuyển khoản đúng nội dung và bấm Kiểm Tra Lại.`
        );
      }
    } catch (err: any) {
      error(err.message || 'Lỗi khi kiểm tra giao dịch từ SePay');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Wallet Balance Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface via-slate-900 to-indigo-950/40 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Số Dư Tài Khoản Khả Dụng
          </span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
            {formatVND(user?.balance || 0)}
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
            <span className="text-slate-400">Cú pháp nạp cố định:</span>
            <span className="font-mono font-black text-rose-400 px-2.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
              {user?.deposit_code || 'SMM502059'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="glow"
            size="md"
            onClick={() => {
              setActiveTab('deposit');
              setActiveDeposit(null);
            }}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Nạp Tiền VietQR
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => setActiveTab('history')}
            leftIcon={<Clock className="w-4 h-4" />}
          >
            Lịch Sử Ví
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'deposit' ? 'text-primary-light border-b-2 border-primary' : 'text-slate-400 hover:text-white'
          }`}
        >
          Nạp Tiền Tự Động (VietQR SePay)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'history' ? 'text-primary-light border-b-2 border-primary' : 'text-slate-400 hover:text-white'
          }`}
        >
          Lịch Sử Biến Động Số Dư
        </button>
      </div>

      {/* Tab 1: Deposit SePay */}
      {activeTab === 'deposit' && (
        <div className="space-y-6">
          {!activeDeposit ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-surface/80 border border-slate-800 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Chọn Số Tiền Cần Nạp
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all ${
                        depositAmount === amt
                          ? 'bg-primary/20 text-primary-light border-primary shadow-glow-primary'
                          : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {formatVND(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Hoặc nhập số tiền khác (VNĐ)"
                type="number"
                min={10000}
                step={1000}
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                placeholder="Tối thiểu 10.000 đ"
              />

              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" /> Cổng Thanh Toán SePay MBBank Tự Động 24/7
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Quét mã QR qua ứng dụng ngân hàng bất kỳ. Tiền được cộng tự động trong vài giây. Không mất phí.
                </p>
              </div>

              <Button
                variant="glow"
                size="lg"
                className="w-full py-4 text-sm font-bold shadow-glow-primary"
                onClick={handleGenerateDeposit}
                isLoading={isGenerating}
              >
                Tạo Mã QR Nạp {formatVND(depositAmount)}
              </Button>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-3xl bg-surface/90 border border-slate-800 space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* QR Code */}
                <div className="relative p-3 bg-white rounded-2xl shadow-xl shrink-0">
                  <img
                    src={
                      activeDeposit.qr_url ||
                      `https://qr.sepay.vn/img?acc=${activeDeposit.bank_account}&bank=${activeDeposit.bank_name}&amount=${activeDeposit.amount}&des=${encodeURIComponent(activeDeposit.transfer_content)}`
                    }
                    alt="SePay VietQR"
                    className="w-52 h-52 object-contain rounded-xl"
                    onError={(e) => {
                      // Fallback VietQR napas image if SePay CDN takes time
                      const accHolder = encodeURIComponent(activeDeposit.account_holder || import.meta.env?.VITE_SEPAY_ACCOUNT_HOLDER || '');
                      (e.target as HTMLImageElement).src = `https://img.vietqr.io/image/${activeDeposit.bank_name}-${activeDeposit.bank_account}-compact2.png?amount=${activeDeposit.amount}&addInfo=${encodeURIComponent(activeDeposit.transfer_content)}&accountName=${accHolder}`;
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Zap className="w-3 h-3" /> Auto 24/7
                  </div>
                </div>

                {/* Transfer Info */}
                <div className="w-full space-y-3 text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">Ngân hàng:</span>
                    <span className="font-bold text-white">{activeDeposit.bank_name}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary-light">{activeDeposit.bank_account}</span>
                      <button
                        onClick={() => handleCopy(activeDeposit.bank_account, 'acc')}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">Chủ tài khoản:</span>
                    <span className="font-bold text-emerald-400">{activeDeposit.account_holder || BANK_CONFIG.accountName}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                    <span className="text-indigo-300 font-semibold">Số tiền cần chuyển:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-emerald-400 text-base">{formatVND(activeDeposit.amount)}</span>
                      <button
                        onClick={() => handleCopy(String(activeDeposit.amount), 'amt')}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        {copiedField === 'amt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-rose-950/40 border border-rose-500/40">
                    <div>
                      <span className="text-rose-300 font-semibold block text-[10px]">Nội dung chuyển khoản (Memo):</span>
                      <span className="font-mono font-black text-rose-400 text-base tracking-wider">{activeDeposit.transfer_content}</span>
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

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <Button variant="ghost" size="sm" onClick={() => setActiveDeposit(null)}>
                  Đổi Số Tiền Khác
                </Button>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="glow"
                    size="md"
                    className="flex-1 sm:flex-initial"
                    onClick={handleVerifyPayment}
                    isLoading={isVerifying}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Xác Nhận Đã Chuyển Khoản
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Transaction History Ledger */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-3xl bg-surface/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white">Lịch Sử Biến Động Số Dư</h3>
            <Button variant="ghost" size="sm" onClick={loadTransactions} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Làm Mới
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="py-3 px-3">Thời gian</th>
                  <th className="py-3 px-3">Loại giao dịch</th>
                  <th className="py-3 px-3">Số tiền</th>
                  <th className="py-3 px-3">Số dư sau</th>
                  <th className="py-3 px-3">Nội dung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Chưa có lịch sử giao dịch nào.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const typeInfo = getTransactionTypeInfo(tx.type);
                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 text-slate-400">{formatDateTime(tx.created_at)}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeInfo.bg} ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold">
                          <span className={typeInfo.isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                            {typeInfo.isPositive ? '+' : ''}
                            {formatVND(tx.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">{formatVND(tx.balance_after)}</td>
                        <td className="py-3 px-3 text-slate-300 max-w-xs truncate">{tx.description}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
