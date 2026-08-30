import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isUp: boolean;
  };
  glowColor?: 'indigo' | 'pink' | 'emerald' | 'cyan' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  glowColor = 'indigo',
}) => {
  const glowMap = {
    indigo: 'from-indigo-500/15 via-indigo-500/5 to-transparent border-indigo-500/20 text-indigo-400',
    pink: 'from-pink-500/15 via-pink-500/5 to-transparent border-pink-500/20 text-pink-400',
    emerald: 'from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/20 text-emerald-400',
    cyan: 'from-cyan-500/15 via-cyan-500/5 to-transparent border-cyan-500/20 text-cyan-400',
    amber: 'from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/20 text-amber-400',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${glowMap[glowColor]} bg-surface/90 border backdrop-blur-md shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-slate-600 cursor-default`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-white/5">{icon}</div>
      </div>

      <div className="mt-3">
        <h4 className="text-2xl font-extrabold text-white tracking-tight">{value}</h4>
        <div className="flex items-center gap-2 mt-1.5">
          {trend && (
            <span
              className={`inline-flex items-center text-xs font-semibold gap-0.5 ${
                trend.isUp ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};
