'use client';

import { type ReactNode, type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'primary' | 'gold' | 'none';
  hover?: boolean;
  children: ReactNode;
}

const glowStyles = {
  primary: 'border-primary/30 shadow-[0_0_15px_rgba(255,51,102,0.3)]',
  gold: 'border-secondary/30 shadow-[0_0_15px_rgba(157,78,221,0.3)]',
  none: 'border-white/10 shadow-none',
};

const hoverGlowStyles = {
  primary: 'hover:shadow-[0_0_30px_rgba(255,51,102,0.5)] hover:border-primary/50',
  gold: 'hover:shadow-[0_0_30px_rgba(157,78,221,0.5)] hover:border-secondary/50',
  none: 'hover:border-white/20',
};

export default function Card({
  glow = 'primary',
  hover = true,
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={[
        'glass rounded-[var(--radius-card)]',
        'border transition-all duration-300',
        glowStyles[glow],
        hover ? hoverGlowStyles[glow] : '',
        className,
      ].join(' ')}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}
