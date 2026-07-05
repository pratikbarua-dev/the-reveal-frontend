'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Timer, UserCircle } from 'lucide-react';
import Image from 'next/image';

export default function TopNav() {
  const { data: session } = useSession();
  const [avatarError, setAvatarError] = useState(false);

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 h-16 border-b border-primary/20 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-3">
        <span className="text-xl font-black tracking-tight text-gradient font-sans">
          THE REVEAL
        </span>
      </div>

      <div className="flex items-center gap-4 text-muted">

        <div className="flex items-center gap-2">
          {session?.user?.image && !avatarError ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User Profile'}
              onError={() => setAvatarError(true)}
              className="w-8 h-8 rounded-full border border-secondary/30 shadow-glow-subtle object-cover"
            />
          ) : (
            <UserCircle className="w-8 h-8 hover:text-contrast transition-colors" />
          )}
        </div>
      </div>
    </nav>
  );
}
