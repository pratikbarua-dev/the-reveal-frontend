'use client';

import Card from '../ui/Card';
import { Users, Sparkles, FireExtinguisher } from 'lucide-react';

interface PartySizeStepProps {
  value: 2 | 3 | 4;
  onChange: (value: 2 | 3 | 4) => void;
}

export default function PartySizeStep({ value, onChange }: PartySizeStepProps) {
  const options = [
    {
      size: 2 as const,
      label: 'Couples',
      desc: 'Just the two of us. Classical discovery mode.',
      icon: Users,
      glow: 'primary' as const,
    },
    {
      size: 3 as const,
      label: 'Threesomes',
      desc: 'Adding a third. Explore new combinations.',
      icon: Sparkles,
      glow: 'gold' as const,
    },
    {
      size: 4 as const,
      label: 'Group Play',
      desc: 'ENM & Group fun. Multiplayer discovery.',
      icon: Sparkles,
      glow: 'primary' as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gradient-rose">
          SELECT PARTY SIZE
        </h2>
        <p className="text-muted text-sm mt-2 font-sans font-light">
          Choose the standard number of participants for your sessions.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.size;

          return (
            <Card
              key={opt.size}
              glow={isSelected ? opt.glow : 'none'}
              hover={true}
              onClick={() => onChange(opt.size)}
              className={`p-5 flex items-center gap-4 cursor-pointer select-none transition-all ${
                isSelected ? 'bg-surface-elevated/40 border-opacity-100' : 'bg-surface-light border-opacity-20'
              }`}
            >
              <div
                className={`p-3 rounded-full ${
                  isSelected
                    ? opt.size === 3
                      ? 'bg-secondary text-surface'
                      : 'bg-primary text-contrast'
                    : 'bg-surface-elevated text-muted'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-sm font-bold uppercase tracking-widest text-contrast">
                  {opt.label}
                </span>
                <span className="text-xs text-muted mt-1 leading-relaxed">
                  {opt.desc}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
