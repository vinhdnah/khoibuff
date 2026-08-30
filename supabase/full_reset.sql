-- ==============================================================================
-- KHÔI BUFF TIM / SMM PANEL - FULL DATABASE RESET & SETUP SCRIPT
-- Copy toàn bộ nội dung file này và chạy trong Supabase SQL Editor
-- ==============================================================================

-- 0. KÍCH HOẠT EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. XÓA SẠCH DỮ LIỆU CŨ (CLEAN RESET)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.ticket_messages CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;
DROP TABLE IF EXISTS public.deposits CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.combo_items CASCADE;
DROP TABLE IF EXISTS public.service_combos CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.smm_providers CASCADE;
DROP TABLE IF EXISTS public.platforms CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. TẠO CÁC BẢNG (TABLES)

-- 2.1 BẢNG PROFILES (Người dùng)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
    api_key TEXT UNIQUE,
    api_key_hash TEXT,
    deposit_code TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 BẢNG PLATFORMS (Nền tảng mạng xã hội)
CREATE TABLE public.platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 BẢNG SMM PROVIDERS (Nhà cung cấp SMM)
CREATE TABLE public.smm_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    api_url TEXT NOT NULL,
    api_key TEXT,
    balance NUMERIC(15, 2) DEFAULT 0.00,
    currency TEXT DEFAULT 'VND',
    active BOOLEAN NOT NULL DEFAULT true,
    is_mock BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4 BẢNG SERVICES (Dịch vụ)
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
    service_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Default',
    min_quantity INT NOT NULL DEFAULT 10,
    max_quantity INT NOT NULL DEFAULT 1000000,
    price_per_1000 NUMERIC(12, 2) NOT NULL,
    provider_price_per_1000 NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    provider_service_id TEXT,
    provider_id UUID REFERENCES public.smm_providers(id) ON DELETE SET NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    refill_supported BOOLEAN NOT NULL DEFAULT false,
    cancel_supported BOOLEAN NOT NULL DEFAULT false,
    average_speed TEXT DEFAULT '5-15 phút',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5 BẢNG ORDERS (Đơn hàng)
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code TEXT NOT NULL UNIQUE DEFAULT 'ORD' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    target_link TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(15, 2) NOT NULL CHECK (total_price >= 0),
    initial_count INT DEFAULT 0,
    current_count INT DEFAULT 0,
    remains INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'in_progress', 'completed', 'partial', 'cancelled', 'refunded')),
    provider_order_id TEXT,
    provider_status TEXT,
    provider_payload JSONB DEFAULT '{}'::jsonb,
    runs INT DEFAULT 1,
    interval_minutes INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.6 BẢNG DEPOSITS (Yêu cầu nạp tiền)
CREATE TABLE public.deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 1000),
    transfer_content TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'vietqr',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'failed')),
    bank_account TEXT DEFAULT '949333308',
    bank_name TEXT DEFAULT 'MBBank',
    account_holder TEXT DEFAULT 'HOANG THE VINH',
    qr_url TEXT,
    transaction_code TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.7 BẢNG WALLET TRANSACTIONS (Lịch sử biến động số dư)
CREATE TABLE public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'order_payment', 'refund', 'admin_adjustment', 'cashback')),
    amount NUMERIC(15, 2) NOT NULL,
    balance_before NUMERIC(15, 2) NOT NULL,
    balance_after NUMERIC(15, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    reference_id UUID,
    payment_method TEXT,
    transaction_code TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.8 BẢNG TICKETS & MESSAGES (Hỗ trợ khách hàng)
CREATE TABLE public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('order', 'payment', 'service', 'api', 'other')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'customer_reply', 'closed')),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    is_internal BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TỰ ĐỘNG TẠO PROFILE KHI CÓ USER AUTH (TRIGGER)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, email, username, full_name, role, status, balance, deposit_code
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Người dùng ' || split_part(NEW.email, '@', 1)),
        CASE WHEN NEW.email IN ('vinhdnah@gmail.com', 'vinhdnah1@gmail.com', 'khoiadmin@gmail.com') THEN 'admin' ELSE 'user' END,
        'active',
        CASE WHEN NEW.email IN ('vinhdnah@gmail.com', 'vinhdnah1@gmail.com', 'khoiadmin@gmail.com') THEN 100000000.00 ELSE 0.00 END,
        'SMM' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = CASE WHEN EXCLUDED.email IN ('vinhdnah@gmail.com', 'vinhdnah1@gmail.com', 'khoiadmin@gmail.com') THEN 'admin' ELSE public.profiles.role END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Đồng bộ ngay các user hiện tại trong auth.users sang public.profiles
