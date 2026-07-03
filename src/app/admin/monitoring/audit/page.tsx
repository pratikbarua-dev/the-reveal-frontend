'use client';

import { useEffect, useState } from 'react';
import { History, Shield, Users } from 'lucide-react';

interface AuditLogItem {
  _id: string;
  action: string;
  category: string;
  performedBy: { name: string; email: string };
  target?: { type: string; label: string };
  timestamp: string;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/monitoring/audit');
        const data = await res.json();
        setLogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-contrast tracking-tight uppercase flex items-center gap-3">
          <Shield className="w-8 h-8 text-secondary" />
          Audit Log
        </h1>
        <p className="text-muted text-sm mt-1">Immutable trail of admin actions and system configuration changes.</p>
      </div>

      <div className="bg-surface-light border border-primary/20 rounded-xl overflow-hidden shadow-glow-subtle">
        {loading ? (
          <div className="p-8 text-muted animate-pulse">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted italic">No audit records found.</div>
        ) : (
          <div className="divide-y divide-primary/10">
            {logs.map((log) => (
              <div key={log._id} className="p-5 flex items-start gap-4 hover:bg-surface/50 transition-colors">
                <div className="p-2 bg-primary/10 rounded-full mt-1">
                  {log.category === 'user' ? <Users className="w-4 h-4 text-primary" /> : <History className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-contrast">{log.action}</span>
                    <span className="text-xs text-muted">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-muted flex items-center gap-2">
                    <span className="font-medium text-secondary">{log.performedBy.name}</span>
                    {log.target && (
                      <>
                        <span>→</span>
                        <span className="px-2 py-0.5 bg-surface rounded text-[10px] uppercase tracking-wider">{log.target.type}: {log.target.label}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
