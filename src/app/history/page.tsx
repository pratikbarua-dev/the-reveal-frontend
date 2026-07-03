'use client';

import { useState, useEffect } from 'react';
import type { PositionCard as IPositionCard } from '@/types';
import Button from '@/components/ui/Button';
import PositionCard from '@/components/library/PositionCard';
import Skeleton from '@/components/ui/Skeleton';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function HistoryPage() {
  const { status } = useSession();
  const [historyItems, setHistoryItems] = useState<IPositionCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    async function loadHistory() {
      try {
        // Fetch real history from the user's profile
        const res = await fetch('/api/history');
        if (!res.ok) throw new Error('Failed to fetch history');
        const data = await res.json();
        setHistoryItems(data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      loadHistory();
    } else {
      setLoading(false);
    }
  }, [status]);

  const handleFavoriteToggle = async (positionId: string, currentlyFavorited: boolean) => {
    try {
      const method = currentlyFavorited ? 'DELETE' : 'POST';
      const url = currentlyFavorited ? `/api/favorites?positionId=${positionId}` : '/api/favorites';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: currentlyFavorited ? undefined : JSON.stringify({ positionId }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col gap-6 p-6 bg-surface max-w-6xl mx-auto font-sans">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-gradient uppercase font-sans">
          Discovery History
        </h1>
        <p className="text-muted text-xs uppercase tracking-widest font-sans font-semibold">
          Recall previously revealed shapes and cards
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-surface-light border border-surface-elevated rounded-[var(--radius-card)] overflow-hidden aspect-[4/5] flex flex-col gap-4 p-4"
            >
              <Skeleton className="w-full aspect-[16/10]" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ) : status === 'unauthenticated' ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 border border-dashed border-primary/20 rounded-[var(--radius-card)] bg-surface-light/40 font-sans">
          <span className="text-sm font-bold uppercase tracking-widest text-secondary mb-1">
            Cloud History Locked
          </span>
          <span className="text-xs text-muted max-w-xs leading-relaxed mb-6">
            Sign in with Google to save your favorite intimate positions and track your game history across devices.
          </span>
          <Link href="/">
            <Button variant="primary" size="md">
              Sign In with Google
            </Button>
          </Link>
        </div>
      ) : historyItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 border border-dashed border-primary/20 rounded-[var(--radius-card)] bg-surface-light/40 font-sans">
          <span className="text-sm font-bold uppercase tracking-widest text-secondary mb-1">
            No history yet
          </span>
          <span className="text-xs text-muted max-w-xs leading-relaxed mb-6">
            History lists cards revealed during live gameplay sessions. Play a game to record history.
          </span>
          <Link href="/play">
            <Button variant="primary" size="md">
              Start Discovery
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {historyItems.map((pos) => (
            <PositionCard
              key={pos._id}
              position={pos}
              isFavorited={false}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
