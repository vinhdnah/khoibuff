import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useAuthStore } from '../stores/authStore';
import { Order } from '../types';
import { formatVND, formatNumber, formatDateTime, getOrderStatusInfo } from '../lib/formatters';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import {
  FileText,
  Search,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { success, error } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefilling, setIsRefilling] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      const data = await orderService.getUserOrders(user.id);
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefill = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefilling(orderId);
    try {
      await orderService.requestRefill(orderId);
      success('Đã gửi yêu cầu bảo hành', 'Hệ thống đang kiểm tra và bù số lượng.');
      loadOrders();
    } catch (err: any) {
      error(err.message || 'Không thể yêu cầu bảo hành');
    } finally {
      setIsRefilling(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.target_url.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-primary-light" /> Lịch Sử Đơn Hàng
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Giám sát trạng thái, số lượng khởi đầu, tiến độ hoàn thành và yêu cầu bảo hành.
          </p>
        </div>

        <Link to="/order">
          <Button variant="glow" size="sm" leftIcon={<ShoppingBag className="w-4 h-4" />}>
            Đặt Đơn Mới
          </Button>
        </Link>
      </div>

      {/* Filter & Search */}
      <div className="p-4 rounded-3xl bg-surface/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['all', 'processing', 'completed', 'pending', 'refunded'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === st
                  ? 'bg-primary text-white border-primary shadow-glow-primary'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {st === 'all' ? 'Tất cả' : st.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="w-full md:w-80">
          <Input
            type="text"
            placeholder="Tìm theo mã đơn, link..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-6 rounded-3xl bg-surface/80 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-3">Mã đơn</th>
              <th className="py-3.5 px-3">Dịch vụ</th>
              <th className="py-3.5 px-3">Mục tiêu</th>
              <th className="py-3.5 px-3">Số lượng</th>
              <th className="py-3.5 px-3">Bắt đầu / Hiện tại</th>
              <th className="py-3.5 px-3">Tổng tiền</th>
              <th className="py-3.5 px-3">Trạng thái</th>
              <th className="py-3.5 px-3 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredOrders.map((order) => {
              const statusInfo = getOrderStatusInfo(order.status);
              const progress = order.progress_percentage || (order.status === 'completed' ? 100 : 45);

              return (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-4 px-3 font-mono font-bold text-primary-light">
                    #{order.id.substring(0, 8)}
                  </td>
                  <td className="py-4 px-3 font-semibold text-white max-w-[200px] truncate">
                    {order.service_name}
                  </td>
                  <td className="py-4 px-3 max-w-[180px] truncate font-mono text-[11px] text-slate-300">
                    {order.target_url}
                  </td>
                  <td className="py-4 px-3 font-bold text-slate-100">
                    {formatNumber(order.quantity)}
                  </td>
                  <td className="py-4 px-3 text-slate-400 whitespace-nowrap">
                    <span className="text-slate-300">{formatNumber(order.start_count || 0)}</span> /{' '}
                    <span className="text-emerald-400 font-bold">{formatNumber(order.current_count || order.start_count || 0)}</span>
                  </td>
                  <td className="py-4 px-3 font-extrabold text-emerald-400 whitespace-nowrap">
                    {formatVND(order.total_amount)}
                  </td>
                  <td className="py-4 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                    >
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {order.status === 'completed' && (
                        <button
                          onClick={(e) => handleRefill(order.id, e)}
                          disabled={isRefilling === order.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3 text-emerald-400" />
                          <span>Bảo hành</span>
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-slate-500 text-xs">Chưa có đơn hàng nào phù hợp.</p>
            <Link to="/order">
              <Button variant="outline" size="sm">
                Tạo Đơn Hàng Đầu Tiên
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
