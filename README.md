# 🚀 SMM PRO — Web Con Bán Dịch Vụ Mạng Xã Hội (Consumer Storefront)

Hệ thống Website Bán Dịch Vụ Mạng Xã Hội (Web Con / Client Storefront) hiện đại, tối ưu trải nghiệm khách hàng người dùng cuối, kết nối nhà cung cấp qua **API Site Social** và nạp tiền tự động qua **SePay MBBank**.

---

## 🏗️ 1. Kiến Trúc Tổng Thể (Architecture)

```
CUSTOMER WEBSITE (Storefront)
         ↓ (Browser Fetch)
SUPABASE / LOCALSTORE (Atomic Transactions & Wallet)
         ↓
SERVER-SIDE PROVIDER ABSTRACTION (`src/services/provider/site-social.ts`)
         ↓
API SITE SOCIAL (Upstream Provider Backend)
```

- **Child Reseller Web (Web Con)**: Tuyệt đối ẩn toàn bộ tài liệu API upstream, bảo vệ bí mật nguồn cung cấp.
- **Consumer-First UX**: Giao diện dạng sàn dịch vụ thương mại hiện đại, luồng đặt đơn 5 bước trực quan kèm popup xác nhận giỏ hàng, chống click trùng (Idempotency), không tạo cảm giác admin panel kỹ thuật.
- **SePay Automated Banking**: Tích hợp trực tiếp kiểm tra giao dịch MBBank tự động và sinh mã VietQR động 24/7.

---

## 🔌 2. Chi Tiết Mapping API Site Social

