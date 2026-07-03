'use client';

import { useState } from 'react';
import { MessageSquareHeart, X, Send, Heart, Bug, Lightbulb, Sparkles } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<'general' | 'bug' | 'feature'>('general');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setTimeout(() => {
            setSubmitted(false);
            setMessage('');
            setType('general');
          }, 300);
        }, 2000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface border border-primary/20 rounded-3xl w-full max-w-md overflow-hidden shadow-glow-subtle relative flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted hover:text-contrast bg-surface-elevated rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-4 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-2">
              <Heart className="w-8 h-8 fill-primary" />
            </div>
            <h2 className="text-2xl font-black text-contrast uppercase tracking-tight">Thank You!</h2>
            <p className="text-muted text-sm leading-relaxed">
              Your feedback means the world to us. We read every single message to make The Reveal better for you.
            </p>
          </div>
        ) : (
          <>
            <div className="p-6 md:p-8 border-b border-primary/10 bg-surface-light relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-3 relative">
                <MessageSquareHeart className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-black text-contrast uppercase tracking-widest">Feedback</h2>
              </div>
              <p className="text-sm text-contrast/80 leading-relaxed relative">
                <span className="font-bold text-primary">We're still small, but growing fast!</span> Your thoughts, ideas, and little bug reports help us shape the future of this game.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">
              
              <div className="flex gap-2 p-1 bg-surface-elevated rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('general')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    type === 'general' ? 'bg-primary text-background shadow-md' : 'text-muted hover:text-contrast'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> General
                </button>
                <button
                  type="button"
                  onClick={() => setType('feature')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    type === 'feature' ? 'bg-secondary text-background shadow-md' : 'text-muted hover:text-contrast'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" /> Idea
                </button>
                <button
                  type="button"
                  onClick={() => setType('bug')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    type === 'bug' ? 'bg-rose-500 text-white shadow-md' : 'text-muted hover:text-contrast'
                  }`}
                >
                  <Bug className="w-3.5 h-3.5" /> Bug
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full bg-surface-elevated border border-primary/20 rounded-xl p-4 text-contrast placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[120px] resize-none text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-background rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-glow"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Sending...</span>
                ) : (
                  <>
                    Send Feedback <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
