import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { formatVND } from '../../lib/formatters';
import { walletService, BANK_CONFIG } from '../../services/walletService';
import { sepayService } from '../../services/sepayService';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from './Toast';
import { Deposit } from '../../types';
import { Copy, Check, QrCode, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VietQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export const VietQRModal: React.FC<VietQRModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, updateBalance } = useAuthStore();
  const { success, error, warning } = useToast();

  const [step, setStep] = useState<'input' | 'payment'>('input');
  const [amount, setAmount] = useState<number>(100000);
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    success('Đã sao chép vào bộ nhớ tạm');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerateQR = async () => {
    if (!user) {
      error('Vui lòng đăng nhập để nạp tiền');
      return;
    }
    if (amount < 10000) {
      error('Số tiền nạp tối thiểu là 10.000 VNĐ');
      return;
    }

    setIsLoading(true);
    try {
      const dep = await walletService.createDepositRequest(user.id, amount);
      setDeposit(dep);
      setStep('payment');
    } catch (err: any) {
      error(err.message || 'Không thể tạo mã QR thanh toán');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPaid = async () => {
    if (!deposit) return;
    setIsVerifying(true);
    try {
      // BẮT BUỘC CHECK VAR THỰC TẾ QUA SEPAY
      const result = await sepayService.verifyDepositWithSepay(
        deposit.id,
        deposit.amount,
        deposit.transfer_content
      );

      if (result.verified) {
        const res = await walletService.confirmDepositPayment(deposit.id);
        updateBalance(res.balanceAfter);

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        success('Nạp tiền thành công qua SePay! 🎉', `Tài khoản đã được cộng +${formatVND(deposit.amount)}.`);
        if (onSuccess) onSuccess();
        handleClose();
      } else {
        warning(
          'Chưa nhận được giao dịch!',
          `Hệ thống chưa tìm thấy chuyển khoản với nội dung "${deposit.transfer_content}". Vui lòng chuyển khoản đúng nội dung và bấm Kiểm Tra Lại.`
        );
      }
    } catch (err: any) {
      error(err.message || 'Xác thực thanh toán thất bại');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setStep('input');
    setDeposit(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'input' ? 'Nạp Tiền Vào Tài Khoản' : 'Thanh Toán VietQR Tự Động 24/7'}
      subtitle={
        step === 'input'
          ? 'Hỗ trợ quét mã VietQR tự động cộng tiền sau 3-10 giây'
          : 'Mở ứng dụng ngân hàng và quét mã QR bên dưới'
      }
      maxWidth={step === 'input' ? 'md' : 'lg'}
    >
      {step === 'input' ? (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Chọn số tiền nạp nhanh
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                    amount === amt
                      ? 'bg-primary/20 text-primary-light border-primary/50 shadow-glow-primary'
                      : 'bg-slate-800/60 text-slate-300 border-slate-700/50 hover:bg-slate-800'
                  }`}
                >
                  {formatVND(amt)}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Hoặc nhập số tiền tùy chỉnh (VNĐ)"
            type="number"
            min={10000}
            step={10000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Tối thiểu 10.000 đ"
          />

          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Hệ thống nạp tự động an toàn 100%
            </div>
            <p className="text-slate-400 leading-relaxed">
              Tiền được cộng tự động vào số dư ngay khi ngân hàng xử lý giao dịch. Không mất phí nạp.
            </p>
          </div>

          <Button
            variant="glow"
            className="w-full py-3"
            onClick={handleGenerateQR}
            isLoading={isLoading}
            leftIcon={<QrCode className="w-4 h-4" />}
          >
            Tạo Mã QR Nạp {formatVND(amount)}
          </Button>
        </div>
      ) : (
        deposit && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              {/* QR Image */}
              <div className="relative p-2 bg-white rounded-xl shadow-lg shrink-0">
                <img
                  src={deposit.qr_url || ''}
                  alt={`VietQR ${BANK_CONFIG.bankName}`}
                  className="w-48 h-48 object-contain rounded-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Auto 24/7
                </div>
              </div>

              {/* Transfer Details */}
              <div className="w-full space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/40">
                  <span className="text-slate-400">Ngân hàng:</span>
                  <span className="font-bold text-slate-100">{BANK_CONFIG.bankName}</span>
                </div>

                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/40">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-primary-light">{BANK_CONFIG.accountNo}</span>
                    <button
                      onClick={() => handleCopy(BANK_CONFIG.accountNo, 'acc')}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/40">
                  <span className="text-slate-400">Chủ tài khoản:</span>
                  <span className="font-bold text-slate-100">{BANK_CONFIG.accountName}</span>
                </div>

                <div className="flex justify-between items-center p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30">
                  <span className="text-indigo-300 font-semibold">Số tiền:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-400 text-sm">{formatVND(deposit.amount)}</span>
                    <button
                      onClick={() => handleCopy(String(deposit.amount), 'amt')}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      {copiedField === 'amt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30">
                  <div>
                    <span className="text-rose-300 font-semibold block">Nội dung chuyển khoản (Bắt buộc):</span>
                    <span className="font-mono font-black text-rose-400 text-sm tracking-wider">{deposit.transfer_content}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(deposit.transfer_content, 'memo')}
                    className="p-1.5 rounded-lg bg-rose-900/50 text-rose-200 hover:bg-rose-800"
                  >
                    {copiedField === 'memo' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setStep('input')}>
                Thay đổi số tiền
              </Button>
              <Button
                variant="glow"
                size="md"
                className="flex-1"
                onClick={handleConfirmPaid}
                isLoading={isVerifying}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Xác Nhận Đã Chuyển Khoản
              </Button>
            </div>
          </div>
        )
      )}
    </Modal>
  );
};
