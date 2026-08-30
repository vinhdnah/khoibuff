import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  ShoppingCart,
  Layers,
  Users,
  DollarSign,
  Headphones,
  FileText,
  Menu,
  X,
  Store,
  LogOut,
  Shield,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const AdminMobileNav: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const primaryNavItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Đơn Hàng', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Dịch Vụ', path: '/admin/services', icon: Layers, highlight: true },
    { name: 'Thành Viên', path: '/admin/users', icon: Users },
  ];

  const allAdminItems = [
    {
      name: 'Admin Dashboard',
      desc: 'Tổng quan doanh thu, đơn hàng & biểu đồ',
      path: '/admin',
      icon: LayoutDashboard,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      end: true,
    },
    {
      name: 'Quản Lý Đơn Hàng',
      desc: 'Xem chi tiết, cập nhật trạng thái, đồng bộ & hoàn tiền',
      path: '/admin/orders',
      icon: ShoppingCart,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      name: 'Dịch Vụ & Bảng Giá',
      desc: 'Cấu hình giá bán, tỷ lệ lợi nhuận, bật/tắt dịch vụ',
      path: '/admin/services',
      icon: Layers,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10 border-pink-500/20',
    },
    {
      name: 'Quản Lý Người Dùng',
      desc: 'Danh sách thành viên, phân quyền, cộng/trừ tiền',
      path: '/admin/users',
      icon: Users,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      name: 'Lịch Sử Nạp Tiền SePay',
      desc: 'Kiểm soát giao dịch nạp tự động, log đối soát MBBank',
      path: '/admin/deposits',
      icon: DollarSign,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      name: 'Xử Lý Ticket Hỗ Trợ',
      desc: 'Phản hồi khiếu nại khách hàng, giải quyết đơn lỗi',
      path: '/admin/tickets',
      icon: Headphones,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      name: 'Nhật Ký Audit Log',
      desc: 'Lịch sử thao tác quản trị, bảo mật & an toàn hệ thống',
      path: '/admin/logs',
      icon: FileText,
      color: 'text-slate-300',
      bg: 'bg-slate-500/10 border-slate-500/20',
    },
  ];

  const handleLogout = () => {
    setIsDrawerOpen(false);
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Fixed Admin Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-purple-900/60 px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-around">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative ${
                    item.highlight
                      ? isActive
                        ? 'text-white'
                        : 'text-purple-300'
                      : isActive
                      ? 'text-purple-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.highlight ? (
                      <div
                        className={`-mt-4 p-2.5 rounded-2xl transition-transform shadow-lg ${
                          isActive
                            ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white scale-110 shadow-purple-500/40'
                            : 'bg-purple-700/80 text-white hover:scale-105'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    ) : (
                      <div
                        className={`p-1 rounded-xl transition-colors ${
                          isActive ? 'bg-purple-900/50 text-purple-300' : ''
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    )}
                    <span className="text-[10px] font-semibold tracking-tight mt-0.5">
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}

          {/* All Functions / Menu Drawer Trigger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all ${
              isDrawerOpen ? 'text-purple-300 font-bold' : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            <div className="p-1 rounded-xl relative">
              <Menu className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </div>
            <span className="text-[10px] font-semibold tracking-tight mt-0.5">
              Menu Admin
            </span>
          </button>
        </div>
      </nav>

      {/* Admin Mobile Drawer (Slide-up Bottom Sheet) */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-h-[85vh] bg-surface border-t border-purple-800/60 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Drawer Drag Bar / Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">Menu Quản Trị Hệ Thống</h3>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Chọn chức năng bạn muốn quản lý</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Admin Modules */}
            <div className="p-3.5 space-y-2 overflow-y-auto max-h-[calc(85vh-8rem)]">
              {allAdminItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.end
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-purple-950/60 border-purple-500/50 shadow-md'
                        : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${item.bg} ${item.color} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold ${
                              isActive ? 'text-purple-300' : 'text-white'
                            }`}
                          >
                            {item.name}
                          </span>
                          {isActive && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 font-semibold">
                              Đang mở
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? 'text-purple-400 translate-x-0.5' : 'text-slate-500'
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/90 grid grid-cols-2 gap-2">
              <Link
                to="/"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Store className="w-4 h-4 text-pink-400" />
                <span>Về Cửa Hàng</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Đăng Xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
