import React from 'react';
import { Modal } from './Modal';
import { ShieldCheck, FileText, RotateCcw, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

export type PolicyType = 'terms' | 'privacy' | 'refund' | null;

interface PolicyModalProps {
  type: PolicyType;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const contentMap = {
    terms: {
      title: 'Điều Khoản Dịch Vụ',
      subtitle: 'Quy định sử dụng dịch vụ tại hệ thống KHÔI BUFF TIM',
      icon: FileText,
      body: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary-light" /> 1. Chấp Nhận Điều Khoản
            </h4>
            <p>
              Khi đăng ký tài khoản và sử dụng dịch vụ tại <b>KHÔI BUFF TIM</b>, quý khách mặc định đồng ý với toàn bộ các điều khoản và quy định được nêu tại đây.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary-light" /> 2. Quy Định Về Link & Tài Khoản Cần Buff
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>Tài khoản / Video / Bài viết cần buff phải ở chế độ <b>Công khai (Public)</b> trong suốt quá trình chạy.</li>
              <li>Tuyệt đối <b>không đổi tên người dùng (username)</b> hoặc xóa bài viết khi đơn hàng đang trong trạng thái xử lý.</li>
              <li>Hệ thống <b>nghiêm cấm</b> buff các nội dung vi phạm pháp luật, chống phá nhà nước, đồi trụy hoặc lừa đảo.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary-light" /> 3. Thời Gian Khởi Chạy & Tiến Độ
            </h4>
            <p>
              Đơn hàng sẽ được khởi chạy tự động sau khi được Admin phê duyệt. Tốc độ phân phối tương tác được điều tiết tự nhiên để đảm bảo an toàn tối đa cho kênh của quý khách.
            </p>
          </div>
        </div>
      ),
    },
    privacy: {
      title: 'Chính Sách Bảo Mật',
      subtitle: 'Cam kết bảo vệ dữ liệu và quyền riêng tư của khách hàng',
      icon: Lock,
      body: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 1. Cam Kết Không Yêu Cầu Mật Khẩu
            </h4>
            <p>
              <b>KHÔI BUFF TIM</b> cam kết <b>100% KHÔNG BAO GIỜ</b> yêu cầu mật khẩu nick mạng xã hội (TikTok, Facebook, Instagram...) của khách hàng. Mọi giao dịch chỉ yêu cầu link công khai.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 2. Bảo Mật Thông Tin Cá Nhân
            </h4>
            <p>
              Mọi thông tin như Email, Tên đăng nhập, Lịch sử nạp tiền và Danh sách đơn hàng được mã hóa an toàn trên cơ sở dữ liệu. Chúng tôi cam kết không tiết lộ hay bán thông tin cho bất kỳ bên thứ ba nào.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 3. An Toàn Thanh Toán VietQR
            </h4>
            <p>
              Giao dịch chuyển khoản qua mã QR SePay VietQR được xử lý theo tiêu chuẩn bảo mật ngân hàng, đối soát mã nội dung tự động và không lưu giữ thông tin thẻ tín dụng của quý khách.
            </p>
          </div>
        </div>
      ),
    },
    refund: {
      title: 'Chính Sách Hoàn Tiền',
      subtitle: 'Quy định bảo vệ quyền lợi và hoàn trả tiền cho khách hàng',
      icon: RotateCcw,
      body: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-pink-400" /> 1. Các Trường Hợp Được Hoàn Tiền 100%
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>Đơn hàng bị lỗi server hoặc không thể khởi chạy từ phía hệ thống.</li>
              <li>Link bài viết / nick bị lỗi, nick để chế độ riêng tư và đơn bị hủy bởi Admin.</li>
              <li>Hệ thống chạy không đủ số lượng cam kết sau thời gian bảo hành.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-pink-400" /> 2. Hình Thức Hoàn Tiền
            </h4>
            <p>
              Tiền hoàn sẽ được cộng tự động và trực tiếp <b>100%</b> vào <b>Số dư ví tài khoản</b> của quý khách trên website ngay khi đơn hàng được duyệt hoàn. Quý khách có thể sử dụng số dư để đặt gói dịch vụ khác bất kỳ lúc nào.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-pink-400" /> 3. Gửi Yêu Cầu Hỗ Trợ Hoàn Tiền
            </h4>
            <p>
              Nếu đơn hàng gặp vấn đề, quý khách chỉ cần vào mục <b>Hỗ Trợ (Ticket)</b>, gửi mã đơn hàng và lý do, đội ngũ quản trị viên sẽ kiểm tra và giải quyết trong thời gian sớm nhất.
            </p>
          </div>
        </div>
      ),
    },
  };

  const current = contentMap[type];

  return (
    <Modal isOpen={Boolean(type)} onClose={onClose} title={current.title} subtitle={current.subtitle} maxWidth="md">
      <div className="space-y-5">
        {current.body}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <Button variant="glow" size="sm" onClick={onClose}>
            Đã Hiểu & Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
