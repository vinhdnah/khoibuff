-- Seed Data: Platforms, Services, Combos & Demo Providers

-- 1. Insert Platforms
INSERT INTO public.platforms (id, name, slug, icon, description, sort_order) VALUES
('11111111-1111-1111-1111-111111111101', 'TikTok', 'tiktok', 'Music2', 'Buff Tim, View, Follow, Comment, Share TikTok chất lượng cao không tụt', 1),
('11111111-1111-1111-1111-111111111102', 'Facebook', 'facebook', 'Facebook', 'Buff Like, Follow page/cá nhân, Member group, View video & Story Facebook', 2),
('11111111-1111-1111-1111-111111111103', 'Instagram', 'instagram', 'Instagram', 'Tăng Follow, Like, View Reel & Story Instagram uy tín, an toàn tài khoản', 3),
('11111111-1111-1111-1111-111111111104', 'YouTube', 'youtube', 'Youtube', 'Tăng Subscribers, View 4000 giờ, Like & Comment video/Shorts YouTube', 4),
('11111111-1111-1111-1111-111111111105', 'Telegram', 'telegram', 'Send', 'Tăng Member Channel/Group, Post Views, Reactions, Story Views Telegram', 5),
('11111111-1111-1111-1111-111111111106', 'X / Twitter', 'twitter', 'Twitter', 'Tăng Followers, Likes, Retweets, Impressions cho tài khoản X/Twitter', 6),
('11111111-1111-1111-1111-111111111107', 'Free Fire', 'freefire', 'Gamepad2', 'Tăng Like Profile game Free Fire uy tín', 7)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- 2. Insert Default Mock Provider
INSERT INTO public.smm_providers (id, name, slug, api_url, api_key, balance, is_mock) VALUES
('22222222-2222-2222-2222-222222222201', 'Mock SMM Engine (Internal)', 'mock-internal', 'https://mock.smm-api.local/v2', 'mock_secret_key_123', 50000000.00, true)
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Combos (From Image 1)
INSERT INTO public.service_combos (name, slug, badge, description, price, original_price, items, sort_order) VALUES
('Combo 30K', 'combo-30k', 'Tiết kiệm', 'Gói khởi đầu tăng tương tác toàn diện cho video / bài viết', 30000, 45000, '[{"name": "2.000 Tim", "qty": 2000}, {"name": "3.000 View", "qty": 3000}, {"name": "1.500 Yêu thích", "qty": 1500}, {"name": "500 Share", "qty": 500}, {"name": "50 Follow Việt", "qty": 50}]'::jsonb, 1),
('Combo 50K', 'combo-50k', 'Phổ biến', 'Gói nâng cao đẩy bài viết lên đề xuất và xu hướng nhanh chóng', 50000, 75000, '[{"name": "3.000 Tim", "qty": 3000}, {"name": "5.000 View", "qty": 5000}, {"name": "2.000 Yêu thích", "qty": 2000}, {"name": "1.500 Share", "qty": 1500}, {"name": "10 Comment Việt", "qty": 10}, {"name": "100 Follow Việt", "qty": 100}]'::jsonb, 2),
('Combo 80K', 'combo-80k', 'Hot', 'Tối ưu tương tác viral mạnh mẽ, tăng độ uy tín profile', 80000, 120000, '[{"name": "4.000 Tim", "qty": 4000}, {"name": "7.000 View", "qty": 7000}, {"name": "3.000 Yêu thích", "qty": 3000}, {"name": "2.000 Share", "qty": 2000}, {"name": "20 Comment Việt", "qty": 20}, {"name": "150 Follow Việt", "qty": 150}]'::jsonb, 3),
('Combo 100K', 'combo-100k', 'VIP Pro', 'Gói VIP tối đa chuyển đổi, cam kết hiệu quả và chất lượng', 100000, 160000, '[{"name": "6.000 Tim", "qty": 6000}, {"name": "10.000 View", "qty": 10000}, {"name": "5.000 Yêu thích", "qty": 5000}, {"name": "3.000 Share", "qty": 3000}, {"name": "50 Comment Việt", "qty": 50}, {"name": "200 Follow Việt", "qty": 200}]'::jsonb, 4)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, items = EXCLUDED.items;

