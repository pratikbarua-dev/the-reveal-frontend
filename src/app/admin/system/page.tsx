'use client';

import { useEffect, useState } from 'react';
import { Server, Database, Activity, Shield, Lock, UserX, Users } from 'lucide-react';

interface SystemStats {
  backend: {
    status: 'up' | 'down';
    pingMs: number;
  };
  database: {
    status: 'connected' | 'disconnected';
    host: string;
    name: string;
  };
  frontend: {
    uptime: number;
    memoryUsageMB: number;
    nodeVersion: string;
    platform: string;
  };
}

type AuthMode = 'login' | 'guest' | 'hybrid';

const AUTH_MODE_OPTIONS: { value: AuthMode; label: string; description: string; icon: typeof Lock }[] = [
  {
    value: 'login',
    label: 'Login Required',
    description: 'Users must sign in with Google to access the app.',
    icon: Lock,
  },
  {
    value: 'guest',
    label: 'Guest Only',
    description: 'Everyone plays anonymously. No login option shown.',
    icon: UserX,
  },
  {
    value: 'hybrid',
    label: 'Hybrid',
    description: 'Users can sign in or continue as a guest.',
    icon: Users,
  },
];

export default function AdminSystemPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth mode config
  const [authMode, setAuthMode] = useState<AuthMode>('hybrid');
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [configLastUpdated, setConfigLastUpdated] = useState<string>('');
  const [configUpdatedBy, setConfigUpdatedBy] = useState<string>('');
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/system');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    setConfigLoading(true);
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      setAuthMode(data.authMode || 'hybrid');
      setConfigLastUpdated(data.updatedAt || '');
      setConfigUpdatedBy(data.updatedBy || '');
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setConfigLoading(false);
    }
  };

  const updateAuthMode = async (newMode: AuthMode) => {
    setConfigSaving(true);
    setConfigSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authMode: newMode }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuthMode(data.authMode);
        setConfigLastUpdated(data.updatedAt);
        setConfigUpdatedBy(data.updatedBy);
        setConfigSaveSuccess(true);
        setTimeout(() => setConfigSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to update config:', error);
    } finally {
      setConfigSaving(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchConfig();
    const interval = setInterval(fetchStats, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-secondary animate-pulse">Loading system metrics...</div>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-contrast tracking-tight uppercase">System Health</h1>
          <p className="text-muted text-sm mt-1">Infrastructure status, performance metrics, and app configuration.</p>
        </div>
        <button onClick={fetchStats} className="px-4 py-2 bg-surface-elevated hover:bg-primary/20 text-contrast text-xs font-bold uppercase tracking-widest rounded-lg transition-colors border border-primary/20">
          Refresh
        </button>
      </div>

      {/* ============================================ */}
      {/* App Configuration — Auth Mode */}
      {/* ============================================ */}
      <div className="bg-surface-light border border-secondary/30 rounded-xl p-6 shadow-glow-subtle flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-primary/20 pb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-secondary" />
            <span className="text-lg font-black uppercase tracking-widest text-contrast">Authentication Mode</span>
          </div>
          {configSaveSuccess && (
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-right-2 duration-300">
              ✓ Saved
            </span>
          )}
        </div>

        {configLoading ? (
          <div className="text-muted text-sm animate-pulse">Loading configuration...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AUTH_MODE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = authMode === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => updateAuthMode(option.value)}
                  disabled={configSaving}
                  className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'border-secondary bg-secondary/10 shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                      : 'border-surface-elevated bg-surface-elevated/30 hover:border-primary/30 hover:bg-primary/5'
                  } ${configSaving ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  {isActive && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                  )}
                  <div className={`p-3 rounded-full ${isActive ? 'bg-secondary/20' : 'bg-surface-elevated'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-secondary' : 'text-muted'}`} />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-secondary' : 'text-contrast'}`}>
                    {option.label}
                  </span>
                  <span className="text-[10px] text-muted text-center leading-relaxed">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {configLastUpdated && (
          <div className="text-[10px] text-muted text-right uppercase tracking-wider">
            Last updated: {new Date(configLastUpdated).toLocaleString()} by {configUpdatedBy || 'system'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Backend Node */}
        <div className="bg-surface-light border border-primary/20 rounded-xl p-6 shadow-glow-subtle flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-primary/20 pb-4">
            <Server className="w-6 h-6 text-secondary" />
            <span className="text-lg font-black uppercase tracking-widest text-contrast">Socket Backend</span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${stats?.backend.status === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {stats?.backend.status === 'up' ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Latency</span>
              <span className="text-contrast font-medium">{stats?.backend.pingMs} ms</span>
            </div>
          </div>
        </div>

        {/* Database Node */}
        <div className="bg-surface-light border border-primary/20 rounded-xl p-6 shadow-glow-subtle flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-primary/20 pb-4">
            <Database className="w-6 h-6 text-secondary" />
            <span className="text-lg font-black uppercase tracking-widest text-contrast">MongoDB</span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${stats?.database.status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {stats?.database.status === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Host</span>
              <span className="text-contrast font-medium truncate max-w-[150px]">{stats?.database.host}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Database</span>
              <span className="text-contrast font-medium">{stats?.database.name}</span>
            </div>
          </div>
        </div>

        {/* Frontend Node */}
        <div className="bg-surface-light border border-primary/20 rounded-xl p-6 shadow-glow-subtle flex flex-col gap-6 md:col-span-2">
          <div className="flex items-center gap-3 border-b border-primary/20 pb-4">
            <Activity className="w-6 h-6 text-secondary" />
            <span className="text-lg font-black uppercase tracking-widest text-contrast">Next.js Frontend Node</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-muted text-xs uppercase tracking-wider">Memory (RSS)</span>
              <span className="text-xl font-bold text-contrast flex items-baseline gap-1">
                {stats?.frontend.memoryUsageMB} <span className="text-xs text-muted font-normal">MB</span>
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted text-xs uppercase tracking-wider">Uptime</span>
              <span className="text-xl font-bold text-contrast">{stats ? formatUptime(stats.frontend.uptime) : '0'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted text-xs uppercase tracking-wider">Node.js</span>
              <span className="text-xl font-bold text-contrast">{stats?.frontend.nodeVersion}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted text-xs uppercase tracking-wider">Platform</span>
              <span className="text-xl font-bold text-contrast capitalize">{stats?.frontend.platform}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
