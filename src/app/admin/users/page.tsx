'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/admin/DataTable';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  isOnboarded: boolean;
  isAdmin: boolean;
  favoritesCount: number;
  historyCount: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (search = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    {
      header: 'User',
      accessorKey: 'name',
      cell: (user: AdminUser) => (
        <div className="flex items-center gap-3">
          {user.image ? (
            <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-primary/20" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-contrast">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-semibold">{user.name || 'Anonymous'}</span>
            <span className="text-xs text-muted">{user.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessorKey: 'isAdmin',
      cell: (user: AdminUser) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          user.isAdmin ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'bg-surface-elevated text-muted'
        }`}>
          {user.isAdmin ? 'Admin' : 'User'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isOnboarded',
      cell: (user: AdminUser) => (
        <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1.5 w-fit ${
          user.isOnboarded ? 'text-green-400' : 'text-rose-400'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${user.isOnboarded ? 'bg-green-400' : 'bg-rose-400'}`} />
          {user.isOnboarded ? 'Onboarded' : 'Pending'}
        </span>
      ),
    },
    {
      header: 'Favs / Hist',
      accessorKey: 'stats',
      cell: (user: AdminUser) => (
        <div className="text-muted text-xs">
          <span className="text-contrast">{user.favoritesCount}</span> / <span className="text-contrast">{user.historyCount}</span>
        </div>
      )
    },
    {
      header: 'Joined',
      accessorKey: 'createdAt',
      cell: (user: AdminUser) => (
        <span className="text-xs text-muted">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: '_id',
      cell: (user: AdminUser) => (
        <Link href={`/admin/users/${user._id}`} className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 w-fit">
          <BarChart3 className="w-3.5 h-3.5" />
          View Profile
        </Link>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-contrast tracking-tight uppercase">User Management</h1>
        <p className="text-muted text-sm mt-1">View and manage all registered users.</p>
      </div>

      <DataTable
        data={users}
        columns={columns}
        isLoading={loading}
        onSearch={fetchUsers}
        searchPlaceholder="Search by name or email..."
      />
    </div>
  );
}
