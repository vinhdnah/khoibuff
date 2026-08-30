import React, { useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { AdminMobileNav } from '../components/layout/AdminMobileNav';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import {
  ShieldAlert,
  ArrowLeft,
  LayoutDashboard,
  ShoppingCart,
  Layers,
  Users,
  DollarSign,
  Headphones,
  FileText,
  Store,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const adminTabs = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', label: 'Đơn Hàng', icon: ShoppingCart },
    { to: '/admin/services', label: 'Dịch Vụ & Giá', icon: Layers },
    { to: '/admin/users', label: 'Người Dùng', icon: Users },
    { to: '/admin/deposits', label: 'Nạp SePay', icon: DollarSign },
    { to: '/admin/tickets', label: 'Ticket Hỗ Trợ', icon: Headphones },
    { to: '/admin/logs', label: 'Audit Log', icon: FileText },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-2xl bg-surface border border-rose-500/30 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Yêu Cầu Quyền Quản Trị Viên</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Khu vực này dành riêng cho tài khoản quản trị hệ thống. Vui lòng đăng nhập với tài khoản Admin để truy cập.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/auth?redirect=/admin">
                <Button variant="glow" className="w-full">
                  Đăng Nhập Tài Khoản Admin
                </Button>
              </Link>
              <Link to="/order">
                <Button variant="ghost" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Quay Lại Cửa Hàng
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Admin Notice Bar */}
      <div className="bg-purple-950/80 border-b border-purple-800/50 px-4 py-2 text-xs font-semibold text-purple-200 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping shrink-0" />
          <span className="truncate">Quản Trị Hệ Thống (Admin Portal)</span>
        </div>
        <Link
          to="/"
          className="shrink-0 flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-purple-900/60 hover:bg-purple-800/80 text-purple-300 transition-colors border border-purple-700/40"
        >
          <Store className="w-3 h-3" />
          <span>Về Web Con</span>
        </Link>
      </div>

      <Navbar />

      {/* Mobile Horizontal Quick Navigation Tabs */}
      <div className="lg:hidden sticky top-16 z-30 bg-surface/95 backdrop-blur-md border-b border-purple-900/50 px-3 py-2 overflow-x-auto no-scrollbar shadow-md">
        <div className="flex items-center gap-1.5 min-w-max">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-purple-200 hover:bg-purple-950/40 border border-transparent'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Admin Dedicated Mobile Bottom Navigation */}
      <AdminMobileNav />
    </div>
  );
};
