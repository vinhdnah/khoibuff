/**
 * MASTER PRICING & SERVICE CONFIGURATION
 * 
 * Nơi duy nhất cấu hình toàn bộ giá bán, min/max, tốc độ và dịch vụ mặc định.
 * Hệ thống tự động dùng file này làm Default Pricing & Fallback nếu database chưa có dữ liệu.
 */

export interface ServiceItemConfig {
  serviceCode: string;
  name: string;
  category: string;
  pricePer1000: number; // Giá bán cho khách (VNĐ / 1.000 tương tác)
  providerCostPer1000: number; // Giá gốc nhà cung cấp (VNĐ / 1.000 tương tác)
  min: number;
  max: number;
  averageSpeed: string;
  refillSupported: boolean;
  cancelSupported: boolean;
  description: string;
  active: boolean;
  badge?: string;
  sortOrder?: number;
}

export interface ComboItemConfig {
  name: string;
  qty: number;
}

export interface ServiceComboConfig {
  id: string;
  name: string;
  slug: string;
  badge: string;
  description: string;
  price: number;
  originalPrice: number;
  items: ComboItemConfig[];
  active: boolean;
  sortOrder: number;
}

export const SERVICE_PRICING: Record<string, Record<string, ServiceItemConfig>> = {
  tiktok: {
    tt_like_global: {
      serviceCode: 'TT_LIKE_GLOBAL',
      name: '1k Tim Tây (Không tụt)',
      category: 'Tim / Like',
      pricePer1000: 15000,
      providerCostPer1000: 8000,
      min: 100,
      max: 500000,
      averageSpeed: '5-15 phút',
      refillSupported: true,
      cancelSupported: true,
      description: 'Tim quốc tế chất lượng cao, tốc độ ổn định, bảo hành trọn đời không tụt.',
      active: true,
    },
    tt_like_vn: {
      serviceCode: 'TT_LIKE_VN',
      name: '1k Tim Việt (Không tụt)',
      category: 'Tim / Like',
      pricePer1000: 30000,
      providerCostPer1000: 18000,
      min: 100,
      max: 200000,
      averageSpeed: '5-30 phút',
      refillSupported: true,
      cancelSupported: true,
      description: 'Tim tài khoản người dùng Việt Nam thật 100%, nick có avatar, tăng tương tác chuẩn SEO.',
      active: true,
      badge: 'Bán chạy',
    },
    tt_view_fast: {
      serviceCode: 'TT_VIEW_FAST',
      name: '1k View (Không tụt)',
      category: 'Lượt xem (View)',
      pricePer1000: 5000,
      providerCostPer1000: 1500,
      min: 1000,
      max: 10000000,
      averageSpeed: '1-5 phút',
      refillSupported: false,
      cancelSupported: false,
      description: 'Tăng lượt xem video TikTok siêu tốc độ, hỗ trợ đẩy video lên xu hướng (FYP).',
      active: true,
      badge: 'Cực nhanh',
    },
    tt_view_bulk: {
      serviceCode: 'TT_VIEW_BULK',
      name: '10k View (Không tụt)',
      category: 'Lượt xem (View)',
      pricePer1000: 1500, // 15.000đ cho 10k view = 1.500đ / 1k
      providerCostPer1000: 600,
      min: 10000,
      max: 50000000,
      averageSpeed: '5-15 phút',
      refillSupported: false,
      cancelSupported: false,
      description: 'Gói View số lượng lớn giá ưu đãi đặc biệt dành cho content creator chuyên nghiệp.',
      active: true,
      badge: 'Siêu rẻ',
    },
    tt_fav: {
      serviceCode: 'TT_FAV',
      name: '1k Yêu thích (Save)',
      category: 'Yêu thích / Save',
      pricePer1000: 3000,
      providerCostPer1000: 1200,
      min: 100,
      max: 100000,
      averageSpeed: '10-30 phút',
      refillSupported: true,
      cancelSupported: false,
      description: 'Tăng lượt lưu video vào danh sách yêu thích, thuật toán TikTok ưu tiên phân phối.',
      active: true,
    },
    tt_share: {
      serviceCode: 'TT_SHARE',
      name: '1k Share video',
      category: 'Chia sẻ (Share)',
      pricePer1000: 5000,
      providerCostPer1000: 2000,
      min: 100,
      max: 50000,
      averageSpeed: '5-20 phút',
      refillSupported: false,
      cancelSupported: false,
      description: 'Tăng lượt chia sẻ liên kết video TikTok, giúp tài khoản tăng chỉ số uy tín.',
      active: true,
    },
    tt_cmt_real_vn: {
      serviceCode: 'TT_CMT_REAL_VN',
      name: '1k Bình luận Việt thật',
      category: 'Bình luận (Comment)',
      pricePer1000: 55000,
      providerCostPer1000: 35000,
      min: 10,
      max: 5000,
      averageSpeed: '15-60 phút',
      refillSupported: false,
      cancelSupported: true,
      description: 'Bình luận tiếng Việt tự nhiên theo nội dung tùy chỉnh từ người dùng thật.',
      active: true,
      badge: 'Chất lượng',
    },
    tt_cmt_like: {
      serviceCode: 'TT_CMT_LIKE',
      name: '1k Tim Bình luận',
      category: 'Bình luận (Comment)',
      pricePer1000: 15000,
      providerCostPer1000: 7000,
      min: 50,
      max: 20000,
      averageSpeed: '5-25 phút',
      refillSupported: true,
      cancelSupported: false,
      description: 'Thả tim đẩy top bình luận nổi bật trên đầu video TikTok.',
      active: true,
    },
    tt_follow_vn_slow: {
      serviceCode: 'TT_FOLLOW_VN_SLOW',
      name: '1k Follow Việt / Tây (Chậm ko tụt)',
      category: 'Theo dõi (Follow)',
      pricePer1000: 60000,
      providerCostPer1000: 38000,
      min: 100,
      max: 50000,
      averageSpeed: '1-6 giờ',
      refillSupported: true,
      cancelSupported: true,
      description: 'Tăng follow tốc độ tự nhiên an toàn tuyệt đối cho kênh mới, bảo hành 30 ngày.',
      active: true,
      badge: 'Khuyên dùng',
    },
    tt_follow_global: {
      serviceCode: 'TT_FOLLOW_GLOBAL',
      name: '1k Follow Tây (Không tụt)',
      category: 'Theo dõi (Follow)',
      pricePer1000: 130000,
      providerCostPer1000: 85000,
      min: 100,
      max: 100000,
      averageSpeed: '30-90 phút',
      refillSupported: true,
      cancelSupported: true,
      description: 'Follow quốc tế tốc độ cao, tài khoản avatar & video đầy đủ.',
      active: true,
    },
  },

  facebook: {
    fb_like_post: {
      serviceCode: 'FB_LIKE_POST',
      name: '1k Like Tây / Việt',
      category: 'Like bài viết',
      pricePer1000: 25000,
      providerCostPer1000: 12000,
      min: 100,
      max: 100000,
      averageSpeed: '5-20 phút',
      refillSupported: true,
      cancelSupported: true,
      description: 'Tăng like bài viết trang cá nhân hoặc fanpage chất lượng cao, không tụt.',
      active: true,
      badge: 'Phổ biến',
    },
    fb_view_video: {
      serviceCode: 'FB_VIEW_VIDEO',
      name: '1k View video',
      category: 'Lượt xem (View)',
      pricePer1000: 5000,
      providerCostPer1000: 1800,
      min: 1000,
      max: 5000000,
      averageSpeed: '2-10 phút',
      refillSupported: false,
      cancelSupported: false,
      description: 'Tăng lượt xem video Facebook Reels / Watch tốc độ cao.',
      active: true,
    },
    fb_view_bulk: {
      serviceCode: 'FB_VIEW_BULK',
      name: '10k View video',
      category: 'Lượt xem (View)',
      pricePer1000: 1500, // 15.000đ cho 10k view
      providerCostPer1000: 600,
      min: 10000,
      max: 20000000,
      averageSpeed: '5-20 phút',
      refillSupported: false,
      cancelSupported: false,
      description: 'Gói xem video Facebook số lượng lớn tiết kiệm chi phí.',
      active: true,
    },
    fb_share_post: {
      serviceCode: 'FB_SHARE_POST',
      name: '1k Share bài viết',
      category: 'Chia sẻ (Share)',
      pricePer1000: 5000,
      providerCostPer1000: 2200,
      min: 100,
      max: 20000,
      averageSpeed: '10-30 phút',
      refillSupported: false,
      cancelSupported: false,
      description: 'Share bài viết lên tường công khai giúp tăng độ viral.',
      active: true,
    },
    fb_cmt_real_vn: {
      serviceCode: 'FB_CMT_REAL_VN',
      name: '1k Bình luận Việt thật',
      category: 'Bình luận (Comment)',
      pricePer1000: 55000,
      providerCostPer1000: 32000,
      min: 10,
      max: 5000,
      averageSpeed: '15-60 phút',
      refillSupported: false,
      cancelSupported: true,
      description: 'Bình luận tùy chọn theo kịch bản từ nick Facebook Việt thật.',
      active: true,
      badge: 'Việt thật',
    },
    fb_follow_page_user: {
      serviceCode: 'FB_FOLLOW_PAGE_USER',
      name: '1k Follow Page / Cá nhân',
      category: 'Theo dõi (Follow)',
      pricePer1000: 45000,
      providerCostPer1000: 26000,
      min: 100,
      max: 100000,
      averageSpeed: '30-120 phút',
      refillSupported: true,
      cancelSupported: true,
      description: 'Tăng người theo dõi profile cá nhân hoặc Fanpage chuyên nghiệp.',
      active: true,
      badge: 'Bán chạy',
    },
    fb_view_story: {
      serviceCode: 'FB_VIEW_STORY',
      name: '1k View Story 24h',
      category: 'Story',
      pricePer1000: 15000,
      providerCostPer1000: 7000,
      min: 500,
      max: 50000,
      averageSpeed: '5-15 phút',
      refillSupported: false,
      cancelSupported: false,
      description: 'Tăng mắt xem tin Story Facebook tự nhiên.',
      active: true,
    },
    fb_group_member: {
      serviceCode: 'FB_GROUP_MEMBER',
      name: '1k Thành viên nhóm Việt',
      category: 'Thành viên Group',
      pricePer1000: 25000,
      providerCostPer1000: 14000,
      min: 500,
      max: 100000,
      averageSpeed: '1-6 giờ',
      refillSupported: true,
      cancelSupported: false,
      description: 'Tăng thành viên group Facebook người dùng Việt thật giúp xây dựng cộng đồng.',
      active: true,
    },
    fb_live_120m: {
      serviceCode: 'FB_LIVE_120M',
      name: '1k Mắt xem Livestream (120 phút)',
      category: 'Livestream',
      pricePer1000: 70000,
      providerCostPer1000: 42000,
      min: 50,
      max: 5000,
      averageSpeed: 'Ngay lập tức',
      refillSupported: false,
      cancelSupported: false,
      description: 'Giữ mắt xem livestream Facebook liên tục 120 phút bán hàng đỉnh cao.',
      active: true,
      badge: 'Live Pro',
    },
  },

  instagram: {
    ig_follow_global: {
      serviceCode: 'IG_FOLLOW_GLOBAL',
      name: '1k Follow Tây',
      category: 'Theo dõi (Follow)',
      pricePer1000: 30000,
      providerCostPer1000: 16000,
      min: 100,
      max: 100000,
      averageSpeed: '15-45 phút',
      refillSupported: true,
      cancelSupported: true,
      description: 'Tăng theo dõi Instagram tài khoản quốc tế có avatar & post ổn định.',
      active: true,
    },
    ig_follow_vn: {
      serviceCode: 'IG_FOLLOW_VN',
      name: '1k Follow Việt',
      category: 'Theo dõi (Follow)',
      pricePer1000: 65000,
      providerCostPer1000: 40000,
      min: 100,
      max: 50000,
      averageSpeed: '30-90 phút',
      refillSupported: true,
      cancelSupported: true,
      description: 'Tăng theo dõi Instagram người dùng Việt Nam thật chất lượng cao.',
      active: true,
      badge: 'Việt 100%',
    },
    ig_like_global: {
      serviceCode: 'IG_LIKE_GLOBAL',
      name: '1k Like Tây',
      category: 'Like / Tim',
      pricePer1000: 15000,
      providerCostPer1000: 7000,
      min: 100,
      max: 200000,
      averageSpeed: '5-20 phút',
      refillSupported: true,
      cancelSupported: true,
      description: 'Thả tim bài viết / Reel Instagram quốc tế giá tốt.',
      active: true,
    },
    ig_like_vn: {
      serviceCode: 'IG_LIKE_VN',
      name: '1k Like Việt',
      category: 'Like / Tim',
      pricePer1000: 35000,
      providerCostPer1000: 20000,
      min: 100,
      max: 50000,
      averageSpeed: '10-30 phút',
      refillSupported: true,
      cancelSupported: true,
      description: 'Thả tim bài viết / Reel Instagram người dùng Việt thật.',
      active: true,
    },
    ig_view_reel: {
      serviceCode: 'IG_VIEW_REEL',
      name: '1k View',
      category: 'Lượt xem (View)',
      pricePer1000: 5000,
      providerCostPer1000: 1800,
      min: 1000,
      max: 5000000,
      averageSpeed: '2-10 phút',
      refillSupported: false,
      cancelSupported: false,
      description: 'Lượt xem video Reel Instagram tốc độ tức thì.',
      active: true,
    },
    ig_view_100k: {
      serviceCode: 'IG_VIEW_100K',
      name: '100k View (Gói lớn)',
      category: 'Lượt xem (View)',
      pricePer1000: 400, // 40.000đ cho 100k view = 400đ / 1k
      providerCostPer1000: 180,
      min: 100000,
      max: 20000000,
      averageSpeed: '10-60 phút',
      refillSupported: false,
      cancelSupported: false,
      description: 'Gói 100k view siêu ưu đãi cho video dài và Reel Instagram.',
      active: true,
      badge: 'Tiết kiệm 90%',
    },
    ig_save_post: {
      serviceCode: 'IG_SAVE_POST',
      name: '1k Yêu thích (Save)',
      category: 'Save & Share',
      pricePer1000: 5000,
      providerCostPer1000: 2000,
      min: 100,
      max: 50000,
      averageSpeed: '10-30 phút',
      refillSupported: true,
      cancelSupported: false,
      description: 'Lưu bài viết Instagram tăng chỉ số tương tác tự nhiên.',
      active: true,
    },
    ig_share_post: {
      serviceCode: 'IG_SHARE_POST',
      name: '1k Share bài viết',
      category: 'Save & Share',
      pricePer1000: 5000,
      providerCostPer1000: 2000,
      min: 100,
      max: 50000,
      averageSpeed: '10-30 phút',
      refillSupported: false,
      cancelSupported: false,
      description: 'Chia sẻ bài viết Instagram.',
      active: true,
    },
  },

  youtube: {
    yt_view_high: {
      serviceCode: 'YT_VIEW_HIGH',
      name: 'Tăng lượt xem video YouTube',
      category: 'Lượt xem',
      pricePer1000: 45000,
      providerCostPer1000: 28000,
      min: 1000,
      max: 2000000,
      averageSpeed: '1-6 giờ',
      refillSupported: true,
      cancelSupported: true,
      description: 'View chất lượng cao giữ chân tốt, an toàn bật kiếm tiền cho video.',
      active: true,
    },
    yt_sub_real: {
      serviceCode: 'YT_SUB_REAL',
      name: 'Tăng Subscribers YouTube (Bảo hành)',
      category: 'Subscribers',
      pricePer1000: 150000,
      providerCostPer1000: 95000,
      min: 100,
      max: 20000,
      averageSpeed: '6-24 giờ',
      refillSupported: true,
      cancelSupported: true,
      description: 'Tăng đăng ký kênh YouTube người dùng thật, bảo hành 60 ngày.',
      active: true,
      badge: 'Bảo hành',
    },
    yt_like_video: {
      serviceCode: 'YT_LIKE_VIDEO',
      name: 'Tăng Like video YouTube',
      category: 'Like',
      pricePer1000: 25000,
      providerCostPer1000: 12000,
      min: 100,
      max: 50000,
      averageSpeed: '15-45 phút',
      refillSupported: true,
      cancelSupported: false,
      description: 'Like video / Shorts YouTube không tụt.',
      active: true,
    },
  },

  telegram: {
    tg_member_channel: {
      serviceCode: 'TG_MEMBER_CHANNEL',
      name: 'Tăng members kênh/nhóm Telegram',
      category: 'Thành viên',
      pricePer1000: 40000,
      providerCostPer1000: 22000,
      min: 100,
      max: 50000,
      averageSpeed: '10-60 phút',
      refillSupported: true,
      cancelSupported: true,
      description: 'Thành viên thật vào channel / group Telegram cộng đồng.',
      active: true,
    },
    tg_post_view: {
      serviceCode: 'TG_POST_VIEW',
      name: 'Tăng lượt xem post Telegram',
      category: 'Post Views',
      pricePer1000: 5000,
      providerCostPer1000: 1500,
      min: 500,
      max: 500000,
      averageSpeed: '2-10 phút',
      refillSupported: false,
      cancelSupported: false,
      description: 'Tăng mắt xem 1 hoặc nhiều bài viết gần nhất trong channel.',
      active: true,
    },
  },

  twitter: {
    x_follow_global: {
      serviceCode: 'X_FOLLOW_GLOBAL',
      name: 'Tăng Follow X / Twitter',
      category: 'Follow',
      pricePer1000: 80000,
      providerCostPer1000: 45000,
      min: 100,
      max: 50000,
      averageSpeed: '30-120 phút',
      refillSupported: true,
      cancelSupported: true,
      description: 'Tăng follower tài khoản Twitter chất lượng cao.',
      active: true,
    },
    x_like_tweet: {
      serviceCode: 'X_LIKE_TWEET',
      name: 'Tăng Like bài viết Twitter',
      category: 'Like',
      pricePer1000: 35000,
      providerCostPer1000: 18000,
      min: 100,
      max: 50000,
      averageSpeed: '10-30 phút',
      refillSupported: true,
      cancelSupported: false,
      description: 'Thả tim bài viết / tweet Twitter.',
      active: true,
    },
  },

  freefire: {
    ff_like_profile: {
      serviceCode: 'FF_LIKE_PROFILE',
      name: 'Tăng Like Profile Free Fire',
      category: 'Like Profile',
      pricePer1000: 50000,
      providerCostPer1000: 25000,
      min: 100,
      max: 10000,
      averageSpeed: '15-45 phút',
      refillSupported: true,
      cancelSupported: false,
      description: 'Tăng lượt thích cho hồ sơ tài khoản game Free Fire uy tín.',
      active: true,
    },
  },
};

