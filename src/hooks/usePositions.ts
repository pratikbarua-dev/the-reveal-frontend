'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PositionCard } from '@/types';

interface UsePositionsFilters {
  search: string;
  spiceLevels: number[];
  partySizes: number[];
  tags: string[];
  favorites: boolean;
}

export function usePositions(filters: UsePositionsFilters) {
  const [items, setItems] = useState<PositionCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPositions = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', pageNum.toString());
      params.append('limit', '12');

      if (filters.search) params.append('search', filters.search);
      if (filters.favorites) params.append('favorites', 'true');

      if (filters.spiceLevels.length > 0) {
        params.append('spiceLevel', filters.spiceLevels.join(','));
      }

      if (filters.partySizes.length > 0) {
        params.append('partySize', filters.partySizes.join(','));
      }

      if (filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }

      const res = await fetch(`/api/positions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch positions');

      const data = await res.json();

      if (append) {
        setItems((prev) => {
          // Prevent duplicates
          const existingIds = new Set(prev.map((item) => item._id));
          const newItems = data.items.filter((item: any) => !existingIds.has(item._id));
          return [...prev, ...newItems];
        });
      } else {
        setItems(data.items);
      }

      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [
    filters.search,
    filters.favorites,
    // Use JSON.stringify for arrays to ensure deep equality comparison in the dependency array
    JSON.stringify(filters.spiceLevels),
    JSON.stringify(filters.partySizes),
    JSON.stringify(filters.tags),
  ]);

  // Refetch from page 1 when filters change
  useEffect(() => {
    fetchPositions(1, false);
  }, [fetchPositions]);

  const loadMore = () => {
    if (page < totalPages && !loading) {
      fetchPositions(page + 1, true);
    }
  };

  return {
    items,
    loading,
    error,
    page,
    totalPages,
    total,
    loadMore,
    refetch: () => fetchPositions(1, false),
  };
}
