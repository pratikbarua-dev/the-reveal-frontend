'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StepIndicator from '@/components/onboarding/StepIndicator';
import PartySizeStep from '@/components/onboarding/PartySizeStep';
import HardLimitsStep from '@/components/onboarding/HardLimitsStep';
import NamesStep from '@/components/onboarding/NamesStep';
import Button from '@/components/ui/Button';

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [preferredPartySize, setPreferredPartySize] = useState<2 | 3 | 4>(2);
  const [hardLimits, setHardLimits] = useState<string[]>([]);
  const [participantNames, setParticipantNames] = useState<string[]>([]);

  const defaultUserName = session?.user?.name || '';

  // Initialize participantNames when preferredPartySize changes
  useEffect(() => {
    setParticipantNames((prev) => {
      const next = [...prev];
      if (next.length === 0 && defaultUserName) {
        next[0] = defaultUserName;
      }
      while (next.length < preferredPartySize) {
        next.push('');
      }
      return next.slice(0, preferredPartySize);
    });
  }, [preferredPartySize, defaultUserName]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Ensure names have fallback if empty
      const finalNames = participantNames.map((name, index) => {
        if (name.trim()) return name.trim();
        return index === 0 ? defaultUserName || 'Player 1' : `Player ${index + 1}`;
      });

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredPartySize,
          hardLimits,
          participantNames: finalNames,
        }),
      });

      if (!response.ok) {
        throw new Error('Onboarding failed');
      }

      // Force refresh of NextAuth session state so AppShell updates
      await update();
      router.push('/play');
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-surface overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle_at_center,rgba(136,14,79,0.04)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-surface-light border border-primary/20 rounded-[var(--radius-xl)] shadow-glow-subtle p-6 md:p-8 flex flex-col gap-8">
        <StepIndicator currentStep={step} totalSteps={3} />

        <div className="min-h-[350px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex-1"
            >
              {step === 1 && (
                <PartySizeStep
                  value={preferredPartySize}
                  onChange={setPreferredPartySize}
                />
              )}
              {step === 2 && (
                <HardLimitsStep value={hardLimits} onChange={setHardLimits} />
              )}
              {step === 3 && (
                <NamesStep
                  partySize={preferredPartySize}
                  value={participantNames}
                  onChange={setParticipantNames}
                  defaultUserName={defaultUserName}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between gap-4 mt-8">
            {step > 1 ? (
              <Button variant="ghost" onClick={handleBack} disabled={loading}>
                Back
              </Button>
            ) : (
              <div />
            )}

            <Button variant="primary" onClick={handleNext} loading={loading}>
              {step === 3 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
