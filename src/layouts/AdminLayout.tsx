import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { LocalStore } from '../lib/localStore';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

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
              <Link to="/login?redirect=/admin">
                <Button variant="glow" className="w-full">
                  Đăng Nhập Tài Khoản Admin
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Quay Lại Dashboard
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
      <div className="bg-purple-950/60 border-b border-purple-800/40 px-4 py-1.5 text-center text-xs font-semibold text-purple-200 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
        Bạn đang trong chế độ Quản Trị Hệ Thống (Admin Portal)
      </div>
      <Navbar />
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};