-- 4. Insert Services (From Image 2 and Prompt specifications)
-- TIKTOK SERVICES
INSERT INTO public.services (platform_id, service_code, name, slug, description, category, min_quantity, max_quantity, price_per_1000, provider_price_per_1000, refill_supported, cancel_supported, average_speed, sort_order) VALUES
('11111111-1111-1111-1111-111111111101', 'TT_LIKE_GLOBAL', '1k Tim Tây (Không tụt)', '1k-tim-tay-khong-tut', 'Tim quốc tế chất lượng cao, tốc độ ổn định, bảo hành vĩnh viễn', 'Tim / Like', 100, 500000, 15000.00, 8000.00, true, true, '5-15 phút', 1),
('11111111-1111-1111-1111-111111111101', 'TT_LIKE_VN', '1k Tim Việt (Không tụt)', '1k-tim-viet-khong-tut', 'Tim tài khoản người dùng Việt Nam thật 100%, tăng tương tác chuẩn', 'Tim / Like', 100, 200000, 30000.00, 18000.00, true, true, '5-30 phút', 2),
('11111111-1111-1111-1111-111111111101', 'TT_VIEW_FAST', '1k View (Không tụt)', '1k-view-khong-tut', 'Tăng lượt xem video TikTok siêu tốc độ, hỗ trợ cắn xu hướng', 'Lượt xem (View)', 1000, 10000000, 5000.00, 1500.00, false, false, '1-5 phút', 3),
('11111111-1111-1111-1111-111111111101', 'TT_VIEW_BULK', '10k View (Không tụt)', '10k-view-khong-tut', 'Gói View số lượng lớn giá ưu đãi đặc biệt', 'Lượt xem (View)', 10000, 50000000, 1500.00, 600.00, false, false, '5-15 phút', 4),
('11111111-1111-1111-1111-111111111101', 'TT_FAV', '1k Yêu thích (Save)', '1k-yeu-thich', 'Tăng lưu video vào danh sách yêu thích', 'Yêu thích / Save', 100, 100000, 3000.00, 1200.00, true, false, '10-30 phút', 5),
('11111111-1111-1111-1111-111111111101', 'TT_SHARE', '1k Share video', '1k-share-video', 'Tăng chia sẻ video TikTok đẩy mạnh đề xuất', 'Chia sẻ (Share)', 100, 50000, 5000.00, 2000.00, false, false, '5-20 phút', 6),
('11111111-1111-1111-1111-111111111101', 'TT_CMT_REAL_VN', '1k Bình luận Việt thật', '1k-binh-luan-viet-that', 'Bình luận theo nội dung tùy chỉnh từ người dùng Việt thật', 'Bình luận (Comment)', 10, 5000, 55000.00, 35000.00, false, true, '15-60 phút', 7),
('11111111-1111-1111-1111-111111111101', 'TT_CMT_LIKE', '1k Tim Bình luận', '1k-tim-binh-luan', 'Thả tim đẩy top bình luận nổi bật trên video', 'Bình luận (Comment)', 50, 20000, 15000.00, 7000.00, true, false, '5-25 phút', 8),
('11111111-1111-1111-1111-111111111101', 'TT_FOLLOW_VN_SLOW', '1k Follow Việt / Tây (Chậm ko tụt)', '1k-follow-viet-tay-cham', 'Tăng theo dõi tự nhiên an toàn tuyệt đối, bảo hành 30 ngày', 'Theo dõi (Follow)', 100, 50000, 60000.00, 38000.00, true, true, '1-6 giờ', 9),
('11111111-1111-1111-1111-111111111101', 'TT_FOLLOW_GLOBAL', '1k Follow Tây (Không tụt)', '1k-follow-tay-khong-tut', 'Follow quốc tế tốc độ cao, tài khoản avatar đầy đủ', 'Theo dõi (Follow)', 100, 100000, 130000.00, 85000.00, true, true, '30-90 phút', 10),
('11111111-1111-1111-1111-111111111101', 'TT_LIVE_VIEW', 'Tăng view livestream TikTok', 'tang-view-livestream-tiktok', 'Mắt xem livestream ổn định trong suốt phiên live', 'Livestream', 50, 10000, 45000.00, 25000.00, false, false, 'Ngay lập tức', 11),
('11111111-1111-1111-1111-111111111101', 'TT_LIVE_LIKE', 'Tăng tim livestream TikTok', 'tang-tim-livestream-tiktok', 'Thả tim liên tục tạo hiệu ứng sôi động cho phòng live', 'Livestream', 1000, 1000000, 8000.00, 3500.00, false, false, 'Ngay lập tức', 12)
ON CONFLICT (service_code) DO NOTHING;

