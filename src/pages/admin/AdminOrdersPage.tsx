import React, { useState, useEffect, useMemo } from 'react';
import { orderService } from '../../services/orderService';
import { useAuthStore } from '../../stores/authStore';
import { Order } from '../../types';
import { formatVND, formatNumber, formatDateTime, getOrderStatusInfo } from '../../lib/formatters';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import {
  ShoppingCart,
  Search,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Clock,
  Send,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminOrdersPage: React.FC = () => {
  const { user } = useAuthStore();
  const { success, error, warning } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Approving state
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [isBatchApproving, setIsBatchApproving] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Refund modal state
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('Hủy và hoàn tiền theo yêu cầu khách');
  const [isRefunding, setIsRefunding] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    success('Đã sao chép link mục tiêu');
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleApproveOrder = async (orderId: string) => {
    if (!user) return;
    setApprovingOrderId(orderId);
    try {
      const res = await orderService.approveAndDispatchOrder(orderId, user.id);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      success('Duyệt đơn thành công! 🚀', `Đã bắn API sang Site Social (Mã NCC: #${res.providerOrderId || 'OK'})`);
      loadOrders();
    } catch (err: any) {
      error(err.message || 'Không thể duyệt đơn hàng');
    } finally {
      setApprovingOrderId(null);
    }
  };

  const handleBatchApprovePending = async () => {
    if (!user) return;
    const pendingOrders = orders.filter((o) => o.status === 'pending');
    if (pendingOrders.length === 0) {
      warning('Không có đơn chờ', 'Không có đơn hàng nào đang ở trạng thái Chờ Duyệt');
      return;
    }

    setIsBatchApproving(true);
    let count = 0;
    try {
      for (const ord of pendingOrders) {
        try {
          await orderService.approveAndDispatchOrder(ord.id, user.id);
          count++;
        } catch (e) {
          console.warn(`Failed to approve order #${ord.id}:`, e);
        }
      }
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      success('Duyệt hàng loạt thành công!', `Đã duyệt và bắn API cho ${count} đơn hàng.`);
      loadOrders();
    } catch (err: any) {
      error(err.message || 'Lỗi khi duyệt hàng loạt');
    } finally {
      setIsBatchApproving(false);
    }
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !refundOrderId) return;

    setIsRefunding(true);
    try {
      const res = await orderService.cancelOrder(refundOrderId, user.id, refundReason);
      success('Hoàn tiền thành công!', `Đã hoàn lại +${formatVND(res.refundAmount)} cho khách hàng.`);
      setRefundOrderId(null);
      loadOrders();
    } catch (err: any) {
      error(err.message || 'Không thể hoàn tiền đơn hàng');
    } finally {
      setIsRefunding(false);
    }
  };

  const pendingCount = useMemo(() => {
    return orders.filter((o) => o.status === 'pending').length;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.target_url.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const filterTabs = [
    { key: 'all', label: 'Tất cả', count: orders.length },
    { key: 'pending', label: 'Chờ duyệt', count: pendingCount },
    { key: 'processing', label: 'Đang chạy', count: orders.filter((o) => o.status === 'processing').length },
    { key: 'completed', label: 'Hoàn thành', count: orders.filter((o) => o.status === 'completed').length },
    { key: 'refunded', label: 'Đã hoàn tiền', count: orders.filter((o) => o.status === 'refunded').length },
    { key: 'canceled', label: 'Đã hủy', count: orders.filter((o) => o.status === 'canceled').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-pink-400" /> Quản Lý Đơn Hàng & Duyệt Bắn API
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Khách tạo đơn $\rightarrow$ kiểm tra link $\rightarrow$ bấm Duyệt để bắn lệnh chạy tức thì qua nhà cung cấp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pendingCount > 0 && (
            <Button
              variant="glow"
              size="sm"
              onClick={handleBatchApprovePending}
              isLoading={isBatchApproving}
              className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white font-bold shadow-lg shadow-pink-500/20"
              leftIcon={<Zap className="w-4 h-4" />}
            >
              Duyệt Tất Cả Đơn Chờ ({pendingCount})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={loadOrders} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Làm Mới
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-surface/80 border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                statusFilter === tab.key
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/20'
                  : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.key === 'pending' && pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full lg:w-80 shrink-0">
          <Input
            type="text"
            placeholder="Tìm theo mã đơn, user ID, link..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* ========================================================== */}
      {/* MOBILE CARD VIEW (< lg screens) */}
      {/* ========================================================== */}
      <div className="lg:hidden space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface/80 border border-slate-800 text-center text-slate-500 text-xs">
            {isLoading ? 'Đang tải danh sách đơn...' : 'Không tìm thấy đơn hàng nào phù hợp.'}
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusInfo = getOrderStatusInfo(order.status);
            const profit = (order.total_amount || 0) - (order.provider_cost || 0);
            const isPending = order.status === 'pending';
            const isCombo = Boolean(
              order.service_id?.startsWith('combo-') ||
              order.service_code?.startsWith('combo-') ||
              order.service_name?.toLowerCase().includes('combo')
            );

            return (
              <div
                key={order.id}
                className={`p-4 sm:p-5 rounded-2xl bg-surface/90 border transition-all space-y-3.5 shadow-md ${
                  isPending ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'
                }`}
              >
                {/* Header: Order ID & Status */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-rose-400 text-xs">
                      #{order.id.substring(0, 10)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      User: {order.user_id.substring(0, 6)}...
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                {/* Service Name */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isCombo && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Gói Combo
                      </span>
                    )}
                    <h3 className="font-bold text-white text-sm">{order.service_name}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" /> {formatDateTime(order.created_at)}
                  </p>
                </div>

                {/* Target Link Box */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-primary-light truncate text-[11px] select-all">
                    {order.target_url}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(order.target_url, order.id)}
                      className="p-1 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                      title="Sao chép link"
                    >
                      {copiedLink === order.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={order.target_url.startsWith('http') ? order.target_url : `https://${order.target_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                      title="Mở link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Số lượng</span>
                    <span className="font-bold text-white">{isCombo ? 'Trọn gói' : formatNumber(order.quantity)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Doanh thu</span>
                    <span className="font-extrabold text-emerald-400">{formatVND(order.total_amount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Lợi nhuận</span>
                    <span className="font-black text-rose-400">+{formatVND(profit)}</span>
                  </div>
                </div>

                {/* Action Buttons on Mobile */}
                <div className="pt-1 flex items-center gap-2">
                  {isPending && (
                    <Button
                      variant="glow"
                      size="sm"
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-600/20"
                      onClick={() => handleApproveOrder(order.id)}
                      isLoading={approvingOrderId === order.id}
                      leftIcon={<Send className="w-4 h-4" />}
                    >
                      Duyệt & Bắn API
                    </Button>
                  )}

                  {order.status !== 'refunded' && order.status !== 'canceled' && (
                    <Button
                      variant="danger"
                      size="sm"
                      className={isPending ? 'shrink-0 px-3' : 'w-full py-2.5'}
                      onClick={() => setRefundOrderId(order.id)}
                      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    >
                      Hủy & Hoàn
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================== */}
      {/* DESKTOP TABLE VIEW (>= lg screens) */}
      {/* ========================================================== */}
      <div className="hidden lg:block p-6 rounded-2xl bg-surface/80 border border-slate-800 overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs min-w-[1050px]">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-3 w-28">Mã đơn</th>
              <th className="py-3.5 px-3 min-w-[200px]">Dịch vụ / Combo</th>
              <th className="py-3.5 px-3 min-w-[220px]">Mục tiêu (Link)</th>
              <th className="py-3.5 px-3 w-20 text-center">Số lượng</th>
              <th className="py-3.5 px-3 w-28">Doanh thu</th>
              <th className="py-3.5 px-3 w-28">Lợi nhuận</th>
              <th className="py-3.5 px-3 w-28">Trạng thái</th>
              <th className="py-3.5 px-3 w-32">Ngày tạo</th>
              <th className="py-3.5 px-3 min-w-[190px] text-right">Thao tác duyệt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  {isLoading ? 'Đang tải dữ liệu...' : 'Không tìm thấy đơn hàng nào phù hợp.'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const statusInfo = getOrderStatusInfo(order.status);
                const profit = (order.total_amount || 0) - (order.provider_cost || 0);
                const isPending = order.status === 'pending';
                const isCombo = Boolean(
                  order.service_id?.startsWith('combo-') ||
                  order.service_code?.startsWith('combo-') ||
                  order.service_name?.toLowerCase().includes('combo')
                );

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isPending ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="py-4 px-3 font-mono font-black text-rose-400 whitespace-nowrap">
                      #{order.id.substring(0, 8)}
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isCombo && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                            Combo
                          </span>
                        )}
                        <span className="font-bold text-white">{order.service_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-1.5 max-w-[220px]">
                        <span className="font-mono text-[11px] text-slate-400 truncate">
                          {order.target_url}
                        </span>
                        <button
                          onClick={() => handleCopy(order.target_url, order.id)}
                          className="p-1 text-slate-500 hover:text-white shrink-0"
                          title="Sao chép link"
                        >
                          {copiedLink === order.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <a
                          href={order.target_url.startsWith('http') ? order.target_url : `https://${order.target_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-slate-500 hover:text-white shrink-0"
                          title="Mở link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-3 font-bold text-slate-200 text-center whitespace-nowrap">
                      {isCombo ? 'Trọn gói' : formatNumber(order.quantity)}
                    </td>
                    <td className="py-4 px-3 font-bold text-emerald-400 whitespace-nowrap">
                      {formatVND(order.total_amount)}
                    </td>
                    <td className="py-4 px-3 font-black text-rose-400 whitespace-nowrap">
                      +{formatVND(profit)}
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Approve & Dispatch Button */}
                        {isPending && (
                          <Button
                            variant="glow"
                            size="sm"
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500"
                            onClick={() => handleApproveOrder(order.id)}
                            isLoading={approvingOrderId === order.id}
                            leftIcon={<Send className="w-3.5 h-3.5" />}
                          >
                            Duyệt & Bắn API
                          </Button>
                        )}

                        {/* Refund Button */}
                        {order.status !== 'refunded' && order.status !== 'canceled' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setRefundOrderId(order.id)}
                            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                          >
                            Hủy & Hoàn
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Refund Modal */}
      <Modal
        isOpen={Boolean(refundOrderId)}
        onClose={() => setRefundOrderId(null)}
        title="Xác Nhận Hủy & Hoàn Tiền Đơn Hàng"
        subtitle="Tiền sẽ được hoàn lại tự động 100% vào ví của khách hàng"
      >
        <form onSubmit={handleRefundSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              Thao tác này sẽ hủy đơn hàng, cộng tiền lại 100% cho tài khoản khách và ghi nhật ký giao dịch.
            </span>
          </div>

          <Input
            label="Lý do hoàn tiền"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setRefundOrderId(null)}>
              Hủy bỏ
            </Button>
            <Button variant="danger" type="submit" isLoading={isRefunding}>
              Xác Nhận Hoàn Tiền
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
