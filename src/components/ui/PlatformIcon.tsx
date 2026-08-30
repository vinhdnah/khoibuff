import React from 'react';
import {
  Music2,
  Facebook,
  Instagram,
  Youtube,
  Send,
  Twitter,
  Gamepad2,
  Layers,
} from 'lucide-react';

interface PlatformIconProps {
  slug: string;
  className?: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ slug, className = 'w-4 h-4' }) => {
  switch (slug.toLowerCase()) {
    case 'tiktok':
      return <Music2 className={className} />;
    case 'facebook':
      return <Facebook className={className} />;
    case 'instagram':
      return <Instagram className={className} />;
    case 'youtube':
      return <Youtube className={className} />;
    case 'telegram':
      return <Send className={className} />;
    case 'twitter':
    case 'x':
      return <Twitter className={className} />;
    case 'freefire':
      return <Gamepad2 className={className} />;
    default:
      return <Layers className={className} />;
  }
};