export const SERVICE_COMBOS: ServiceComboConfig[] = [
  {
    id: 'combo-35k',
    name: 'Combo 35K Khởi Nghiệp',
    slug: 'combo-35k',
    badge: 'Tiết kiệm',
    description: 'Bộ tương tác cơ bản đẩy đề xuất video mới',
    price: 35000,
    originalPrice: 55000,
    items: [
      { name: 'Tim TikTok', qty: 800 },
      { name: 'Lượt xem', qty: 6000 },
      { name: 'Lượt lưu yêu thích', qty: 1000 },
      { name: 'Lượt chia sẻ', qty: 600 },
      { name: 'Follow Việt thật', qty: 40 },
    ],
    active: true,
    sortOrder: 1,
  },
  {
    id: 'combo-69k',
    name: 'Combo 69K Lên Xu Hướng',
    slug: 'combo-69k',
    badge: 'Phổ biến nhất',
    description: 'Tăng mạnh chỉ số thuật toán FYP kích hoạt đề xuất',
    price: 69000,
    originalPrice: 110000,
    items: [
      { name: 'Tim TikTok', qty: 2000 },
      { name: 'Lượt xem', qty: 15000 },
      { name: 'Lượt lưu yêu thích', qty: 2000 },
      { name: 'Lượt chia sẻ', qty: 1500 },
      { name: 'Follow Việt thật', qty: 70 },
    ],
    active: true,
    sortOrder: 2,
  },
  {
    id: 'combo-139k',
    name: 'Combo 139K Tăng Trưởng',
    slug: 'combo-139k',
    badge: 'Hot Viral',
    description: 'Bứt phá uy tín kênh, tăng trưởng lượt theo dõi và tương tác cao',
    price: 139000,
    originalPrice: 220000,
    items: [
      { name: 'Tim TikTok', qty: 4200 },
      { name: 'Lượt xem', qty: 35000 },
      { name: 'Lượt lưu yêu thích', qty: 4500 },
      { name: 'Lượt chia sẻ', qty: 3000 },
      { name: 'Follow Việt thật', qty: 110 },
    ],
    active: true,
    sortOrder: 3,
  },
  {
    id: 'combo-269k',
    name: 'Combo 269K KOC VIP',
    slug: 'combo-269k',
    badge: 'VIP Pro',
    description: 'Gói toàn diện tối đa tỷ lệ chuyển đổi, dành cho Creator và Livestream',
    price: 269000,
    originalPrice: 450000,
    items: [
      { name: 'Tim TikTok', qty: 8500 },
      { name: 'Lượt xem', qty: 80000 },
      { name: 'Lượt lưu yêu thích', qty: 9000 },
      { name: 'Lượt chia sẻ', qty: 6000 },
      { name: 'Follow Việt thật', qty: 170 },
    ],
    active: true,
    sortOrder: 4,
  },
];

