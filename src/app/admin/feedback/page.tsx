'use client';

import { useEffect, useState } from 'react';
import { MessageSquareHeart, CheckCircle, Lightbulb, Bug, Sparkles } from 'lucide-react';

interface FeedbackItem {
  _id: string;
  type: 'general' | 'bug' | 'feature';
  message: string;
  email?: string;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: string;
  userId?: { name: string; email: string };
}

export default function AdminFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'new' | 'reviewed' | 'resolved' | 'all'>('new');

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/feedback?status=${filter}`);
      const data = await res.json();
      setFeedbackList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [filter]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchFeedback();
    } catch (e) {
      console.error(e);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="w-4 h-4 text-rose-500" />;
      case 'feature': return <Lightbulb className="w-4 h-4 text-secondary" />;
      default: return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-contrast tracking-tight uppercase flex items-center gap-3">
            <MessageSquareHeart className="w-8 h-8 text-primary" />
            User Feedback
          </h1>
          <p className="text-muted text-sm mt-1">Review suggestions and bug reports from the community.</p>
        </div>

        <div className="flex items-center gap-2 bg-surface border border-primary/20 rounded-lg p-1">
          {['new', 'reviewed', 'resolved', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                filter === status ? 'bg-primary text-background shadow-md' : 'text-muted hover:text-contrast'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-muted animate-pulse">Loading feedback...</div>
        ) : feedbackList.length === 0 ? (
          <div className="bg-surface-light border border-primary/20 rounded-xl p-12 flex flex-col items-center justify-center text-muted gap-4 shadow-glow-subtle">
            <CheckCircle className="w-12 h-12 opacity-50 text-green-500" />
            <span className="font-bold tracking-widest uppercase">No {filter !== 'all' ? filter : ''} feedback found.</span>
          </div>
        ) : (
          feedbackList.map((item) => (
            <div key={item._id} className="bg-surface-light border border-primary/20 rounded-xl p-6 shadow-glow-subtle flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface rounded-lg border border-primary/10">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">{item.type}</span>
                    <span className="text-sm font-medium text-contrast/70">
                      {item.userId?.name || 'Anonymous User'} 
                      {(item.email || item.userId?.email) && ` (${item.email || item.userId?.email})`}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-muted tracking-widest font-bold uppercase">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="p-4 bg-surface rounded-lg border border-primary/10 text-contrast text-sm leading-relaxed whitespace-pre-wrap">
                "{item.message}"
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-primary/10">
                {item.status !== 'new' && (
                  <button 
                    onClick={() => updateStatus(item._id, 'new')}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted hover:text-contrast transition-colors"
                  >
                    Mark as New
                  </button>
                )}
                {item.status !== 'reviewed' && (
                  <button 
                    onClick={() => updateStatus(item._id, 'reviewed')}
                    className="px-4 py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Mark Reviewed
                  </button>
                )}
                {item.status !== 'resolved' && (
                  <button 
                    onClick={() => updateStatus(item._id, 'resolved')}
                    className="px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
