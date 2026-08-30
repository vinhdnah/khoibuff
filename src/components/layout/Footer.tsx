import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Clock, Headphones } from 'lucide-react';
import { PolicyModal, PolicyType } from '../ui/PolicyModal';
import { BrandLogo } from '../ui/BrandLogo';

export const Footer: React.FC = () => {
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  return (
    <>
      <footer className="bg-surface/90 border-t border-slate-800 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Col */}
            <div className="space-y-4 md:col-span-1">
              <Link to="/" className="inline-block">
                <BrandLogo size="md" />
              </Link>
              <p className="text-slate-400 text-xs leading-relaxed">
                KHÔI BUFF TIM — Hệ thống buff tim, like, follow, view mạng xã hội tự động hàng đầu. Nhanh chóng, ổn định và bảo mật tuyệt đối.
              </p>
              <div className="flex items-center gap-3 text-slate-400">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% An Toàn & Bảo Mật
                </span>
              </div>
            </div>

            {/* Dịch vụ phổ biến */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                Dịch Vụ Nổi Bật
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/order?platform=tiktok" className="hover:text-primary-light transition-colors">
                    Tăng Tim & Follow TikTok
                  </Link>
                </li>
                <li>
                  <Link to="/order?platform=facebook" className="hover:text-primary-light transition-colors">
                    Tăng Like & Follow Facebook
                  </Link>
                </li>
                <li>
                  <Link to="/order?platform=instagram" className="hover:text-primary-light transition-colors">
                    Tăng Follow & Like Instagram
                  </Link>
                </li>
                <li>
                  <Link to="/order?platform=youtube" className="hover:text-primary-light transition-colors">
                    Tăng Sub & View YouTube
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-primary-light transition-colors font-semibold text-primary-light">
                    Xem tất cả dịch vụ →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Tiện ích & Hỗ trợ */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                Khách Hàng
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/order" className="hover:text-primary-light transition-colors">
                    Đặt Đơn Dịch Vụ
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="hover:text-primary-light transition-colors">
                    Theo Dõi Tiến Độ Đơn
                  </Link>
                </li>
                <li>
                  <Link to="/wallet" className="hover:text-primary-light transition-colors">
                    Nạp Tiền VietQR Tự Động
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="hover:text-primary-light transition-colors">
                    Trung Tâm Hỗ Trợ 24/7
                  </Link>
                </li>
              </ul>
            </div>

            {/* Thanh toán & Cam kết */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                Thanh Toán & Hỗ Trợ
              </h4>
              <p className="text-slate-400 leading-relaxed text-xs">
                Hỗ trợ nạp tiền tự động qua mã VietQR với công nghệ đối soát tức thì 24/7.
              </p>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-primary-light" />
                  <span>Hoạt động: <b>24/7</b></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSKH: <b>24/7</b></span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
            <p>© 2026 KHÔI BUFF TIM. All rights reserved. Hệ thống tăng tương tác mạng xã hội.</p>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => setActivePolicy('terms')}
                className="hover:text-primary-light transition-colors underline-offset-4 hover:underline"
              >
                Điều khoản dịch vụ
              </button>
              <button
                type="button"
                onClick={() => setActivePolicy('privacy')}
                className="hover:text-primary-light transition-colors underline-offset-4 hover:underline"
              >
                Chính sách bảo mật
              </button>
              <button
                type="button"
                onClick={() => setActivePolicy('refund')}
                className="hover:text-primary-light transition-colors underline-offset-4 hover:underline"
              >
                Chính sách hoàn tiền
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Policy Modal */}
      <PolicyModal type={activePolicy} onClose={() => setActivePolicy(null)} />
    </>
  );
};
