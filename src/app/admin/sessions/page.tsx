'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/admin/DataTable';
import { X, CheckCircle, XCircle } from 'lucide-react';

interface SessionHistoryItem {
  positionTitle: string;
  imageUrl?: string;
  spiceLevel?: number;
  revealedAt: string;
  vetoed: boolean;
}

interface AdminSession {
  _id: string;
  roomCode: string;
  status: string;
  hostName: string;
  players: string[];
  revealedCount: number;
  vetoedCount: number;
  createdAt: string;
  updatedAt: string;
  history: SessionHistoryItem[];
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<AdminSession | null>(null);

  const fetchSessions = async (search = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sessions?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const formatDuration = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diffMins = Math.round((e - s) / 60000);
    return `${diffMins}m`;
  };

  const columns = [
    {
      header: 'Room Code',
      accessorKey: 'roomCode',
      cell: (session: AdminSession) => (
        <span className="font-black text-secondary tracking-widest">{session.roomCode}</span>
      ),
    },
    {
      header: 'Host',
      accessorKey: 'hostName',
      cell: (session: AdminSession) => (
        <span className="font-medium text-contrast">{session.hostName}</span>
      ),
    },
    {
      header: 'Players',
      accessorKey: 'players',
      cell: (session: AdminSession) => (
        <span className="text-xs text-muted max-w-[150px] truncate block" title={session.players.join(', ')}>
          {session.players.join(', ')}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (session: AdminSession) => (
        <span className={`text-[10px] uppercase font-bold tracking-wider ${
          session.status === 'active' ? 'text-secondary' 
          : session.status === 'ended' ? 'text-muted' 
          : 'text-blue-400'
        }`}>
          {session.status}
        </span>
      ),
    },
    {
      header: 'Revealed (Vetoed)',
      accessorKey: 'counts',
      cell: (session: AdminSession) => (
        <div className="text-xs">
          <span className="text-contrast font-bold">{session.revealedCount}</span>
          <span className="text-muted"> ({session.vetoedCount})</span>
        </div>
      ),
    },
    {
      header: 'Duration',
      accessorKey: 'duration',
      cell: (session: AdminSession) => (
        <span className="text-xs text-muted">
          {formatDuration(session.createdAt, session.updatedAt)}
        </span>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: (session: AdminSession) => (
        <span className="text-xs text-muted">
          {new Date(session.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-contrast tracking-tight uppercase">Session History</h1>
        <p className="text-muted text-sm mt-1">Review completed games and the exact positions they explored.</p>
      </div>

      <DataTable
        data={sessions}
        columns={columns}
        isLoading={loading}
        onSearch={fetchSessions}
        searchPlaceholder="Search by room code..."
        onRowClick={(session) => setSelectedSession(session)}
      />

      {/* Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedSession(null)}>
          <div 
            className="bg-surface-light border border-primary/30 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-glow"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-primary/20 flex items-center justify-between bg-surface-elevated/50">
              <div className="flex flex-col">
                <span className="text-xs text-secondary font-black uppercase tracking-widest">Room {selectedSession.roomCode}</span>
                <span className="text-lg font-bold text-contrast">Session Details</span>
              </div>
              <button onClick={() => setSelectedSession(null)} className="p-2 text-muted hover:text-contrast transition-colors rounded-full hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-8">
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-muted text-xs uppercase tracking-wider">Host</span>
                  <span className="text-contrast font-medium">{selectedSession.hostName}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted text-xs uppercase tracking-wider">Players</span>
                  <span className="text-contrast font-medium">{selectedSession.players.join(', ')}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted text-xs uppercase tracking-wider">Date</span>
                  <span className="text-contrast font-medium">{new Date(selectedSession.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-black text-contrast uppercase tracking-widest border-b border-primary/20 pb-2">
                  Timeline of Positions Tried
                </h3>
                
                {selectedSession.history.length === 0 ? (
                  <p className="text-muted text-sm italic">No cards were revealed in this session.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {selectedSession.history.map((hist, idx) => (
                      <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl border ${hist.vetoed ? 'bg-rose-500/5 border-rose-500/20' : 'bg-surface border-primary/10'}`}>
                        <div className="w-8 h-8 rounded-full bg-surface-elevated border border-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-black text-muted">{idx + 1}</span>
                        </div>
                        
                        {hist.imageUrl ? (
                          <img src={hist.imageUrl} alt={hist.positionTitle} className="w-12 h-12 rounded-lg object-cover border border-primary/20" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-surface-elevated border border-primary/20" />
                        )}
                        
                        <div className="flex flex-col flex-1">
                          <span className="font-bold text-contrast">{hist.positionTitle}</span>
                          <span className="text-xs text-muted flex items-center gap-2">
                            {hist.spiceLevel && <span>{Array(hist.spiceLevel).fill('🌶️').join('')}</span>}
                            <span>•</span>
                            <span>{new Date(hist.revealedAt).toLocaleTimeString()}</span>
                          </span>
                        </div>

                        {hist.vetoed ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-widest px-3 py-1 bg-rose-500/10 rounded-lg">
                            <XCircle className="w-4 h-4" /> Vetoed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 uppercase tracking-widest px-3 py-1 bg-green-500/10 rounded-lg">
                            <CheckCircle className="w-4 h-4" /> Played
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
