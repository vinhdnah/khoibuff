import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { PLATFORMS_CONFIG } from '../config/platforms';
import { COMBOS_CONFIG } from '../config/services';
import { PlatformIcon } from '../components/ui/PlatformIcon';
import { formatVND } from '../lib/formatters';
import { Button } from '../components/ui/Button';
import { gsap, useGSAP } from '../lib/gsap';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Flame,
  ArrowRight,
  Sparkles,
  Lock,
  CreditCard,
  ChevronRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Floating Glowing Background Orbs
    gsap.to('.orb-float-1', {
      x: 30,
      y: -35,
      scale: 1.1,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    gsap.to('.orb-float-2', {
      x: -35,
      y: 30,
      scale: 0.95,
      duration: 7,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // 2. Main Choreography (Smooth Entrance on Mount with clearProps to guarantee 100% visibility)
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
    });

    tl.fromTo(
      '.hero-badge',
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' }
    )
      .fromTo(
        '.hero-title',
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, clearProps: 'all' },
        '-=0.3'
      )
      .fromTo(
        '.hero-desc',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' },
        '-=0.3'
      )
      .fromTo(
        '.hero-cta',
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, stagger: 0.1, duration: 0.4, clearProps: 'all' },
        '-=0.2'
      )
      .fromTo(
        '.trust-badge-item',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.06, duration: 0.4, clearProps: 'all' },
        '-=0.2'
      )
      .fromTo(
        '.platform-card',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.03, duration: 0.4, clearProps: 'all' },
        '-=0.2'
      )
      .fromTo(
        '.combo-card',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.06, duration: 0.4, clearProps: 'all' },
        '-=0.2'
      );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="space-y-20 pb-16 overflow-hidden relative">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -z-10 orb-float-1" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none -z-10 orb-float-2" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary-light text-xs font-bold mb-6 shadow-glow-primary/30">
          <Sparkles className="w-4 h-4 text-primary-light" />
          <span>Hệ Thống Tăng Tương Tác Mạng Xã Hội Tự Động 24/7</span>
        </div>

        <h1 className="hero-title text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          TĂNG TƯƠNG TÁC MẠNG XÃ HỘI <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-light via-violet-400 to-pink-500">
            NHANH • ỔN ĐỊNH • DỄ SỬ DỤNG
          </span>
        </h1>

        <p className="hero-desc mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Nền tảng mua và quản lý dịch vụ TikTok, Facebook, Instagram, YouTube trong một giao diện đơn giản.
          Bắt đầu chỉ từ vài nghìn đồng với tốc độ xử lý tức thì.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link to="/order" className="w-full sm:w-auto hero-cta">
            <Button
              variant="glow"
              size="lg"
              className="w-full text-sm font-extrabold px-8 py-3.5 shadow-glow-primary hover:scale-105 transition-transform"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Đặt Đơn Ngay
            </Button>
          </Link>

          <Link to="/services" className="w-full sm:w-auto hero-cta">
            <Button
              variant="outline"
              size="lg"
              className="w-full text-sm font-bold px-8 py-3.5 border-slate-700 hover:bg-slate-800 hover:scale-105 transition-transform"
            >
              Xem Bảng Giá Dịch Vụ
            </Button>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="trust-badge-item p-3.5 rounded-2xl bg-surface/80 border border-slate-800/80 flex items-center gap-3 hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Xử Lý Tự Động</p>
              <p className="text-[11px] text-slate-400">Khởi chạy mượt mà 24/7</p>
            </div>
          </div>

          <div className="trust-badge-item p-3.5 rounded-2xl bg-surface/80 border border-slate-800/80 flex items-center gap-3 hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Bảo Mật Kênh</p>
              <p className="text-[11px] text-slate-400">Chỉ cần dán link công khai</p>
            </div>
          </div>

          <div className="trust-badge-item p-3.5 rounded-2xl bg-surface/80 border border-slate-800/80 flex items-center gap-3 hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Nạp Tiền VietQR</p>
              <p className="text-[11px] text-slate-400">Tự động cộng số dư</p>
            </div>
          </div>

          <div className="trust-badge-item p-3.5 rounded-2xl bg-surface/80 border border-slate-800/80 flex items-center gap-3 hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Bảo Hành Uy Tín</p>
              <p className="text-[11px] text-slate-400">Cam kết đủ số lượng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Platforms Grid */}
      <section className="platforms-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Nền Tảng Hỗ Trợ Đầy Đủ
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Chọn nền tảng bạn cần tăng tương tác để xem chi tiết gói dịch vụ
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {PLATFORMS_CONFIG.map((platform) => (
            <Link
              key={platform.slug}
              to={`/order?platform=${platform.slug}`}
              className="platform-card p-4 rounded-2xl bg-surface/70 border border-slate-800/80 hover:border-primary/50 hover:bg-surface hover:-translate-y-1 transition-all flex flex-col items-center text-center group shadow-md"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 shadow-sm"
                style={{ backgroundColor: `${platform.color}15`, color: platform.color }}
              >
                <PlatformIcon slug={platform.slug} className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xs text-white group-hover:text-primary-light transition-colors">
                {platform.name}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                {platform.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Combo Packages Showcase */}
      <section className="combos-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-400 mb-1">
              <Flame className="w-4 h-4 text-pink-500" /> GÓI COMBO BÁN CHẠY NHẤT
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Gói Combo TikTok Trọn Gói Tiết Kiệm
            </h2>
          </div>
          <Link to="/services" className="text-xs font-bold text-primary-light hover:underline flex items-center gap-1">
            Xem tất cả combo <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMBOS_CONFIG.map((combo) => (
            <div
              key={combo.id}
              className={`combo-card p-6 rounded-3xl bg-surface/80 border transition-all flex flex-col justify-between relative hover:-translate-y-1.5 ${
                combo.badge
                  ? 'border-primary shadow-glow-primary'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {combo.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-pink-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                  {combo.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-lg text-white">{combo.name}</h3>
                  <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">
                    {formatVND(combo.price)}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                  {combo.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary-light shrink-0" />
                      <span>
                        <b className="text-white">{item.qty.toLocaleString('vi-VN')}</b> {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <Link to={`/order?combo=${combo.id}`}>
                  <Button
                    variant={combo.badge ? 'glow' : 'outline'}
                    size="sm"
                    className="w-full font-bold"
                  >
                    Chọn Gói Này
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3-Step Ordering Guide */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Quy Trình Đặt Đơn Cực Kỳ Đơn Giản
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Chỉ mất chưa đầy 30 giây để bắt đầu một đơn hàng tăng tương tác
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-surface/70 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary-light font-black text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-sm text-white">Chọn Nền Tảng & Gói Dịch Vụ</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chọn mạng xã hội bạn muốn tăng tương tác (TikTok, Facebook, Instagram...) và gói số lượng phù hợp.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface/70 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/20 text-violet-300 font-black text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-sm text-white">Nhập Link Bài Viết / Profile</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dán link video, bài viết hoặc username cần tăng. Hệ thống tự động kiểm tra định dạng chính xác.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface/70 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 font-black text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-sm text-white">Xác Nhận & Theo Dõi Tiến Độ</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Xác nhận đơn và theo dõi tiến độ chạy trực tiếp trên trang cá nhân theo thời gian thực.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Câu Hỏi Thường Gặp (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Giải đáp những thắc mắc phổ biến của khách hàng khi sử dụng dịch vụ
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-surface/70 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-sm text-white">
              Tôi có cần cung cấp mật khẩu mạng xã hội không?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              <b>Tuyệt đối không!</b> Chúng tôi không bao giờ yêu cầu mật khẩu Facebook, TikTok, Instagram hay bất kỳ tài khoản nào của bạn. Bạn chỉ cần cung cấp link công khai bài viết hoặc profile cần tăng.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface/70 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-sm text-white">
              Bao lâu sau khi đặt đơn thì tương tác bắt đầu tăng?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Sau khi đơn được duyệt, hệ thống sẽ tự động khởi chạy và phân phối tương tác tự nhiên, an toàn. Bạn có thể theo dõi tiến độ chi tiết ở mục <b>Đơn Hàng</b>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface/70 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-sm text-white">
              Nạp tiền qua VietQR có tự động không?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Hệ thống tích hợp cổng thanh toán VietQR MBBank xử lý tự động 24/7. Số dư ví sẽ được cộng ngay khi ngân hàng ghi nhận chuyển khoản đúng cú pháp memo.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
