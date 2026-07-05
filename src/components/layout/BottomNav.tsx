'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, History, Heart, Settings } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Play', href: '/play', icon: Gamepad2 },
    { name: 'Library', href: '/library', icon: Heart },
    { name: 'History', href: '/history', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="glass-nav fixed bottom-6 left-6 right-6 h-16 rounded-[var(--radius-pill)] border border-primary/20 flex items-center justify-around z-50 shadow-glow-subtle">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className="flex flex-col items-center justify-center w-16 h-12 gap-1 relative group"
          >
            <div
              className={`p-1.5 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-primary text-contrast shadow-glow scale-110 border border-primary-light/40'
                  : 'text-muted group-hover:text-contrast group-hover:bg-surface-elevated/40'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span
              className={`text-[9px] uppercase tracking-widest font-medium font-sans transition-colors ${
                isActive ? 'text-secondary font-semibold' : 'text-muted/80'
              }`}
            >
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
