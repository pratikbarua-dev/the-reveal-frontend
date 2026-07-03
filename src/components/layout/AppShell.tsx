'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import BitingLipSpinner from '../ui/BitingLipSpinner';
import FeedbackModal from '../ui/FeedbackModal';
import { MessageSquareHeart } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

type AuthMode = 'login' | 'guest' | 'hybrid';

export default function AppShell({ children }: AppShellProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const isAuthPage = pathname === '/';
  const isOnboardingPage = pathname === '/onboarding';
  const isAdminPage = pathname.startsWith('/admin');
  const isPublicPage = pathname === '/privacy' || pathname === '/terms';

  // Fetch auth mode from backend on mount
  useEffect(() => {
    async function fetchAuthMode() {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          setAuthMode(data.authMode || 'hybrid');
        } else {
          setAuthMode('hybrid'); // fallback
        }
      } catch {
        setAuthMode('hybrid'); // fallback
      }
    }
    fetchAuthMode();
  }, []);

  // Initialize guest profile for unauthenticated users (when guest/hybrid mode)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (status === 'unauthenticated' && authMode !== 'login') {
      let guestId = localStorage.getItem('reveal_guestId');
      if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('reveal_guestId', guestId);
      }
      let guestName = localStorage.getItem('reveal_guestName');
      if (!guestName) {
        guestName = 'Guest_' + Math.random().toString(36).substring(2, 6).toUpperCase();
        localStorage.setItem('reveal_guestName', guestName);
      }
    }
  }, [status, authMode]);

  // Routing logic based on auth mode
  useEffect(() => {
    // Wait for authMode to load
    if (!authMode) return;
    // Admin and public static pages don't need auth redirects
    if (isAdminPage || isPublicPage) return;

    if (authMode === 'login') {
      // Login required mode — must authenticate
      if (status === 'authenticated') {
        const onboarded = (session as any)?.isOnboarded;
        if (!onboarded && !isOnboardingPage) {
          router.push('/onboarding');
        } else if (onboarded && isOnboardingPage) {
          router.push('/play');
        }
      } else if (status === 'unauthenticated') {
        // Force back to landing for login
        if (pathname !== '/') {
          router.push('/');
        }
      }
    } else if (authMode === 'guest') {
      // Guest-only mode — skip login, go straight to play
      if (status === 'authenticated') {
        const onboarded = (session as any)?.isOnboarded;
        if (!onboarded && !isOnboardingPage) {
          router.push('/onboarding');
        } else if (onboarded && isOnboardingPage) {
          router.push('/play');
        }
      } else if (status === 'unauthenticated') {
        // Allow guests on all pages except onboarding
        if (isOnboardingPage) {
          router.push('/play');
        } else if (isAuthPage) {
          // Skip landing, go to play directly
          router.push('/play');
        }
      }
    } else {
      // Hybrid mode — users can login or continue as guest
      if (status === 'authenticated') {
        const onboarded = (session as any)?.isOnboarded;
        if (!onboarded && !isOnboardingPage) {
          router.push('/onboarding');
        } else if (onboarded && isOnboardingPage) {
          router.push('/play');
        }
      } else if (status === 'unauthenticated') {
        // Allow guests on all app pages; only block admin
        if (isOnboardingPage) {
          router.push('/play');
        }
      }
    }
  }, [status, session, pathname, router, isOnboardingPage, isAuthPage, isAdminPage, authMode]);

  // Feedback triggers (Returning User & End of Session)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 1. Returning user logic
    const hasPlayed = localStorage.getItem('reveal_has_played');
    const hasPrompted = localStorage.getItem('reveal_feedback_prompted');
    const lastVisit = localStorage.getItem('reveal_last_visit');
    const now = Date.now();
    
    if (hasPlayed && !hasPrompted && !isAdminPage) {
      if (lastVisit && now - parseInt(lastVisit) > 12 * 60 * 60 * 1000) {
        // Returning user after 12 hours
        setTimeout(() => {
          setShowFeedback(true);
          localStorage.setItem('reveal_feedback_prompted', 'true');
        }, 3000); // 3-second delay so they see the dashboard first
      }
    }
    localStorage.setItem('reveal_last_visit', now.toString());

    // 2. End of session event listener
    const handleTrigger = () => {
      setShowFeedback(true);
      localStorage.setItem('reveal_feedback_prompted', 'true');
    };
    
    window.addEventListener('trigger-feedback', handleTrigger);
    return () => window.removeEventListener('trigger-feedback', handleTrigger);
  }, [isAdminPage]);

  // Show loading while we determine auth state + config
  if (status === 'loading' || !authMode) {
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
    <div className="min-h-screen bg-surface flex flex-col pb-16 font-sans relative">
      <TopNav />
      <main className="flex-1 flex flex-col pt-16 overflow-y-auto">{children}</main>
      <BottomNav />

      {/* Global Feedback FAB (Not shown on admin pages, handled by conditional rendering in AppShell already, wait, isAdmin returns early above? No, isAdminPage is handled separately. Wait, isAdminPage returns {children} somewhere else? Ah, if isAdminPage it's handled in its own layout. If it's here, we just render it.) */}
      {!isAdminPage && (
        <button
          onClick={() => setShowFeedback(true)}
          className="fixed bottom-24 right-4 md:right-8 z-40 bg-gradient-to-r from-primary to-secondary text-background p-4 rounded-full shadow-glow flex items-center justify-center hover:scale-110 transition-transform"
          title="Send Feedback"
        >
          <MessageSquareHeart className="w-6 h-6" />
        </button>
      )}

      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
    </div>
  );
}
