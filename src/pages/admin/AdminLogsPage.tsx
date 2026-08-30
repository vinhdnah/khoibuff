import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import { AdminLog } from '../../types';
import { formatDateTime } from '../../lib/formatters';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FileText, Search, RefreshCw, Shield } from 'lucide-react';

export const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAdminLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.resource_id && l.resource_id.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
  }, [logs, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" /> Nhật Ký Audit Log Hệ Thống
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Lưu lại toàn bộ lịch sử can thiệp của Quản trị viên (Cộng/trừ số dư, hoàn tiền, đổi giá, khóa tài khoản).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadLogs} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Làm Mới
        </Button>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-surface/80 border border-slate-800 flex items-center justify-between">
        <div className="w-full md:w-96">
          <Input
            type="text"
            placeholder="Tìm theo hành động, tài nguyên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <span className="text-xs text-slate-400">
          Tổng cộng: <b>{filteredLogs.length}</b> bản ghi
        </span>
      </div>

      {/* Logs Table */}
      <div className="p-6 rounded-2xl bg-surface/80 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-3">Hành động</th>
              <th className="py-3.5 px-3">Tài nguyên</th>
              <th className="py-3.5 px-3">Mã đối tượng (ID)</th>
              <th className="py-3.5 px-3">Dữ liệu thay đổi</th>
              <th className="py-3.5 px-3">IP Admin</th>
              <th className="py-3.5 px-3">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-3 font-mono font-bold text-purple-300">
                  {log.action}
                </td>
                <td className="py-4 px-3 uppercase text-[10px] text-slate-400 font-bold">
                  {log.resource}
                </td>
                <td className="py-4 px-3 font-mono text-[11px] text-slate-300">
                  {log.resource_id || '--'}
                </td>
                <td className="py-4 px-3 max-w-md">
                  <div className="font-mono text-[11px] bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-slate-300 overflow-x-auto">
                    {JSON.stringify(log.new_data || log.old_data || {})}
                  </div>
                </td>
                <td className="py-4 px-3 font-mono text-slate-400">
                  {log.ip_address || '127.0.0.1'}
                </td>
                <td className="py-4 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                  {formatDateTime(log.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
