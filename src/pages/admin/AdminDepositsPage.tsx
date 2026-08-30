import React, { useState, useEffect, useMemo } from 'react';
import { walletService } from '../../services/walletService';
import { sepayService } from '../../services/sepayService';
import { Deposit } from '../../types';
import { formatVND, formatDateTime } from '../../lib/formatters';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { DollarSign, Search, RefreshCw, Zap, CheckCircle2, Clock } from 'lucide-react';

export const AdminDepositsPage: React.FC = () => {
  const { success, info } = useToast();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    try {
      setIsLoading(true);
      const data = await walletService.getAllDeposits();
      setDeposits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualScanSePay = async () => {
    setIsScanning(true);
    try {
      const credited = await sepayService.checkAndProcessIncomingTransactions();
      if (credited.length > 0) {
        success(
          'Đã quét SePay thành công!',
          `Phát hiện và tự động cộng ${credited.length} giao dịch mới cho khách hàng.`
        );
      } else {
        info('Đã quét SePay', 'Không có giao dịch mới nào chưa được cộng tiền.');
      }
      await loadDeposits();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const filteredDeposits = useMemo(() => {
    return deposits.filter((d) => {
      return (
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.transfer_content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.transaction_code || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [deposits, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-purple-400" /> Giám Sát Nạp Tiền SePay Tự Động
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Hệ thống tự động kiểm tra nội dung chuyển khoản và cộng tiền qua SePay 24/7. Không cần duyệt thủ công.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="glow"
            size="sm"
            onClick={handleManualScanSePay}
            isLoading={isScanning}
            leftIcon={<Zap className="w-4 h-4" />}
          >
            Quét SePay Ngay
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDeposits}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Làm Mới
          </Button>
        </div>
      </div>

      {/* Search Bar & Stats */}
      <div className="p-4 rounded-2xl bg-surface/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-96">
          <Input
            type="text"
            placeholder="Tìm theo mã giao dịch, Memo, User ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>
            Tổng cộng: <b className="text-white">{filteredDeposits.length}</b> giao dịch
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> SePay Auto-Sync 30s
          </span>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="p-6 rounded-2xl bg-surface/80 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-3">Mã GD</th>
              <th className="py-3.5 px-3">Khách hàng</th>
              <th className="py-3.5 px-3">Số tiền</th>
              <th className="py-3.5 px-3">Cú pháp Memo</th>
              <th className="py-3.5 px-3">Ngân hàng</th>
              <th className="py-3.5 px-3">Mã GD SePay</th>
              <th className="py-3.5 px-3">Trạng thái</th>
              <th className="py-3.5 px-3 text-right">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredDeposits.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                  {isLoading ? 'Đang tải dữ liệu...' : 'Chưa có giao dịch nạp tiền nào'}
                </td>
              </tr>
            ) : (
              filteredDeposits.map((dep) => {
                const isSuccess = dep.status === 'completed';
                return (
                  <tr key={dep.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-3 font-mono font-bold text-slate-300">
                      #{dep.id.substring(0, 8)}
                    </td>
                    <td className="py-4 px-3 font-mono text-[11px] text-slate-400">
                      {dep.user_id.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-3 font-extrabold text-emerald-400 text-sm whitespace-nowrap">
                      +{formatVND(dep.amount)}
                    </td>
                    <td className="py-4 px-3 font-mono font-bold text-rose-300">
                      {dep.transfer_content}
                    </td>
                    <td className="py-4 px-3 text-slate-300">
                      {dep.bank_name}
                    </td>
                    <td className="py-4 px-3 font-mono text-[11px] text-slate-400">
                      {dep.transaction_code || '---'}
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      {isSuccess ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Tự động cộng SePay
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> Chờ quét QR
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-3 text-right text-slate-400 whitespace-nowrap text-[11px]">
                      {formatDateTime(dep.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
