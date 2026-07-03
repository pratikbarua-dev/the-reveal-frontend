'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import HeroSection from '@/components/landing/HeroSection';
import DemoSection from '@/components/landing/DemoSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import SpiceSection from '@/components/landing/SpiceSection';
import PartnerSection from '@/components/landing/PartnerSection';
import FinalCTA from '@/components/landing/FinalCTA';
import SmoothScroll from '@/components/landing/SmoothScroll';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users away from landing (handled by AppShell too,
  // but this provides a faster redirect for logged-in users)
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
    <SmoothScroll>
      <main className="bg-surface">
        <HeroSection />
        <DemoSection />
        <FeaturesSection />
        <SpiceSection />
        <PartnerSection />
        <FinalCTA />

        {/* Minimal Footer */}
        <footer className="py-8 px-6 bg-black border-t border-white/[0.04]">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-xs font-black tracking-tight text-gradient uppercase">
              THE REVEAL
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-sans font-semibold">
              © 2026 The Reveal. All rights reserved.
            </span>
          </div>
        </footer>
      </main>
    </SmoothScroll>
  );
}
