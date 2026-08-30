import React, { useState, useEffect } from 'react';
import { ticketService } from '../services/ticketService';
import { useAuthStore } from '../stores/authStore';
import { Ticket, TicketMessage, TicketCategory } from '../types';
import { formatDateTime, getTicketStatusInfo } from '../lib/formatters';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import {
  Headphones,
  PlusCircle,
  Send,
  User,
  ShieldCheck,
  LifeBuoy,
} from 'lucide-react';

export const TicketsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { success, error } = useToast();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState('');

  // Create Ticket Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('order');
  const [orderId, setOrderId] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    if (!user) return;
    try {
      const data = await ticketService.getUserTickets(user.id);
      setTickets(data);
      if (data.length > 0 && !selectedTicket) {
        handleSelectTicket(data[0]);
      }
    } catch (err) {
      console.error(err);
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const ticket = await ticketService.createTicket({
        userId: user.id,
        subject,
        category,
        orderId: orderId.trim() || undefined,
        message: initialMessage,
      });

      success('Tạo yêu cầu hỗ trợ thành công!');
      setIsCreateOpen(false);
      setSubject('');
      setOrderId('');
      setInitialMessage('');
      loadTickets();
      handleSelectTicket(ticket);
    } catch (err: any) {
      error(err.message || 'Không thể tạo ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTicket || !replyText.trim()) return;

    setIsSendingReply(true);
    try {
      const msg = await ticketService.replyTicket({
        ticketId: selectedTicket.id,
        senderId: user.id,
        senderRole: 'user',
        message: replyText.trim(),
      });

      setMessages((prev) => [...prev, msg]);
      setReplyText('');
      success('Đã gửi tin nhắn hỗ trợ!');
    } catch (err: any) {
      error(err.message || 'Không thể gửi tin nhắn');
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Headphones className="w-7 h-7 text-primary-light" /> Trung Tâm Hỗ Trợ Khách Hàng (24/7)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Gửi thắc mắc hoặc báo lỗi đơn hàng để đội ngũ CSKH xử lý ngay lập tức.
          </p>
        </div>

        <Button
          variant="glow"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Gửi Yêu Cầu Hỗ Trợ
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Ticket List */}
        <div className="lg:col-span-4 p-4 rounded-3xl bg-surface/80 border border-slate-800 space-y-3 flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
            Yêu Cầu Của Bạn ({tickets.length})
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
            {tickets.map((t) => {
              const statusInfo = getTicketStatusInfo(t.status);
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTicket(t)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-left ${
                    isSelected
                      ? 'bg-primary/20 border-primary/50 shadow-glow-primary'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80'
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
                    Mã #{t.id.substring(0, 6)} {t.order_id && `• Đơn #${t.order_id.substring(0, 6)}`}
                  </p>
                </div>
              );
            })}

            {tickets.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                Bạn chưa có ticket hỗ trợ nào.
              </div>
            )}
          </div>
        </div>

        {/* Chat Feed */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-surface/90 border border-slate-800 flex flex-col justify-between space-y-4">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary-light">
                      #{selectedTicket.id.substring(0, 8)}
                    </span>
                    <h3 className="font-extrabold text-sm text-white">{selectedTicket.subject}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Danh mục: <b className="text-slate-200 uppercase">{selectedTicket.category}</b>
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-80 pr-2 py-2">
                {messages.map((msg) => {
                  const isUser = msg.sender_role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${
                        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                          isUser ? 'bg-primary text-white' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isUser ? <User className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                          isUser
                            ? 'bg-primary/20 text-white border border-primary/30'
                            : 'bg-slate-800 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400">
                          <span className="font-bold">{isUser ? 'Bạn' : 'Hỗ Trợ Viên KHÔI BUFF TIM'}</span>
                          <span>{formatDateTime(msg.created_at)}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleReplySubmit} className="pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập nội dung phản hồi..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                />
                <Button variant="glow" size="sm" type="submit" isLoading={isSendingReply} rightIcon={<Send className="w-3.5 h-3.5" />}>
                  Gửi
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-20 text-xs text-slate-500">
              Chọn một yêu cầu hỗ trợ từ danh sách hoặc tạo yêu cầu mới.
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Gửi Yêu Cầu Hỗ Trợ Mới"
        subtitle="Đội ngũ CSKH sẽ phản hồi trong vòng vài phút"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <Input
            label="Tiêu đề yêu cầu"
            placeholder="Ví dụ: Đơn hàng chạy chậm, chưa nhận được tiền nạp..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Danh mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
              >
                <option value="order">Vấn đề Đơn Hàng</option>
                <option value="deposit">Vấn đề Nạp Tiền</option>
                <option value="service">Hỏi về Dịch Vụ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <Input
              label="Mã đơn hàng liên quan (nếu có)"
              placeholder="Ví dụ: #7a8b9c"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Nội dung chi tiết
            </label>
            <textarea
              rows={4}
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Mô tả cụ thể vấn đề bạn đang gặp phải..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            <Button variant="glow" type="submit" isLoading={isSubmitting}>
              Gửi Yêu Cầu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
