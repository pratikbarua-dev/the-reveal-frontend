'use client';

import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface VetoModalProps {
  open: boolean;
  callerName: string;
  expiresIn: number; // in milliseconds
  onVote: (vote: boolean) => void;
}

export default function VetoModal({ open, callerName, expiresIn, onVote }: VetoModalProps) {
  const [timeLeft, setTimeLeft] = useState(Math.round(expiresIn / 1000));

  useEffect(() => {
    if (!open) return;
    setTimeLeft(Math.round(expiresIn / 1000));

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, expiresIn]);

  return (
    <Modal open={open} onClose={() => {}} title="VETO VOTE CALLED">
      <div className="flex flex-col items-center text-center gap-4">
        <p className="text-sm text-muted">
          <span className="text-secondary font-bold uppercase">{callerName}</span> wishes to veto the current position card.
        </p>

        {/* Countdown */}
        <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-4 border-primary/20 shadow-glow mb-2">
          <span className="text-4xl font-black text-secondary font-sans">
            {timeLeft}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full mt-2">
          <Button
            variant="danger"
            size="md"
            onClick={() => onVote(true)}
            className="flex-1 font-bold"
          >
            YES, VETO
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => onVote(false)}
            className="flex-1 font-bold"
          >
            NO, KEEP
          </Button>
        </div>
      </div>
    </Modal>
  );
}
