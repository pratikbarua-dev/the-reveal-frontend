'use client';

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-1.5 px-1 font-sans">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted">
        <span>Reveal Progress</span>
        <span className={normalizedProgress >= 60 ? 'text-secondary animate-pulse' : 'text-primary'}>
          {normalizedProgress}% Revealed
        </span>
      </div>
      <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden border border-surface-elevated/40">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-200 shadow-glow"
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
    </div>
  );
}
