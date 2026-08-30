import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconSizeMap = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  const heartSizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const titleSizeMap = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2.5 group shrink-0 select-none">
      {/* Glowing Heart Icon Container */}
      <div
        className={`relative ${iconSizeMap[size]} bg-gradient-to-tr from-rose-600 via-pink-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:shadow-rose-500/50 group-hover:scale-105 transition-all duration-300`}
      >
        <Heart className={`${heartSizeMap[size]} text-white fill-white drop-shadow-md animate-pulse`} />
        <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-300 drop-shadow animate-bounce" />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <span
          className={`font-black ${titleSizeMap[size]} tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-rose-100 to-pink-400 leading-tight`}
        >
          KHÔI BUFF TIM
        </span>
        {showSubtitle && (
          <span className="text-[9px] uppercase tracking-widest text-pink-300/90 font-bold -mt-0.5">
            Tăng Tương Tác 24/7
          </span>
        )}
      </div>
    </div>
  );
};
