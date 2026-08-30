import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  const base = 'inline-flex items-center font-medium rounded-full select-none';

  const variants = {
    primary: 'bg-primary/15 text-primary-light border border-primary/25',
    secondary: 'bg-secondary/15 text-secondary-light border border-secondary/25',
    success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',
    danger: 'bg-rose-500/15 text-rose-300 border border-rose-500/25',
    info: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25',
    neutral: 'bg-slate-700/40 text-slate-300 border border-slate-600/30',
    outline: 'bg-transparent text-slate-300 border border-slate-600',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], sizes[size], className))} {...props}>
      {children}
    </span>
  );
};
