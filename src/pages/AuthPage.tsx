import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Sparkles, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuthStore();
  const { success, error } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const redirectTarget = searchParams.get('redirect');

    try {
      if (mode === 'login') {
        const profile = await authService.login(identifier, password);
        setUser(profile);
        success('Đăng nhập thành công!', `Chào mừng trở lại, ${profile.full_name || profile.username}!`);
        navigate(redirectTarget || (profile.role === 'admin' ? '/admin' : '/order'));
      } else {
        const profile = await authService.register({
          email: identifier,
          username: username || identifier.split('@')[0],
          fullName: fullName || username || identifier.split('@')[0],
          password,
        });
        setUser(profile);
        success('Đăng ký thành công!', 'Tài khoản của bạn đã sẵn sàng sử dụng.');
        navigate(redirectTarget || '/order');
      }
    } catch (err: any) {
      error(err.message || 'Thao tác thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10 flex flex-col items-center">
        <Link to="/" className="inline-block hover:scale-105 transition-transform">
          <BrandLogo size="lg" />
        </Link>
        <h2 className="text-xl font-bold text-slate-100">
          {mode === 'login' ? 'Đăng nhập vào tài khoản của bạn' : 'Tạo tài khoản mới'}
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="p-8 rounded-3xl bg-surface/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`py-2 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đăng Ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <Input
                  label="Họ và tên"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User className="w-4 h-4 text-slate-400" />}
                  required
                />
                <Input
                  label="Tên đăng nhập (Username)"
                  placeholder="nguyenvana"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  leftIcon={<User className="w-4 h-4 text-slate-400" />}
                  required
                />
              </>
            )}

            <Input
              label={mode === 'login' ? 'Tên đăng nhập hoặc Email' : 'Địa chỉ Email'}
              type={mode === 'login' ? 'text' : 'email'}
              placeholder={mode === 'login' ? 'Nhập username hoặc email...' : 'example@domain.com'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            <Button
              variant="glow"
              size="lg"
              className="w-full py-3.5 mt-2"
              type="submit"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {mode === 'login' ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
