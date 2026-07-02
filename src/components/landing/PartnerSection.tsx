'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Wifi, MessageSquare, Eye } from 'lucide-react';

const highlights = [
  {
    icon: Wifi,
    text: 'Share a private link — your partner joins instantly',
  },
  {
    icon: Eye,
    text: 'See each other\'s scratches appear in real-time',
  },
  {
    icon: MessageSquare,
    text: 'Built-in chat and live reactions',
  },
];

export default function PartnerSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-24 md:py-32 px-6 bg-black overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(136,14,79,0.06)_0%,transparent_70%)] blur-3xl" />
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
            Multiplayer Intimacy
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-contrast uppercase tracking-tight">
            Play Together, Anywhere
          </h2>
          <p className="text-xs md:text-sm text-muted font-light leading-relaxed max-w-md mx-auto">
            Whether you&rsquo;re across the room or across the world — every scratch, every reveal, is shared live.
          </p>
        </motion.div>

        {/* Visual mockup of shared session */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative w-full max-w-md aspect-[4/3] bg-surface-light/30 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-xl)] overflow-hidden"
        >
          {/* Shared card visual */}
          <div className="absolute inset-4 md:inset-6 bg-surface-light border border-primary/10 rounded-[var(--radius-card)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <div className="text-3xl">🫦</div>
              <span className="text-xs font-black uppercase tracking-widest text-secondary">
                Shared Discovery
              </span>
              <span className="text-[10px] text-muted font-light">
                Both players scratch together
              </span>
            </div>
          </div>

          {/* Player 1 avatar (left) */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-3 left-3 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark border-2 border-primary/50 flex items-center justify-center text-[10px] font-black text-contrast shadow-glow"
          >
            P1
          </motion.div>

          {/* Player 2 avatar (right) */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary-light border-2 border-secondary/50 flex items-center justify-center text-[10px] font-black text-surface shadow-glow-gold"
          >
            P2
          </motion.div>

          {/* Ghost scratch strokes animation */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-30">
            <motion.line
              x1="30%" y1="40%" x2="55%" y2="55%"
              stroke="var(--color-primary-light)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: [0, 0.6, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <motion.line
              x1="70%" y1="35%" x2="50%" y2="60%"
              stroke="var(--color-secondary)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: [0, 0.4, 0] } : {}}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }}
            />
          </svg>
        </motion.div>

        {/* Highlight points */}
        <div className="flex flex-col gap-4 w-full max-w-md">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-primary-light" />
                </div>
                <span className="text-xs md:text-sm text-muted font-light">
                  {item.text}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
