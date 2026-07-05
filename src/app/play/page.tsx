'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageSquare, RefreshCw, Copy, Check, User, Users, Share, Heart, ArrowLeft, Sparkles } from 'lucide-react';
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
import PlayModeStep from '@/components/onboarding/PlayModeStep';
import BitingLipSpinner from '@/components/ui/BitingLipSpinner';

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

// ============================================
// Solo Mode Component
// ============================================
function SoloPlay() {
  const { data: session } = useSession();
  const [currentPosition, setCurrentPosition] = useState<any>(null);
  const [assignedText, setAssignedText] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const [profileNames, setProfileNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedSpice, setSelectedSpice] = useState<number[]>([]);
  const [partnerName, setPartnerName] = useState('');
  const [soloSessionId, setSoloSessionId] = useState<string>('');

  // Load saved spice filter and initialize solo session on mount
  useEffect(() => {
    const saved = localStorage.getItem('soloSpiceFilter');
    if (saved) setSelectedSpice(JSON.parse(saved));

    // Manage solo session ID
    let currentSession = localStorage.getItem('reveal_solo_session');
    const sessionTimestamp = localStorage.getItem('reveal_solo_session_time');
    const now = Date.now();

    // Create a new session if none exists or if it's older than 4 hours
    if (!currentSession || !sessionTimestamp || (now - parseInt(sessionTimestamp)) > 4 * 60 * 60 * 1000) {
      currentSession = `SOLO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      localStorage.setItem('reveal_solo_session', currentSession);
      localStorage.setItem('reveal_solo_session_time', now.toString());
    }
    setSoloSessionId(currentSession);
  }, []);

  const handleSpiceToggle = (level: number) => {
    setSelectedSpice((prev) => {
      const next = prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level];
      localStorage.setItem('soloSpiceFilter', JSON.stringify(next));
      return next;
    });
  };

  // Fetch profile names for role assignment
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile?.participantNames?.length > 0) {
            setProfileNames(data.profile.participantNames);
            if (data.profile.participantNames.length > 1) {
              setPartnerName(data.profile.participantNames[1]);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load profile names:', e);
      }
    };
    fetchProfile();
  }, []);

  // Auto-load first card
  useEffect(() => {
    if (!currentPosition && !loading) {
      loadNextPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNextPosition = async () => {
    setLoading(true);
    try {
      let url = '/api/positions/random?partySize=2';
      if (selectedSpice.length > 0) {
        url += `&spiceLevels=${selectedSpice.join(',')}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load random position');
      const position = await res.json();

      // Assign roles using profile names or defaults
      const namesToUse = [...profileNames];
      if (namesToUse.length === 0 && session?.user?.name) {
        namesToUse.push(session.user.name);
      }
      if (partnerName.trim()) {
        namesToUse[1] = partnerName.trim();
      }
      while (namesToUse.length < 2) {
        namesToUse.push(`Player ${namesToUse.length + 1}`);
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
      setIsFavorited(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Live-update the card text if they change the partner name while viewing it
  useEffect(() => {
    if (currentPosition) {
      const namesToUse = [...profileNames];
      if (namesToUse.length === 0 && session?.user?.name) {
        namesToUse.push(session.user.name);
      }
      if (partnerName.trim()) {
        namesToUse[1] = partnerName.trim();
      }
      while (namesToUse.length < 2) {
        namesToUse.push(`Player ${namesToUse.length + 1}`);
      }

      let result = currentPosition.descriptionTemplate || '';
      namesToUse.forEach((name, i) => {
        result = result.replaceAll(`{Player${i + 1}}`, name);
      });
      setAssignedText(result);
    }
  }, [partnerName, currentPosition, profileNames, session]);

  const handleNext = () => {
    setCurrentPosition(null);
    setAssignedText('');
    setIsRevealed(false);
    setRevealProgress(0);
    loadNextPosition();
  };

  const handleReset = () => {
    setIsRevealed(false);
    setRevealProgress(0);
  };

  const handleRevealComplete = async () => {
    setIsRevealed(true);
    if (currentPosition?._id && soloSessionId) {
      try {
        await fetch('/api/sessions/solo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            positionId: currentPosition._id,
            soloSessionId,
            isRevealed: true
          }),
        });
      } catch (err) {
        console.error('Failed to log robust solo session:', err);
      }
    }
  };

  const handleFavoriteToggle = async () => {
    if (!currentPosition?._id) return;
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const url = isFavorited ? `/api/favorites?positionId=${currentPosition._id}` : '/api/favorites';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: isFavorited ? undefined : JSON.stringify({ positionId: currentPosition._id }),
      });
      setIsFavorited(!isFavorited);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-between p-6 bg-surface overflow-hidden gap-6">
      {/* Solo mode header */}
      <div className="w-full max-w-lg flex flex-col gap-5 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-secondary/10 border border-secondary/20">
              <User className="w-4 h-4 text-secondary" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/80 font-sans hidden sm:inline">
              Solo Discovery
            </span>
          </div>
          
          <div className="flex gap-1.5">
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                onClick={() => handleSpiceToggle(level)}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all ${
                  selectedSpice.includes(level)
                    ? 'bg-primary border-primary text-contrast shadow-glow'
                    : 'bg-surface border-surface-elevated text-muted'
                }`}
              >
                {level === 1 ? '🌶 Mild' : level === 2 ? '🌶🌶 Spicy' : '🌶🌶🌶 Inferno'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="px-1">
          <Input 
            placeholder="Partner's Name (Optional)" 
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            className="text-xs py-2 text-center"
          />
        </div>
        
        <ProgressBar progress={revealProgress} />
      </div>

      <div className="flex-1 flex items-center justify-center w-full">
        {currentPosition ? (
          <ScratchCard
            roomId="solo"
            title={currentPosition.title}
            assignedText={assignedText}
            spiceLevel={currentPosition.spiceLevel}
            tags={currentPosition.tags}
            imageUrl={currentPosition.imageUrl}
            isRevealed={isRevealed}
            onRevealComplete={handleRevealComplete}
            revealProgress={revealProgress}
            onProgressUpdate={setRevealProgress}
          />
        ) : (
          <div className="w-full max-w-lg aspect-[4/3] glass border border-primary/20 rounded-[var(--radius-card)] flex flex-col items-center justify-center text-muted font-sans text-xs gap-3">
            <BitingLipSpinner className="w-10 h-10" />
            <span className="uppercase tracking-widest font-bold">Drawing card...</span>
          </div>
        )}
      </div>

      <div className="w-full max-w-lg flex flex-col gap-5">
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={handleReset}
            disabled={!currentPosition}
          >
            Reset
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={handleFavoriteToggle}
            disabled={!currentPosition || !isRevealed}
            className={`transition-colors ${isFavorited ? 'text-rose-500 hover:text-rose-600 bg-rose-500/10' : ''}`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current text-rose-500' : ''}`} />
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            disabled={loading}
            className="flex-1"
          >
            Next Card
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Play Page
// ============================================
function PlayPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // If there's an invite join code in the URL, clear stale cached room state
  // BEFORE useRoom initializes from localStorage. This ensures the invite link
  // takes priority over any previous session's cached state.
  const [initialJoinCode] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('join');
      if (code) {
        localStorage.removeItem('reveal_roomState');
        localStorage.removeItem('activeRoomCode');
        localStorage.removeItem('reveal_currentPosition');
        localStorage.removeItem('reveal_assignedText');
        localStorage.removeItem('reveal_revealProgress');
        localStorage.removeItem('reveal_isRevealed');
        return code.toUpperCase();
      }
    }
    return null;
  });

  const [playMode, setPlayMode] = useState<'solo' | 'partner' | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [lobbyPartySize, setLobbyPartySize] = useState<2 | 3 | 4>(2);

  const {
    socket,
    userId,
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
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showSizeOptions, setShowSizeOptions] = useState(false);
  const [allReadyModalOpen, setAllReadyModalOpen] = useState(false);
  const [readyCountdown, setReadyCountdown] = useState(3);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredAutoStart = useRef(false);

  // Fetch profile to determine play mode
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          // setPlayMode(data.profile?.playMode || 'solo'); // Removed auto-routing
          if (data.profile?.participantNames?.length > 0) {
            setProfileNames(data.profile.participantNames);
          }
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle auto-join from URL parameter (invite link) or stale room rejoin
  const hasAttemptedJoin = useRef(false);

  useEffect(() => {
    // Invite link join — takes priority. initialJoinCode was captured from URL
    // before useRoom initialized, and stale localStorage was already cleared.
    if (initialJoinCode && userId && !hasAttemptedJoin.current) {
      hasAttemptedJoin.current = true;
      setPlayMode('partner');
      // Force leave any stale room before joining the invite room
      leaveRoom();
      joinRoom(initialJoinCode);
      // Remove ?join from URL to prevent re-triggering
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/play');
      }
      return;
    }

    // Auto-rejoin if a saved room code exists in localStorage (partner mode only)
    if (!initialJoinCode && playMode === 'partner' && userId && !roomState) {
      const savedRoomCode = localStorage.getItem('activeRoomCode');
      if (savedRoomCode) {
        joinRoom(savedRoomCode);
      }
    }
  }, [initialJoinCode, userId, roomState, joinRoom, leaveRoom, playMode]);

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

  // If in active room, fetch a random card initially if none loaded
  // Any player can trigger this if the card is missing, to prevent deadlocks.
  useEffect(() => {
    if (roomState && roomState.status === 'active' && !currentPosition) {
      nextCard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomState, currentPosition, isHost]);

  // Auto-start when room is full
  useEffect(() => {
    if (
      roomState &&
      roomState.status === 'waiting' &&
      roomState.settings?.partySize &&
      roomState.participants.length >= roomState.settings.partySize &&
      !hasTriggeredAutoStart.current
    ) {
      hasTriggeredAutoStart.current = true;
      setAllReadyModalOpen(true);
      setReadyCountdown(3);
      playPingSound();

      let count = 3;
      countdownRef.current = setInterval(() => {
        count -= 1;
        setReadyCountdown(count);
        if (count <= 0) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          setAllReadyModalOpen(false);
          if (isHost) {
            startRoom();
          }
        }
      }, 1000);
    }

    // Reset auto-start flag when room is cleared
    if (!roomState || roomState.status !== 'waiting') {
      hasTriggeredAutoStart.current = false;
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [roomState, isHost, startRoom]);

  const handleCopyCode = () => {
    if (!roomState) return;
    navigator.clipboard.writeText(roomState.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (loadingProfile) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <BitingLipSpinner className="w-10 h-10" />
          <span className="text-xs text-muted uppercase tracking-widest font-bold font-sans">Loading...</span>
        </div>
      </div>
    );
  }

  // If mode not selected, show mode selector
  if (playMode === null) {
    return (
      <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center p-6 bg-surface overflow-hidden">
        <div className="relative z-10 w-full max-w-md glass border border-primary/20 rounded-[var(--radius-xl)] shadow-glow-subtle p-6 md:p-8 flex flex-col gap-6">
          <PlayModeStep value={null as any} onChange={(mode) => setPlayMode(mode)} />
        </div>
      </div>
    );
  }

  // Solo mode — render the self-contained solo experience
  if (playMode === 'solo') {
    return <SoloPlay />;
  }

  // ============================================
  // Partner mode — existing multiplayer lobby flow
  // ============================================

  if (!roomState) {
    return (
      <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center p-6 bg-surface overflow-hidden">
        {/* Lobby selector panel */}
        <div className="relative z-10 w-full max-w-md glass border border-primary/20 rounded-[var(--radius-xl)] shadow-glow p-6 md:p-8 flex flex-col gap-6">
          <button 
            onClick={() => setPlayMode(null)}
            className="absolute top-4 left-4 p-2 text-muted hover:text-contrast transition-colors flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest"
          >
            <ArrowLeft className="w-3 h-3" />
            Mode
          </button>
          
          <div className="text-center mt-2">
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
              <span className="relative px-3 glass-light text-[9px] font-bold text-muted uppercase tracking-widest">
                Or
              </span>
            </div>

            {/* Create Room */}
            <div className="flex flex-col gap-3 p-4 bg-surface-elevated/40 rounded-[var(--radius-card)] border border-primary/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary font-sans text-center">
                Host New Lobby
              </span>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xs font-bold text-contrast">{lobbyPartySize} Players</span>
                <button
                  onClick={() => setShowSizeOptions(!showSizeOptions)}
                  className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest transition-colors underline underline-offset-2 cursor-pointer"
                >
                  {showSizeOptions ? 'Done' : 'Change'}
                </button>
              </div>
              {showSizeOptions && (
                <div className="flex justify-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  {[2, 3, 4].map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setLobbyPartySize(size as 2 | 3 | 4);
                        setShowSizeOptions(false);
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                        lobbyPartySize === size
                          ? 'bg-primary border-primary text-contrast shadow-glow'
                          : 'bg-surface border-surface-elevated text-muted hover:border-primary/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
              <Button
                variant="primary"
                size="lg"
                onClick={() =>
                  createRoom({
                    partySize: lobbyPartySize,
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
      </div>
    );
  }

  // Lobby view before starting
  if (roomState.status === 'waiting') {
    return (
      <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center p-6 bg-surface overflow-hidden">
        <div className="relative z-10 w-full max-w-md glass border border-primary/20 rounded-[var(--radius-xl)] shadow-glow p-6 md:p-8 flex flex-col gap-6 font-sans">
          <div className="text-center">
            <span className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">Lobby Code</span>
            <div className="flex flex-col items-center justify-center mt-1.5 gap-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-black text-contrast tracking-widest uppercase">
                  {roomState.roomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 text-muted hover:text-contrast active:scale-90 transition-transform cursor-pointer"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <Button variant="secondary" size="md" onClick={() => setShareModalOpen(true)} className="flex items-center justify-center gap-2 w-full max-w-[200px] border border-primary/20 hover:border-primary/50">
                <Share className="w-4 h-4" />
                Invite Partner
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-primary font-sans text-center">
              Players In Lobby ({roomState.participants.length}/{roomState.settings?.partySize || 2})
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
            <div className="w-full max-w-sm glass border border-primary/20 rounded-[var(--radius-xl)] p-6 shadow-glow flex flex-col gap-5">
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

        {/* All Players Ready Modal */}
        {allReadyModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm glass border border-primary/20 rounded-[var(--radius-xl)] p-8 shadow-glow flex flex-col items-center gap-6 animate-in zoom-in-95 fade-in duration-300">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="relative p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-black text-gradient uppercase tracking-wider font-sans">
                  All Players Ready!
                </h3>
                <p className="text-xs text-muted mt-2 uppercase tracking-widest font-sans">
                  Starting your discovery session
                </p>
              </div>
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="var(--color-surface-elevated)" strokeWidth="4" />
                  <circle
                    cx="40" cy="40" r="35" fill="none" stroke="var(--color-primary)" strokeWidth="4"
                    strokeDasharray={`${(readyCountdown / 3) * 220} 220`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="text-3xl font-black text-primary font-sans">{readyCountdown}</span>
              </div>
              <div className="flex items-center gap-2">
                {roomState?.participants.map((p, i) => (
                  <div key={i} className="flex items-center gap-1 px-2 py-1 bg-surface-elevated/40 rounded-full border border-primary/10">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-contrast uppercase tracking-wider">{p.displayName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Share Invite Link Modal */}
        {shareModalOpen && roomState && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm glass border border-primary/20 rounded-[var(--radius-xl)] p-6 shadow-glow flex flex-col gap-5 relative">
              <h3 className="text-base font-black text-secondary uppercase tracking-wider text-center font-sans">
                Invite Your Partner
              </h3>
              <p className="text-xs text-muted text-center leading-relaxed font-sans">
                Send this link to your partner so they can join your discovery session instantly!
              </p>
              
              <div className="flex items-center justify-between p-3 bg-surface-elevated/40 border border-primary/10 rounded-md">
                <span className="text-xs text-contrast truncate w-full mr-3">
                  {`${window.location.origin}/play?join=${roomState.roomCode}`}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/play?join=${roomState.roomCode}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-muted hover:text-contrast shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {typeof navigator !== 'undefined' && navigator.share && (
                  <Button variant="primary" size="md" onClick={() => {
                    navigator.share({
                      title: 'Join my Reveal Session',
                      text: `Join my intimate discovery session on The Reveal!`,
                      url: `${window.location.origin}/play?join=${roomState.roomCode}`,
                    }).catch(console.error);
                  }}>
                    Share via App...
                  </Button>
                )}
                <Button variant="ghost" size="md" onClick={() => setShareModalOpen(false)}>
                  Done
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
          <div className="w-full max-w-lg aspect-[4/3] glass border border-primary/20 rounded-[var(--radius-card)] flex flex-col items-center justify-center text-muted font-sans text-xs gap-3">
            <BitingLipSpinner className="w-10 h-10" />
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
          <div className="w-full max-w-sm glass border border-primary/20 rounded-[var(--radius-xl)] p-6 shadow-glow flex flex-col gap-5 relative">
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

      {/* Share Invite Link Modal */}
      {shareModalOpen && roomState && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass border border-primary/20 rounded-[var(--radius-xl)] p-6 shadow-glow flex flex-col gap-5 relative">
            <h3 className="text-base font-black text-secondary uppercase tracking-wider text-center font-sans">
              Invite Your Partner
            </h3>
            <p className="text-xs text-muted text-center leading-relaxed font-sans">
              Send this link to your partner so they can join your discovery session instantly!
            </p>
            
            <div className="flex items-center justify-between p-3 bg-surface-elevated/40 border border-primary/10 rounded-md">
              <span className="text-xs text-contrast truncate w-full mr-3">
                {`${window.location.origin}/play?join=${roomState.roomCode}`}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/play?join=${roomState.roomCode}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-muted hover:text-contrast shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {typeof navigator !== 'undefined' && navigator.share && (
                <Button variant="primary" size="md" onClick={() => {
                  navigator.share({
                    title: 'Join my Reveal Session',
                    text: `Join my intimate discovery session on The Reveal!`,
                    url: `${window.location.origin}/play?join=${roomState.roomCode}`,
                  }).catch(console.error);
                }}>
                  Share via App...
                </Button>
              )}
              <Button variant="ghost" size="md" onClick={() => setShareModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Default Export with Suspense
// ============================================
export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-surface">
        <BitingLipSpinner className="w-10 h-10" />
      </div>
    }>
      <PlayPageContent />
    </Suspense>
  );
}
