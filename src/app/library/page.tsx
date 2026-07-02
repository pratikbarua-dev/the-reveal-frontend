'use client';

import { useState } from 'react';
import { usePositions } from '@/hooks/usePositions';
import FilterBar from '@/components/library/FilterBar';
import PositionCard from '@/components/library/PositionCard';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function LibraryPage() {
  const [search, setSearch] = useState('');
  const [selectedSpice, setSelectedSpice] = useState<number[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const { items, loading, total, page, totalPages, loadMore } = usePositions({
    search,
    spiceLevels: selectedSpice,
    partySizes: selectedSizes,
    tags: selectedTags,
    favorites: showFavorites,
  });

  const handleFavoriteToggle = async (positionId: string, currentlyFavorited: boolean) => {
    try {
      const method = currentlyFavorited ? 'DELETE' : 'POST';
      const url = currentlyFavorited ? `/api/favorites?positionId=${positionId}` : '/api/favorites';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: currentlyFavorited ? undefined : JSON.stringify({ positionId }),
      });

      if (!res.ok) throw new Error('Failed to update favorite status');
    } catch (e) {
      console.error('Error toggling favorite:', e);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col gap-6 p-6 bg-surface max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-gradient uppercase font-sans">
          Library of Discovery
        </h1>
        <p className="text-muted text-xs uppercase tracking-widest font-sans font-semibold">
          Explore intimate shapes and positions ({total} available)
        </p>
      </div>

      {/* Filter Options */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        selectedSpice={selectedSpice}
        onSpiceChange={setSelectedSpice}
        selectedSizes={selectedSizes}
        onSizesChange={setSelectedSizes}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        showFavorites={showFavorites}
        onFavoritesChange={setShowFavorites}
      />

      {/* Grid List */}
      {items.length === 0 && !loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 border border-dashed border-primary/20 rounded-[var(--radius-card)] bg-surface-light/40 font-sans">
          <span className="text-sm font-bold uppercase tracking-widest text-secondary mb-1">
            No matches found
          </span>
          <span className="text-xs text-muted max-w-xs leading-relaxed mb-6">
            {showFavorites ? 'You have no favorited cards. Play a session to discover new favorites!' : 'Try resetting filters or adjusting search parameters to explore positions.'}
          </span>
          {showFavorites ? (
            <Link href="/play">
              <Button variant="primary" size="md">Start Discovery</Button>
            </Link>
          ) : (
            <Button variant="ghost" size="md" onClick={() => {
              setSearch('');
              setSelectedSpice([]);
              setSelectedTags([]);
              setSelectedSizes([]);
            }}>
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((pos) => (
            <PositionCard
              key={pos._id}
              position={pos}
              isFavorited={true} // will auto-render correct initial state because endpoint filters exclude boundaries or only include favorites
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}

          {/* Skeletons while loading more */}
          {loading &&
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-surface-light border border-surface-elevated rounded-[var(--radius-card)] overflow-hidden aspect-[4/5] flex flex-col gap-4 p-4"
              >
                <Skeleton className="w-full aspect-[16/10]" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-12 w-full" />
                <div className="flex justify-between mt-auto">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Load More Trigger */}
      {page < totalPages && !loading && (
        <div className="flex justify-center mt-6">
          <Button variant="secondary" size="md" onClick={loadMore} className="min-w-[150px]">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
