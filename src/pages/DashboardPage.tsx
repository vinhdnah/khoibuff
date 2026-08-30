import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { formatVND, formatDateTime, getOrderStatusInfo } from '../lib/formatters';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { VietQRModal } from '../components/ui/VietQRModal';
import { gsap, useGSAP } from '../lib/gsap';
import {
  Wallet,
  ShoppingCart,
  Clock,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  ListFilter,
  ExternalLink,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const DashboardPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await orderService.getUserOrders(user.id);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      '.dash-welcome',
      { y: -15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' }
    )
      .fromTo(
        '.dash-stat-item',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.06, duration: 0.4, clearProps: 'all' },
        '-=0.2'
      );
  }, { scope: containerRef });

  const totalOrders = orders.length;
  const processingOrders = orders.filter((o) => o.status === 'processing' || o.status === 'pending').length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const totalSpent = orders
    .filter((o) => o.status !== 'canceled' && o.status !== 'refunded')
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  // Mock chart activity for 7 days
  const chartData = [
    { name: 'T2', orders: 2, spent: 45000 },
    { name: 'T3', orders: 4, spent: 90000 },
    { name: 'T4', orders: 1, spent: 30000 },
    { name: 'T5', orders: 5, spent: 150000 },
    { name: 'T6', orders: 8, spent: 220000 },
    { name: 'T7', orders: 6, spent: 180000 },
    { name: 'CN', orders: 9, spent: 290000 },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Welcome Banner */}
      <div className="dash-welcome p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-surface-light via-surface to-indigo-950/40 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Xin chào, <span className="text-primary-light">{user?.full_name || user?.username}</span> 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Chào mừng bạn quay lại hệ thống quản lý & tăng trưởng mạng xã hội SMM PRO.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="glow" size="sm" onClick={() => setIsDepositOpen(true)} leftIcon={<PlusCircle className="w-4 h-4" />}>
            Nạp Tiền VietQR
          </Button>
          <Link to="/order/new">
            <Button variant="primary" size="sm" leftIcon={<ShoppingCart className="w-4 h-4" />}>
              Tạo Đơn Mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dash-stat-item">
          <StatCard
            title="Số dư khả dụng"
            value={formatVND(user?.balance || 0)}
            subtitle="Cập nhật thời gian thực"
            icon={<Wallet className="w-5 h-5 text-emerald-400" />}
            glowColor="emerald"
          />
        </div>
        <div className="dash-stat-item">
          <StatCard
            title="Tổng đơn đã đặt"
            value={totalOrders}
            subtitle="Tất cả thời gian"
            icon={<ShoppingCart className="w-5 h-5 text-indigo-400" />}
            glowColor="indigo"
          />
        </div>
        <div className="dash-stat-item">
          <StatCard
            title="Đơn đang chạy"
            value={processingOrders}
            subtitle="Đang phân phối trên server"
            icon={<Clock className="w-5 h-5 text-amber-400" />}
            glowColor="amber"
          />
        </div>
        <div className="dash-stat-item">
          <StatCard
            title="Tổng chi tiêu"
            value={formatVND(totalSpent)}
            subtitle={`${completedOrders} đơn hoàn thành`}
            icon={<TrendingUp className="w-5 h-5 text-pink-400" />}
            glowColor="pink"
          />
        </div>
      </div>

      {/* Chart & Quick Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Activity Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Hoạt Động Tăng Tương Tác 7 Ngày Qua</h4>
              <p className="text-xs text-slate-400">Thống kê số lượng đơn đặt theo ngày</p>
            </div>
            <Badge variant="primary" size="sm">
              Tuần này
            </Badge>
          </div>

          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} đơn`, 'Số đơn']}
                />
                <Area type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Tips & System Status */}
        <div className="p-6 rounded-2xl bg-surface/80 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary-light font-bold text-sm mb-3">
              <Zap className="w-4 h-4" /> Mẹo Tối Ưu Tương Tác
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Nên buff Tim + View cùng lúc cho video mới đăng trong vòng 1 giờ đầu để dễ lên xu hướng.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Đảm bảo bài viết, video hoặc profile ở chế độ <b>Công khai (Public)</b> trước khi đặt đơn.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Sử dụng dịch vụ có bảo hành (Refill) để được bù số lượng miễn phí nếu có biến động.</span>
              </li>
            </ul>
          </div>

          <Link to="/services">
            <Button variant="outline" className="w-full text-xs" leftIcon={<ListFilter className="w-3.5 h-3.5" />}>
              Xem Bảng Giá Tất Cả Dịch Vụ
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 rounded-2xl bg-surface/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-white">Đơn Hàng Gần Đây</h4>
            <p className="text-xs text-slate-400">Danh sách các đơn hàng gần nhất của bạn</p>
          </div>
          <Link to="/orders">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Xem tất cả ({totalOrders})
            </Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-400">Bạn chưa có đơn hàng nào.</p>
            <Link to="/order/new">
              <Button variant="glow" size="sm">
                Tạo Đơn Đầu Tiên
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Mã đơn</th>
                  <th className="py-3 px-3">Dịch vụ</th>
                  <th className="py-3 px-3">Liên kết mục tiêu</th>
                  <th className="py-3 px-3">Số lượng</th>
                  <th className="py-3 px-3">Tổng tiền</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {orders.slice(0, 5).map((order) => {
                  const statusInfo = getOrderStatusInfo(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-300">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-white">
                        {order.service_name}
                      </td>
                      <td className="py-3.5 px-3 max-w-[200px] truncate text-slate-400">
                        <a
                          href={order.target_url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-primary-light flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{order.target_url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-200">
                        {order.quantity.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-emerald-400">
                        {formatVND(order.total_amount)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                        {formatDateTime(order.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <VietQRModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
    </div>
  );
};
