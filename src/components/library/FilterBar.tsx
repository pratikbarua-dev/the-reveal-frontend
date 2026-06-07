'use client';

import { useState } from 'react';
import Input from '../ui/Input';
import TagPill from './TagPill';
import { Search, SlidersHorizontal, Users } from 'lucide-react';
import { TAG_CATEGORIES } from '@/types';

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedSpice: number[];
  onSpiceChange: (spice: number[]) => void;
  selectedSizes: number[];
  onSizesChange: (sizes: number[]) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  showFavorites: boolean;
  onFavoritesChange: (fav: boolean) => void;
}

export default function FilterBar({
  search,
  onSearchChange,
  selectedSpice,
  onSpiceChange,
  selectedSizes,
  onSizesChange,
  selectedTags,
  onTagsChange,
  showFavorites,
  onFavoritesChange,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleSpice = (level: number) => {
    if (selectedSpice.includes(level)) {
      onSpiceChange(selectedSpice.filter((l) => l !== level));
    } else {
      onSpiceChange([...selectedSpice, level]);
    }
  };

  const toggleSize = (size: number) => {
    if (selectedSizes.includes(size)) {
      onSizesChange(selectedSizes.filter((s) => s !== size));
    } else {
      onSizesChange([...selectedSizes, size]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    onSearchChange('');
    onSpiceChange([]);
    onSizesChange([]);
    onTagsChange([]);
  };

  const allTags = Object.values(TAG_CATEGORIES).flat();

  return (
    <div className="w-full bg-surface-light border border-primary/20 rounded-[var(--radius-card)] p-4 flex flex-col gap-4 shadow-glow-subtle font-sans">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search catalog positions..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-full py-2.5"
          />
          <Search className="w-4 h-4 text-muted absolute left-4 top-[14px]" />
        </div>

        {/* Favorite heart toggle button */}
        <button
          onClick={() => onFavoritesChange(!showFavorites)}
          className={`px-4 rounded-full border transition-all duration-300 font-bold uppercase text-[10px] tracking-wider select-none cursor-pointer flex items-center justify-center ${
            showFavorites
              ? 'bg-primary border-primary text-contrast shadow-glow'
              : 'bg-surface border-surface-elevated text-muted hover:text-contrast'
          }`}
        >
          Favorites
        </button>

        {/* Filters toggle button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`p-2.5 rounded-full border transition-all duration-200 cursor-pointer flex items-center justify-center ${
            expanded
              ? 'bg-secondary border-secondary text-surface shadow-glow-gold'
              : 'bg-surface border-surface-elevated text-muted hover:text-contrast'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Expanded filters panel */}
      {expanded && (
        <div className="flex flex-col gap-4 pt-3 border-t border-surface-elevated/60 animate-fade-in">
          {/* Party size filters */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest font-sans flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>Party Size</span>
            </span>
            <div className="flex gap-2">
              {[2, 3, 4].map((size) => (
                <TagPill
                  key={size}
                  label={`${size} players`}
                  active={selectedSizes.includes(size)}
                  onClick={() => toggleSize(size)}
                />
              ))}
            </div>
          </div>

          {/* Spice levels */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest font-sans">
              Spice Level
            </span>
            <div className="flex gap-2">
              {[1, 2, 3].map((level) => (
                <TagPill
                  key={level}
                  label={level === 1 ? '🌶️ Mild' : level === 2 ? '🌶️🌶️ Spicy' : '🌶️🌶️🌶️ Inferno'}
                  active={selectedSpice.includes(level)}
                  onClick={() => toggleSpice(level)}
                />
              ))}
            </div>
          </div>

          {/* Popular Tag categories */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest font-sans">
              Intimate Categories
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {allTags.map((tag) => (
                <TagPill
                  key={tag}
                  label={tag}
                  active={selectedTags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-elevated/40">
            <button
              onClick={clearFilters}
              className="text-[10px] font-bold text-danger uppercase tracking-widest hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
            <span className="text-[9px] text-muted font-sans font-light">
              Filtering out boundaries matches automatically
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
