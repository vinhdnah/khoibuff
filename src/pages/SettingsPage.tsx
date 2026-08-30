import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { User, Shield, Mail, Phone, Lock, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const updated = await authService.updateProfile(user.id, {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      });
      setUser(updated);
      success('Cập nhật thông tin tài khoản thành công!');
    } catch (err: any) {
      error(err.message || 'Không thể cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-primary-light" /> Cài Đặt Tài Khoản
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Quản lý thông tin cá nhân, liên hệ và các tùy chọn bảo mật.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface/90 border border-slate-800 space-y-6">
        {/* User Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
            alt="Avatar"
            className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-primary/40 object-cover"
          />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">{user?.full_name || user?.username}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary-light uppercase">
              Vai trò: {user?.role}
            </span>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input
            label="Họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Địa chỉ Email (Không thể thay đổi)"
            value={user?.email || ''}
            disabled
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Số điện thoại"
            placeholder="0988xxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
          />

          <div className="pt-2">
            <Button variant="glow" type="submit" isLoading={isLoading} leftIcon={<Save className="w-4 h-4" />}>
              Lưu Thay Đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
