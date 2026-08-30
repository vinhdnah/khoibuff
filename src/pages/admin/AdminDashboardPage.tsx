import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { orderService } from '../../services/orderService';
import { useAuthStore } from '../../stores/authStore';
import { AdminDashboardStats, ChartDataPoint } from '../../types';
import { formatVND, formatNumber } from '../../lib/formatters';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import {
  Shield,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  CreditCard,
  Zap,
  RefreshCw,
  Clock,
  Layers,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const { user, updateBalance } = useAuthStore();
  const { success, error } = useToast();

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const s = await adminService.getDashboardStats();
      setStats(s);

      const cd = await adminService.getRevenueChartData();
      setChartData(cd);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncOrders = async () => {
    setIsSyncing(true);
    try {
      await orderService.syncActiveOrders();
      await loadDashboard();
      success('Đã đồng bộ trạng thái đơn hàng từ Provider');
    } catch (err: any) {
      error(err.message || 'Lỗi khi đồng bộ đơn');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-surface to-surface border border-purple-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <Shield className="w-3.5 h-3.5" /> TRUNG TÂM ĐIỀU HÀNH HỆ THỐNG
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Bảng Quản Trị Hệ Thống KHÔI BUFF TIM
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Giám sát tài chính, kiểm soát đơn hàng, nhà cung cấp và người dùng thời gian thực.
          </p>
        </div>

        {/* Admin Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncOrders}
            isLoading={isSyncing}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Đồng Bộ Provider
          </Button>
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Doanh thu hôm nay"
          value={formatVND(stats?.revenueToday || 0)}
          subtitle="Tự động tính từ orders"
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          glowColor="emerald"
        />
        <StatCard
          title="Doanh thu tháng này"
          value={formatVND(stats?.revenueThisMonth || 0)}
          subtitle="Tổng phát sinh trong tháng"
          icon={<TrendingUp className="w-5 h-5 text-indigo-400" />}
          glowColor="indigo"
        />
        <StatCard
          title="Lợi nhuận ròng (Net Profit)"
          value={formatVND(stats?.totalProfit || 0)}
          subtitle={`Chi phí gốc: ${formatVND(stats?.providerCost || 0)}`}
          icon={<Zap className="w-5 h-5 text-pink-400" />}
          glowColor="pink"
        />
        <StatCard
          title="Tổng người dùng"
          value={formatNumber(stats?.totalUsers || 0)}
          subtitle={`${stats?.pendingDeposits || 0} yêu cầu nạp chờ duyệt`}
          icon={<Users className="w-5 h-5 text-cyan-400" />}
          glowColor="cyan"
        />
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Tổng số đơn</span>
          <p className="text-2xl font-bold text-white mt-1">{stats?.totalOrders || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface/80 border border-slate-800">
          <span className="text-[11px] text-blue-400 uppercase font-semibold">Đang xử lý</span>
          <p className="text-2xl font-bold text-blue-400 mt-1">{stats?.processingOrders || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface/80 border border-slate-800">
          <span className="text-[11px] text-emerald-400 uppercase font-semibold">Hoàn tất</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats?.completedOrders || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface/80 border border-slate-800">
          <span className="text-[11px] text-rose-400 uppercase font-semibold">Thất bại / Hủy</span>
          <p className="text-2xl font-bold text-rose-400 mt-1">{stats?.failedOrders || 0}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Profit Trends */}
        <div className="p-6 rounded-2xl bg-surface/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Xu Hướng Doanh Thu & Lợi Nhuận (7 Ngày)</h4>
            <Badge variant="primary" size="sm">
              VNĐ
            </Badge>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [formatVND(val), '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" name="Doanh thu" dataKey="revenue" stroke="#6366f1" fill="url(#colorRev)" />
                <Area type="monotone" name="Lợi nhuận" dataKey="profit" stroke="#10b981" fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Count Trend */}
        <div className="p-6 rounded-2xl bg-surface/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Lượng Đơn Hàng Theo Ngày</h4>
            <Badge variant="secondary" size="sm">
              Đơn
            </Badge>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar name="Số lượng đơn" dataKey="orders" fill="#ec4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
