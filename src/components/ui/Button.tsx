'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-primary text-contrast',
    'border border-primary-light/30',
    'shadow-[0_0_15px_rgba(136,14,79,0.3)]',
    'hover:shadow-[0_0_30px_rgba(136,14,79,0.5)]',
    'hover:bg-primary-light',
    'active:bg-primary-dark',
  ].join(' '),
  secondary: [
    'bg-transparent text-secondary',
    'border border-secondary/40',
    'shadow-[0_0_15px_rgba(212,175,55,0.2)]',
    'hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]',
    'hover:bg-secondary/10',
  ].join(' '),
  ghost: [
    'bg-transparent text-muted',
    'border border-transparent',
    'hover:text-contrast',
    'hover:bg-surface-elevated/50',
  ].join(' '),
  danger: [
    'bg-danger/10 text-danger',
    'border border-danger/30',
    'shadow-[0_0_15px_rgba(239,68,68,0.2)]',
    'hover:bg-danger/20',
    'hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-1.5 text-xs tracking-wider',
  md: 'px-6 py-2.5 text-sm tracking-wider',
  lg: 'px-8 py-3.5 text-base tracking-wide',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, loading, children, className = '', disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={[
          'inline-flex items-center justify-center gap-2',
          'rounded-[var(--radius-card)] font-semibold uppercase',
          'transition-all duration-200 ease-out',
          'cursor-pointer select-none',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className,
        ].join(' ')}
        disabled={disabled || loading}
        {...(props as any)}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
