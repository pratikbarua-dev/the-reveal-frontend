'use client';

import { Activity, Server, AlertTriangle, Users, History, Link as LinkIcon, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { useMonitoringSocket } from '@/hooks/useMonitoringSocket';
import StatusBeacon from '@/components/admin/monitoring/StatusBeacon';

export default function MonitoringHubPage() {
  const { isConnected, infraMetrics } = useMonitoringSocket();

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-contrast tracking-tight uppercase flex items-center gap-3">
            <Activity className="w-8 h-8 text-secondary" />
            Monitoring Hub
          </h1>
          <p className="text-muted text-sm mt-1">Real-time observability and event-driven metrics for The Reveal.</p>
        </div>
        
        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors ${
          isConnected ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {isConnected ? (
            <>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Stream Active
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              Disconnected
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatusBeacon
          title="Backend Node"
          icon={Server}
          status={infraMetrics?.backend.status || 'unknown'}
          details={[
            `Active Rooms: ${infraMetrics?.backend.activeRooms || 0}`,
            `Socket Conns: ${infraMetrics?.backend.socketConnections || 0}`
          ]}
        />
        <StatusBeacon
          title="MongoDB"
          icon={Server}
          status={infraMetrics?.database.status || 'unknown'}
          details={[
            `Latency: ${infraMetrics?.database.latencyMs || 0} ms`,
            `Active Conns: ${infraMetrics?.database.activeConnections || 0}`
          ]}
        />
        <StatusBeacon
          title="Process Health"
          icon={Activity}
          status={infraMetrics ? 'up' : 'unknown'}
          details={[
            `Heap Used: ${infraMetrics?.frontend.memory.heapUsed || 0} MB`,
            `Uptime: ${infraMetrics ? Math.floor(infraMetrics.frontend.uptimeSeconds / 3600) + 'h' : '0h'}`
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <Link href="/admin/monitoring/infrastructure" className="group bg-surface-light border border-primary/20 hover:border-secondary/50 rounded-xl p-6 transition-all shadow-glow-subtle flex items-start gap-4 cursor-pointer hover:bg-surface-elevated">
          <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-secondary/20 group-hover:text-secondary transition-colors">
            <Server className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-contrast uppercase tracking-widest text-lg">Infrastructure</span>
              <LinkIcon className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted">Deep dive into CPU, memory, and database metrics with live sparklines.</p>
          </div>
        </Link>
        
        <Link href="/admin/monitoring/analytics" className="group bg-surface-light border border-primary/20 hover:border-secondary/50 rounded-xl p-6 transition-all shadow-glow-subtle flex items-start gap-4 cursor-pointer hover:bg-surface-elevated">
          <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-secondary/20 group-hover:text-secondary transition-colors">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-contrast uppercase tracking-widest text-lg">User Analytics</span>
              <LinkIcon className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted">Growth, engagement, and behavior metrics powered by DB aggregations.</p>
          </div>
        </Link>
        
        <Link href="/admin/rooms" className="group bg-surface-light border border-primary/20 hover:border-secondary/50 rounded-xl p-6 transition-all shadow-glow-subtle flex items-start gap-4 cursor-pointer hover:bg-surface-elevated">
          <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-secondary/20 group-hover:text-secondary transition-colors">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-contrast uppercase tracking-widest text-lg">Live Rooms</span>
              <LinkIcon className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted">Monitor active game sessions, intercept chat, and moderate players.</p>
          </div>
        </Link>
        
        <Link href="/admin/monitoring/performance" className="group bg-surface-light border border-primary/20 hover:border-secondary/50 rounded-xl p-6 transition-all shadow-glow-subtle flex items-start gap-4 cursor-pointer hover:bg-surface-elevated">
          <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-secondary/20 group-hover:text-secondary transition-colors">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-contrast uppercase tracking-widest text-lg">Performance</span>
              <LinkIcon className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted">Application Performance Monitoring for API routes.</p>
          </div>
        </Link>
        
        <Link href="/admin/monitoring/errors" className="group bg-surface-light border border-primary/20 hover:border-secondary/50 rounded-xl p-6 transition-all shadow-glow-subtle flex items-start gap-4 cursor-pointer hover:bg-surface-elevated">
          <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-secondary/20 group-hover:text-secondary transition-colors">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-contrast uppercase tracking-widest text-lg">Errors</span>
              <LinkIcon className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted">Structured exception tracking and resolution management.</p>
          </div>
        </Link>

        <Link href="/admin/monitoring/audit" className="group bg-surface-light border border-primary/20 hover:border-secondary/50 rounded-xl p-6 transition-all shadow-glow-subtle flex items-start gap-4 cursor-pointer hover:bg-surface-elevated">
          <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-secondary/20 group-hover:text-secondary transition-colors">
            <History className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-contrast uppercase tracking-widest text-lg">Audit Log</span>
              <LinkIcon className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted">Immutable trail of admin actions and configuration changes.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
