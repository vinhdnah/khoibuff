import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useAuthStore } from '../stores/authStore';
import { Order } from '../types';
import { SERVICE_COMBOS } from '../config/services';
import { formatVND, formatNumber, formatDateTime, getOrderStatusInfo } from '../lib/formatters';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  RotateCcw,
  Zap,
  ShieldCheck,
  Activity,
  AlertCircle,
  Sparkles,
  Layers,
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { success, error } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefilling, setIsRefilling] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrderDetail(id);
    }
  }, [id]);

  const loadOrderDetail = async (orderId: string) => {
    try {
      setIsLoading(true);
      const data = await orderService.getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefill = async () => {
    if (!order) return;
    setIsRefilling(true);
    try {
      await orderService.requestRefill(order.id);
      success('Đã gửi yêu cầu bảo hành', 'Hệ thống đang kiểm tra và xử lý bù số lượng.');
      loadOrderDetail(order.id);
    } catch (err: any) {
      error(err.message || 'Không thể yêu cầu bảo hành');
    } finally {
      setIsRefilling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-white text-lg">Không tìm thấy đơn hàng</h3>
        <p className="text-xs text-slate-400">Đơn hàng không tồn tại hoặc bạn không có quyền xem.</p>
        <Link to="/orders">
          <Button variant="outline" size="sm">
            Về Danh Sách Đơn Hàng
          </Button>
        </Link>
      </div>
    );
  }

  const statusInfo = getOrderStatusInfo(order.status);

  // Timeline Step Status Calculation
  const isPending = order.status === 'pending';
  const isProcessing = order.status === 'processing';
  const isCompleted = order.status === 'completed';
  const isRefunded = order.status === 'refunded';

  const steps = [
    { title: 'Đã Tạo Đơn Hàng', desc: 'Đã thanh toán & trừ số dư ví', completed: true, active: false },
    {
      title: 'Duyệt & Gửi Server',
      desc: isPending ? 'Đang chờ Admin kiểm tra và duyệt lệnh' : 'Đã duyệt & gửi tới server tương tác',
      completed: !isPending,
      active: isPending,
    },
    { title: 'Đang Xử Lý Tương Tác', desc: 'Hệ thống đang tăng dần số lượng', completed: isCompleted, active: isProcessing },
    { title: 'Hoàn Thành Đơn Hàng', desc: 'Đã hoàn tất 100% số lượng cam kết', completed: isCompleted, active: false },
  ];

  // Check if order is a Combo
  const isCombo = Boolean(
    order.service_id?.startsWith('combo-') ||
    order.service_code?.startsWith('combo-') ||
    order.service_name?.toLowerCase().includes('combo')
  );

  const matchedCombo = SERVICE_COMBOS.find(
    (c) => c.id === order.service_id || c.slug === order.service_id || c.name === order.service_name
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay Lại Đơn Hàng
        </button>

        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Order Info Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface/80 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-primary-light">
                #{order.id.substring(0, 8)}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {order.service_name}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Thời gian tạo: {formatDateTime(order.created_at)}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Tổng tiền thanh toán:</span>
            <span className="font-black text-2xl text-emerald-400">
              {formatVND(order.total_amount)}
            </span>
          </div>
        </div>

        {/* Live Step Timeline */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tiến Trình Xử Lý Đơn Hàng (Timeline)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  st.completed
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : st.active
                    ? 'bg-primary/20 border-primary text-primary-light animate-pulse'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      st.completed
                        ? 'bg-emerald-500 text-slate-950'
                        : st.active
                        ? 'bg-primary text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {st.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <h4 className="font-bold text-xs text-white">{st.title}</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Counts & Statistics / Combo Breakdown */}
        {isCombo && matchedCombo ? (
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-pink-400" /> Chi Tiết 5 Dịch Vụ Trong Gói Combo
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ⚡ Đang Phân Phối Đồng Thời
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              {matchedCombo.items.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 block truncate">{item.name}</span>
                  <span className="font-black text-rose-400 text-base block font-mono">
                    +{formatNumber(item.qty)}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-semibold block">Cam kết đủ 100%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block">Số lượng đặt:</span>
              <span className="font-extrabold text-white text-base">
                {formatNumber(order.quantity)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Số lượng ban đầu:</span>
              <span className="font-bold text-slate-300 text-base">
                {order.start_count ? formatNumber(order.start_count) : (isPending ? 'Chờ máy quét' : '0')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Hiện tại đạt:</span>
              <span className="font-black text-emerald-400 text-base">
                {order.current_count ? formatNumber(order.current_count) : (isCompleted ? formatNumber(order.quantity) : '0')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Còn lại:</span>
              <span className="font-bold text-pink-400 text-base">
                {isCompleted ? '0' : formatNumber(order.remains || order.quantity)}
              </span>
            </div>
          </div>
        )}

        {/* Target link */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-slate-500 text-[10px] block">Đường dẫn mục tiêu:</span>
            <a
              href={order.target_url.startsWith('http') ? order.target_url : `https://${order.target_url}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-primary-light hover:underline break-all"
            >
              {order.target_url}
            </a>
          </div>

          {order.status === 'completed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefill}
              isLoading={isRefilling}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Yêu Cầu Bảo Hành
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
