'use client';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              isActive
                ? 'w-8 bg-secondary shadow-glow-gold'
                : isCompleted
                ? 'w-4 bg-primary'
                : 'w-2 bg-surface-elevated'
            }`}
          />
        );
      })}
    </div>
  );
}
