'use client';

import { useState } from 'react';
import type { IParticipant } from '@/types';
import { User } from 'lucide-react';

interface PlayerAvatarsProps {
  participants: IParticipant[];
  hostUserId?: string;
  activeScratcherId?: string;
}

function PlayerAvatarItem({
  player,
  isScratching,
  isConnected,
  isHost,
}: {
  player: IParticipant;
  isScratching: boolean;
  isConnected: boolean;
  isHost: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex flex-col items-center gap-1.5 relative group">
      {/* Avatar block */}
      <div
        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          isScratching
            ? 'ring-2 ring-secondary ring-offset-2 ring-offset-surface shadow-glow-gold scale-105'
            : 'border border-primary/20'
        } ${isConnected ? 'opacity-100' : 'opacity-40'}`}
      >
        {player.avatarUrl && !imgError ? (
          <img
            src={player.avatarUrl}
            alt={player.displayName}
            onError={() => setImgError(true)}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-surface-elevated flex items-center justify-center text-muted">
            <User className="w-5 h-5" />
          </div>
        )}

        {/* Status Indicator */}
        <span
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-surface-light ${
            isConnected ? 'bg-success' : 'bg-muted-dark'
          }`}
        />
      </div>

      {/* Label */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-semibold text-contrast truncate max-w-[70px] uppercase tracking-wider">
          {player.displayName}
        </span>
        {isHost && (
          <span className="text-[8px] font-bold text-secondary uppercase tracking-widest mt-0.5">
            Host
          </span>
        )}
      </div>
    </div>
  );
}

export default function PlayerAvatars({
  participants,
  hostUserId,
  activeScratcherId,
}: PlayerAvatarsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-lg mx-auto py-2">
      {participants.map((player, idx) => {
        const isConnected = player.isConnected !== false;
        const isHost = player.role === 'host';
        const isScratching = activeScratcherId === player.userId?.toString();

        return (
          <PlayerAvatarItem
            key={player.userId?.toString() || idx}
            player={player}
            isScratching={isScratching}
            isConnected={isConnected}
            isHost={isHost}
          />
        );
      })}
    </div>
  );
}