export const COMBOS_CONFIG = SERVICE_COMBOS;

export const DEFAULT_MARKUP_PERCENT = 40; // Mặc định tăng 40% so với giá gốc Provider

/**
 * Tính giá bán lẻ dựa trên giá gốc nhà cung cấp + % lợi nhuận (mặc định 40%)
 */
export function calculateMarkupPrice(providerCostPer1000: number, markupPercent: number = DEFAULT_MARKUP_PERCENT): number {
  if (!providerCostPer1000 || providerCostPer1000 <= 0) return 0;
  return Math.round(providerCostPer1000 * (1 + markupPercent / 100));
}

/**
 * Tính giá đơn hàng an toàn (VNĐ)
 */
export function calculateOrderPrice(quantity: number, pricePer1000: number): number {
  if (!quantity || quantity <= 0 || !pricePer1000 || pricePer1000 <= 0) return 0;
  return Math.round((quantity * pricePer1000) / 1000);
}

export const calculateServicePrice = calculateOrderPrice;

/**
 * Lấy danh sách phẳng tất cả các dịch vụ mặc định
 */
export function getAllDefaultServices(): (ServiceItemConfig & { platformSlug: string })[] {
  const list: (ServiceItemConfig & { platformSlug: string })[] = [];
  for (const [platformSlug, services] of Object.entries(SERVICE_PRICING)) {
    for (const service of Object.values(services)) {
      list.push({ ...service, platformSlug });
    }
  }
  return list;
}

/**
 * Tìm dịch vụ theo mã code
 */
export function getServiceByCode(serviceCode: string): (ServiceItemConfig & { platformSlug: string }) | undefined {
  for (const [platformSlug, services] of Object.entries(SERVICE_PRICING)) {
    for (const service of Object.values(services)) {
      if (service.serviceCode.toUpperCase() === serviceCode.toUpperCase()) {
        return { ...service, platformSlug };
      }
    }
  }
  return undefined;
}
