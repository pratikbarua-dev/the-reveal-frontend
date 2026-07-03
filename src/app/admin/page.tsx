'use client';

import { useEffect, useState } from 'react';
import { Users, UserPlus, Grid, Activity, PlaySquare } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';

interface DashboardStats {
  totalUsers: number;
  newUsers24h: number;
  totalPositions: number;
  totalSessions: number;
  totalSoloSessions: number;
  totalPartnerSessions: number;
  cardsRevealedToday: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-secondary animate-pulse">Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-contrast tracking-tight uppercase">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Overview of system metrics and activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
        />
        <StatCard 
          title="New Users (24h)" 
          value={stats?.newUsers24h || 0} 
          icon={UserPlus} 
          trend="Past 24 hours"
          trendUp={true}
        />
        <StatCard 
          title="Total Positions" 
          value={stats?.totalPositions || 0} 
          icon={Grid} 
        />
        <StatCard 
          title="Sessions Played" 
          value={stats?.totalSessions || 0} 
          icon={PlaySquare} 
          trend={`Solo: ${stats?.totalSoloSessions || 0} | Partner: ${stats?.totalPartnerSessions || 0}`}
        />
        <StatCard 
          title="Cards Revealed (Today)" 
          value={stats?.cardsRevealedToday || 0} 
          icon={Activity} 
          trend="Today"
          trendUp={true}
        />
      </div>
    </div>
  );
}
