'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { MessageSquare, RefreshCw, Copy, Check } from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ScratchCard from '@/components/game/ScratchCard';
import ProgressBar from '@/components/game/ProgressBar';
import ActionButtons from '@/components/game/ActionButtons';
import PlayerAvatars from '@/components/game/PlayerAvatars';
import VetoModal from '@/components/game/VetoModal';
import ReactionOverlay from '@/components/game/ReactionOverlay';
import ChatDrawer from '@/components/game/ChatDrawer';

function playPingSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.error('AudioContext playback blocked or failed:', e);
  }
}

export default function PlayPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || '';

  const {
    socket,
    roomState,
    currentPosition,
    assignedText,
    revealProgress,
    isRevealed,
    chatMessages,
    activeVeto,
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
    setCurrentPosition,
    setAssignedText,
    setIsRevealed,
    setRevealProgress,
  } = useRoom();

  const isHost = roomState?.participants.find((p) => p.userId?.toString() === userId)?.role === 'host';

  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileNames, setProfileNames] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevMessagesCount = useRef(chatMessages.length);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  // Auto-rejoin if a saved room code exists in localStorage
  useEffect(() => {
    if (userId && !roomState) {
      const savedRoomCode = localStorage.getItem('activeRoomCode');
      if (savedRoomCode) {
        joinRoom(savedRoomCode);
      }
    }
  }, [userId, roomState, joinRoom]);

  // Manage unread message badge count reactive to new messages & chat drawer open state
  useEffect(() => {
    if (chatOpen) {
      setUnreadCount(0);
    } else {
      const lastMessage = chatMessages[chatMessages.length - 1];
      // Only trigger if a new message arrived from a user other than ourselves
      if (lastMessage && lastMessage.userId !== userId && chatMessages.length > prevMessagesCount.current) {
        setUnreadCount((prev) => prev + (chatMessages.length - prevMessagesCount.current));
        playPingSound();
      }
    }
    prevMessagesCount.current = chatMessages.length;
  }, [chatMessages, chatOpen, userId]);

  // Fetch onboarding names for dynamic placeholders mapping fallback
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.participantNames && data.participantNames.length > 0) {
            setProfileNames(data.participantNames);
          }
        }
      } catch (e) {
        console.error('Failed to load profile names:', e);
      }
    };
    fetchProfile();
  }, []);

  // If in active room, fetch a random card initially if none loaded
  // Any player can trigger this if the card is missing, to prevent deadlocks.
  useEffect(() => {
    if (roomState && roomState.status === 'active' && !currentPosition) {
      loadNextPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomState, currentPosition, isHost]);

  const loadNextPosition = async () => {
    try {
      const partySize = roomState?.settings?.partySize || 2;
      const res = await fetch(`/api/positions/random?partySize=${partySize}`);
      if (!res.ok) throw new Error('Failed to load random position');
      const position = await res.json();

      // Assign roles from connected session names padded with onboarding names
      const participants = roomState?.participants.map((p) => p.displayName) || [];
      const namesToUse = [...participants];
      
      const targetCount = roomState?.settings?.partySize || 2;
      for (let i = namesToUse.length; i < targetCount; i++) {
        if (profileNames && profileNames[i]) {
          namesToUse.push(profileNames[i]);
        } else {
          namesToUse.push(`Player ${i + 1}`);
        }
      }

      const assignRoles = (template: string, names: string[]) => {
        let result = template;
        names.forEach((name, i) => {
          result = result.replaceAll(`{Player${i + 1}}`, name);
        });
        return result;
      };

      const finalText = assignRoles(position.descriptionTemplate, namesToUse);

      setCurrentPosition(position);
      setAssignedText(finalText);
      setIsRevealed(false);
      setRevealProgress(0);

      // Synchronize the card details to all other players in the room
      if (socket && roomState) {
        socket.emit('card:sync', {
          roomId: (roomState as any).roomId || roomState.roomCode,
          position,
          assignedText: finalText,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCode = () => {
    if (!roomState) return;
    navigator.clipboard.writeText(roomState.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  if (!roomState) {
    return (
      <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center p-6 bg-surface overflow-hidden">
        {/* Lobby selector panel */}
        <div className="relative z-10 w-full max-w-md bg-surface-light border border-primary/20 rounded-[var(--radius-xl)] shadow-glow p-6 md:p-8 flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight text-gradient uppercase font-sans">
              Enter Discovery
            </h1>
            <p className="text-muted text-xs mt-2 uppercase tracking-widest font-sans">
              Create a session or join an existing lobby
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Join Room */}
            <div className="flex flex-col gap-2 p-4 bg-surface-elevated/40 rounded-[var(--radius-card)] border border-primary/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary font-sans">
                Join Lobby
              </span>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="6-LETTER CODE"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="text-center font-bold tracking-widest py-2 rounded-full uppercase"
                />
                <Button variant="secondary" size="md" onClick={() => joinRoom(inputCode)}>
                  Join
                </Button>
              </div>
            </div>

            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-elevated" />
              </div>
              <span className="relative px-3 bg-surface-light text-[9px] font-bold text-muted uppercase tracking-widest">
                Or
              </span>
            </div>

            {/* Create Room */}
            <Button
              variant="primary"
              size="lg"
              onClick={() =>
                createRoom({
                  partySize: 2,
                  hardLimits: [],
                  turnBased: false,
                })
              }
              className="w-full"
            >
              Host Lobby
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Lobby view before starting
  if (roomState.status === 'waiting') {
    return (
      <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center p-6 bg-surface overflow-hidden">
        <div className="relative z-10 w-full max-w-md bg-surface-light border border-primary/20 rounded-[var(--radius-xl)] shadow-glow p-6 md:p-8 flex flex-col gap-6 font-sans">
          <div className="text-center">
            <span className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">Lobby Code</span>
            <div className="flex items-center justify-center gap-2 mt-1.5">
              <span className="text-3xl font-black text-contrast tracking-widest uppercase">
                {roomState.roomCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 text-muted hover:text-contrast active:scale-90 transition-transform cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-primary font-sans text-center">
              Players In Lobby ({roomState.participants.length}/4)
            </span>
            <PlayerAvatars participants={roomState.participants} hostUserId={userId} />

            <div className="mt-4 flex flex-col gap-2">
              {isHost ? (
                <Button variant="primary" size="lg" className="w-full" onClick={startRoom}>
                  Start Session
                </Button>
              ) : (
                <div className="text-center text-xs text-muted py-3 border border-surface-elevated rounded-[var(--radius-card)] bg-surface-elevated/20 uppercase tracking-widest font-semibold animate-pulse">
                  Waiting for host to start
                </div>
              )}
              <Button variant="ghost" size="md" className="w-full" onClick={() => setLeaveModalOpen(true)}>
                Leave Lobby
              </Button>
            </div>
          </div>
        </div>

        {/* Leave Lobby Confirmation Modal */}
        {leaveModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-surface-light border border-primary/20 rounded-[var(--radius-xl)] p-6 shadow-glow flex flex-col gap-5">
              <h3 className="text-base font-black text-secondary uppercase tracking-wider text-center">
                Leave Lobby?
              </h3>
              <p className="text-xs text-muted text-center leading-relaxed">
                Are you sure you want to leave this session lobby? You will need to re-enter the room code to join back.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setLeaveModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1 bg-rose-700 hover:bg-rose-800 border-none" onClick={() => {
                  leaveRoom();
                  setLeaveModalOpen(false);
                }}>
                  Leave
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-between p-6 bg-surface overflow-hidden gap-6">
      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className={`fixed top-20 right-4 z-40 p-3 rounded-full transition-all duration-300 shadow-glow flex items-center justify-center cursor-pointer ${
          chatOpen ? 'bg-primary text-contrast rotate-90' : 'bg-surface-elevated text-secondary border border-secondary/20'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600 border border-surface-light"></span>
          </span>
        )}
      </button>

      {/* Main Game flow layout */}
      <div className="w-full max-w-lg flex flex-col gap-5 mt-2">
        <PlayerAvatars participants={roomState.participants} hostUserId={userId} />
        <ProgressBar progress={revealProgress} />
      </div>

      <div className="flex-1 flex items-center justify-center w-full">
        {currentPosition ? (
          <ScratchCard
            roomId={(roomState as any).roomId || roomState.roomCode}
            title={currentPosition.title}
            assignedText={assignedText}
            spiceLevel={currentPosition.spiceLevel}
            tags={currentPosition.tags}
            imageUrl={currentPosition.imageUrl}
            isRevealed={isRevealed}
            onRevealComplete={() => setIsRevealed(true)}
            revealProgress={revealProgress}
            onProgressUpdate={setRevealProgress}
          />
        ) : (
          <div className="w-full max-w-lg aspect-[4/3] bg-surface-light border border-primary/20 rounded-[var(--radius-card)] flex flex-col items-center justify-center text-muted font-sans text-xs gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <span className="uppercase tracking-widest font-bold">Drawing card...</span>
          </div>
        )}
      </div>

      <div className="w-full max-w-lg flex flex-col gap-5">
        <ReactionOverlay reactions={reactions} onSendReaction={sendReaction} />

        <ActionButtons
          onVeto={callVeto}
          onReset={resetCard}
          onNext={nextCard}
          isHost={isHost}
          disabled={!currentPosition}
        />
      </div>

      {/* Veto Modal Overlay */}
      <VetoModal
        open={!!activeVeto}
        callerName={
          roomState.participants.find((p) => p.userId?.toString() === activeVeto?.callerId)?.displayName || 'Lobby Player'
        }
        expiresIn={activeVeto?.expiresIn || 10000}
        onVote={castVetoVote}
      />

      {/* Lobby Chat Sidebar */}
      <ChatDrawer
        open={chatOpen}
        messages={chatMessages}
        onSendMessage={sendChatMessage}
        userId={userId}
        onClose={() => setChatOpen(false)}
      />

      {/* Leave Session Confirmation Modal */}
      {leaveModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface-light border border-primary/20 rounded-[var(--radius-xl)] p-6 shadow-glow flex flex-col gap-5">
            <h3 className="text-base font-black text-secondary uppercase tracking-wider text-center font-sans">
              Leave Session?
            </h3>
            <p className="text-xs text-muted text-center leading-relaxed font-sans">
              Are you sure you want to leave this intimate session? You will need to re-enter the room code to join back.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setLeaveModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1 bg-rose-700 hover:bg-rose-800 border-none" onClick={() => {
                leaveRoom();
                setLeaveModalOpen(false);
              }}>
                Leave
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
