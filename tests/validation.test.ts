import { describe, it, expect } from 'vitest';
import { validatePlatformTarget } from '../src/lib/validation';

describe('Social Media URL Validation Test', () => {
  it('should validate TikTok URLs & usernames', () => {
    expect(validatePlatformTarget('tiktok', 'https://www.tiktok.com/@creator/video/739182391283').isValid).toBe(true);
    expect(validatePlatformTarget('tiktok', 'https://vt.tiktok.com/ZS2xY12/').isValid).toBe(true);
    expect(validatePlatformTarget('tiktok', '@my_username').isValid).toBe(true);
    expect(validatePlatformTarget('tiktok', 'invalid_url_not_tiktok').isValid).toBe(false);
  });

  it('should validate Facebook URLs', () => {
    expect(validatePlatformTarget('facebook', 'https://www.facebook.com/username/posts/123456789').isValid).toBe(true);
    expect(validatePlatformTarget('facebook', 'https://fb.watch/xyz123/').isValid).toBe(true);
    expect(validatePlatformTarget('facebook', '100089238129837').isValid).toBe(true);
    expect(validatePlatformTarget('facebook', 'google.com/test').isValid).toBe(false);
  });

  it('should validate Instagram URLs & usernames', () => {
    expect(validatePlatformTarget('instagram', 'https://www.instagram.com/p/Cxyz123/').isValid).toBe(true);
    expect(validatePlatformTarget('instagram', 'https://www.instagram.com/reel/Cxyz123/').isValid).toBe(true);
    expect(validatePlatformTarget('instagram', 'my_insta_user').isValid).toBe(true);
  });

  it('should validate YouTube URLs', () => {
    expect(validatePlatformTarget('youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ').isValid).toBe(true);
    expect(validatePlatformTarget('youtube', 'https://youtu.be/dQw4w9WgXcQ').isValid).toBe(true);
    expect(validatePlatformTarget('youtube', 'https://not-yt.com/watch').isValid).toBe(false);
  });
});
