'use client';

import { useEffect, useState } from 'react';
import { Activity, Clock, Zap, AlertTriangle } from 'lucide-react';
import MetricCard from '@/components/admin/monitoring/MetricCard';

interface APMStats {
  global: {
    avgResponseTime: number;
    totalRequests: number;
    errorCount: number;
  };
  routes: {
    _id: string;
    avgResponseTime: number;
    maxResponseTime: number;
    totalRequests: number;
    errorCount: number;
  }[];
}

export default function PerformancePage() {
  const [stats, setStats] = useState<APMStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/monitoring/performance');
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    // Re-fetch every 30s as a fallback for the APM UI
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-muted animate-pulse">Loading performance metrics...</div>;

  const errorRate = stats?.global.totalRequests 
    ? ((stats.global.errorCount / stats.global.totalRequests) * 100).toFixed(2) 
    : '0.00';

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-contrast tracking-tight uppercase flex items-center gap-3">
          <Zap className="w-8 h-8 text-secondary" />
          Performance APM
        </h1>
        <p className="text-muted text-sm mt-1">Application Performance Monitoring for API routes (Last 24 Hours).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Global Avg Latency"
          value={Math.round(stats?.global.avgResponseTime || 0)}
          unit="ms"
          icon={Clock}
        />
        <MetricCard
          title="Throughput (24h)"
          value={stats?.global.totalRequests || 0}
          unit="reqs"
          icon={Activity}
        />
        <MetricCard
          title="Error Rate"
          value={errorRate}
          unit="%"
          icon={AlertTriangle}
          trend={`${stats?.global.errorCount} total errors`}
        />
      </div>

      <div className="bg-surface-light border border-primary/20 rounded-xl overflow-hidden shadow-glow-subtle mt-4">
        <div className="p-4 bg-surface-elevated border-b border-primary/20 flex items-center gap-3">
          <Activity className="w-5 h-5 text-secondary" />
          <h2 className="text-lg font-black uppercase tracking-widest text-contrast">Route Performance</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-muted text-xs uppercase tracking-widest">
                <th className="p-4 font-bold border-b border-primary/20">Route</th>
                <th className="p-4 font-bold border-b border-primary/20">Avg Latency</th>
                <th className="p-4 font-bold border-b border-primary/20">Max Latency</th>
                <th className="p-4 font-bold border-b border-primary/20">Requests</th>
                <th className="p-4 font-bold border-b border-primary/20">Errors</th>
              </tr>
            </thead>
            <tbody>
              {stats?.routes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted italic">No API requests recorded yet.</td>
                </tr>
              ) : (
                stats?.routes.map((route) => (
                  <tr key={route._id} className="border-b border-primary/10 hover:bg-surface/50 transition-colors">
                    <td className="p-4 font-mono text-sm text-contrast font-bold">{route._id || 'Unknown'}</td>
                    <td className="p-4 text-sm text-contrast">{Math.round(route.avgResponseTime)} ms</td>
                    <td className="p-4 text-sm text-contrast">{Math.round(route.maxResponseTime)} ms</td>
                    <td className="p-4 text-sm text-contrast">{route.totalRequests}</td>
                    <td className="p-4 text-sm">
                      {route.errorCount > 0 ? (
                        <span className="text-rose-400 font-bold">{route.errorCount}</span>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
