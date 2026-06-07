'use client';

interface TagPillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function TagPill({ label, active = false, onClick }: TagPillProps) {
  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all duration-200 ${
        onClick ? 'cursor-pointer active:scale-95' : ''
      } ${
        active
          ? 'bg-primary/10 border-primary text-secondary shadow-[0_0_8px_rgba(136,14,79,0.2)]'
          : 'bg-surface-elevated/40 border-surface-elevated text-muted hover:text-contrast hover:border-muted/30'
      }`}
    >
      {label}
    </Component>
  );
}
