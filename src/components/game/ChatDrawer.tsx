'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types';
import { Send, MessageSquareCode, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ChatDrawerProps {
  open: boolean;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  userId: string;
  onClose?: () => void;
}

export default function ChatDrawer({ open, messages, onSendMessage, userId, onClose }: ChatDrawerProps) {
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  if (!open) return null;

  return (
    <div className="fixed top-16 right-0 bottom-16 w-80 bg-surface-light border-l border-primary/20 shadow-glow-intense flex flex-col z-40 animate-slide-up font-sans">
      {/* Header */}
      <div className="p-4 border-b border-primary/15 flex items-center justify-between text-secondary">
        <div className="flex items-center gap-2">
          <MessageSquareCode className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Lobby Chat
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-primary/15 rounded text-muted hover:text-contrast transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted text-xs gap-1 opacity-60">
            <span>No messages yet.</span>
            <span>Send a whisper to begin.</span>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.userId === userId;

            return (
              <div
                key={idx}
                className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <span className="text-[9px] font-bold text-muted uppercase tracking-wider mb-0.5">
                  {msg.displayName}
                </span>
                <div
                  className={`px-3 py-2 text-xs rounded-[var(--radius-card)] border ${
                    isMe
                      ? 'bg-primary/10 border-primary/25 text-contrast'
                      : 'bg-surface-elevated/60 border-surface-elevated text-contrast'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-primary/15 flex gap-2">
        <Input
          placeholder="Whisper..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="px-3 py-2 text-xs rounded-full bg-surface-elevated/60"
        />
        <button
          type="submit"
          className="p-2.5 rounded-full bg-primary hover:bg-primary-light text-contrast active:scale-95 transition-all shadow-glow flex items-center justify-center cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
