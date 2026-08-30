import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { formatVND } from '../../lib/formatters';
import { Button } from '../ui/Button';
import { VietQRModal } from '../ui/VietQRModal';
import { BrandLogo } from '../ui/BrandLogo';
import { gsap, useGSAP } from '../../lib/gsap';
import {
  Zap,
  ShoppingBag,
  Layers,
  FileText,
  Wallet,
  Headphones,
  Shield,
  User,
  LogOut,
  PlusCircle,
  CreditCard,
  ChevronDown,
  Home,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const balanceRef = useRef<HTMLSpanElement>(null);
  const prevBalanceRef = useRef<number>(user?.balance || 0);

  // GSAP pulse when balance changes
  useEffect(() => {
    if (balanceRef.current && user?.balance !== undefined && user.balance !== prevBalanceRef.current) {
      prevBalanceRef.current = user.balance;
      gsap.fromTo(
        balanceRef.current,
        { scale: 1.15, color: '#34d399' },
        { scale: 1, duration: 0.5, ease: 'back.out(2)' }
      );
    }
  }, [user?.balance]);

  const navLinks = [
    { name: 'Trang Chủ', path: '/', icon: Home },
    { name: 'Dịch Vụ', path: '/services', icon: Layers },
    { name: 'Đặt Đơn', path: '/order', icon: ShoppingBag },
    { name: 'Đơn Hàng', path: '/orders', icon: FileText },
    { name: 'Nạp Tiền', path: '/wallet', icon: Wallet },
    { name: 'Hỗ Trợ', path: '/support', icon: Headphones },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/85 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="shrink-0">
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {user ? (
              <>
                {/* Balance & Quick Deposit */}
                <div className="flex items-center gap-1.5 p-1 sm:p-1.5 pl-3 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-inner">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-slate-400 leading-none">Số Dư</span>
                    <span ref={balanceRef} className="font-mono font-black text-emerald-400 text-xs sm:text-sm inline-block transition-transform">
                      {formatVND(user.balance || 0)}
                    </span>
                  </div>
                  <Button
                    variant="glow"
                    size="sm"
                    className="h-8 px-2 sm:px-3 text-xs font-bold bg-gradient-to-r from-rose-600 to-pink-600 shadow-glow-rose"
                    onClick={() => setIsDepositOpen(true)}
                    leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                  >
                    <span className="hidden sm:inline">Nạp Tiền</span>
                    <span className="sm:hidden">Nạp</span>
                  </Button>
                </div>

                {/* Profile & Mobile Nav Menu Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
                  >
                    <img
                      src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                      alt="Avatar"
                      className="w-8 h-8 rounded-lg bg-slate-700 object-cover border border-rose-500/30"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isProfileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 p-2 rounded-2xl bg-surface/98 backdrop-blur-2xl border border-slate-700/80 shadow-2xl space-y-1 z-50 text-xs max-h-[85vh] overflow-y-auto"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      {/* User Info Header */}
                      <div className="px-3 py-2.5 border-b border-slate-800/80 bg-slate-900/50 rounded-xl mb-1">
                        <p className="font-black text-white text-sm truncate">{user.full_name || user.username}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                        <div className="mt-1.5 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Mã nạp:</span>
                          <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                            {user.deposit_code || 'SMM502059'}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Main Menu Section (Visible everywhere via Avatar) */}
                      <div className="lg:hidden py-1 border-b border-slate-800/80 space-y-0.5">
                        <span className="px-3 text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          Điều Hướng Nhanh
                        </span>
                        {navLinks.map((link) => {
                          const Icon = link.icon;
                          const isActive = location.pathname === link.path;
                          return (
                            <Link
                              key={link.path}
                              to={link.path}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors ${
                                isActive
                                  ? 'bg-rose-500/15 text-rose-300 font-bold border border-rose-500/30'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                              }`}
                            >
                              <Icon className="w-4 h-4 text-pink-400" />
                              <span>{link.name}</span>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Account & Orders Section */}
                      <div className="py-1 space-y-0.5">
                        <Link
                          to="/account"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium"
                        >
                          <User className="w-4 h-4 text-sky-400" />
                          <span>Tài Khoản & Cài Đặt</span>
                        </Link>

                        <Link
                          to="/orders"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium"
                        >
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span>Đơn Hàng Của Tôi</span>
                        </Link>

                        <Link
                          to="/wallet"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium"
                        >
                          <Wallet className="w-4 h-4 text-amber-400" />
                          <span>Ví & Nạp Tiền MBBank</span>
                        </Link>
                      </div>

                      {/* Admin Section */}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-300 hover:text-white hover:bg-purple-900/40 font-bold border border-purple-500/30"
                        >
                          <Shield className="w-4 h-4 text-purple-400" />
                          <span>Trang Quản Trị Admin</span>
                        </Link>
                      )}

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 font-semibold text-left border-t border-slate-800/80 mt-1"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Đăng Xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Đăng Nhập
                  </Button>
                </Link>
                <Link to="/auth?tab=register">
                  <Button variant="glow" size="sm" className="bg-gradient-to-r from-rose-600 to-pink-600">
                    Đăng Ký
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* VietQR Quick Deposit Modal */}
      <VietQRModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
    </>
  );
};
