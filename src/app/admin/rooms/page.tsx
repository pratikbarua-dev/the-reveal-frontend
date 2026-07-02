'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Radio, Users, Eye, MessageSquare } from 'lucide-react';
import { ChatMessage } from '@/types';

interface LiveRoom {
  roomId: string;
  roomCode: string;
  status: 'waiting' | 'active' | 'ended';
  playerCount: number;
  players: string[];
  currentPosition?: string;
  revealProgress: number;
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<LiveRoom[]>([]);
  const [chats, setChats] = useState<{ [roomId: string]: ChatMessage[] }>({});
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to the backend
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
      withCredentials: true,
    });
    setSocket(s);

    s.on('connect', () => {
      s.emit('admin:subscribe');
    });

    s.on('admin:rooms-update', (data: LiveRoom[]) => {
      setRooms(data);
    });

    s.on('admin:room-chat', (message: ChatMessage) => {
      setChats((prev) => {
        const roomChats = prev[message.roomId] || [];
        return {
          ...prev,
          [message.roomId]: [...roomChats, message].slice(-50), // Keep last 50
        };
      });
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-contrast tracking-tight uppercase flex items-center gap-3">
          <Radio className="w-8 h-8 text-rose-500 animate-pulse" />
          Live Room Monitor
        </h1>
        <p className="text-muted text-sm mt-1">Real-time surveillance of all active sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {rooms.length === 0 ? (
          <div className="col-span-full p-12 bg-surface-light border border-primary/20 rounded-xl text-center text-muted shadow-glow-subtle flex flex-col items-center gap-2">
            <Radio className="w-8 h-8 opacity-50" />
            <p>No active rooms right now.</p>
          </div>
        ) : (
          rooms.map((room) => {
            const roomChats = chats[room.roomId] || [];
            
            return (
              <div key={room.roomCode} className="bg-surface-light border border-primary/30 rounded-xl overflow-hidden shadow-glow-subtle flex flex-col relative group hover:border-secondary/50 transition-colors">
                
                {/* Status Indicator */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  room.status === 'active' ? 'bg-secondary shadow-[0_0_10px_rgba(212,175,55,0.8)]' 
                  : room.status === 'waiting' ? 'bg-blue-400' 
                  : 'bg-muted'
                }`} />

                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-secondary font-black tracking-widest uppercase">Room {room.roomCode}</span>
                      <span className="text-[10px] text-muted uppercase mt-0.5 tracking-wider">{room.status}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-primary/20">
                      <Users className="w-3.5 h-3.5 text-muted" />
                      <span className="text-xs font-bold text-contrast">{room.playerCount}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted font-medium tracking-wide">Players:</span>
                    <span className="text-sm text-contrast font-medium">
                      {room.players.join(', ') || 'Waiting...'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted font-medium tracking-wide flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Current Card
                    </span>
                    <span className="text-sm font-black text-contrast uppercase tracking-tight">
                      {room.currentPosition || 'None'}
                    </span>
                    
                    {room.currentPosition && (
                      <div className="mt-2 w-full h-1.5 bg-surface rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" 
                          style={{ width: `${room.revealProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Log */}
                <div className="bg-surface p-4 border-t border-primary/20 flex-1 max-h-48 overflow-y-auto">
                  <span className="text-[10px] text-muted uppercase tracking-widest font-black flex items-center gap-1.5 mb-3">
                    <MessageSquare className="w-3 h-3" /> Live Chat Intercept
                  </span>
                  
                  {roomChats.length === 0 ? (
                    <p className="text-xs text-muted/50 italic">No messages yet.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {roomChats.map((msg, i) => (
                        <div key={i} className="flex flex-col">
                          <span className="text-[9px] text-muted font-bold">{msg.displayName}</span>
                          <span className="text-xs text-contrast/90 leading-snug">{msg.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
