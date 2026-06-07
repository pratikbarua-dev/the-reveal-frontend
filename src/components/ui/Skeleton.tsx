'use client';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`shimmer-bg rounded-[var(--radius-card)] ${className}`}
    />
  );
}
