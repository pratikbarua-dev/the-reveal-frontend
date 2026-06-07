'use client';

import { AVAILABLE_REACTIONS } from '@/types';

interface ReactionOverlayProps {
  reactions: { emoji: string; userId: string; id: string }[];
  onSendReaction: (emoji: string) => void;
}

export default function ReactionOverlay({ reactions, onSendReaction }: ReactionOverlayProps) {
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4 relative">
      {/* Floating reactions display */}
      <div className="absolute -top-36 left-0 right-0 h-32 pointer-events-none overflow-hidden z-20">
        {reactions.map((react) => (
          <span
            key={react.id}
            className="absolute bottom-0 left-1/2 text-4xl animate-reaction-float select-none opacity-0"
            style={{
              marginLeft: `${Math.floor(Math.random() * 80) - 40}px`,
              animationDelay: '0s',
            }}
          >
            {react.emoji}
          </span>
        ))}
      </div>

      {/* Picker Bar */}
      <div className="flex items-center justify-between p-1 bg-surface-elevated/40 border border-primary/10 rounded-[var(--radius-pill)] gap-0.5 sm:gap-1 shadow-glow-subtle max-w-sm mx-auto w-full">
        {AVAILABLE_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSendReaction(emoji)}
            className="text-lg sm:text-2xl hover:scale-125 hover:rotate-12 active:scale-95 transition-all duration-150 p-0.5 sm:p-1 flex items-center justify-center cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
