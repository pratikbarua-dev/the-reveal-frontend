'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import { useSession } from 'next-auth/react';
import type { IGameSession, PositionCard, VetoResult, ChatMessage } from '@/types';

export function useRoom() {
  const socket = useSocket();
  const { data: session } = useSession();

  const [roomState, setRoomState] = useState<IGameSession | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('reveal_roomState');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [currentPosition, setCurrentPosition] = useState<PositionCard | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('reveal_currentPosition');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [assignedText, setAssignedText] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('reveal_assignedText') || '';
    }
    return '';
  });

  const [revealProgress, setRevealProgress] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reveal_revealProgress');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [isRevealed, setIsRevealed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('reveal_isRevealed') === 'true';
    }
    return false;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeVeto, setActiveVeto] = useState<{ callerId: string; expiresIn: number } | null>(null);
  const [vetoResult, setVetoResult] = useState<VetoResult | null>(null);
  const [activeTurnUserId, setActiveTurnUserId] = useState<string>('');
  const [activeTurnIndex, setActiveTurnIndex] = useState<number>(0);
  const [reactions, setReactions] = useState<{ emoji: string; userId: string; id: string }[]>([]);

  const userId = session?.user?.id || '';
  const displayName = session?.user?.name || 'Guest';

  // Synchronize state changes to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (roomState) {
      localStorage.setItem('reveal_roomState', JSON.stringify(roomState));
      localStorage.setItem('activeRoomCode', roomState.roomCode);
    } else {
      localStorage.removeItem('reveal_roomState');
      localStorage.removeItem('activeRoomCode');
    }
  }, [roomState]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (currentPosition) {
      localStorage.setItem('reveal_currentPosition', JSON.stringify(currentPosition));
    } else {
      localStorage.removeItem('reveal_currentPosition');
    }
  }, [currentPosition]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('reveal_assignedText', assignedText);
  }, [assignedText]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('reveal_revealProgress', revealProgress.toString());
  }, [revealProgress]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('reveal_isRevealed', isRevealed ? 'true' : 'false');
  }, [isRevealed]);

  // Auto-rejoin room on socket connection/reconnection
  useEffect(() => {
    if (!socket || !userId) return;

    const handleConnect = () => {
      const savedRoomCode = localStorage.getItem('activeRoomCode');
      if (savedRoomCode) {
        socket.emit('room:join', {
          roomCode: savedRoomCode,
          userId,
          displayName,
          avatarUrl: session?.user?.image || undefined,
        });
      }
    };

    socket.on('connect', handleConnect);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [socket, userId, displayName, session]);

  // Room lifecycle functions
  const createRoom = useCallback((settings: any) => {
    if (!userId) return;
    socket.emit('room:create', {
      userId,
      displayName,
      avatarUrl: session?.user?.image || undefined,
      settings,
    });
  }, [socket, userId, displayName, session]);

  const joinRoom = useCallback((roomCode: string) => {
    if (!userId) return;
    socket.emit('room:join', {
      roomCode,
      userId,
      displayName,
      avatarUrl: session?.user?.image || undefined,
    });
  }, [socket, userId, displayName, session]);

  const leaveRoom = useCallback(() => {
    if (!roomState) return;
    socket.emit('room:leave', { roomId: (roomState as any).roomId || roomState.roomCode });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('activeRoomCode');
    }
    setRoomState(null);
    setCurrentPosition(null);
  }, [socket, roomState]);

  const startRoom = useCallback(() => {
    if (!roomState) return;
    socket.emit('room:start', { roomId: (roomState as any).roomId || roomState.roomCode });
  }, [socket, roomState]);

  const nextCard = useCallback(() => {
    if (!roomState) return;
    socket.emit('card:next', { roomId: (roomState as any).roomId || roomState.roomCode });
  }, [socket, roomState]);

  const resetCard = useCallback(() => {
    if (!roomState) return;
    socket.emit('card:reset', { roomId: (roomState as any).roomId || roomState.roomCode });
  }, [socket, roomState]);

  const callVeto = useCallback(() => {
    if (!roomState) return;
    socket.emit('vote:veto-call', { roomId: (roomState as any).roomId || roomState.roomCode });
  }, [socket, roomState]);

  const castVetoVote = useCallback((vote: boolean) => {
    if (!roomState) return;
    socket.emit('vote:cast', { roomId: (roomState as any).roomId || roomState.roomCode, vote });
    setActiveVeto(null);
  }, [socket, roomState]);

  const sendReaction = useCallback((emoji: string) => {
    if (!roomState || !userId) return;
    socket.emit('reaction:send', { roomId: (roomState as any).roomId || roomState.roomCode, emoji, userId });
  }, [socket, roomState, userId]);

  const sendChatMessage = useCallback((text: string) => {
    if (!roomState) return;
    socket.emit('chat:message', { roomId: (roomState as any).roomId || roomState.roomCode, text });
  }, [socket, roomState]);

  const passTurn = useCallback(() => {
    if (!roomState) return;
    socket.emit('turn:pass', { roomId: (roomState as any).roomId || roomState.roomCode });
  }, [socket, roomState]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('room:created', (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('activeRoomCode', data.roomCode);
      }
      // Set a temporary mock room state
      setRoomState({
        roomCode: data.roomCode,
        roomId: data.roomId,
        participants: [{ displayName, userId: userId as any, role: 'host', isConnected: true }],
        settings: { partySize: 2, hardLimits: [], turnBased: false },
        status: 'waiting',
      } as any);
    });

    socket.on('room:joined', (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('activeRoomCode', data.room.roomCode);
      }
      setRoomState(data.room as any);
      if (data.room) {
        setIsRevealed(data.room.isRevealed || false);
        setRevealProgress(data.room.revealProgress || 0);
      }
    });

    socket.on('room:player-joined', (data) => {
      setRoomState((prev) => {
        if (!prev) return null;
        // Check if duplicate
        if (prev.participants.some((p) => p.userId?.toString() === data.participant.userId?.toString())) return prev;
        return {
          ...prev,
          participants: [...prev.participants, data.participant],
        };
      });
    });

    socket.on('room:player-left', (data) => {
      setRoomState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          participants: prev.participants.filter((p) => p.userId?.toString() !== data.userId?.toString()),
        };
      });
    });

    socket.on('room:started', (data) => {
      setRoomState((prev) => (prev ? { ...prev, status: 'active' } : null));
      if (data.position) {
        setCurrentPosition(data.position);
        setAssignedText(data.assignedText);
      }
      setIsRevealed(false);
      setRevealProgress(0);
    });

    socket.on('scratch:progress', (data) => {
      setRevealProgress(data.percentage);
    });

    socket.on('scratch:reveal', (data) => {
      setIsRevealed(true);
      setRevealProgress(100);
      if (data.position) {
        setCurrentPosition(data.position);
        setAssignedText(data.assignedText);
      }
    });

    socket.on('card:loaded', (data) => {
      setCurrentPosition(data.position || null);
      setAssignedText(data.assignedText || '');
      setIsRevealed(data.isRevealed ?? false);
      setRevealProgress(data.revealProgress ?? 0);
    });

    socket.on('vote:veto-prompt', (data) => {
      setActiveVeto(data);
      setVetoResult(null);
    });

    socket.on('vote:result', (data) => {
      setVetoResult(data);
      setActiveVeto(null);
      setTimeout(() => setVetoResult(null), 5000);
    });

    socket.on('turn:current', (data) => {
      setActiveTurnUserId(data.userId);
      setActiveTurnIndex(data.turnIndex);
    });

    socket.on('reaction:send', (data) => {
      const reactionId = Math.random().toString(36).substring(2, 9);
      setReactions((prev) => [...prev, { ...data, id: reactionId }]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reactionId));
      }, 2000);
    });

    socket.on('chat:message', (data) => {
      setChatMessages((prev) => {
        const next = [...prev, data];
        if (next.length > 100) return next.slice(next.length - 100);
        return next;
      });
    });

    return () => {
      socket.off('room:created');
      socket.off('room:joined');
      socket.off('room:player-joined');
      socket.off('room:player-left');
      socket.off('room:started');
      socket.off('scratch:progress');
      socket.off('scratch:reveal');
      socket.off('card:loaded');
      socket.off('vote:veto-prompt');
      socket.off('vote:result');
      socket.off('turn:current');
      socket.off('reaction:send');
      socket.off('chat:message');
    };
  }, [socket, displayName, userId]);

  return {
    socket,
    roomState,
    currentPosition,
    assignedText,
    revealProgress,
    isRevealed,
    chatMessages,
    activeVeto,
    vetoResult,
    activeTurnUserId,
    activeTurnIndex,
    reactions,
    createRoom,
    joinRoom,
    leaveRoom,
    startRoom,
    nextCard,
    resetCard,
    callVeto,
    castVetoVote,
    sendReaction,
    sendChatMessage,
    passTurn,
    setCurrentPosition,
    setAssignedText,
    setIsRevealed,
    setRevealProgress,
  };
}