INSERT INTO public.profiles (id, email, username, full_name, role, status, balance, deposit_code)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
    COALESCE(raw_user_meta_data->>'full_name', 'Người dùng ' || split_part(email, '@', 1)),
    CASE WHEN email IN ('vinhdnah@gmail.com', 'vinhdnah1@gmail.com', 'khoiadmin@gmail.com') THEN 'admin' ELSE 'user' END,
    'active',
    CASE WHEN email IN ('vinhdnah@gmail.com', 'vinhdnah1@gmail.com', 'khoiadmin@gmail.com') THEN 100000000.00 ELSE 0.00 END,
    'SMM' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0')
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    role = CASE WHEN EXCLUDED.email IN ('vinhdnah@gmail.com', 'vinhdnah1@gmail.com', 'khoiadmin@gmail.com') THEN 'admin' ELSE public.profiles.role END,
    balance = CASE WHEN EXCLUDED.email IN ('vinhdnah@gmail.com', 'vinhdnah1@gmail.com', 'khoiadmin@gmail.com') THEN 100000000.00 ELSE public.profiles.balance END;

-- 4. BẬT RLS VÀ PHÂN QUYỀN MỞ CHO PHÉP WEB TRUY CẬP

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Policy Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);

-- Policy Platforms & Services (Mọi người đều xem được)
CREATE POLICY "Platforms viewable by all" ON public.platforms FOR SELECT USING (true);
CREATE POLICY "Services viewable by all" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admin manage platforms" ON public.platforms FOR ALL USING (true);
CREATE POLICY "Admin manage services" ON public.services FOR ALL USING (true);

-- Policy Orders
CREATE POLICY "Orders viewable by creator or admin" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update orders" ON public.orders FOR UPDATE USING (true);

-- Policy Deposits
CREATE POLICY "Deposits viewable by all" ON public.deposits FOR SELECT USING (true);
CREATE POLICY "Users can create deposits" ON public.deposits FOR INSERT WITH CHECK (true);
CREATE POLICY "Deposits can be updated" ON public.deposits FOR UPDATE USING (true);

-- Policy Wallet Transactions
CREATE POLICY "Wallet tx viewable by all" ON public.wallet_transactions FOR SELECT USING (true);
CREATE POLICY "Wallet tx insertable" ON public.wallet_transactions FOR INSERT WITH CHECK (true);

-- Policy Tickets
CREATE POLICY "Tickets viewable by all" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Tickets insertable" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Ticket messages viewable by all" ON public.ticket_messages FOR SELECT USING (true);
CREATE POLICY "Ticket messages insertable" ON public.ticket_messages FOR INSERT WITH CHECK (true);

-- 5. NẠP DANH MỤC NỀN TẢNG (PLATFORMS)
INSERT INTO public.platforms (id, name, slug, icon, description, sort_order) VALUES
('11111111-1111-1111-1111-111111111101', 'TikTok', 'tiktok', 'tiktok', 'Dịch vụ tăng tương tác TikTok số 1 Việt Nam', 1),
('11111111-1111-1111-1111-111111111102', 'Facebook', 'facebook', 'facebook', 'Tăng Like, Follow, View Story Facebook uy tín', 2),
('11111111-1111-1111-1111-111111111103', 'Instagram', 'instagram', 'instagram', 'Tăng tương tác Instagram toàn cầu', 3),
('11111111-1111-1111-1111-111111111104', 'YouTube', 'youtube', 'youtube', 'Tăng View, Sub, Like YouTube an toàn bật kiếm tiền', 4),
('11111111-1111-1111-1111-111111111105', 'Telegram', 'telegram', 'telegram', 'Tăng Members channel và views bài viết Telegram', 5),
('11111111-1111-1111-1111-111111111106', 'Twitter (X)', 'twitter', 'twitter', 'Dịch vụ Twitter / X uy tín', 6),
('11111111-1111-1111-1111-111111111107', 'Free Fire', 'freefire', 'freefire', 'Dịch vụ tương tác Free Fire', 7)
ON CONFLICT (slug) DO NOTHING;

