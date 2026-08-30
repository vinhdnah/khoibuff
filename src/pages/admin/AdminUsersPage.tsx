import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../stores/authStore';
import { Profile } from '../../types';
import { formatVND, formatDateTime } from '../../lib/formatters';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import {
  Users,
  Search,
  DollarSign,
  Shield,
  UserX,
  UserCheck,
  PlusCircle,
  MinusCircle,
  RefreshCw,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin } = useAuthStore();
  const { success, error } = useToast();

  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Balance adjust modal
  const [adjustTargetUser, setAdjustTargetUser] = useState<Profile | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(100000);
  const [adjustAction, setAdjustAction] = useState<'add' | 'subtract'>('add');
  const [adjustReason, setAdjustReason] = useState('Nạp tiền tay theo thỏa thuận');
  const [isAdjusting, setIsAdjusting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin || !adjustTargetUser) return;

    const finalAmount = adjustAction === 'add' ? adjustAmount : -adjustAmount;

    setIsAdjusting(true);
    try {
      const res = await adminService.adjustBalance(
        currentAdmin.id,
        adjustTargetUser.id,
        finalAmount,
        'adjustment',
        adjustReason
      );

      success(
        'Điều chỉnh số dư thành công!',
        `Số dư mới của ${adjustTargetUser.username}: ${formatVND(res.balanceAfter)}`
      );
      setAdjustTargetUser(null);
      loadUsers();
    } catch (err: any) {
      error(err.message || 'Không thể điều chỉnh số dư');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleToggleUserStatus = async (user: Profile) => {
    if (!currentAdmin) return;
    const nextStatus = user.status === 'active' ? 'banned' : 'active';
    try {
      await adminService.updateUserStatus(user.id, nextStatus, currentAdmin.id);
      success(`Đã ${nextStatus === 'banned' ? 'khóa' : 'mở khóa'} tài khoản ${user.username}`);
      loadUsers();
    } catch (err: any) {
      error(err.message);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      return (
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [users, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" /> Quản Lý Khách Hàng & Số Dư
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Xem danh sách thành viên, khóa/mở tài khoản và can thiệp cộng/trừ số dư thủ công.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadUsers} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Làm Mới
        </Button>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-surface/80 border border-slate-800 flex items-center justify-between">
        <div className="w-full md:w-96">
          <Input
            type="text"
            placeholder="Tìm theo email, họ tên, username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <span className="text-xs text-slate-400 hidden sm:block">
          Tổng cộng: <b>{filteredUsers.length}</b> thành viên
        </span>
      </div>

      {/* Users Table */}
      <div className="p-6 rounded-2xl bg-surface/80 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-3">Thành viên</th>
              <th className="py-3.5 px-3">Email</th>
              <th className="py-3.5 px-3">Số dư</th>
              <th className="py-3.5 px-3">Vai trò</th>
              <th className="py-3.5 px-3">Trạng thái</th>
              <th className="py-3.5 px-3">Ngày tham gia</th>
              <th className="py-3.5 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-3 flex items-center gap-3">
                  <img
                    src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                    alt="Avatar"
                    className="w-8 h-8 rounded-lg bg-slate-700 object-cover"
                  />
                  <div>
                    <p className="font-bold text-white text-xs">{u.full_name || u.username}</p>
                    <p className="text-[10px] text-slate-400">@{u.username}</p>
                  </div>
                </td>

                <td className="py-4 px-3 text-slate-300 font-medium">{u.email}</td>

                <td className="py-4 px-3 font-extrabold text-emerald-400 text-sm whitespace-nowrap">
                  {formatVND(u.balance)}
                </td>

                <td className="py-4 px-3 whitespace-nowrap">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      u.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-primary/20 text-primary-light'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>

                <td className="py-4 px-3 whitespace-nowrap">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {u.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                  </span>
                </td>

                <td className="py-4 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                  {formatDateTime(u.created_at)}
                </td>

                <td className="py-4 px-3 text-right whitespace-nowrap space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAdjustTargetUser(u);
                      setAdjustAmount(100000);
                      setAdjustAction('add');
                    }}
                    leftIcon={<DollarSign className="w-3.5 h-3.5 text-emerald-400" />}
                  >
                    Chỉnh Số Dư
                  </Button>

                  {u.role !== 'admin' && (
                    <Button
                      variant={u.status === 'active' ? 'danger' : 'success'}
                      size="sm"
                      onClick={() => handleToggleUserStatus(u)}
                    >
                      {u.status === 'active' ? 'Khóa' : 'Mở'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Adjust Balance Modal */}
      <Modal
        isOpen={Boolean(adjustTargetUser)}
        onClose={() => setAdjustTargetUser(null)}
        title="Điều Chỉnh Số Dư Thủ Công"
        subtitle={`Người nhận: ${adjustTargetUser?.full_name || adjustTargetUser?.username} (${adjustTargetUser?.email})`}
      >
        {adjustTargetUser && (
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-900 flex justify-between text-xs">
              <span className="text-slate-400">Số dư hiện tại:</span>
              <span className="font-extrabold text-emerald-400">{formatVND(adjustTargetUser.balance)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAdjustAction('add')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  adjustAction === 'add' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" /> Cộng Tiền
              </button>
              <button
                type="button"
                onClick={() => setAdjustAction('subtract')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  adjustAction === 'subtract' ? 'bg-rose-600 text-white' : 'text-slate-400'
                }`}
              >
                <MinusCircle className="w-3.5 h-3.5" /> Trừ Tiền
              </button>
            </div>

            <Input
              label="Số tiền điều chỉnh (VNĐ)"
              type="number"
              min={1000}
              step={10000}
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(Number(e.target.value))}
              required
            />

            <Input
              label="Lý do điều chỉnh (Bắt buộc để lưu Audit Log)"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="Ví dụ: Khách thanh toán ngoài, hoàn cọc..."
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={() => setAdjustTargetUser(null)}>
                Hủy bỏ
              </Button>
              <Button variant="glow" type="submit" isLoading={isAdjusting}>
                Xác Nhận Thay Đổi
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
