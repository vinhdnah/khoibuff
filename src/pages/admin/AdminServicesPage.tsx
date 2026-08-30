import React, { useState, useEffect, useMemo } from 'react';
import { serviceCatalogService } from '../../services/serviceCatalogService';
import { PLATFORMS_CONFIG } from '../../config/platforms';
import { Service } from '../../types';
import { formatVND, formatNumber } from '../../lib/formatters';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import {
  Layers,
  Search,
  Edit2,
  Check,
  Percent,
  Power,
  RefreshCw,
} from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const { success, error } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit service modal
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editProviderPrice, setEditProviderPrice] = useState<number>(0);
  const [editProviderServiceId, setEditProviderServiceId] = useState<string>('');
  const [editMin, setEditMin] = useState<number>(100);
  const [editMax, setEditMax] = useState<number>(100000);
  const [editSpeed, setEditSpeed] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const data = await serviceCatalogService.getAllServicesAdmin();
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setEditPrice(service.price_per_1000);
    setEditProviderPrice(service.provider_price_per_1000 || 0);
    setEditProviderServiceId(service.provider_service_id || '');
    setEditMin(service.min_quantity);
    setEditMax(service.max_quantity);
    setEditSpeed(service.average_speed || '5-15 phút');
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    setIsSaving(true);
    try {
      await serviceCatalogService.updateService(editingService.id, {
        price_per_1000: editPrice,
        provider_price_per_1000: editProviderPrice,
        provider_service_id: editProviderServiceId.trim() || undefined,
        min_quantity: editMin,
        max_quantity: editMax,
        average_speed: editSpeed,
      });

      success('Cập nhật giá và thông số dịch vụ thành công!');
      setEditingService(null);
      loadServices();
    } catch (err: any) {
      error(err.message || 'Không thể lưu thay đổi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await serviceCatalogService.updateService(service.id, {
        active: !service.active,
      });
      success(`Đã ${!service.active ? 'bật' : 'tắt'} dịch vụ ${service.name}`);
      loadServices();
    } catch (err: any) {
      error(err.message);
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesPlatform = selectedPlatform === 'all' || s.platform_id === selectedPlatform;
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.service_code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlatform && matchesSearch;
    });
  }, [services, selectedPlatform, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" /> Quản Lý Dịch Vụ & Giá Bán (Pricing)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Chỉnh sửa giá bán cho khách, giá vốn nhà cung cấp, giới hạn min/max và bật/tắt dịch vụ.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadServices} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Làm Mới
        </Button>
      </div>

      {/* Filter & Search */}
      <div className="p-4 rounded-2xl bg-surface/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedPlatform === 'all'
                ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            Tất cả ({services.length})
          </button>
          {PLATFORMS_CONFIG.map((p) => (
            <button
              key={p.slug}
              onClick={() => setSelectedPlatform(p.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedPlatform === p.slug
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="w-full md:w-80">
          <Input
            type="text"
            placeholder="Tìm theo tên dịch vụ, mã code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* Services Table */}
      <div className="p-6 rounded-2xl bg-surface/80 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-3">Mã</th>
              <th className="py-3.5 px-3">Tên dịch vụ</th>
              <th className="py-3.5 px-3">Giá bán (/ 1.000)</th>
              <th className="py-3.5 px-3">Giá gốc (/ 1.000)</th>
              <th className="py-3.5 px-3">Biên lợi nhuận</th>
              <th className="py-3.5 px-3">Min - Max</th>
              <th className="py-3.5 px-3">Tốc độ</th>
              <th className="py-3.5 px-3">Trạng thái</th>
              <th className="py-3.5 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredServices.map((service) => {
              const profitMargin =
                service.price_per_1000 > 0
                  ? Math.round(
                      ((service.price_per_1000 - (service.provider_price_per_1000 || 0)) /
                        service.price_per_1000) *
                        100
                    )
                  : 0;

              return (
                <tr key={service.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-3 font-mono font-bold text-slate-400 whitespace-nowrap">
                    {service.service_code}
                  </td>
                  <td className="py-4 px-3 font-semibold text-white min-w-[200px]">
                    <div>{service.name}</div>
                    <span className="text-[10px] text-slate-400 uppercase">{service.category}</span>
                  </td>
                  <td className="py-4 px-3 font-extrabold text-emerald-400 text-sm whitespace-nowrap">
                    {formatVND(service.price_per_1000)}
                  </td>
                  <td className="py-4 px-3 text-slate-400 whitespace-nowrap">
                    {formatVND(service.provider_price_per_1000 || 0)}
                  </td>
                  <td className="py-4 px-3 whitespace-nowrap">
                    <span className="font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                      +{profitMargin}%
                    </span>
                  </td>
                  <td className="py-4 px-3 text-slate-300 whitespace-nowrap">
                    {formatNumber(service.min_quantity)} - {formatNumber(service.max_quantity)}
                  </td>
                  <td className="py-4 px-3 text-slate-400 whitespace-nowrap">
                    {service.average_speed || '5-15p'}
                  </td>
                  <td className="py-4 px-3 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(service)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        service.active
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      {service.active ? 'Đang bật' : 'Tạm tắt'}
                    </button>
                  </td>
                  <td className="py-4 px-3 text-right whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(service)}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Sửa Giá
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Service Modal */}
      <Modal
        isOpen={Boolean(editingService)}
        onClose={() => setEditingService(null)}
        title="Chỉnh Sửa Giá & Thông Số Dịch Vụ"
        subtitle={editingService?.name}
      >
        {editingService && (
          <form onSubmit={handleSaveService} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Giá bán cho khách (/ 1.000 tương tác)"
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                required
              />

              <Input
                label="Giá gốc Provider (/ 1.000)"
                type="number"
                value={editProviderPrice}
                onChange={(e) => setEditProviderPrice(Number(e.target.value))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Số lượng tối thiểu (Min)"
                type="number"
                value={editMin}
                onChange={(e) => setEditMin(Number(e.target.value))}
                required
              />

              <Input
                label="Số lượng tối đa (Max)"
                type="number"
                value={editMax}
                onChange={(e) => setEditMax(Number(e.target.value))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Mã ID Dịch Vụ Provider (tangliketym.click)"
                placeholder="Ví dụ: 1477"
                value={editProviderServiceId}
                onChange={(e) => setEditProviderServiceId(e.target.value)}
              />

              <Input
                label="Tốc độ ước tính"
                value={editSpeed}
                onChange={(e) => setEditSpeed(e.target.value)}
                placeholder="Ví dụ: 5-15 phút"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="ghost" type="button" onClick={() => setEditingService(null)}>
                Hủy bỏ
              </Button>
              <Button variant="glow" type="submit" isLoading={isSaving} leftIcon={<Check className="w-4 h-4" />}>
                Lưu Thay Đổi
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
