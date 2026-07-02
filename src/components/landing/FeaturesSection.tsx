'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link2, Sparkles, Heart } from 'lucide-react';

const features = [
  {
    num: '01',
    icon: Link2,
    title: 'Connect',
    description: 'Play solo for self-discovery, or generate a private room code to invite your partner from anywhere.',
  },
  {
    num: '02',
    icon: Sparkles,
    title: 'Reveal',
    description: 'Take turns scratching away the fog to unveil intimate positions, guided prompts, and shapes together.',
  },
  {
    num: '03',
    icon: Heart,
    title: 'Curate',
    description: 'Save your favorite discoveries to a personal library. Filter by spice level — from gentle to bold.',
  },
];

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-24 md:py-32 px-6 bg-black overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[30%] -right-[20%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.03)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-[30%] -left-[20%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(136,14,79,0.04)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center flex flex-col gap-3"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/80">
            The Experience
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-contrast uppercase tracking-tight">
            Three Steps To Discovery
          </h2>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 * idx }}
                className="group relative flex flex-col items-center gap-5 p-8 bg-surface-light/40 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-xl)] hover:border-primary/40 transition-all duration-500 hover:shadow-glow cursor-default"
              >
                {/* Number badge */}
                <span className="text-3xl font-black text-secondary/30 group-hover:text-secondary/60 transition-colors duration-500 absolute top-4 right-5">
                  {feature.num}
                </span>

                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-500">
                  <Icon className="w-5 h-5 text-primary-light group-hover:text-secondary transition-colors duration-500" />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-2 text-center">
                  <h3 className="text-sm font-black text-contrast uppercase tracking-widest">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted font-light leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
