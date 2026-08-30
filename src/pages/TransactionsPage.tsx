import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { walletService } from '../services/walletService';
import { WalletTransaction, TransactionType } from '../types';
import { formatVND, formatDateTime, getTransactionTypeInfo } from '../lib/formatters';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import {
  History,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await walletService.getUserTransactions(user.id);
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesSearch =
        t.transaction_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesType && matchesSearch;
    });
  }, [transactions, typeFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <History className="w-6 h-6 text-primary-light" /> Lịch Sử Giao Dịch Ví
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Toàn bộ biến động số dư, nạp tiền, thanh toán đơn hàng và hoàn tiền được ghi nhận minh bạch 100%.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-4 rounded-2xl bg-surface/80 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'deposit', label: 'Nạp tiền' },
              { key: 'order', label: 'Thanh toán đơn' },
              { key: 'refund', label: 'Hoàn tiền' },
              { key: 'bonus', label: 'Thưởng' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  typeFilter === tab.key
                    ? 'bg-primary text-white border-primary shadow-glow-primary'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full md:w-72">
            <Input
              type="text"
              placeholder="Tìm theo mã giao dịch, mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="p-6 rounded-2xl bg-surface/80 border border-slate-800">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <History className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-400">Không tìm thấy giao dịch nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-3">Mã GD</th>
                  <th className="py-3.5 px-3">Loại giao dịch</th>
                  <th className="py-3.5 px-3">Số dư trước</th>
                  <th className="py-3.5 px-3">Số tiền</th>
                  <th className="py-3.5 px-3">Số dư sau</th>
                  <th className="py-3.5 px-3">Mô tả chi tiết</th>
                  <th className="py-3.5 px-3">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredTransactions.map((tx) => {
                  const info = getTransactionTypeInfo(tx.type);
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-3 font-mono font-bold text-slate-400 whitespace-nowrap">
                        {tx.transaction_code}
                      </td>

                      <td className="py-4 px-3 whitespace-nowrap">
                        <span className={`font-semibold ${info.color}`}>
                          {info.label}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-slate-400 whitespace-nowrap">
                        {formatVND(tx.balance_before)}
                      </td>

                      <td className="py-4 px-3 font-black text-sm whitespace-nowrap">
                        <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                          {isPositive ? '+' : ''}
                          {formatVND(tx.amount)}
                        </span>
                      </td>

                      <td className="py-4 px-3 font-extrabold text-slate-100 whitespace-nowrap">
                        {formatVND(tx.balance_after)}
                      </td>

                      <td className="py-4 px-3 text-slate-300 max-w-md">
                        {tx.description || '--'}
                      </td>

                      <td className="py-4 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                        {formatDateTime(tx.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
