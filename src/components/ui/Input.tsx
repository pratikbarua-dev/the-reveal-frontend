'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-[0.15em] text-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full px-4 py-3 rounded-[var(--radius-card)]',
            'bg-surface-elevated text-contrast placeholder:text-muted-dark',
            'border border-surface-elevated/80',
            'outline-none transition-all duration-200',
            'focus:border-primary/50 focus:shadow-[0_0_15px_rgba(136,14,79,0.2)]',
            error ? 'border-danger/50 shadow-[0_0_10px_rgba(239,68,68,0.15)]' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <span className="text-xs text-danger mt-0.5">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
