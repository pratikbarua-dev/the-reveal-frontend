'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User as UserIcon, Calendar, Clock, PlayCircle, EyeOff, ShieldAlert, ArrowLeft } from 'lucide-react';
import MetricCard from '@/components/admin/monitoring/MetricCard';

interface UserProfile {
  _id: string;
  name?: string;
  email: string;
  image?: string;
  googleId?: string;
  createdAt: string;
  lastSeen: string;
  statistics: {
    sessionsPlayed: number;
    sessionsHosted: number;
    vetoesCast: number;
  };
  history: string[];
}

interface UserSession {
  _id: string;
  roomCode: string;
  status: string;
  createdAt: string;
  currentPositionId?: { title: string };
  participants: { userId: string; role: string; displayName: string }[];
}

export default function UserStatsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`);
        const data = await res.json();
        setUser(data.user);
        setSessions(data.sessions);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <div className="text-muted animate-pulse max-w-6xl mx-auto">Loading user statistics...</div>;
  if (!user) return <div className="text-rose-500 max-w-6xl mx-auto">User not found.</div>;

  const lastSeenDate = new Date(user.lastSeen);
  const isOnline = (Date.now() - lastSeenDate.getTime()) < 5 * 60 * 1000; // < 5 mins
  const isAway = !isOnline && (Date.now() - lastSeenDate.getTime()) < 24 * 60 * 60 * 1000; // < 24h

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      
      <button onClick={() => router.back()} className="flex items-center gap-2 text-muted hover:text-contrast transition-colors self-start text-sm font-bold uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      {/* Profile Header */}
      <div className="bg-surface-light border border-primary/20 rounded-2xl p-8 shadow-glow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Status Indicator Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${isOnline ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : isAway ? 'bg-amber-500' : 'bg-muted'}`} />

        <div className="flex items-center gap-6">
          <div className="relative">
            {user.image ? (
              <img src={user.image} alt={user.name || 'User'} className="w-20 h-20 rounded-full border-2 border-primary/20 object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full border-2 border-primary/20 bg-surface flex items-center justify-center text-muted">
                <UserIcon className="w-8 h-8" />
              </div>
            )}
            <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-surface-light ${isOnline ? 'bg-green-500 animate-pulse' : isAway ? 'bg-amber-500' : 'bg-muted'}`} title={isOnline ? 'Online' : isAway ? 'Away' : 'Offline'} />
          </div>
          
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black text-contrast tracking-tight">{user.name || 'Anonymous Guest'}</h1>
            <span className="text-sm text-secondary font-mono">{user.email}</span>
            <div className="flex items-center gap-4 mt-1 text-xs font-bold text-muted uppercase tracking-widest">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Last seen {lastSeenDate.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Moderation Action
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Sessions Played"
          value={user.statistics?.sessionsPlayed || 0}
          icon={PlayCircle}
        />
        <MetricCard
          title="Sessions Hosted"
          value={user.statistics?.sessionsHosted || 0}
          icon={PlayCircle}
        />
        <MetricCard
          title="Cards Revealed"
          value={user.history?.length || 0}
          icon={UserIcon}
        />
        <MetricCard
          title="Vetoes Cast"
          value={user.statistics?.vetoesCast || 0}
          icon={EyeOff}
        />
      </div>

      {/* Session History */}
      <div className="bg-surface-light border border-primary/20 rounded-xl overflow-hidden shadow-glow-subtle mt-4">
        <div className="p-5 bg-surface-elevated border-b border-primary/20 flex items-center gap-3">
          <History className="w-5 h-5 text-secondary" />
          <h2 className="text-lg font-black uppercase tracking-widest text-contrast">Recent Activity History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-muted text-xs uppercase tracking-widest">
                <th className="p-4 font-bold border-b border-primary/20">Date</th>
                <th className="p-4 font-bold border-b border-primary/20">Room Code</th>
                <th className="p-4 font-bold border-b border-primary/20">Role</th>
                <th className="p-4 font-bold border-b border-primary/20">Status</th>
                <th className="p-4 font-bold border-b border-primary/20">Last Card</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted italic">No recent sessions found.</td>
                </tr>
              ) : (
                sessions.map((session) => {
                  const userRole = session.participants.find(p => p.userId === id)?.role || 'player';
                  
                  return (
                    <tr key={session._id} className="border-b border-primary/10 hover:bg-surface/50 transition-colors">
                      <td className="p-4 text-sm text-contrast">{new Date(session.createdAt).toLocaleString()}</td>
                      <td className="p-4 font-mono text-sm text-secondary font-bold uppercase">{session.roomCode}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${
                          userRole === 'host' ? 'bg-primary/20 text-primary border-primary/50' : 'bg-surface-elevated text-contrast border-primary/20'
                        }`}>
                          {userRole}
                        </span>
                      </td>
                      <td className="p-4 text-sm uppercase tracking-wider text-xs font-bold text-muted">{session.status}</td>
                      <td className="p-4 text-sm text-contrast font-medium">{session.currentPositionId?.title || 'None'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Ensure lucide icon History is imported correctly above since it was missed in the auto-import list.
import { History } from 'lucide-react';
