'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Grid, Radio, History, Server, LogOut, Shield } from 'lucide-react';
import { signOut } from 'next-auth/react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Content', href: '/admin/content', icon: Grid },
  { name: 'Live Rooms', href: '/admin/rooms', icon: Radio },
  { name: 'Sessions', href: '/admin/sessions', icon: History },
  { name: 'System', href: '/admin/system', icon: Server },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface-light border-r border-primary/20 flex flex-col z-50">
      <div className="p-6 border-b border-primary/20 flex items-center gap-3">
        <Shield className="w-6 h-6 text-secondary" />
        <span className="font-black tracking-widest uppercase text-contrast">Reveal Admin</span>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary/20 text-contrast border border-primary/30 shadow-[0_0_15px_rgba(136,14,79,0.2)]' 
                  : 'text-muted hover:text-contrast hover:bg-surface-elevated'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-secondary' : ''}`} />
              <span className="text-sm font-medium tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary/20">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 w-full px-4 py-3 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium tracking-wide">Exit Admin</span>
        </button>
      </div>
    </aside>
  );
}