Dựa trên tài liệu Postman chính thức ([Postman Documenter](https://documenter.getpostman.com/view/7443180/2sA3XWdeSc)):

| Mục tiêu / Chức năng | Endpoint Site Social | Method | Request Payload (Body) | Response Data | Function được Map trong Project |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Tra cứu số dư Provider** | `/me` | `POST` | `token` | `{ status: 1, balance: 1500000, email: '...' }` | `SiteSocialProvider.getBalance()` |
| **Lấy danh sách giá gốc** | `/prices` | `POST` | `token, type?, server?` | `{ status: 1, data: [...] }` | `SiteSocialProvider.getServices()` |
| **TikTok Like** | `/tiktok/like_tiktok` | `POST` | `token, link, server, count, note` | `{ status: 1, msg: '...', order_id: 10666800 }` | `SiteSocialProvider.createOrder()` |
| **TikTok View** | `/tiktok/view_tiktok` | `POST` | `token, link, server, count, note` | `{ status: 1, msg: '...', order_id: 10666801 }` | `SiteSocialProvider.createOrder()` |
| **TikTok Follow** | `/tiktok/follow_tiktok` | `POST` | `token, link, server, count, note` | `{ status: 1, msg: '...', order_id: 10666802 }` | `SiteSocialProvider.createOrder()` |
| **TikTok Comment** | `/tiktok/comment_tiktok` | `POST` | `token, link, server, count, comments, note` | `{ status: 1, msg: '...', order_id: 10666803 }` | `SiteSocialProvider.createOrder()` |
| **TikTok Yêu Thích** | `/tiktok/favorite_tiktok` | `POST` | `token, link, server, count, note` | `{ status: 1, msg: '...', order_id: 10666804 }` | `SiteSocialProvider.createOrder()` |
| **TikTok Live** | `/tiktok/live_tiktok` | `POST` | `token, link, server, minute, count, note` | `{ status: 1, msg: '...', order_id: 10666805 }` | `SiteSocialProvider.createOrder()` |
| **Facebook Like Speed** | `/fb_speed/s_like` | `POST` | `token, uid, count, server, reaction, speed, url, note` | `{ status: 1, msg: '...', order_id: 10666806 }` | `SiteSocialProvider.createOrder()` |
| **Facebook Like Thường** | `/facebook/reactions` | `POST` | `token, uid, server, count, reaction, note` | `{ status: 1, msg: '...', order_id: 10666807 }` | `SiteSocialProvider.createOrder()` |
| **Facebook Follow** | `/facebook/follow` | `POST` | `token, uid, name, server, count, note` | `{ status: 1, msg: '...', order_id: 10666808 }` | `SiteSocialProvider.createOrder()` |
| **Facebook Like Page** | `/facebook/like_page` | `POST` | `token, uid, name, server, count, speed, note` | `{ status: 1, msg: '...', order_id: 10666809 }` | `SiteSocialProvider.createOrder()` |
| **Facebook Comment** | `/facebook/comment` | `POST` | `token, uid, server, list_comment, count, url, note` | `{ status: 1, msg: '...', order_id: 10666810 }` | `SiteSocialProvider.createOrder()` |
| **Facebook Share** | `/facebook/share` | `POST` | `token, url, uid, server, count, content, note` | `{ status: 1, msg: '...', order_id: 10666811 }` | `SiteSocialProvider.createOrder()` |
| **Facebook Group Member**| `/facebook/buff_group` | `POST` | `token, uid, name, server, count, speed_server_1, note`| `{ status: 1, msg: '...', order_id: 10666812 }` | `SiteSocialProvider.createOrder()` |
| **Instagram Like** | `/instagram/like_instagram` | `POST` | `token, link, count, server, speed, note` | `{ status: 1, msg: '...', order_id: 10666813 }` | `SiteSocialProvider.createOrder()` |
| **Instagram Follow** | `/instagram/follow_instagram`| `POST` | `token, link, count, server, speed, note` | `{ status: 1, msg: '...', order_id: 10666814 }` | `SiteSocialProvider.createOrder()` |
| **Instagram View** | `/instagram/view_instagram` | `POST` | `token, link, count, server, note` | `{ status: 1, msg: '...', order_id: 10666815 }` | `SiteSocialProvider.createOrder()` |
| **Instagram Comment** | `/instagram/comment_instagram`| `POST`| `token, link, speed, comments, note, server` | `{ status: 1, msg: '...', order_id: 10666816 }` | `SiteSocialProvider.createOrder()` |
| **YouTube Like** | `/youtube/like_youtube` | `POST` | `token, link, server, count, note` | `{ status: 1, msg: '...', order_id: 10666817 }` | `SiteSocialProvider.createOrder()` |
| **YouTube View** | `/youtube/view_youtube` | `POST` | `token, link, server, count, note` | `{ status: 1, msg: '...', order_id: 10666818 }` | `SiteSocialProvider.createOrder()` |
| **YouTube Sub** | `/youtube/sub_youtube` | `POST` | `token, link, server, count, note` | `{ status: 1, msg: '...', order_id: 10666819 }` | `SiteSocialProvider.createOrder()` |
| **YouTube View 4000H** | `/youtube/view_youtube_4k`| `POST` | `token, link, server, count, note` | `{ status: 1, msg: '...', order_id: 10666820 }` | `SiteSocialProvider.createOrder()` |
| **Telegram Member** | `/telegram/member_telegram` | `POST` | `token, link, server, count, note` | `{ status: 1, msg: '...', order_id: 10666821 }` | `SiteSocialProvider.createOrder()` |
| **Telegram View** | `/telegram/view_telegram` | `POST` | `token, link, server, post_count, count, note` | `{ status: 1, msg: '...', order_id: 10666822 }` | `SiteSocialProvider.createOrder()` |
| **Twitter Follow/Like** | `/twitter/follow_twitter` | `POST` | `token, link, server, count, note` | `{ status: 1, msg: '...', order_id: 10666823 }` | `SiteSocialProvider.createOrder()` |
| **Tra cứu trạng thái đơn**| `/orders` | `POST` | `token, id` | `{ status: 1, data: [{ start_count, current_count, remains, status }] }` | `SiteSocialProvider.getOrderStatus()` |
| **Bảo hành (Warranty)** | `/facebook/warranty` | `POST` | `token, id` | `{ status: 1, msg: 'Bảo hành thành công' }` | `SiteSocialProvider.refillOrder()` |
| **Hủy / Hoàn tiền** | `/facebook/refund` | `POST` | `token, id` | `{ status: 1, msg: 'Hoàn tiền thành công' }` | `SiteSocialProvider.cancelOrder()` |

---

## 💳 3. Tích Hợp Nạp Tiền SePay MBBank

Hệ thống kết nối trực tiếp với API SePay qua:
- **API Key**: `QZTNFZPBS1GVVRZWHUI97CYAAIDSKO2BMWPLJ4VCD0LKAYSFOCLHU0XX4MUPNO58`
- **Số tài khoản**: `1029384756` (MBBank)
- **Cơ chế hoạt động**:
  1. Khi người dùng bấm tạo mã nạp, hệ thống sinh ra mã QR VietQR SePay động:
     `https://qr.sepay.vn/img?acc=1029384756&bank=MBBank&amount={amount}&des={memo}`
  2. Người dùng chuyển khoản bằng App ngân hàng.
  3. Hệ thống gọi API SePay `https://my.sepay.vn/userapi/transactions/list` để kiểm tra biến động số dư và tự động duyệt tiền vào ví qua RPC nguyên tử.

---

## ⚙️ 4. Hướng Dẫn Vận Hành & Cấu Hình

### Bật / Tắt Mock Mode
- Trong file `.env`:
  - **Dùng Mock (Test không tốn tiền)**:
    ```env
    VITE_MOCK_PROVIDER=true
    ```
  - **Dùng API Thật (Site Social)**:
    ```env
    VITE_MOCK_PROVIDER=false
    VITE_SMM_PROVIDER_API_URL=https://api.yourdomain.com/api
    VITE_SMM_PROVIDER_API_KEY=your_token_site_social_here
    ```

### Cách Thay Đổi Giá Bán
- **Cách 1**: Mở file [`src/config/services.ts`](file:///d:/d%E1%BB%B1%20%C3%A1n%20l%E1%BB%8F/src/config/services.ts) và chỉnh sửa `pricePer1000`.
- **Cách 2**: Truy cập `/admin/services` với tài khoản Admin để chỉnh sửa trực tiếp trên giao diện quản trị.

### Thêm Dịch Vụ Mới
1. Thêm định nghĩa dịch vụ vào `SERVICE_PRICING` trong `src/config/services.ts`.
2. Map mã code sang endpoint tương ứng trong `SiteSocialProvider.determineEndpoint()`.

### Khởi Chạy Local & Deploy
```bash
# Cài đặt
npm install

# Chạy phát triển
npm run dev

# Chạy Unit Tests
npm run test

# Build Production
npm run build
```
