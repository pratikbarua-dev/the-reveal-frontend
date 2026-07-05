'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, MessageSquareHeart, Grid, Radio, History, Server, LogOut, Shield, Activity, Menu, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Feedback', href: '/admin/feedback', icon: MessageSquareHeart },
  { name: 'Content', href: '/admin/content', icon: Grid },
  { name: 'Live Rooms', href: '/admin/rooms', icon: Radio },
  { name: 'Sessions', href: '/admin/sessions', icon: History },
  { name: 'System', href: '/admin/system', icon: Server },
  { name: 'Monitoring', href: '/admin/monitoring', icon: Activity },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass-nav z-50 flex items-center justify-between px-4 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-secondary" />
          <span className="font-black tracking-widest uppercase text-contrast text-sm">Reveal Admin</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-muted hover:text-contrast">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 glass border-r border-primary/20 flex flex-col z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-primary/20 flex items-center gap-3 hidden md:flex">
          <Shield className="w-6 h-6 text-secondary" />
          <span className="font-black tracking-widest uppercase text-contrast">Reveal Admin</span>
        </div>
        
        {/* Mobile Header Inside Sidebar (Optional, for spacing) */}
        <div className="md:hidden h-16 border-b border-primary/20 flex items-center px-6">
          <span className="font-black tracking-widest uppercase text-contrast text-sm">Menu</span>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary/20 text-contrast border border-primary/30 shadow-glow-subtle' 
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
    </>
  );
}
