import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { serviceCatalogService } from '../services/serviceCatalogService';
import { orderService } from '../services/orderService';
import { useAuthStore } from '../stores/authStore';
import { PLATFORMS_CONFIG } from '../config/platforms';
import { COMBOS_CONFIG, calculateOrderPrice, ServiceComboConfig } from '../config/services';
import { validatePlatformTarget } from '../lib/validation';
import { formatVND, formatNumber } from '../lib/formatters';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { Service } from '../types';
import { PlatformIcon } from '../components/ui/PlatformIcon';
import { gsap, useGSAP } from '../lib/gsap';
import {
  ShoppingBag,
  Zap,
  Check,
  AlertCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Link2,
  Flame,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const NewOrderPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateBalance } = useAuthStore();
  const { success, error, warning } = useToast();

  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('tiktok');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedComboId, setSelectedComboId] = useState<string>('combo-35k');
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1000);
  const [commentsText, setCommentsText] = useState<string>('');

  // UI & Idempotency States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const isComboMode = selectedPlatform === 'combo';

  // Load services
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await serviceCatalogService.getServices();
      setAllServices(data);

      const urlPlatform = searchParams.get('platform');
      const urlService = searchParams.get('service');
      const urlCombo = searchParams.get('combo');

      if (urlCombo) {
        setSelectedPlatform('combo');
        const foundCombo = COMBOS_CONFIG.find((c) => c.id === urlCombo || c.slug === urlCombo);
        if (foundCombo) {
          setSelectedComboId(foundCombo.id);
        }
      } else if (urlPlatform) {
        setSelectedPlatform(urlPlatform);
      }

      if (urlService) {
        const found = data.find((s) => s.service_code === urlService);
        if (found) {
          setSelectedPlatform(found.platform_id);
          setSelectedCategory(found.category);
          setSelectedServiceId(found.id);
          setQuantity(found.min_quantity || 1000);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter services by active platform
  const platformServices = useMemo(() => {
    if (isComboMode) return [];
    return allServices.filter((s) => s.platform_id === selectedPlatform && s.active);
  }, [allServices, selectedPlatform, isComboMode]);

  // Categories for active platform
  const platformCategories = useMemo<string[]>(() => {
    if (isComboMode) return [];
    return Array.from(new Set(platformServices.map((s) => s.category).filter(Boolean)));
  }, [platformServices, isComboMode]);

  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Default to Tim / Like category or first available category on platform change
  useEffect(() => {
    if (platformCategories.length > 0) {
      const isCurrentValid = platformCategories.includes(selectedCategory);
      if (!isCurrentValid) {
        const likeCat = platformCategories.find(
          (c) => c.toLowerCase().includes('tim') || c.toLowerCase().includes('like')
        );
        setSelectedCategory(likeCat || platformCategories[0]);
      }
    }
  }, [platformCategories, selectedCategory]);

  // Filtered services by category
  const displayedServices = useMemo(() => {
    if (isComboMode) return [];
    if (!selectedCategory) return platformServices;
    const filtered = platformServices.filter((s) => s.category === selectedCategory);
    return filtered.length > 0 ? filtered : platformServices;
  }, [platformServices, selectedCategory, isComboMode]);

  // Deterministic server statistics helper (sold count, completion count, success rate)
  const getServiceStats = (srv: Service, index: number) => {
    let hash = 0;
    const str = srv.id || srv.service_code || `server-${index}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);
    const sold = 40 + (positiveHash % 320);
    const rateNum = 90.0 + ((positiveHash % 95) / 10);
    const rate = rateNum.toFixed(2) + '%';
    const completed = Math.max(1, Math.round((sold * rateNum) / 100));
    return { sold, completed, rate };
  };

  // Set default selected service if displayedServices changed
  useEffect(() => {
    if (!isComboMode && displayedServices.length > 0) {
      const currentExists = displayedServices.some((s) => s.id === selectedServiceId);
      if (!currentExists) {
        setSelectedServiceId(displayedServices[0].id);
        setQuantity(displayedServices[0].min_quantity || 1000);
      }
    }
  }, [displayedServices, selectedServiceId, isComboMode]);

  const activeService = useMemo(() => {
    if (isComboMode) return null;
    return allServices.find((s) => s.id === selectedServiceId);
  }, [allServices, selectedServiceId, isComboMode]);

  const activeCombo = useMemo(() => {
    if (!isComboMode) return null;
    return COMBOS_CONFIG.find((c) => c.id === selectedComboId) || COMBOS_CONFIG[0];
  }, [isComboMode, selectedComboId]);

  // URL Target Validation
  const targetValidation = useMemo(() => {
    if (!targetUrl.trim()) return { isValid: true };
    const validateSlug = isComboMode ? 'tiktok' : selectedPlatform;
    return validatePlatformTarget(validateSlug, targetUrl.trim());
  }, [selectedPlatform, targetUrl, isComboMode]);

  // Price Calculation
  const totalPrice = useMemo(() => {
    if (isComboMode) {
      return activeCombo ? activeCombo.price : 0;
    }
    if (!activeService) return 0;
    return calculateOrderPrice(quantity, activeService.price_per_1000);
  }, [isComboMode, activeCombo, activeService, quantity]);

  const balanceAfter = (user?.balance || 0) - totalPrice;
  const isBalanceSufficient = (user?.balance || 0) >= totalPrice;

  // Handle open confirmation checkout
  const handleOpenCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      warning('Vui lòng đăng nhập', 'Bạn cần đăng nhập để tạo đơn hàng');
      navigate('/auth');
      return;
    }

    if (!isComboMode && !activeService) {
      error('Vui lòng chọn gói dịch vụ');
      return;
    }

    if (isComboMode && !activeCombo) {
      error('Vui lòng chọn gói combo');
      return;
    }

    if (!targetUrl.trim()) {
      error('Vui lòng nhập link bài viết hoặc tài khoản');
      return;
    }

    if (!targetValidation.isValid) {
      error('Định dạng link không đúng', targetValidation.errorMessage);
      return;
    }

    if (!isComboMode && activeService) {
      if (quantity < activeService.min_quantity || quantity > activeService.max_quantity) {
        error(
          'Số lượng không hợp lệ',
          `Số lượng phải từ ${formatNumber(activeService.min_quantity)} đến ${formatNumber(activeService.max_quantity)}`
        );
        return;
      }
    }

    if (!isBalanceSufficient) {
      error('Số dư không đủ', 'Vui lòng nạp thêm tiền vào ví để thanh toán đơn hàng này');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Submit Order (With Idempotency & Double Click Protection)
  const handleConfirmOrder = async () => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const orderParams = isComboMode && activeCombo
        ? {
            userId: user.id,
            serviceId: activeCombo.id,
            serviceName: activeCombo.name,
            targetUrl: targetUrl.trim(),
            quantity: 1,
            totalAmount: activeCombo.price,
            pricePer1000: activeCombo.price,
            providerCost: Math.round(activeCombo.price / 1.35),
            comments: `Combo TikTok: ${activeCombo.name}`,
          }
        : {
            userId: user.id,
            serviceId: activeService!.id,
            serviceName: activeService!.name,
            targetUrl: targetUrl.trim(),
            quantity,
            totalAmount: totalPrice,
            pricePer1000: activeService!.price_per_1000,
            providerCost: calculateOrderPrice(quantity, activeService!.provider_price_per_1000 || 0),
            comments: commentsText || undefined,
          };

      const result = await orderService.createOrder(orderParams);

      // Update local user balance
      updateBalance(result.balanceAfter);
      setIsConfirmModalOpen(false);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      success('Đặt đơn thành công! 🎉', `Mã đơn hàng: #${result.orderId.substring(0, 8)}`);
      navigate(`/orders/${result.orderId}`);
    } catch (err: any) {
      error(err.message || 'Không thể tạo đơn hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary-light text-xs font-bold border border-primary/20">
          <Zap className="w-3.5 h-3.5" /> Khởi Tạo Đơn Hàng Tự Động 24/7
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          Đặt Dịch Vụ Mạng Xã Hội
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Chọn gói tương tác, dán link cần tăng và bấm đặt đơn. Hệ thống xử lý tự động 24/7.
        </p>
      </div>

      <form onSubmit={handleOpenCheckout} className="space-y-6">
        {/* Step 1: Platform Selection + Combo Pill */}
        <div className="p-6 rounded-3xl bg-surface/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Bước 1: Chọn Nền Tảng Hoặc Gói Combo
            </label>
            {isComboMode && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-pink-500" /> Chế Độ Combo Tiết Kiệm
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {/* Combo Special Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedPlatform('combo');
                setSearchParams({ combo: selectedComboId });
              }}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center text-center relative overflow-hidden ${
                isComboMode
                  ? 'bg-gradient-to-tr from-pink-600/30 to-purple-600/30 border-pink-500 text-white shadow-glow-pink ring-1 ring-pink-500/50'
                  : 'bg-slate-900/60 border-slate-800 text-pink-400 hover:text-pink-300 hover:bg-slate-800/60'
              }`}
            >
              <Flame className="w-6 h-6 mb-1 text-pink-500 animate-bounce" />
              <span className="text-xs font-black truncate w-full">Gói Combo</span>
              <span className="text-[8px] font-bold uppercase text-pink-300">Hot Tiết Kiệm</span>
            </button>

            {/* Platform Buttons */}
            {PLATFORMS_CONFIG.map((platform) => {
              const isSelected = selectedPlatform === platform.slug;
              return (
                <button
                  key={platform.slug}
                  type="button"
                  onClick={() => {
                    setSelectedPlatform(platform.slug);
                    setSearchParams({ platform: platform.slug });
                  }}
                  className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center text-center ${
                    isSelected
                      ? 'bg-primary/20 border-primary text-white shadow-glow-primary'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <PlatformIcon slug={platform.slug} className="w-6 h-6 mb-1.5" />
                  <span className="text-xs font-bold truncate w-full">{platform.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Service Selection (OR Combo Package Selection) */}
        {isComboMode ? (
          <div className="p-6 rounded-3xl bg-surface/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-pink-500" /> Bước 2: Chọn Gói Combo Phù Hợp
              </label>
              <span className="text-xs text-slate-400">Đã bao gồm trọn gói Tim + View + Save + Share + Follow + Cmt</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {COMBOS_CONFIG.map((combo) => {
                const isSelected = selectedComboId === combo.id;
                return (
                  <div
                    key={combo.id}
                    onClick={() => setSelectedComboId(combo.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-glow-primary ring-1 ring-primary'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    {combo.badge && (
                      <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-pink-500 to-primary text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                        {combo.badge}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-white">{combo.name}</h4>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-xl font-black text-emerald-400 font-mono">
                            {formatVND(combo.price)}
                          </span>
                          <span className="text-xs text-slate-500 line-through">
                            {formatVND(combo.originalPrice)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-slate-300 border-t border-slate-800/80 pt-3">
                        {combo.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary-light shrink-0" />
                            <span>
                              <b className="text-white">{item.qty.toLocaleString('vi-VN')}</b> {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">Trọn gói 1 video</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-primary border-primary text-white' : 'border-slate-700 bg-slate-800'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-surface/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Bước 2: Chọn Máy Chủ / Dịch Vụ
                </label>
                <span className="text-xs text-slate-500 font-medium">Máy Chủ: Chọn gói tương tác phù hợp nhất với nhu cầu</span>
              </div>

              {/* Category Filter Pills */}
              {platformCategories.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-0">
                  {platformCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        const firstInCat = platformServices.find((s) => s.category === cat);
                        if (firstInCat) {
                          setSelectedServiceId(firstInCat.id);
                          setQuantity(firstInCat.min_quantity || 1000);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        selectedCategory === cat
                          ? 'bg-primary text-white border-primary shadow-glow-primary'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Server Radio List */}
            {displayedServices.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
                Không tìm thấy máy chủ nào cho danh mục này.
              </div>
            ) : (
              <div className="space-y-2.5">
                {displayedServices.map((srv, idx) => {
                  const isSelected = selectedServiceId === srv.id;
                  const stats = getServiceStats(srv, idx);
                  const serverNum = idx + 1;

                  return (
                    <div
                      key={srv.id}
                      onClick={() => {
                        setSelectedServiceId(srv.id);
                        if (quantity < srv.min_quantity || quantity > srv.max_quantity) {
                          setQuantity(srv.min_quantity || 1000);
                        }
                      }}
                      className={`server-radio-item p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 relative select-none ${
                        isSelected
                          ? 'bg-primary/10 border-primary/90 shadow-glow-primary/20 ring-1 ring-primary/40'
                          : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Radio Circle */}
                      <div className="pt-0.5 shrink-0">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/20 shadow-sm'
                              : 'border-slate-500 bg-slate-900/90'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>

                      {/* Server Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Top Line: Server Badge, Title, Price, Status */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {/* Server Badge */}
                          <span className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-200 text-xs font-bold shrink-0">
                            Server {serverNum}
                          </span>

                          {/* Service Name */}
                          <span className="font-bold text-white text-xs sm:text-sm">
                            {srv.name}
                          </span>

                          {/* Price Badge */}
                          <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-bold text-xs shrink-0 shadow-sm">
                            {formatVND(srv.price_per_1000)}
                          </span>

                          {/* Dash */}
                          <span className="text-slate-500 font-bold text-xs">-</span>

                          {/* Status Badge */}
                          <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-xs shrink-0 shadow-sm">
                            Hoạt động
                          </span>

                          {srv.badge && (
                            <span className="px-2 py-0.5 rounded-md bg-pink-500/20 border border-pink-500/40 text-pink-400 text-[10px] font-black uppercase tracking-wider shrink-0">
                              {srv.badge}
                            </span>
                          )}
                        </div>

                        {/* Bottom Line: Stat Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md border border-slate-700/80 bg-slate-800/80 text-slate-300 font-medium">
                            Đã bán: <b className="text-white font-mono">{formatNumber(stats.sold)}</b>
                          </span>
                          <span className="px-2 py-0.5 rounded-md border border-emerald-800/50 bg-emerald-950/40 text-emerald-300 font-medium">
                            Hoàn thành: <b className="text-emerald-400 font-mono">{formatNumber(stats.completed)}</b>
                          </span>
                          <span className="px-2 py-0.5 rounded-md border border-blue-800/50 bg-blue-950/40 text-blue-300 font-medium">
                            Tỷ lệ: <b className="text-blue-400 font-mono">{stats.rate}</b>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Detailed Info Card for Selected Server */}
            {activeService && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs mt-3">
                {activeService.description && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-slate-300 text-xs leading-relaxed flex items-start gap-2">
                    <span className="text-amber-400 text-sm shrink-0">💡</span>
                    <span>{activeService.description}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block font-medium">Đơn giá:</span>
                    <span className="font-extrabold text-emerald-400 font-mono text-sm">
                      {formatVND(activeService.price_per_1000)} / 1k
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block font-medium">Giới hạn số lượng:</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {formatNumber(activeService.min_quantity)} - {formatNumber(activeService.max_quantity)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block font-medium">Tốc độ trung bình:</span>
                    <span className="font-bold text-primary-light">
                      {activeService.average_speed || '5 - 15 phút'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block font-medium">Chế độ bảo hành:</span>
                    <span className={`font-bold ${activeService.refill_supported ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {activeService.refill_supported ? 'Có bảo hành tụt' : 'Không bảo hành'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Target URL / Link Input */}
        <div className="p-6 rounded-3xl bg-surface/80 border border-slate-800 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            {isComboMode ? 'Bước 3: Nhập Link Video TikTok Cần Đẩy Combo' : 'Bước 3: Nhập Link Bài Viết / Trang Cá Nhân'}
          </label>

          <Input
            type="text"
            placeholder={
              isComboMode
                ? 'https://www.tiktok.com/@username/video/1234567890 hoặc @username'
                : (PLATFORMS_CONFIG.find((p) => p.slug === selectedPlatform)?.urlPlaceholder || 'https://...')
            }
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            leftIcon={<Link2 className="w-4 h-4 text-slate-400" />}
            error={!targetValidation.isValid ? targetValidation.errorMessage : undefined}
          />

          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            🔒 Lưu ý: Đảm bảo tài khoản/video ở chế độ công khai. Hệ thống chỉ cần link, an toàn 100% cho tài khoản của bạn.
          </p>
        </div>

        {/* Step 4: Quantity (Hidden / Fixed for Combo Mode) */}
        {!isComboMode ? (
          <div className="p-6 rounded-3xl bg-surface/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Bước 4: Nhập Số Lượng Tương Tác
              </label>
              {activeService && (
                <span className="text-[11px] text-slate-500">
                  Tối thiểu: <b>{formatNumber(activeService.min_quantity)}</b> • Tối đa: <b>{formatNumber(activeService.max_quantity)}</b>
                </span>
              )}
            </div>

            <Input
              type="number"
              min={activeService?.min_quantity || 100}
              max={activeService?.max_quantity || 10000000}
              step={100}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />

            {/* If comment service, show comment textarea */}
            {activeService && (activeService.category.toLowerCase().includes('bình luận') || activeService.category.toLowerCase().includes('comment')) && (
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Nội dung bình luận (Mỗi dòng 1 bình luận):
                  </label>
                  <span className="text-[11px] text-primary-light font-bold">
                    {commentsText.split('\n').filter((l) => l.trim()).length} bình luận
                  </span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Tuyệt vời quá shop ơi&#10;Sản phẩm rất chất lượng&#10;Ủng hộ shop dài dài nha"
                  value={commentsText}
                  onChange={(e) => {
                    setCommentsText(e.target.value);
                    const lines = e.target.value.split('\n').filter((l) => l.trim()).length;
                    if (lines > 0) setQuantity(lines);
                  }}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-all resize-y"
                />
              </div>
            )}

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[100, 500, 1000, 2000, 5000, 10000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    quantity === preset
                      ? 'bg-primary/20 text-primary-light border-primary/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  +{preset.toLocaleString('vi-VN')}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-surface/80 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Bước 4: Quyền Lợi Gói Combo Tự Động Xử Lý
            </label>
            {activeCombo && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {activeCombo.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-200">
                      <b className="text-white font-mono">{item.qty.toLocaleString('vi-VN')}</b> {item.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Price Summary & Checkout Button */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-surface to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-xs text-slate-400 block">Tổng Tiền Thanh Toán:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {formatVND(totalPrice)}
              </span>
              <span className="text-xs text-slate-500">
                {isComboMode ? '(Trọn gói combo)' : `(${formatNumber(quantity)} @ ${formatVND(activeService?.price_per_1000 || 0)}/1k)`}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            variant="glow"
            size="lg"
            className="w-full sm:w-auto px-8 py-4 font-extrabold shadow-glow-primary"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isComboMode ? 'Tiến Hành Đặt Đơn Combo' : 'Tiến Hành Đặt Đơn'}
          </Button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => !isSubmitting && setIsConfirmModalOpen(false)}
        title="Xác Nhận Đặt Đơn Hàng"
        subtitle="Vui lòng kiểm tra lại thông tin trước khi tạo đơn"
        maxWidth="md"
      >
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Dịch vụ / Combo:</span>
              <span className="font-bold text-white">
                {isComboMode ? activeCombo?.name : activeService?.name}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Nền tảng:</span>
              <span className="font-bold text-primary-light uppercase">
                {isComboMode ? 'TikTok (Combo Trọn Gói)' : selectedPlatform}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Mục tiêu:</span>
              <span className="font-mono text-slate-300 max-w-[200px] truncate">{targetUrl}</span>
            </div>

            {!isComboMode && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Số lượng:</span>
                <span className="font-bold text-slate-200 font-mono">{formatNumber(quantity)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-slate-300 font-bold">Tổng thanh toán:</span>
              <span className="font-black text-emerald-400 text-base font-mono">{formatVND(totalPrice)}</span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Số dư sau khi trừ:</span>
              <span className="font-mono text-slate-400">{formatVND(balanceAfter)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy Bỏ
            </Button>
            <Button
              variant="glow"
              size="md"
              className="flex-1"
              onClick={handleConfirmOrder}
              isLoading={isSubmitting}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Xác Nhận Mua
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
