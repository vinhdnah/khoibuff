import { z } from 'zod';

/**
 * Validate định dạng link hoặc target cho từng nền tảng mạng xã hội
 */
export function validatePlatformTarget(platformSlug: string, target: string): { isValid: boolean; message?: string; errorMessage?: string } {
  if (!target || !target.trim()) {
    const msg = 'Vui lòng nhập đường dẫn (link) hoặc mục tiêu cần xử lý.';
    return { isValid: false, message: msg, errorMessage: msg };
  }

  const cleanTarget = target.trim();

  switch (platformSlug.toLowerCase()) {
    case 'tiktok': {
      // Cho phép link tiktok (video, profile, photo) hoặc username @username
      const tiktokPattern = /^(https?:\/\/)?(www\.|vt\.|vm\.)?tiktok\.com\/.*$/i;
      const usernamePattern = /^@[a-zA-Z0-9_.-]+$/;
      if (!tiktokPattern.test(cleanTarget) && !usernamePattern.test(cleanTarget)) {
        const msg = 'Link TikTok không hợp lệ. Vui lòng nhập link dạng: https://www.tiktok.com/@username/video/... hoặc @username';
        return { isValid: false, message: msg, errorMessage: msg };
      }
      return { isValid: true };
    }

    case 'facebook': {
      // Cho phép link facebook (post, profile, page, reel, watch, group) hoặc ID số
      const fbPattern = /^(https?:\/\/)?(www\.|m\.|web\.)?facebook\.com\/.*$/i;
      const fbShortPattern = /^(https?:\/\/)?fb\.watch\/.*$/i;
      const fbNumericId = /^[0-9]{5,20}$/;
      if (!fbPattern.test(cleanTarget) && !fbShortPattern.test(cleanTarget) && !fbNumericId.test(cleanTarget)) {
        return {
          isValid: false,
          message: 'Link Facebook không hợp lệ. Vui lòng nhập link dạng: https://www.facebook.com/... hoặc ID bài viết.',
        };
      }
      return { isValid: true };
    }

    case 'instagram': {
      // Cho phép link instagram (p, reel, tv, profile) hoặc username
      const igPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/.*$/i;
      const igUsername = /^[a-zA-Z0-9_.-]{1,30}$/;
      if (!igPattern.test(cleanTarget) && !igUsername.test(cleanTarget)) {
        return {
          isValid: false,
          message: 'Link Instagram không hợp lệ. Vui lòng nhập link dạng: https://www.instagram.com/p/... hoặc username.',
        };
      }
      return { isValid: true };
    }

    case 'youtube': {
      // Cho phép link youtube (watch, shorts, channel, youtu.be)
      const ytPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.*$/i;
      if (!ytPattern.test(cleanTarget)) {
        return {
          isValid: false,
          message: 'Link YouTube không hợp lệ. Vui lòng nhập link dạng: https://www.youtube.com/watch?v=... hoặc https://youtu.be/...',
        };
      }
      return { isValid: true };
    }

    case 'telegram': {
      // Cho phép link t.me hoặc @username
      const tgPattern = /^(https?:\/\/)?(t\.me|telegram\.me)\/.*$/i;
      const tgUsername = /^@[a-zA-Z0-9_]{4,32}$/;
      if (!tgPattern.test(cleanTarget) && !tgUsername.test(cleanTarget)) {
        return {
          isValid: false,
          message: 'Link Telegram không hợp lệ. Vui lòng nhập link dạng: https://t.me/... hoặc @username',
        };
      }
      return { isValid: true };
    }

    case 'twitter':
    case 'x': {
      // Cho phép link twitter.com, x.com hoặc @username
      const twitterPattern = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.*$/i;
      const twitterUser = /^@[a-zA-Z0-9_]{1,15}$/;
      if (!twitterPattern.test(cleanTarget) && !twitterUser.test(cleanTarget)) {
        return {
          isValid: false,
          message: 'Link X / Twitter không hợp lệ. Vui lòng nhập link dạng: https://x.com/username/status/... hoặc @username',
        };
      }
      return { isValid: true };
    }

    case 'freefire': {
      // Cho phép UID game số (8-12 chữ số)
      const uidPattern = /^[0-9]{6,15}$/;
      if (!uidPattern.test(cleanTarget)) {
        return {
          isValid: false,
          message: 'UID Free Fire không hợp lệ. Vui lòng nhập dãy số UID từ 6 đến 15 chữ số.',
        };
      }
      return { isValid: true };
    }

    default:
      return { isValid: true };
  }
}

/**
 * Zod Schemas
 */
export const orderSchema = z.object({
  serviceId: z.string().min(1, 'Vui lòng chọn dịch vụ'),
  targetUrl: z.string().min(3, 'Vui lòng nhập link hợp lệ'),
  quantity: z.number().int().positive('Số lượng phải là số nguyên dương'),
  customComments: z.string().optional(),
});

export const depositSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Vui lòng nhập số tiền hợp lệ' })
    .min(10000, 'Số tiền nạp tối thiểu là 10.000 VNĐ')
    .max(500000000, 'Số tiền nạp tối đa là 500.000.000 VNĐ'),
});

export const ticketSchema = z.object({
  subject: z.string().min(5, 'Tiêu đề ticket phải có ít nhất 5 ký tự').max(150, 'Tiêu đề tối đa 150 ký tự'),
  category: z.enum(['order', 'payment', 'service', 'api', 'other']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  message: z.string().min(10, 'Nội dung yêu cầu hỗ trợ phải có ít nhất 10 ký tự'),
  orderId: z.string().optional(),
});