-- FACEBOOK SERVICES
INSERT INTO public.services (platform_id, service_code, name, slug, description, category, min_quantity, max_quantity, price_per_1000, provider_price_per_1000, refill_supported, cancel_supported, average_speed, sort_order) VALUES
('11111111-1111-1111-1111-111111111102', 'FB_LIKE_POST', '1k Like Tây / Việt bài viết', '1k-like-tay-viet', 'Tăng like bài viết trang cá nhân hoặc fanpage chất lượng', 'Like bài viết', 100, 100000, 25000.00, 12000.00, true, true, '5-20 phút', 1),
('11111111-1111-1111-1111-111111111102', 'FB_VIEW_VIDEO', '1k View video', '1k-view-video-fb', 'Tăng lượt xem video Facebook Reels / Watch', 'Lượt xem (View)', 1000, 5000000, 5000.00, 1800.00, false, false, '2-10 phút', 2),
('11111111-1111-1111-1111-111111111102', 'FB_VIEW_BULK', '10k View video', '10k-view-video-fb', 'Gói xem video số lượng lớn Facebook giá cực tốt', 'Lượt xem (View)', 10000, 20000000, 1500.00, 600.00, false, false, '5-20 phút', 3),
('11111111-1111-1111-1111-111111111102', 'FB_SHARE_POST', '1k Share bài viết', '1k-share-fb', 'Share bài viết lên tường công khai', 'Chia sẻ (Share)', 100, 20000, 5000.00, 2200.00, false, false, '10-30 phút', 4),
('11111111-1111-1111-1111-111111111102', 'FB_CMT_REAL_VN', '1k Bình luận Việt thật', '1k-cmt-viet-that-fb', 'Bình luận tùy chọn theo kịch bản từ nick Việt thật', 'Bình luận (Comment)', 10, 5000, 55000.00, 32000.00, false, true, '15-60 phút', 5),
('11111111-1111-1111-1111-111111111102', 'FB_FOLLOW_PAGE_USER', '1k Follow Page / Cá nhân', '1k-follow-page-ca-nhan', 'Tăng người theo dõi profile cá nhân hoặc Fanpage chế độ chuyên nghiệp', 'Theo dõi (Follow)', 100, 100000, 45000.00, 26000.00, true, true, '30-120 phút', 6),
('11111111-1111-1111-1111-111111111102', 'FB_VIEW_STORY', '1k View Story 24h', '1k-view-story-fb', 'Tăng mắt xem tin Story Facebook', 'Story', 500, 50000, 15000.00, 7000.00, false, false, '5-15 phút', 7),
('11111111-1111-1111-1111-111111111102', 'FB_GROUP_MEMBER', '1k Thành viên nhóm Việt', '1k-thanh-vien-nhom-viet', 'Tăng thành viên group Facebook người dùng Việt thật', 'Thành viên Group', 500, 100000, 25000.00, 14000.00, true, false, '1-6 giờ', 8),
('11111111-1111-1111-1111-111111111102', 'FB_LIVE_120M', '1k Mắt xem Livestream (120 phút)', '1k-mat-live-120m', 'Giữ mắt xem livestream Facebook liên tục 120 phút', 'Livestream', 50, 5000, 70000.00, 42000.00, false, false, 'Ngay lập tức', 9)
ON CONFLICT (service_code) DO NOTHING;

