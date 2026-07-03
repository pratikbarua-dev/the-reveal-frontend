'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Bug, Trash2 } from 'lucide-react';

interface ErrorLogItem {
  _id: string;
  level: string;
  source: string;
  message: string;
  stack?: string;
  route?: string;
  fingerprint: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  resolved: boolean;
  resolvedBy?: string;
}

export default function ErrorsPage() {
  const [errors, setErrors] = useState<ErrorLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [selectedError, setSelectedError] = useState<ErrorLogItem | null>(null);

  const fetchErrors = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/monitoring/errors?resolved=${showResolved}`);
      const data = await res.json();
      setErrors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, [showResolved]);

  const resolveError = async (id: string) => {
    try {
      await fetch(`/api/admin/monitoring/errors/${id}`, { method: 'POST' });
      if (selectedError?._id === id) setSelectedError(null);
      fetchErrors();
    } catch (e) {
      console.error(e);
    }
  };

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'fatal': return 'bg-rose-500/20 text-rose-500 border-rose-500/50';
      case 'error': return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
      default: return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-contrast tracking-tight uppercase flex items-center gap-3">
            <Bug className="w-8 h-8 text-secondary" />
            Error Center
          </h1>
          <p className="text-muted text-sm mt-1">Structured exception tracking and resolution management.</p>
        </div>
        <button 
          onClick={() => setShowResolved(!showResolved)}
          className="px-4 py-2 bg-surface-elevated hover:bg-primary/20 border border-primary/20 rounded-lg text-xs font-bold uppercase tracking-widest text-contrast transition-colors"
        >
          {showResolved ? 'Show Active' : 'Show Resolved'}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-muted animate-pulse">Loading errors...</div>
        ) : errors.length === 0 ? (
          <div className="bg-surface-light border border-primary/20 rounded-xl p-12 flex flex-col items-center justify-center text-muted gap-4">
            <CheckCircle className="w-12 h-12 opacity-50 text-green-500" />
            <span className="font-bold tracking-widest uppercase">No {showResolved ? 'Resolved' : 'Active'} Errors Found</span>
          </div>
        ) : (
          errors.map((error) => (
            <div key={error._id} className="bg-surface-light border border-primary/20 hover:border-secondary/50 rounded-xl p-5 transition-all shadow-glow-subtle flex flex-col md:flex-row md:items-center gap-4 cursor-pointer" onClick={() => setSelectedError(error)}>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${getLevelColor(error.level)}`}>
                    {error.level}
                  </span>
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">{error.source}</span>
                  {error.route && <span className="text-xs font-mono text-primary bg-primary/10 px-2 rounded">{error.route}</span>}
                  <span className="text-xs text-muted flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {error.count} occurrences
                  </span>
                </div>
                <p className="text-sm text-contrast font-medium line-clamp-1">{error.message}</p>
                <div className="text-[10px] text-muted tracking-wide flex items-center gap-4">
                  <span>First seen: {new Date(error.firstSeen).toLocaleString()}</span>
                  <span>Last seen: {new Date(error.lastSeen).toLocaleString()}</span>
                </div>
              </div>
              {!error.resolved && (
                <button 
                  onClick={(e) => { e.stopPropagation(); resolveError(error._id); }}
                  className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors self-start md:self-center shrink-0"
                >
                  Resolve
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedError(null)}>
          <div className="bg-surface-light border border-primary/30 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-glow" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-primary/20 flex items-center justify-between bg-surface-elevated/50">
              <div className="flex items-center gap-3">
                <Bug className="w-5 h-5 text-secondary" />
                <span className="text-lg font-black text-contrast uppercase tracking-widest">Error Details</span>
              </div>
              <button onClick={() => setSelectedError(null)} className="text-muted hover:text-contrast"><Trash2 className="w-5 h-5"/></button>
            </div>
            <div className="p-6 overflow-y-auto flex flex-col gap-6 flex-1">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted uppercase tracking-widest font-bold">Message</span>
                <span className="text-lg text-contrast font-medium">{selectedError.message}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1"><span className="text-xs text-muted uppercase tracking-widest font-bold">Level</span><span className="text-sm font-medium text-contrast">{selectedError.level}</span></div>
                <div className="flex flex-col gap-1"><span className="text-xs text-muted uppercase tracking-widest font-bold">Source</span><span className="text-sm font-medium text-contrast">{selectedError.source}</span></div>
                <div className="flex flex-col gap-1"><span className="text-xs text-muted uppercase tracking-widest font-bold">Count</span><span className="text-sm font-medium text-contrast">{selectedError.count}</span></div>
                <div className="flex flex-col gap-1"><span className="text-xs text-muted uppercase tracking-widest font-bold">Route</span><span className="text-sm font-mono text-primary">{selectedError.route || 'N/A'}</span></div>
              </div>
              {selectedError.stack && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted uppercase tracking-widest font-bold">Stack Trace</span>
                  <pre className="p-4 bg-surface rounded-lg text-xs font-mono text-contrast/80 overflow-x-auto border border-primary/10">
                    {selectedError.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
