'use client';

import { useState } from 'react';
import type { PositionCard as IPositionCard } from '@/types';
import Card from '../ui/Card';
import SpiceBadge from './SpiceBadge';
import TagPill from './TagPill';
import { Heart } from 'lucide-react';
import Image from 'next/image';

interface PositionCardProps {
  position: IPositionCard;
  isFavorited: boolean;
  onFavoriteToggle: (id: string, currentlyFavorited: boolean) => void;
}

export default function PositionCard({
  position,
  isFavorited,
  onFavoriteToggle,
}: PositionCardProps) {
  const [favorite, setFavorite] = useState(isFavorited);
  const [imgError, setImgError] = useState(false);

  const handleFavToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle(position._id, favorite);
    setFavorite(!favorite);
  };

  // Safe image path resolution
  const imageSrc =
    position.imageUrl && !imgError
      ? position.imageUrl
      : '/vercel.svg'; // subtle default placeholder

  return (
    <Card
      glow="primary"
      hover={true}
      className="flex flex-col h-full bg-surface-light border-primary/20 overflow-hidden font-sans group relative"
    >
      {/* Favorite Heart Toggle Button */}
      <button
        onClick={handleFavToggle}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-surface/75 border border-primary/10 backdrop-blur-sm shadow-glow-subtle transition-all duration-300 scale-100 hover:scale-110 active:scale-95 cursor-pointer"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            favorite ? 'fill-primary text-primary' : 'text-muted'
          }`}
        />
      </button>

      {/* Position Cover image illustration header */}
      <div className="relative aspect-[16/10] bg-surface-elevated/20 overflow-hidden border-b border-primary/10">
        <Image
          src={imageSrc}
          alt={position.title}
          fill
          onError={() => setImgError(true)}
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Main content body */}
      <div className="p-4 flex flex-col justify-between flex-1 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-contrast tracking-tight group-hover:text-secondary transition-colors uppercase">
              {position.title}
            </h3>
          </div>
          <p className="text-xs text-muted leading-relaxed line-clamp-3 font-light font-sans">
            {position.description}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Metadata badges */}
          <div className="flex items-center justify-between flex-wrap gap-2 border-t border-surface-elevated/40 pt-3">
            <SpiceBadge level={position.spiceLevel} />
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-surface-elevated px-2 py-0.5 rounded border border-secondary/10">
              {position.partySize} players
            </span>
          </div>

          {/* Inline tag pill limits */}
          <div className="flex flex-wrap gap-1">
            {position.tags.slice(0, 3).map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
