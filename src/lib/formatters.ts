import { OrderStatus, TransactionType, DepositStatus, TicketStatus, TicketPriority } from '../types';

/**
 * Định dạng tiền tệ VNĐ (ví dụ: 50.000 đ)
 */
export function formatVND(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '0 đ';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(amount)).replace('₫', 'đ');
}

/**
 * Định dạng số lượng thu gọn (ví dụ: 1.5k, 10k, 1M)
 */
export function formatCompactNumber(number: number | null | undefined): string {
  if (number === null || number === undefined || isNaN(Number(number))) {
    return '0';
  }
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(number));
}

/**
 * Định dạng số nguyên có dấu chấm phân cách hàng nghìn (ví dụ: 10.000)
 */
export function formatNumber(number: number | null | undefined): string {
  if (number === null || number === undefined || isNaN(Number(number))) {
    return '0';
  }
  return new Intl.NumberFormat('vi-VN').format(Number(number));
}

/**
 * Định dạng ngày giờ chuẩn Việt Nam (ví dụ: 14:30 28/08/2026)
 */
export function formatDateTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '--';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Định dạng ngày ngắn (ví dụ: 28/08/2026)
 */
export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '--';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Trả về thông tin hiển thị trạng thái đơn hàng (Label, Color, Badge style)
 */
export function getOrderStatusInfo(status: OrderStatus): { label: string; color: string; bg: string; border: string } {
  switch (status) {
    case 'pending':
      return { label: 'Chờ xử lý', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
    case 'processing':
      return { label: 'Đang chạy', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
    case 'completed':
      return { label: 'Hoàn thành', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' };
    case 'partial':
      return { label: 'Chạy một phần', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' };
    case 'canceled':
      return { label: 'Đã hủy', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' };
    case 'refunded':
      return { label: 'Đã hoàn tiền', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' };
    case 'failed':
      return { label: 'Thất bại', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' };
    default:
      return { label: status, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' };
  }
}

/**
 * Trả về thông tin hiển thị loại giao dịch ví
 */
export function getTransactionTypeInfo(type: TransactionType): { label: string; color: string; bg: string; isPositive: boolean } {
  switch (type) {
    case 'deposit':
      return { label: 'Nạp tiền VietQR', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/20', isPositive: true };
    case 'order':
      return { label: 'Thanh toán đơn hàng', color: 'text-rose-400', bg: 'bg-rose-500/10 border border-rose-500/20', isPositive: false };
    case 'refund':
      return { label: 'Hoàn tiền đơn hàng', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border border-cyan-500/20', isPositive: true };
    case 'bonus':
      return { label: 'Thưởng / Khuyến mãi', color: 'text-amber-400', bg: 'bg-amber-500/10 border border-amber-500/20', isPositive: true };
    case 'adjustment':
      return { label: 'Điều chỉnh số dư', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border border-indigo-500/20', isPositive: true };
    default:
      return { label: type, color: 'text-slate-300', bg: 'bg-slate-800', isPositive: true };
  }
}

/**
 * Trạng thái nạp tiền
 */
export function getDepositStatusInfo(status: DepositStatus): { label: string; color: string; bg: string } {
  switch (status) {
    case 'pending':
      return { label: 'Đang chờ thanh toán', color: 'text-amber-400', bg: 'bg-amber-400/10' };
    case 'completed':
      return { label: 'Thành công', color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
    case 'expired':
      return { label: 'Hết hạn', color: 'text-slate-400', bg: 'bg-slate-400/10' };
    case 'failed':
      return { label: 'Thất bại', color: 'text-rose-400', bg: 'bg-rose-400/10' };
    default:
      return { label: status, color: 'text-slate-400', bg: 'bg-slate-400/10' };
  }
}

/**
 * Trạng thái ticket hỗ trợ
 */
export function getTicketStatusInfo(status: TicketStatus): { label: string; color: string; bg: string } {
  switch (status) {
    case 'open':
      return { label: 'Đang mở', color: 'text-blue-400', bg: 'bg-blue-400/10' };
    case 'pending':
      return { label: 'Đang xử lý', color: 'text-amber-400', bg: 'bg-amber-400/10' };
    case 'answered':
      return { label: 'Đã phản hồi', color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
    case 'closed':
      return { label: 'Đã đóng', color: 'text-slate-400', bg: 'bg-slate-400/10' };
    default:
      return { label: status, color: 'text-slate-400', bg: 'bg-slate-400/10' };
  }
}

export function getTicketPriorityInfo(priority: TicketPriority): { label: string; color: string } {
  switch (priority) {
    case 'low':
      return { label: 'Thấp', color: 'text-slate-400' };
    case 'normal':
      return { label: 'Bình thường', color: 'text-blue-400' };
    case 'high':
      return { label: 'Cao', color: 'text-amber-400' };
    case 'urgent':
      return { label: 'Khẩn cấp', color: 'text-rose-500 font-semibold' };
    default:
      return { label: priority, color: 'text-slate-400' };
  }
}
