'use client';

import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        'inline-flex items-center gap-3 cursor-pointer select-none',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <div
        className={[
          'relative w-11 h-6 rounded-full transition-colors duration-200',
          checked ? 'bg-primary shadow-[0_0_12px_rgba(136,14,79,0.4)]' : 'bg-surface-elevated',
        ].join(' ')}
      >
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={[
            'absolute top-1 w-4 h-4 rounded-full',
            checked ? 'bg-contrast' : 'bg-muted',
          ].join(' ')}
        />
      </div>
      {label && (
        <span className="text-sm text-muted">{label}</span>
      )}
    </button>
  );
}
