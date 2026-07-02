'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export default function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-surface-light border border-primary/20 rounded-xl p-5 shadow-glow-subtle flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-muted text-sm font-medium tracking-wide">{title}</span>
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-secondary" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-black text-contrast">{value}</span>
        {trend && (
          <span className={`text-xs font-bold ${trendUp ? 'text-green-400' : 'text-rose-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </div>
  );
}
