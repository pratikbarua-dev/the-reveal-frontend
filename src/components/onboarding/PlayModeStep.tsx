'use client';

import Card from '../ui/Card';
import { User, Users } from 'lucide-react';

interface PlayModeStepProps {
  value: 'solo' | 'partner';
  onChange: (value: 'solo' | 'partner') => void;
}

export default function PlayModeStep({ value, onChange }: PlayModeStepProps) {
  const options = [
    {
      mode: 'solo' as const,
      label: 'Play Solo',
      desc: 'Explore on your own. Discover positions at your own pace with no room codes needed.',
      icon: User,
      glow: 'gold' as const,
    },
    {
      mode: 'partner' as const,
      label: 'Play with a Partner',
      desc: 'Create or join a live session. Scratch, reveal, and discover together in real time.',
      icon: Users,
      glow: 'primary' as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gradient-rose">
          HOW DO YOU WANT TO PLAY?
        </h2>
        <p className="text-muted text-sm mt-2 font-sans font-light">
          Choose your experience. You can always change this later in settings.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.mode;

          return (
            <Card
              key={opt.mode}
              glow={isSelected ? opt.glow : 'none'}
              hover={true}
              onClick={() => onChange(opt.mode)}
              className={`p-5 flex items-center gap-4 cursor-pointer select-none transition-all ${
                isSelected ? 'bg-surface-elevated/40 border-opacity-100' : 'bg-surface-light border-opacity-20'
              }`}
            >
              <div
                className={`p-3 rounded-full transition-colors duration-200 ${
                  isSelected
                    ? opt.mode === 'solo'
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

              {/* Selection indicator */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  isSelected
                    ? opt.mode === 'solo'
                      ? 'border-secondary bg-secondary'
                      : 'border-primary bg-primary'
                    : 'border-muted-dark bg-transparent'
                }`}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-contrast" />
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
