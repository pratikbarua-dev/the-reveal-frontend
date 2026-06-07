'use client';

import Button from '../ui/Button';

interface ActionButtonsProps {
  onVeto: () => void;
  onReset: () => void;
  onNext: () => void;
  isHost: boolean;
  disabled?: boolean;
}

export default function ActionButtons({
  onVeto,
  onReset,
  onNext,
  isHost,
  disabled = false,
}: ActionButtonsProps) {
  return (
    <div className="w-full max-w-lg mx-auto grid grid-cols-3 gap-3">
      <Button
        variant="danger"
        size="md"
        onClick={onVeto}
        disabled={disabled}
        className="font-bold text-xs"
      >
        VETO
      </Button>

      <Button
        variant="secondary"
        size="md"
        onClick={onReset}
        disabled={disabled}
        className="font-bold text-xs"
      >
        RESET
      </Button>

      {isHost ? (
        <Button
          variant="primary"
          size="md"
          onClick={onNext}
          disabled={disabled}
          className="font-bold text-xs"
        >
          NEXT POS.
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="md"
          disabled={true}
          className="font-bold text-xs text-muted border border-surface-elevated cursor-not-allowed"
        >
          WAITING
        </Button>
      )}
    </div>
  );
}
