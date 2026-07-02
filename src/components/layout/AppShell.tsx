'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import Skeleton from '../ui/Skeleton';
import BitingLipSpinner from '../ui/BitingLipSpinner';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/';
  const isOnboardingPage = pathname === '/onboarding';

  useEffect(() => {
    if (status === 'authenticated') {
      const onboarded = (session as any)?.isOnboarded;
      if (!onboarded && !isOnboardingPage) {
        router.push('/onboarding');
      } else if (onboarded && isOnboardingPage) {
        router.push('/play');
      }
    } else if (status === 'unauthenticated' && !isAuthPage) {
      router.push('/');
    }
  }, [status, session, pathname, router, isOnboardingPage, isAuthPage]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <BitingLipSpinner className="w-16 h-16 mb-6" />
        <span className="text-sm font-semibold tracking-widest text-secondary uppercase animate-pulse">
          Connecting to The Reveal
        </span>
      </div>
    );
  }

  // If on landing page (auth page)
  if (isAuthPage) {
    return <>{children}</>;
  }

  // If on onboarding page
  if (isOnboardingPage) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <TopNav />
        <main className="flex-1 flex flex-col pt-16">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col pb-16 font-sans">
      <TopNav />
      <main className="flex-1 flex flex-col pt-16 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
