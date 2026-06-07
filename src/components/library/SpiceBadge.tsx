'use client';

import { SPICE_LABELS } from '@/types';

interface SpiceBadgeProps {
  level: 1 | 2 | 3;
}

const colorStyles = {
  1: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
  2: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
  3: 'bg-rose-500/10 border-rose-500/25 text-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]',
};

export default function SpiceBadge({ level }: SpiceBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest font-sans ${colorStyles[level]}`}
    >
      <span>{Array.from({ length: level }).map(() => '🌶️')}</span>
      <span>{SPICE_LABELS[level]}</span>
    </div>
  );
}
