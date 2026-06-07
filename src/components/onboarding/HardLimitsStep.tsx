'use client';

import { TAG_CATEGORIES } from '@/types';

interface HardLimitsStepProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function HardLimitsStep({ value, onChange }: HardLimitsStepProps) {
  // Let's grab some key tags from common categories for the checklist
  const boundaryCategories = [
    {
      category: 'Penetration & Intensity',
      tags: ['anal sex', 'anal play', 'deep spot', 'oral sex'],
    },
    {
      category: 'Stimulation & Styles',
      tags: ['doggy style', 'cowgirl', '69 sex position', 'feet kissing'],
    },
    {
      category: 'Difficulty & Level',
      tags: ['hard', 'crazy', 'neutral'],
    },
  ];

  const handleToggle = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gradient-rose">
          SET BOUNDARIES
        </h2>
        <p className="text-muted text-sm mt-2 font-sans font-light">
          Expose cards matching your comfort level. Selected categories will be filtered out.
        </p>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto max-h-[45vh] pr-2">
        {boundaryCategories.map((group) => (
          <div key={group.category} className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-secondary font-sans">
              {group.category}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {group.tags.map((tag) => {
                const isExcluded = value.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggle(tag)}
                    className={`p-3 text-xs font-semibold uppercase tracking-wider rounded-[var(--radius-card)] border transition-all duration-200 text-center select-none ${
                      isExcluded
                        ? 'bg-danger/10 border-danger text-danger shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                        : 'bg-surface-elevated/50 border-surface-elevated text-muted hover:text-contrast hover:border-muted/30'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
