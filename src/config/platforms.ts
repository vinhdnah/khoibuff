export interface PlatformConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  gradient: string;
  urlPlaceholder: string;
  urlPatternHint: string;
  sortOrder: number;
  icon?: string;
}

export const PLATFORMS_CONFIG: PlatformConfig[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    slug: 'tiktok',
    description: 'Buff Tim, View, Follow, Comment, Share TikTok chất lượng cao không tụt',
    color: '#00f2fe',
    gradient: 'from-cyan-500 to-pink-500',
    urlPlaceholder: 'https://www.tiktok.com/@username/video/1234567890',
    urlPatternHint: 'Link video TikTok hoặc link profile @username',
    sortOrder: 1,
    icon: 'tiktok',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    slug: 'facebook',
    description: 'Buff Like, Follow page/cá nhân, Member group, View video & Story Facebook',
    color: '#1877f2',
    gradient: 'from-blue-600 to-indigo-600',
    urlPlaceholder: 'https://www.facebook.com/username/posts/123456',
    urlPatternHint: 'Link bài viết, fanpage, profile hoặc group Facebook công khai',
    sortOrder: 2,
    icon: 'facebook',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    slug: 'instagram',
    description: 'Tăng Follow, Like, View Reel & Story Instagram uy tín, an toàn tài khoản',
    color: '#e1306c',
    gradient: 'from-pink-500 via-rose-500 to-amber-500',
    urlPlaceholder: 'https://www.instagram.com/p/Cxyz123/',
    urlPatternHint: 'Link bài viết, Reel hoặc profile Instagram công khai',
    sortOrder: 3,
    icon: 'instagram',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    slug: 'youtube',
    description: 'Tăng Subscribers, View 4000 giờ, Like & Comment video/Shorts YouTube',
    color: '#ff0000',
    gradient: 'from-red-600 to-rose-600',
    urlPlaceholder: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    urlPatternHint: 'Link video, Shorts hoặc kênh YouTube',
    sortOrder: 4,
    icon: 'youtube',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    slug: 'telegram',
    description: 'Tăng Member Channel/Group, Post Views, Reactions, Story Views Telegram',
    color: '#229ed9',
    gradient: 'from-sky-500 to-blue-500',
    urlPlaceholder: 'https://t.me/channel_or_post_link',
    urlPatternHint: 'Link public channel, group hoặc bài viết Telegram',
    sortOrder: 5,
    icon: 'telegram',
  },
  {
    id: 'twitter',
    name: 'X / Twitter',
    slug: 'twitter',
    description: 'Tăng Followers, Likes, Retweets, Impressions cho tài khoản X/Twitter',
    color: '#ffffff',
    gradient: 'from-slate-700 to-slate-900',
    urlPlaceholder: 'https://x.com/username/status/123456789',
    urlPatternHint: 'Link tweet hoặc link profile X / Twitter',
    sortOrder: 6,
    icon: 'twitter',
  },
  {
    id: 'freefire',
    name: 'Free Fire',
    slug: 'freefire',
    description: 'Tăng Like Profile game Free Fire uy tín',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    urlPlaceholder: 'UID game: 1234567890',
    urlPatternHint: 'UID tài khoản game Free Fire',
    sortOrder: 7,
    icon: 'freefire',
  },
];
