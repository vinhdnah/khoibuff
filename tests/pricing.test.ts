import { describe, it, expect } from 'vitest';
import { calculateOrderPrice, calculateMarkupPrice, getAllDefaultServices, getServiceByCode, SERVICE_PRICING, DEFAULT_MARKUP_PERCENT } from '../src/config/services';

describe('Pricing Engine & Services Config Test', () => {
  it('should correctly calculate order price in VND', () => {
    // 2,000 TikTok Tim Việt @ 30,000đ / 1k = 60,000đ
    expect(calculateOrderPrice(2000, 30000)).toBe(60000);

    // 10,000 TikTok View @ 1,500đ / 1k = 15,000đ
    expect(calculateOrderPrice(10000, 1500)).toBe(15000);

    // 500 FB Like @ 25,000đ / 1k = 12,500đ
    expect(calculateOrderPrice(500, 25000)).toBe(12500);

    // 0 quantity or negative returns 0
    expect(calculateOrderPrice(0, 30000)).toBe(0);
    expect(calculateOrderPrice(-100, 30000)).toBe(0);
  });

  it('should correctly calculate 40% markup from provider cost', () => {
    expect(DEFAULT_MARKUP_PERCENT).toBe(40);

    // Provider cost 10,000đ + 40% = 14,000đ
    expect(calculateMarkupPrice(10000, 40)).toBe(14000);

    // Provider cost 25,000đ + 40% = 35,000đ
    expect(calculateMarkupPrice(25000, 40)).toBe(35000);

    // Default 40%
    expect(calculateMarkupPrice(50000)).toBe(70000);
  });

  it('should find service by service_code', () => {
    const srv = getServiceByCode('TT_LIKE_VN');
    expect(srv).toBeDefined();
    expect(srv?.name).toBe('1k Tim Việt (Không tụt)');
    expect(srv?.pricePer1000).toBe(30000);
    expect(srv?.providerCostPer1000).toBe(18000);
  });

  it('should have higher selling price than provider cost across all default services', () => {
    const allServices = getAllDefaultServices();
    expect(allServices.length).toBeGreaterThan(15);

    for (const service of allServices) {
      expect(service.pricePer1000).toBeGreaterThan(service.providerCostPer1000);
      expect(service.min).toBeGreaterThan(0);
      expect(service.max).toBeGreaterThan(service.min);
    }
  });

  it('should verify image 2 exact prices', () => {
    // TikTok 1k Tim Tây: 15.000đ
    expect(SERVICE_PRICING.tiktok.tt_like_global.pricePer1000).toBe(15000);
    // TikTok 1k Tim Việt: 30.000đ
    expect(SERVICE_PRICING.tiktok.tt_like_vn.pricePer1000).toBe(30000);
    // TikTok 1k Follow Tây: 130.000đ
    expect(SERVICE_PRICING.tiktok.tt_follow_global.pricePer1000).toBe(130000);
    // Facebook 1k Like: 25.000đ
    expect(SERVICE_PRICING.facebook.fb_like_post.pricePer1000).toBe(25000);
    // Facebook 1k Live 120m: 70.000đ
    expect(SERVICE_PRICING.facebook.fb_live_120m.pricePer1000).toBe(70000);
    // Instagram 1k Follow Việt: 65.000đ
    expect(SERVICE_PRICING.instagram.ig_follow_vn.pricePer1000).toBe(65000);
  });
});
