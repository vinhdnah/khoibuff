import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceCatalogService } from '../services/serviceCatalogService';
import { PLATFORMS_CONFIG } from '../config/platforms';
import { COMBOS_CONFIG } from '../config/services';
import { PlatformIcon } from '../components/ui/PlatformIcon';
import { Service } from '../types';
import { formatVND, formatNumber } from '../lib/formatters';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { gsap, useGSAP } from '../lib/gsap';
import {
  Layers,
  Search,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await serviceCatalogService.getServices();
      setServices(data);
    } catch (err) {
      console.error(err);
    }
  };

  const isComboTab = selectedPlatform === 'combo';

  const filteredServices = useMemo(() => {
    if (isComboTab) return [];
    return services.filter((s) => {
      const matchesPlatform = selectedPlatform === 'all' || s.platform_id === selectedPlatform;
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlatform && matchesSearch;
    });
  }, [services, selectedPlatform, searchQuery, isComboTab]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary-light text-xs font-bold border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" /> Bảng Giá Minh Bạch • Không Phí Ẩn
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          Danh Mục Dịch Vụ Mạng Xã Hội
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Khám phá tất cả các gói tăng like, follow, view, comment chất lượng cao và các gói combo trọn gói tiết kiệm.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-surface/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Clean Platform Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              selectedPlatform === 'all'
                ? 'bg-primary text-white border-primary shadow-glow-primary'
                : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tất Cả</span>
          </button>

          {/* Combo Filter Pill */}
          <button
            onClick={() => setSelectedPlatform('combo')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              isComboTab
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-500 shadow-glow-pink'
                : 'bg-slate-900/60 text-pink-400 border-slate-800 hover:bg-slate-800 hover:text-pink-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-pink-500" />
            <span>Gói Combo Tiết Kiệm</span>
          </button>

          {PLATFORMS_CONFIG.map((p) => (
            <button
              key={p.slug}
              onClick={() => setSelectedPlatform(p.slug)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                selectedPlatform === p.slug
                  ? 'bg-primary text-white border-primary shadow-glow-primary'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <PlatformIcon slug={p.slug} className="w-3.5 h-3.5" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>

        {/* Search Box */}
        {!isComboTab && (
          <div className="w-full md:w-80">
            <Input
              type="text"
              placeholder="Tìm theo tên dịch vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        )}
      </div>

      {/* When Combo Tab is Selected: Display Rich Combo Cards */}
      {isComboTab ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMBOS_CONFIG.map((combo) => (
            <div
              key={combo.id}
              className="p-6 rounded-3xl bg-surface/80 border border-slate-800 hover:border-primary/50 transition-all flex flex-col justify-between relative group"
            >
              {combo.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-primary text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                  {combo.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-lg text-white group-hover:text-primary-light transition-colors">
                    {combo.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{combo.description}</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {formatVND(combo.price)}
                    </span>
                    <span className="text-xs text-slate-500 line-through">
                      {formatVND(combo.originalPrice)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                  {combo.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary-light shrink-0" />
                      <span>
                        <b className="text-white font-mono">{item.qty.toLocaleString('vi-VN')}</b> {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <Button
                  variant="glow"
                  size="md"
                  className="w-full font-bold shadow-glow-primary"
                  onClick={() => navigate(`/order?combo=${combo.id}`)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Đặt Combo Ngay
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Regular Services Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="service-card-item p-5 rounded-3xl bg-surface/70 border border-slate-800/80 hover:border-slate-700 hover:bg-surface/90 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                    <PlatformIcon slug={service.platform_id} className="w-3 h-3 text-primary-light" />
                    {service.category}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Auto 24/7
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-white group-hover:text-primary-light transition-colors line-clamp-2">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  )}
                </div>

                {/* Service Specs */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Số lượng:</span>
                    <span className="font-bold text-slate-200">
                      {formatNumber(service.min_quantity)} - {formatNumber(service.max_quantity)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bảo hành:</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Không tụt
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Đơn giá / 1.000</span>
                  <span className="font-black text-lg text-emerald-400">
                    {formatVND(service.price_per_1000)}
                  </span>
                </div>

                <Button
                  variant="glow"
                  size="sm"
                  onClick={() => navigate(`/order?service=${service.service_code}`)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Đặt Ngay
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
