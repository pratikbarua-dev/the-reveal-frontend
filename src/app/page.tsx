'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoginButton from '@/components/auth/LoginButton';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      if ((session as any)?.isOnboarded) {
        router.push('/play');
      } else {
        router.push('/onboarding');
      }
    }
  }, [status, session, router]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-surface overflow-hidden px-6">
      {/* Background Constellation & Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Twinkle background dots */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(136,14,79,0.05)_0%,transparent_70%)]" />
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle_at_center,rgba(136,14,79,0.08)_0%,transparent_70%)] blur-3xl animate-pulse" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.04)_0%,transparent_70%)] blur-3xl" />
      </div>

      {/* Main Core Content */}
      <div className="relative z-10 max-w-xl w-full text-center flex flex-col items-center gap-10">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-secondary/80 font-sans shadow-glow-gold px-3 py-1 bg-surface-elevated/40 rounded-full border border-secondary/10">
            Intimacy Redefined
          </span>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-gradient-rose animate-float uppercase leading-none mt-2">
            THE REVEAL
          </h1>
          <p className="text-muted text-base md:text-lg max-w-md mx-auto leading-relaxed mt-4 font-sans font-light">
            A tactile multiplayer exploration of intimate connections. Scratch the surface, discover new shapes, and connect deeply.
          </p>
        </div>

        {/* Visual Cue - Card Mockup */}
        <div className="w-64 h-40 bg-surface-light border border-primary/20 rounded-[var(--radius-card)] shadow-glow-intense flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-secondary/5" />
          {/* Subtle line art patterns */}
          <svg className="w-full h-full absolute inset-0 opacity-20 stroke-secondary" fill="none" viewBox="0 0 100 100">
            <path d="M10,50 Q40,90 50,50 T90,50" strokeWidth="1" />
            <path d="M20,30 Q50,70 60,30 T80,70" strokeWidth="0.5" />
          </svg>
          <div className="relative z-10 flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-sans font-semibold">Discovery Mode</span>
            <span className="text-xs font-black uppercase text-secondary tracking-widest">Scratch To Begin</span>
          </div>
        </div>

        <div className="w-full flex justify-center mt-4">
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