-- 6. NẠP DANH SÁCH DỊCH VỤ (SERVICES)
INSERT INTO public.services (platform_id, service_code, name, slug, description, category, min_quantity, max_quantity, price_per_1000, provider_price_per_1000, provider_service_id, refill_supported, cancel_supported, average_speed, sort_order) VALUES
-- TikTok
('11111111-1111-1111-1111-111111111101', 'TT_LIKE_CHEAP', 'Tăng Tim / Like Video TikTok (Sever Giá Rẻ)', 'tang-tim-tiktok-gia-re', 'Tăng tim video TikTok giá siêu rẻ, lên nhanh, tốc độ ổn định', 'Tăng Tim / Like', 50, 500000, 15000.00, 8500.00, '1477', false, false, '1-5 phút', 1),
('11111111-1111-1111-1111-111111111101', 'TT_LIKE_VIP', 'Tăng Tim TikTok Người Dùng Thật (Bảo Hành 30 Ngày)', 'tang-tim-tiktok-vip', 'Tim từ tài khoản TikTok thật, không tụt, có bảo hành 30 ngày', 'Tăng Tim / Like', 100, 100000, 35000.00, 20000.00, '1478', true, true, '5-15 phút', 2),
('11111111-1111-1111-1111-111111111101', 'TT_FOLLOW_FAST', 'Tăng Follow / Người Theo Dõi TikTok (Tốc Độ Cao)', 'tang-follow-tiktok-toc-do-cao', 'Tăng follow kênh TikTok nhanh chóng, giúp kênh đủ điều kiện livestream', 'Tăng Follow', 100, 50000, 65000.00, 42000.00, '1479', true, false, '10-30 phút', 3),
('11111111-1111-1111-1111-111111111101', 'TT_FOLLOW_VIET', 'Tăng Follow TikTok Nick Việt Nam Chuẩn', 'tang-follow-tiktok-viet-nam', 'Follow từ tài khoản người dùng Việt Nam thật 100%', 'Tăng Follow', 100, 20000, 120000.00, 85000.00, '1480', true, true, '30-60 phút', 4),
('11111111-1111-1111-1111-111111111101', 'TT_VIEW_INSTANT', 'Tăng Lượt Xem Video TikTok (Lên Ngay Lập Tức)', 'tang-view-tiktok-sieu-toc', 'View lên sau 1-3 phút, giúp video dễ dàng lên xu hướng TikTok', 'Lượt Xem (Views)', 1000, 10000000, 1500.00, 500.00, '1481', false, false, '1-3 phút', 5),
('11111111-1111-1111-1111-111111111101', 'TT_EYE_LIVE', 'Tăng Mắt Xem Livestream TikTok (30 Phút)', 'tang-mat-live-tiktok-30p', 'Tăng mắt xem live giúp phiên live sôi nổi và thu hút người xem thật', 'Livestream', 50, 10000, 45000.00, 25000.00, '1482', false, false, 'Ngay tức thì', 6),
('11111111-1111-1111-1111-111111111101', 'TT_SHARE_VIRAL', 'Tăng Lượt Chia Sẻ Video (Share TikTok)', 'tang-share-tiktok', 'Tăng lượt chia sẻ video giúp thuật toán đẩy đề xuất mạnh', 'Lưu & Share', 100, 100000, 8000.00, 3000.00, '1483', false, false, '5-15 phút', 7),
('11111111-1111-1111-1111-111111111101', 'TT_SAVE_BOOKMARK', 'Tăng Lượt Lưu Video Vào Mục Yêu Thích', 'tang-save-tiktok', 'Tăng lượt lưu video vào mục yêu thích tăng chỉ số tương tác', 'Lưu & Share', 100, 100000, 8000.00, 3000.00, '1484', false, false, '5-15 phút', 8),

