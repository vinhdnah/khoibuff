import React, { useState, useEffect } from 'react';
import { ticketService } from '../../services/ticketService';
import { useAuthStore } from '../../stores/authStore';
import { Ticket, TicketMessage, TicketStatus } from '../../types';
import { formatDateTime, getTicketStatusInfo, getTicketPriorityInfo } from '../../lib/formatters';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import {
  Headphones,
  MessageSquare,
  Send,
  CheckCircle,
  User,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const AdminTicketsPage: React.FC = () => {
  const { user: currentAdmin } = useAuthStore();
  const { success, error } = useToast();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const data = await ticketService.getAllTickets();
      setTickets(data);
      if (data.length > 0 && !selectedTicket) {
        handleSelectTicket(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    try {
      const msgs = await ticketService.getTicketMessages(ticket.id);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin || !selectedTicket || !replyText.trim()) return;

    setIsSending(true);
    try {
      const msg = await ticketService.replyTicket({
        ticketId: selectedTicket.id,
        senderId: currentAdmin.id,
        senderRole: 'admin',
        message: replyText.trim(),
        newStatus: 'answered',
      });

      setMessages((prev) => [...prev, msg]);
      setReplyText('');
      success('Đã gửi phản hồi tới khách hàng!');
      loadTickets();
    } catch (err: any) {
      error(err.message || 'Không thể gửi phản hồi');
    } finally {
      setIsSending(false);
    }
  };

  const handleChangeStatus = async (status: TicketStatus) => {
    if (!selectedTicket) return;
    try {
      await ticketService.updateTicketStatus(selectedTicket.id, status);
      selectedTicket.status = status;
      success(`Đã cập nhật trạng thái ticket sang ${status}`);
      loadTickets();
    } catch (err: any) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Headphones className="w-6 h-6 text-purple-400" /> Trung Tâm Xử Lý Ticket Hỗ Trợ
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Xem và trả lời các thắc mắc, khiếu nại của khách hàng.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadTickets} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Làm Mới
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Ticket List (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-surface/90 border border-slate-800 space-y-3 flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
            Danh Sách Tickets ({tickets.length})
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[550px] pr-1">
            {tickets.map((t) => {
              const statusInfo = getTicketStatusInfo(t.status);
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTicket(t)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border text-left ${
                    isSelected
                      ? 'bg-purple-600/20 border-purple-500/50 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDateTime(t.updated_at)}</span>
                  </div>

                  <h4 className="font-bold text-xs text-white line-clamp-1">{t.subject}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 uppercase">
                    User: {t.user_id.substring(0, 8)}... {t.order_id && `• Đơn #${t.order_id.substring(0, 6)}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversation Desk (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-surface/90 border border-slate-800 flex flex-col justify-between space-y-4">
          {selectedTicket ? (
            <>
              {/* Header Info with Quick Status Buttons */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-400">
                      #{selectedTicket.id.substring(0, 8)}
                    </span>
                    <h3 className="font-extrabold text-sm text-white">{selectedTicket.subject}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Danh mục: <b className="text-slate-200 uppercase">{selectedTicket.category}</b> • Ưu tiên:{' '}
                    <b className="text-slate-200 uppercase">{selectedTicket.priority}</b>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleChangeStatus('answered')}
                    className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30"
                  >
                    Đã trả lời
                  </button>
                  <button
                    onClick={() => handleChangeStatus('closed')}
                    className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-[10px] font-bold border border-slate-700"
                  >
                    Đóng Ticket
                  </button>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-96 pr-2 py-2">
                {messages.map((msg) => {
                  const isAdmin = msg.sender_role === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${
                        isAdmin ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isAdmin ? 'bg-purple-600 text-white' : 'bg-primary text-white'
                        }`}
                      >
                        {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                          isAdmin
                            ? 'bg-purple-950/40 text-purple-100 border border-purple-800/40'
                            : 'bg-slate-800/80 text-slate-100 border border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400">
                          <span className="font-bold">{isAdmin ? 'Admin (Bạn)' : 'Khách Hàng'}</span>
                          <span>{formatDateTime(msg.created_at)}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Admin Reply Box */}
              <form onSubmit={handleReplySubmit} className="pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập câu trả lời hỗ trợ khách hàng..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <Button variant="glow" size="sm" type="submit" isLoading={isSending} rightIcon={<Send className="w-3.5 h-3.5" />}>
                  Gửi Phản Hồi
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-20 text-xs text-slate-500">
              Chọn ticket cần xử lý từ danh sách bên trái.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