-- INSTAGRAM SERVICES
INSERT INTO public.services (platform_id, service_code, name, slug, description, category, min_quantity, max_quantity, price_per_1000, provider_price_per_1000, refill_supported, cancel_supported, average_speed, sort_order) VALUES
('11111111-1111-1111-1111-111111111103', 'IG_FOLLOW_GLOBAL', '1k Follow Tây (Instagram)', '1k-follow-tay-ig', 'Tăng theo dõi Instagram tài khoản quốc tế có avatar & post', 'Theo dõi (Follow)', 100, 100000, 30000.00, 16000.00, true, true, '15-45 phút', 1),
('11111111-1111-1111-1111-111111111103', 'IG_FOLLOW_VN', '1k Follow Việt (Instagram)', '1k-follow-viet-ig', 'Tăng theo dõi Instagram người dùng Việt Nam thật', 'Theo dõi (Follow)', 100, 50000, 65000.00, 40000.00, true, true, '30-90 phút', 2),
('11111111-1111-1111-1111-111111111103', 'IG_LIKE_GLOBAL', '1k Like Tây bài viết / Reel', '1k-like-tay-ig', 'Thả tim bài viết / Reel Instagram quốc tế', 'Like / Tim', 100, 200000, 15000.00, 7000.00, true, true, '5-20 phút', 3),
('11111111-1111-1111-1111-111111111103', 'IG_LIKE_VN', '1k Like Việt bài viết / Reel', '1k-like-viet-ig', 'Thả tim bài viết / Reel Instagram người dùng Việt', 'Like / Tim', 100, 50000, 35000.00, 20000.00, true, true, '10-30 phút', 4),
('11111111-1111-1111-1111-111111111103', 'IG_VIEW_REEL', '1k View Reel / Video', '1k-view-ig', 'Lượt xem video Reel Instagram tốc độ tức thì', 'Lượt xem (View)', 1000, 5000000, 5000.00, 1800.00, false, false, '2-10 phút', 5),
('11111111-1111-1111-1111-111111111103', 'IG_VIEW_100K', '100k View Reel Instagram', '100k-view-ig', 'Gói 100k view siêu ưu đãi cho video dài và Reel', 'Lượt xem (View)', 100000, 20000000, 400.00, 180.00, false, false, '10-60 phút', 6),
('11111111-1111-1111-1111-111111111103', 'IG_SAVE_POST', '1k Yêu thích (Save post)', '1k-save-post-ig', 'Lưu bài viết Instagram tăng tương tác tự nhiên', 'Save & Share', 100, 50000, 5000.00, 2000.00, true, false, '10-30 phút', 7),
('11111111-1111-1111-1111-111111111103', 'IG_SHARE_POST', '1k Share bài viết', '1k-share-post-ig', 'Chia sẻ bài viết Instagram', 'Save & Share', 100, 50000, 5000.00, 2000.00, false, false, '10-30 phút', 8)
ON CONFLICT (service_code) DO NOTHING;

-- YOUTUBE, TELEGRAM, X, FREEFIRE SERVICES
INSERT INTO public.services (platform_id, service_code, name, slug, description, category, min_quantity, max_quantity, price_per_1000, provider_price_per_1000, refill_supported, cancel_supported, average_speed, sort_order) VALUES
('11111111-1111-1111-1111-111111111104', 'YT_VIEW_HIGH', 'Tăng lượt xem video YouTube', 'tang-luot-xem-youtube', 'View chất lượng cao, giữ chân xem tốt, an toàn bật kiếm tiền', 'Lượt xem', 1000, 2000000, 45000.00, 28000.00, true, true, '1-6 giờ', 1),
('11111111-1111-1111-1111-111111111104', 'YT_SUB_REAL', 'Tăng Subscribers YouTube (Bảo hành)', 'tang-sub-youtube', 'Tăng đăng ký kênh YouTube người dùng thật, bảo hành 60 ngày', 'Subscribers', 100, 20000, 150000.00, 95000.00, true, true, '6-24 giờ', 2),
('11111111-1111-1111-1111-111111111104', 'YT_LIKE_VIDEO', 'Tăng Like video YouTube', 'tang-like-youtube', 'Like video / Shorts YouTube không tụt', 'Like', 100, 50000, 25000.00, 12000.00, true, false, '15-45 phút', 3),
('11111111-1111-1111-1111-111111111105', 'TG_MEMBER_CHANNEL', 'Tăng members kênh/nhóm Telegram', 'tang-member-telegram', 'Thành viên thật vào channel / group Telegram', 'Thành viên', 100, 50000, 40000.00, 22000.00, true, true, '10-60 phút', 1),
('11111111-1111-1111-1111-111111111105', 'TG_POST_VIEW', 'Tăng lượt xem post Telegram', 'tang-view-post-telegram', 'Tăng mắt xem 1 hoặc nhiều bài viết gần nhất', 'Post Views', 500, 500000, 5000.00, 1500.00, false, false, '2-10 phút', 2),
('11111111-1111-1111-1111-111111111106', 'X_FOLLOW_GLOBAL', 'Tăng Follow X / Twitter', 'tang-follow-twitter', 'Tăng follower tài khoản Twitter chất lượng cao', 'Follow', 100, 50000, 80000.00, 45000.00, true, true, '30-120 phút', 1),
('11111111-1111-1111-1111-111111111106', 'X_LIKE_TWEET', 'Tăng Like bài viết Twitter', 'tang-like-twitter', 'Thả tim bài viết / tweet Twitter', 'Like', 100, 50000, 35000.00, 18000.00, true, false, '10-30 phút', 2),
('11111111-1111-1111-1111-111111111107', 'FF_LIKE_PROFILE', 'Tăng Like Profile Free Fire', 'tang-like-profile-ff', 'Tăng lượt thích cho hồ sơ tài khoản game Free Fire', 'Like Profile', 100, 10000, 50000.00, 25000.00, true, false, '15-45 phút', 1)
ON CONFLICT (service_code) DO NOTHING;