-- Facebook
('11111111-1111-1111-1111-111111111102', 'FB_LIKE_POST', 'Tăng Like Bài Viết Facebook (Server Nhanh)', 'tang-like-post-fb', 'Tăng like bài viết trang cá nhân hoặc fanpage nhanh chóng', 'Tăng Like Bài Viết', 50, 100000, 12000.00, 6000.00, '1485', false, false, '5-10 phút', 1),
('11111111-1111-1111-1111-111111111102', 'FB_REACT_LOVE', 'Tăng Cảm Xúc Bài Viết (Thả Tim / Haha / Wow)', 'tang-cam-xuc-fb', 'Tùy chọn cảm xúc: Thả Tim, Haha, Thương Thương, Wow', 'Cảm Xúc', 50, 50000, 18000.00, 9500.00, '1486', false, false, '5-15 phút', 2),
('11111111-1111-1111-1111-111111111102', 'FB_FOLLOW_PROFILE', 'Tăng Follow Trang Cá Nhân Facebook (Nick Việt)', 'tang-follow-profile-fb', 'Tăng người theo dõi trang cá nhân FB người dùng Việt', 'Theo Dõi Cá Nhân', 100, 500000, 45000.00, 28000.00, '1487', true, true, '15-45 phút', 3),
('11111111-1111-1111-1111-111111111102', 'FB_LIKE_PAGE', 'Tăng Like & Follow Fanpage Facebook', 'tang-like-fanpage-fb', 'Tăng like và follow cho Fanpage, bảo hành không tụt', 'Tăng Like Page', 100, 100000, 55000.00, 35000.00, '1488', true, true, '30-60 phút', 4),
('11111111-1111-1111-1111-111111111102', 'FB_MEM_GROUP', 'Tăng Thành Viên Nhóm (Group Facebook)', 'tang-member-group-fb', 'Thêm thành viên nhóm Facebook công khai hoặc riêng tư', 'Thành Viên Nhóm', 100, 500000, 35000.00, 20000.00, '1489', true, true, '1-3 giờ', 5),
('11111111-1111-1111-1111-111111111102', 'FB_VIEW_REELS', 'Tăng View Video Facebook Reels / Watch', 'tang-view-reels-fb', 'View video Reels / Watch Facebook lên siêu tốc', 'Lượt Xem (Views)', 500, 5000000, 4000.00, 1500.00, '1490', false, false, '1-5 phút', 6),

-- Instagram
('11111111-1111-1111-1111-111111111103', 'IG_LIKE_HQ', 'Tăng Tim / Like Instagram Chất Lượng Cao', 'tang-like-ig-chat-luong', 'Like từ tài khoản có avatar, bài đăng, giữ lâu không tụt', 'Tăng Like', 50, 100000, 18000.00, 9000.00, '1491', true, false, '5-15 phút', 1),
('11111111-1111-1111-1111-111111111103', 'IG_FOLLOW_REAL', 'Tăng Follower Instagram (Bảo Hành 60 Ngày)', 'tang-follow-ig-bao-hanh', 'Follower chất lượng cao, có bảo hành nút bù tự động 60 ngày', 'Tăng Follower', 100, 100000, 65000.00, 38000.00, '1492', true, true, '10-30 phút', 2),
('11111111-1111-1111-1111-111111111103', 'IG_VIEW_REELS', 'Tăng View Reels Instagram', 'tang-view-reels-ig', 'View video Reels Instagram siêu nhanh', 'Lượt Xem (Views)', 500, 2000000, 3500.00, 1200.00, '1493', false, false, '1-5 phút', 3),

-- YouTube, Telegram, Twitter, Free Fire
('11111111-1111-1111-1111-111111111104', 'YT_VIEW_HIGH', 'Tăng lượt xem video YouTube', 'tang-luot-xem-youtube', 'View chất lượng cao, giữ chân xem tốt, an toàn bật kiếm tiền', 'Lượt xem', 1000, 2000000, 45000.00, 28000.00, '1494', true, true, '1-6 giờ', 1),
('11111111-1111-1111-1111-111111111104', 'YT_SUB_REAL', 'Tăng Subscribers YouTube (Bảo hành)', 'tang-sub-youtube', 'Tăng đăng ký kênh YouTube người dùng thật, bảo hành 60 ngày', 'Subscribers', 100, 20000, 150000.00, 95000.00, '1495', true, true, '6-24 giờ', 2),
('11111111-1111-1111-1111-111111111105', 'TG_MEMBER_CHANNEL', 'Tăng members kênh/nhóm Telegram', 'tang-member-telegram', 'Thành viên thật vào channel / group Telegram', 'Thành viên', 100, 50000, 40000.00, 22000.00, '1496', true, true, '10-60 phút', 1),
('11111111-1111-1111-1111-111111111106', 'X_FOLLOW_GLOBAL', 'Tăng Follow X / Twitter', 'tang-follow-twitter', 'Tăng follower tài khoản Twitter chất lượng cao', 'Follow', 100, 50000, 80000.00, 45000.00, '1497', true, true, '30-120 phút', 1),
('11111111-1111-1111-1111-111111111107', 'FF_LIKE_PROFILE', 'Tăng Like Profile Free Fire', 'tang-like-profile-ff', 'Tăng lượt thích cho hồ sơ tài khoản game Free Fire', 'Like Profile', 100, 10000, 50000.00, 25000.00, '1498', true, false, '15-45 phút', 1)
ON CONFLICT (service_code) DO NOTHING;
