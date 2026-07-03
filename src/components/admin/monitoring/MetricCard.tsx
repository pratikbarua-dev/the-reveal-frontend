'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  children?: ReactNode;
  trend?: string;
}

export default function MetricCard({ title, value, unit, icon: Icon, children, trend }: MetricCardProps) {
  return (
    <div className="bg-surface border border-primary/20 rounded-xl p-5 shadow-glow-subtle flex flex-col gap-3">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
      </div>
      
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-black text-contrast tracking-tight">{value}</span>
        {unit && <span className="text-sm font-bold text-muted uppercase">{unit}</span>}
      </div>

      {trend && (
        <div className="text-[10px] text-muted font-medium tracking-wide">
          {trend}
        </div>
      )}

      {children && (
        <div className="mt-2 pt-3 border-t border-primary/10">
          {children}
        </div>
      )}
    </div>
  );
}
