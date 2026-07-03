'use client';

import { LucideIcon } from 'lucide-react';

interface StatusBeaconProps {
  title: string;
  status: 'up' | 'down' | 'degraded' | 'connected' | 'disconnected' | 'unknown';
  icon: LucideIcon;
  details?: string[];
}

export default function StatusBeacon({ title, status, icon: Icon, details = [] }: StatusBeaconProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'up':
      case 'connected':
        return 'bg-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]';
      case 'down':
      case 'disconnected':
        return 'bg-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]';
      case 'degraded':
        return 'bg-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]';
      default:
        return 'bg-gray-500 text-gray-400 shadow-[0_0_15px_rgba(156,163,175,0.4)]';
    }
  };

  const colorClasses = getStatusColor();

  return (
    <div className="bg-surface-light border border-primary/20 rounded-xl p-6 shadow-glow-subtle flex flex-col gap-4 relative overflow-hidden group">
      <div className={`absolute top-0 left-0 right-0 h-1 ${colorClasses.split(' ')[0]}`} />
      
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-secondary" />
          <span className="text-lg font-black uppercase tracking-widest text-contrast">{title}</span>
        </div>
        <div className={`w-3 h-3 rounded-full ${colorClasses.split(' ')[0]} animate-pulse shadow-glow`} />
      </div>

      <div className="flex flex-col gap-2 flex-1 justify-center">
        <div className="flex items-center justify-between">
          <span className="text-muted text-xs uppercase tracking-wider font-bold">Status</span>
          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-opacity-20 ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]}`}>
            {status}
          </span>
        </div>
        
        {details.map((detail, idx) => {
          const [label, value] = detail.split(':');
          return (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-muted font-medium">{label}</span>
              <span className="text-contrast font-bold">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
