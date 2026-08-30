import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  ShoppingCart,
  Clock,
  ListFilter,
  CreditCard,
  History,
  Code2,
  Headphones,
  Settings,
  Shield,
  Users,
  Layers,
  FileText,
  DollarSign,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  const userNavItems = [
    { to: '/order', label: 'Tạo đơn mới', icon: ShoppingCart, badge: 'Hot' },
    { to: '/orders', label: 'Lịch sử đơn hàng', icon: Clock },
    { to: '/services', label: 'Bảng giá dịch vụ', icon: ListFilter },
    { to: '/wallet', label: 'Ví & Nạp tiền', icon: CreditCard },
    { to: '/support', label: 'Hỗ trợ kỹ thuật', icon: Headphones },
    { to: '/account', label: 'Cài đặt tài khoản', icon: Settings },
  ];

  const adminNavItems = [
    { to: '/admin', label: 'Admin Dashboard', icon: Shield },
    { to: '/admin/orders', label: 'Quản lý Đơn hàng', icon: ShoppingCart },
    { to: '/admin/services', label: 'Dịch vụ & Giá bán', icon: Layers },
    { to: '/admin/users', label: 'Quản lý Người dùng', icon: Users },
    { to: '/admin/deposits', label: 'Lịch sử Nạp SePay', icon: DollarSign },
    { to: '/admin/tickets', label: 'Xử lý Ticket', icon: Headphones },
    { to: '/admin/logs', label: 'Nhật ký Audit Log', icon: FileText },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-4rem)] sticky top-16 bg-surface/50 border-r border-border/70 p-4 overflow-y-auto">
      {/* User Section */}
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Menu Chính
        </div>
        {userNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-primary/20 text-primary-light border border-primary/30 shadow-glow-primary'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Admin Section (Only shown if user.role === 'admin') */}
      {user?.role === 'admin' && (
        <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-400">
            <span>Admin Panel</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">ADMIN</span>
          </div>
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-purple-200 hover:bg-purple-950/30'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}

      {/* Bottom Service Guarantee Banner */}
      <div className="mt-auto pt-4">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/20 text-[11px]">
          <div className="flex items-center gap-1.5 font-bold text-indigo-300">
            <span>🚀 Tốc độ phân phối 24/7</span>
          </div>
          <p className="text-slate-400 mt-1 leading-relaxed">
            Hệ thống máy chủ tối ưu API trực tiếp, cam kết không tụt và bảo hành chu đáo.
          </p>
        </div>
      </div>
    </aside>
  );
};
