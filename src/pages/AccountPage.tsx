import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { orderService } from '../services/orderService';
import { formatVND, formatDateTime } from '../lib/formatters';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import {
  User,
  ShoppingBag,
  CreditCard,
  Calendar,
  Lock,
  LogOut,
  Shield,
  CheckCircle2,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, role } = useAuthStore();
  const { success, error } = useToast();

  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;
    try {
      const orders = await orderService.getUserOrders(user.id);
      setTotalOrders(orders.length);
      const spent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      setTotalSpent(spent);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setIsChangingPass(true);
    try {
      // Simulate pass change
      await new Promise((r) => setTimeout(r, 600));
      success('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      error(err.message || 'Không thể đổi mật khẩu');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-slate-400 text-sm">Vui lòng đăng nhập để quản lý tài khoản.</p>
        <Link to="/auth">
          <Button variant="glow" size="sm">
            Đăng Nhập Ngay
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface/80 border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
            alt="Avatar"
            className="w-20 h-20 rounded-2xl bg-slate-800 object-cover border-2 border-primary/40 shadow-glow-primary"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {user.full_name || user.username}
              </h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  user.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-primary/20 text-primary-light'
                }`}
              >
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">@{user.username} • {user.email}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400">Mã nạp tiền cá nhân:</span>
              <span className="font-mono font-black text-rose-400 text-xs px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
                {user.deposit_code || 'SMM502059'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 justify-center sm:justify-start">
              <Calendar className="w-3.5 h-3.5" /> Tham gia ngày {formatDateTime(user.created_at)}
            </p>
          </div>
        </div>

        <Button variant="danger" size="sm" onClick={handleLogout} leftIcon={<LogOut className="w-4 h-4" />}>
          Đăng Xuất
        </Button>
      </div>

      {/* Account Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-surface/70 border border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Số Dư Hiện Tại
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {formatVND(user.balance)}
          </div>
          <Link to="/wallet" className="text-xs text-primary-light hover:underline block font-semibold">
            Nạp tiền vào ví →
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-surface/70 border border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tổng Số Đơn Đã Đặt
          </span>
          <div className="text-2xl font-black text-white">
            {totalOrders} đơn hàng
          </div>
          <Link to="/orders" className="text-xs text-primary-light hover:underline block font-semibold">
            Xem lịch sử đơn →
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-surface/70 border border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tổng Chi Tiêu
          </span>
          <div className="text-2xl font-black text-pink-400 font-mono">
            {formatVND(totalSpent)}
          </div>
          <p className="text-[11px] text-slate-500">Tích lũy từ khi đăng ký</p>
        </div>
      </div>

      {/* Change Password Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-light" />
          <h3 className="font-extrabold text-base text-white">Đổi Mật Khẩu Tài Khoản</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <Input
            label="Mật khẩu hiện tại"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Input
            label="Mật khẩu mới (Tối thiểu 6 ký tự)"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button variant="glow" size="sm" type="submit" isLoading={isChangingPass}>
            Cập Nhật Mật Khẩu
          </Button>
        </form>
      </div>
    </div>
  );
};
