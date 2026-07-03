'use client';

import { Activity, Server, Database, Cpu, HardDrive } from 'lucide-react';
import { useMonitoringSocket } from '@/hooks/useMonitoringSocket';
import StatusBeacon from '@/components/admin/monitoring/StatusBeacon';
import MetricCard from '@/components/admin/monitoring/MetricCard';

export default function InfrastructurePage() {
  const { isConnected, infraMetrics } = useMonitoringSocket();

  const formatUptime = (seconds: number = 0) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-contrast tracking-tight uppercase flex items-center gap-3">
          <Server className="w-8 h-8 text-secondary" />
          Infrastructure
        </h1>
        <p className="text-muted text-sm mt-1">Live OS, Database, and Process metrics pushed directly from the server.</p>
      </div>

      {!isConnected && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl flex items-center gap-3 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <span className="text-sm font-bold tracking-wide">Waiting for socket connection to receive live metrics...</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusBeacon
          title="Socket Backend"
          icon={Activity}
          status={infraMetrics?.backend.status || 'unknown'}
          details={[
            `Active Sockets: ${infraMetrics?.backend.socketConnections || 0}`,
            `Active Rooms: ${infraMetrics?.backend.activeRooms || 0}`,
          ]}
        />

        <StatusBeacon
          title="MongoDB Cluster"
          icon={Database}
          status={infraMetrics?.database.status || 'unknown'}
          details={[
            `Ping Latency: ${infraMetrics?.database.latencyMs || 0} ms`,
            `Active Conns: ${infraMetrics?.database.activeConnections || 0}`,
          ]}
        />
      </div>

      <div className="bg-surface-light border border-primary/20 rounded-xl p-6 shadow-glow-subtle flex flex-col gap-6 mt-2">
        <div className="flex items-center gap-3 border-b border-primary/20 pb-4">
          <Cpu className="w-6 h-6 text-secondary" />
          <span className="text-lg font-black uppercase tracking-widest text-contrast">Process & OS Health</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MetricCard
            title="Heap Used"
            value={infraMetrics?.frontend.memory.heapUsed || 0}
            unit="MB"
            icon={HardDrive}
            trend={`Total Heap: ${infraMetrics?.frontend.memory.heapTotal || 0} MB`}
          />
          <MetricCard
            title="RSS Memory"
            value={infraMetrics?.frontend.memory.rss || 0}
            unit="MB"
            icon={HardDrive}
          />
          <MetricCard
            title="Process Uptime"
            value={formatUptime(infraMetrics?.frontend.uptimeSeconds)}
            icon={Activity}
          />
          <MetricCard
            title="Event Loop Lag"
            value={infraMetrics?.frontend.eventLoopLagMs || 0}
            unit="ms"
            icon={Cpu}
          />
        </div>
      </div>
    </div>
  );
}
