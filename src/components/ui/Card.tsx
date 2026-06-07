'use client';

import { type ReactNode, type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'primary' | 'gold' | 'none';
  hover?: boolean;
  children: ReactNode;
}

const glowStyles = {
  primary: 'border-primary/30 shadow-[0_0_15px_rgba(136,14,79,0.3)]',
  gold: 'border-secondary/30 shadow-[0_0_15px_rgba(212,175,55,0.3)]',
  none: 'border-surface-elevated',
};

const hoverGlowStyles = {
  primary: 'hover:shadow-[0_0_30px_rgba(136,14,79,0.5)] hover:border-primary/50',
  gold: 'hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:border-secondary/50',
  none: '',
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
        'bg-surface-light rounded-[var(--radius-card)]',
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
