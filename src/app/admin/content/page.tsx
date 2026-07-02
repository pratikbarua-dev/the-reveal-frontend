'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/admin/DataTable';
import { X } from 'lucide-react';

interface AdminPosition {
  _id: string;
  title: string;
  description: string;
  spiceLevel: number;
  partySize: number;
  tagsCount: number;
  createdAt: string;
}

export default function AdminContentPage() {
  const [positions, setPositions] = useState<AdminPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    spiceLevel: 1,
    partySize: 2,
    imageUrl: '',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPositions = async (search = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/positions?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setPositions(data.positions || []);
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...newCard,
        tags: newCard.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      
      const res = await fetch('/api/admin/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewCard({ title: '', description: '', spiceLevel: 1, partySize: 2, imageUrl: '', tags: '' });
        fetchPositions(); // Refresh list
      } else {
        alert('Failed to add card.');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const columns = [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: (pos: AdminPosition) => (
        <span className="font-semibold text-contrast">{pos.title}</span>
      ),
    },
    {
      header: 'Spice Level',
      accessorKey: 'spiceLevel',
      cell: (pos: AdminPosition) => (
        <span className="text-lg">
          {Array(pos.spiceLevel).fill('🌶️').join('')}
        </span>
      ),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (pos: AdminPosition) => (
        <span className="text-xs text-muted max-w-xs truncate block" title={pos.description}>
          {pos.description}
        </span>
      ),
    },
    {
      header: 'Party Size',
      accessorKey: 'partySize',
      cell: (pos: AdminPosition) => (
        <span className="text-xs font-medium text-contrast px-2 py-1 bg-surface-elevated rounded">
          {pos.partySize}P
        </span>
      ),
    },
    {
      header: 'Tags',
      accessorKey: 'tagsCount',
      cell: (pos: AdminPosition) => (
        <span className="text-xs text-muted">{pos.tagsCount} tags</span>
      ),
    }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-contrast tracking-tight uppercase">Content Management</h1>
          <p className="text-muted text-sm mt-1">Manage position cards and their metadata.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/40 border border-primary/50 text-contrast text-sm font-bold tracking-wide uppercase rounded-lg transition-colors shadow-glow"
        >
          + Add Card
        </button>
      </div>

      <DataTable
        data={positions}
        columns={columns}
        isLoading={loading}
        onSearch={fetchPositions}
        searchPlaceholder="Search by title, description, or tags..."
      />

      {/* Add Card Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
          <div 
            className="bg-surface-light border border-primary/30 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-glow"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-primary/20 flex items-center justify-between bg-surface-elevated/50">
              <span className="text-lg font-bold text-contrast">Add New Position</span>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-muted hover:text-contrast transition-colors rounded-full hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted font-bold uppercase tracking-wider">Title</label>
                <input 
                  required
                  type="text" 
                  value={newCard.title}
                  onChange={e => setNewCard({...newCard, title: e.target.value})}
                  className="w-full bg-surface border border-primary/20 rounded-lg p-3 text-sm text-contrast focus:border-secondary focus:outline-none" 
                  placeholder="e.g. The Lotus"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted font-bold uppercase tracking-wider">Description</label>
                <textarea 
                  required
                  value={newCard.description}
                  onChange={e => setNewCard({...newCard, description: e.target.value})}
                  className="w-full bg-surface border border-primary/20 rounded-lg p-3 text-sm text-contrast focus:border-secondary focus:outline-none resize-none h-24" 
                  placeholder="Describe the position..."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs text-muted font-bold uppercase tracking-wider">Spice Level</label>
                  <select 
                    value={newCard.spiceLevel}
                    onChange={e => setNewCard({...newCard, spiceLevel: parseInt(e.target.value)})}
                    className="w-full bg-surface border border-primary/20 rounded-lg p-3 text-sm text-contrast focus:border-secondary focus:outline-none"
                  >
                    <option value={1}>1 - Mild</option>
                    <option value={2}>2 - Spicy</option>
                    <option value={3}>3 - Inferno</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs text-muted font-bold uppercase tracking-wider">Party Size</label>
                  <select 
                    value={newCard.partySize}
                    onChange={e => setNewCard({...newCard, partySize: parseInt(e.target.value)})}
                    className="w-full bg-surface border border-primary/20 rounded-lg p-3 text-sm text-contrast focus:border-secondary focus:outline-none"
                  >
                    <option value={2}>2 Players</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted font-bold uppercase tracking-wider">Image URL</label>
                <input 
                  required
                  type="url" 
                  value={newCard.imageUrl}
                  onChange={e => setNewCard({...newCard, imageUrl: e.target.value})}
                  className="w-full bg-surface border border-primary/20 rounded-lg p-3 text-sm text-contrast focus:border-secondary focus:outline-none" 
                  placeholder="https://..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted font-bold uppercase tracking-wider">Tags (comma separated)</label>
                <input 
                  type="text" 
                  value={newCard.tags}
                  onChange={e => setNewCard({...newCard, tags: e.target.value})}
                  className="w-full bg-surface border border-primary/20 rounded-lg p-3 text-sm text-contrast focus:border-secondary focus:outline-none" 
                  placeholder="missionary, deep, easy"
                />
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg font-bold text-sm text-muted hover:text-contrast transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-secondary text-surface-light rounded-lg font-bold text-sm hover:bg-secondary-light transition-colors shadow-glow-subtle disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
