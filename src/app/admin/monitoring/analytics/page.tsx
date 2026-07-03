'use client';

import { useEffect, useState } from 'react';
import { LineChart, Users, PlayCircle, EyeOff, BarChart3, Flame, Heart } from 'lucide-react';
import MetricCard from '@/components/admin/monitoring/MetricCard';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    totalSessions: number;
    totalSoloSessions: number;
    totalPartnerSessions: number;
    activeSessionsToday: number;
    activeSoloSessionsToday: number;
    activePartnerSessionsToday: number;
  };
  engagement: {
    avgCardsPerSoloSession: number;
    avgCardsPerPartnerSession: number;
    vetoRate: number;
    totalCardsRevealedRecent: number;
  };
  soloPreferences: {
    mild: number;
    spicy: number;
    inferno: number;
    total: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/monitoring/analytics');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="text-muted animate-pulse p-8 text-center uppercase tracking-widest font-bold text-xs mt-12">Loading analytics...</div>;

  const totalSoloSpice = data?.soloPreferences.total || 0;
  const mildPct = totalSoloSpice > 0 ? ((data?.soloPreferences.mild || 0) / totalSoloSpice) * 100 : 0;
  const spicyPct = totalSoloSpice > 0 ? ((data?.soloPreferences.spicy || 0) / totalSoloSpice) * 100 : 0;
  const infernoPct = totalSoloSpice > 0 ? ((data?.soloPreferences.inferno || 0) / totalSoloSpice) * 100 : 0;

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-contrast tracking-tight uppercase flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-secondary" />
          User & Game Analytics
        </h1>
        <p className="text-muted text-sm mt-1">Growth, engagement, and solo preferences powered by DB aggregations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={data?.overview.totalUsers || 0}
          icon={Users}
          trend={`+${data?.overview.newUsersThisWeek} this week`}
        />
        <MetricCard
          title="Total Sessions"
          value={data?.overview.totalSessions || 0}
          icon={PlayCircle}
          trend={`${data?.overview.activeSessionsToday} active today`}
        >
          <div className="flex flex-col gap-1.5 mt-1 text-[11px]">
            <div className="flex justify-between border-b border-primary/5 pb-1">
              <span className="text-muted">Solo Play:</span>
              <span className="font-bold text-contrast">{data?.overview.totalSoloSessions || 0}</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-muted">Partner Play:</span>
              <span className="font-bold text-contrast">{data?.overview.totalPartnerSessions || 0}</span>
            </div>
          </div>
        </MetricCard>
        <MetricCard
          title="Active Today"
          value={data?.overview.activeSessionsToday || 0}
          icon={LineChart}
          trend="Last 24 hours"
        >
          <div className="flex flex-col gap-1.5 mt-1 text-[11px]">
            <div className="flex justify-between border-b border-primary/5 pb-1">
              <span className="text-muted">Solo Active:</span>
              <span className="font-bold text-contrast">{data?.overview.activeSoloSessionsToday || 0}</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-muted">Partner Active:</span>
              <span className="font-bold text-contrast">{data?.overview.activePartnerSessionsToday || 0}</span>
            </div>
          </div>
        </MetricCard>
        <MetricCard
          title="Veto Rate (7d)"
          value={data?.engagement.vetoRate.toFixed(1) || '0.0'}
          unit="%"
          icon={EyeOff}
          trend={`${data?.engagement.totalCardsRevealedRecent} cards revealed`}
        />
      </div>

      {/* Solo vs Partner Play Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Play Depth */}
        <div className="bg-surface-light border border-primary/20 rounded-xl p-6 shadow-glow-subtle flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-primary/10 pb-3">
            <Heart className="w-5 h-5 text-secondary" />
            <h2 className="text-sm font-black uppercase tracking-widest text-contrast">Avg Session Card Depth (7d)</h2>
          </div>
          
          <div className="flex flex-col gap-5 mt-2">
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-contrast mb-2">
                <span>Solo Play</span>
                <span>{(data?.engagement.avgCardsPerSoloSession || 0).toFixed(1)} cards / sess</span>
              </div>
              <div className="w-full bg-surface-elevated h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((data?.engagement.avgCardsPerSoloSession || 0) / 20) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-contrast mb-2">
                <span>Partner Play</span>
                <span>{(data?.engagement.avgCardsPerPartnerSession || 0).toFixed(1)} cards / sess</span>
              </div>
              <div className="w-full bg-surface-elevated h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-secondary to-pink-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((data?.engagement.avgCardsPerPartnerSession || 0) / 20) * 100)}%` }}
                />
              </div>
            </div>
          </div>
          <span className="text-[10px] text-muted uppercase mt-2 block tracking-widest font-semibold leading-relaxed">
            Indicates how many cards are scratched before players exit the session.
          </span>
        </div>

        {/* Solo Spice Preferences */}
        <div className="bg-surface-light border border-primary/20 rounded-xl p-6 shadow-glow-subtle flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-primary/10 pb-3">
            <Flame className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-widest text-contrast">Solo Spice Level Selections (7d)</h2>
          </div>

          {totalSoloSpice === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-muted uppercase tracking-wider py-8">
              No solo card reveals recorded in the past 7 days
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 mt-1">
              {/* Stacked Progress Bar */}
              <div className="w-full bg-surface-elevated h-4 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-400 h-full" 
                  style={{ width: `${mildPct}%` }}
                  title={`Mild: ${data?.soloPreferences.mild} cards`}
                />
                <div 
                  className="bg-amber-400 h-full" 
                  style={{ width: `${spicyPct}%` }}
                  title={`Spicy: ${data?.soloPreferences.spicy} cards`}
                />
                <div 
                  className="bg-rose-500 h-full" 
                  style={{ width: `${infernoPct}%` }}
                  title={`Inferno: ${data?.soloPreferences.inferno} cards`}
                />
              </div>

              {/* Legends with detail counters */}
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div className="flex flex-col items-center p-2.5 bg-surface-elevated/30 rounded-lg border border-primary/5">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                    🌶 Mild
                  </span>
                  <span className="text-sm font-black text-contrast mt-1">{data?.soloPreferences.mild || 0}</span>
                  <span className="text-[9px] text-muted mt-0.5">{mildPct.toFixed(0)}%</span>
                </div>
                <div className="flex flex-col items-center p-2.5 bg-surface-elevated/30 rounded-lg border border-primary/5">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                    🌶🌶 Spicy
                  </span>
                  <span className="text-sm font-black text-contrast mt-1">{data?.soloPreferences.spicy || 0}</span>
                  <span className="text-[9px] text-muted mt-0.5">{spicyPct.toFixed(0)}%</span>
                </div>
                <div className="flex flex-col items-center p-2.5 bg-surface-elevated/30 rounded-lg border border-primary/5">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1">
                    🌶🌶🌶 Inferno
                  </span>
                  <span className="text-sm font-black text-contrast mt-1">{data?.soloPreferences.inferno || 0}</span>
                  <span className="text-[9px] text-muted mt-0.5">{infernoPct.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface-light border border-primary/20 rounded-xl p-8 shadow-glow-subtle flex flex-col items-center justify-center gap-4 text-center mt-4">
        <div className="p-4 bg-primary/10 rounded-full text-secondary">
          <LineChart className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black uppercase tracking-widest text-contrast">Growth Charts</h2>
        <p className="text-muted text-sm max-w-md">
          To visualize historical growth and DAU cohorts, integrate a charting library like Recharts or Chart.js here as outlined in Phase 3.
        </p>
      </div>
    </div>
  );
}
