'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const spiceLevels = [
  {
    level: 1,
    emoji: '🌶️',
    label: 'Gentle & Playful',
    description: 'Soft touches, tender explorations, and warm beginnings.',
    color: 'from-amber-900/30 to-orange-900/10',
    border: 'border-amber-700/30 hover:border-amber-600/50',
    glow: '0 0 20px rgba(217, 119, 6, 0.15)',
  },
  {
    level: 2,
    emoji: '🌶️🌶️',
    label: 'Adventurous & Bold',
    description: 'Push your comfort zone with confident, creative positions.',
    color: 'from-primary/30 to-primary-dark/10',
    border: 'border-primary/30 hover:border-primary/50',
    glow: '0 0 20px rgba(136, 14, 79, 0.2)',
  },
  {
    level: 3,
    emoji: '🌶️🌶️🌶️',
    label: 'Intense & Uninhibited',
    description: 'For those ready to explore the full spectrum of connection.',
    color: 'from-rose-900/30 to-red-900/10',
    border: 'border-rose-600/30 hover:border-rose-500/50',
    glow: '0 0 25px rgba(225, 29, 72, 0.2)',
  },
];

export default function SpiceSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-24 md:py-32 px-6 bg-surface overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(136,14,79,0.05)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-14">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center flex flex-col gap-3"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/80">
            Your Boundaries, Your Rules
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-contrast uppercase tracking-tight">
            Choose Your Intensity
          </h2>
          <p className="text-xs md:text-sm text-muted font-light leading-relaxed max-w-md mx-auto">
            Every session is yours to control. Filter cards by intensity so every reveal feels right.
          </p>
        </motion.div>

        {/* Spice Level Cards */}
        <div className="flex flex-col gap-4 w-full">
          {spiceLevels.map((spice, idx) => (
            <motion.div
              key={spice.level}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 * idx }}
              className={`relative flex items-center gap-5 p-5 md:p-6 bg-gradient-to-r ${spice.color} backdrop-blur-sm border ${spice.border} rounded-[var(--radius-xl)] transition-all duration-500 cursor-default group`}
              style={{ boxShadow: spice.glow }}
            >
              {/* Emoji */}
              <span className="text-2xl md:text-3xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                {spice.emoji}
              </span>

              {/* Text */}
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-black text-contrast uppercase tracking-wider">
                  {spice.label}
                </h3>
                <p className="text-xs text-muted/80 font-light leading-relaxed">
                  {spice.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
