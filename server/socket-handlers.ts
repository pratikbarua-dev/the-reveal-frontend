// ============================================
// Socket.IO Event Handlers
// Manages rooms, scratch sync, voting, chat
// ============================================

import { Server, Socket } from 'socket.io';
import { generateRoomCode } from './rooms';
import type {
  ScratchStroke,
  RoomCreatePayload,
  RoomJoinPayload,
  CursorPosition,
  ReactionPayload,
} from '../src/types';
import dbConnect from '../src/lib/db';
import GameSession from '../src/models/GameSession';
import Position from '../src/models/Position';
import User from '../src/models/User';

// In-memory room state (fast access; DB is source of truth for persistence)
interface RoomState {
  roomId: string;
  roomCode: string;
  hostUserId: string;
  participants: Map<string, { socketId: string; displayName: string; userId: string; avatarUrl?: string }>;
  revealProgress: number;
  isRevealed: boolean;
  vetoVotes: Map<string, boolean>;
  vetoTimeout: NodeJS.Timeout | null;
  turnOrder: string[];
  currentTurnIndex: number;
  turnBased: boolean;
  status: 'waiting' | 'active' | 'ended';
  currentPosition?: any;
  assignedText?: string;
}

const rooms = new Map<string, RoomState>();
const socketToRoom = new Map<string, string>();

export function registerSocketHandlers(io: Server): void {
  // Ensure DB connection
  dbConnect().catch((err) => {
    console.error('❌ Mongoose connection failed in socket handlers:', err);
  });
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ========================================
    // ROOM MANAGEMENT
    // ========================================

    socket.on('room:create', (data: RoomCreatePayload) => {
      const roomCode = generateRoomCode();
      const roomId = `room_${roomCode}`;

      const state: RoomState = {
        roomId,
        roomCode,
        hostUserId: data.userId,
        participants: new Map(),
        revealProgress: 0,
        isRevealed: false,
        vetoVotes: new Map(),
        vetoTimeout: null,
        turnOrder: [],
        currentTurnIndex: 0,
        turnBased: data.settings?.turnBased || false,
        status: 'waiting',
      };

      state.participants.set(data.userId, {
        socketId: socket.id,
        displayName: data.displayName,
        userId: data.userId,
        avatarUrl: data.avatarUrl,
      });
      state.turnOrder.push(data.userId);

      rooms.set(roomCode, state);
      socketToRoom.set(socket.id, roomCode);
      socket.join(roomId);

      // Save to MongoDB
      const newSession = new GameSession({
        roomCode,
        hostUserId: data.userId,
        participants: [
          {
            userId: data.userId,
            displayName: data.displayName,
            avatarUrl: data.avatarUrl,
            role: 'host',
            isConnected: true,
          },
        ],
        settings: {
          partySize: data.settings?.partySize || 2,
          hardLimits: data.settings?.hardLimits || [],
          turnBased: data.settings?.turnBased || false,
        },
        status: 'waiting',
      });
      newSession.save().catch((err: any) => {
        console.error('❌ Failed to save GameSession to DB:', err);
      });

      socket.emit('room:created', { roomCode, roomId });
      console.log(`🏠 Room created: ${roomCode} by ${data.displayName}`);
    });

    socket.on('room:join', async (data: RoomJoinPayload) => {
      let state = rooms.get(data.roomCode);
      if (!state) {
        try {
          const sessionDoc = await GameSession.findOne({ roomCode: data.roomCode }).populate('currentPositionId');
          if (sessionDoc) {
            const participantsMap = new Map();
            sessionDoc.participants.forEach((p: any) => {
              participantsMap.set(p.userId.toString(), {
                socketId: p.userId.toString() === data.userId ? socket.id : '',
                displayName: p.displayName,
                userId: p.userId.toString(),
                avatarUrl: p.avatarUrl,
              });
            });

            state = {
              roomId: `room_${sessionDoc.roomCode}`,
              roomCode: sessionDoc.roomCode,
              hostUserId: sessionDoc.hostUserId?.toString(),
              participants: participantsMap,
              revealProgress: sessionDoc.revealProgress || 0,
              isRevealed: sessionDoc.isRevealed || false,
              vetoVotes: new Map(),
              vetoTimeout: null,
              turnOrder: sessionDoc.participants.map((p: any) => p.userId.toString()),
              currentTurnIndex: 0,
              turnBased: sessionDoc.settings?.turnBased || false,
              status: sessionDoc.status as any,
              currentPosition: sessionDoc.currentPositionId || undefined,
              assignedText: sessionDoc.assignedText || undefined,
            };

            rooms.set(sessionDoc.roomCode, state);
          }
        } catch (dbErr) {
          console.error('❌ Error restoring session from DB:', dbErr);
        }
      }

      if (!state) {
        socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room does not exist' });
        return;
      }

      if (state.participants.size >= 4 && !state.participants.has(data.userId)) {
        socket.emit('error', { code: 'ROOM_FULL', message: 'Room is full (max 4 players)' });
        return;
      }

      state.participants.set(data.userId, {
        socketId: socket.id,
        displayName: data.displayName,
        userId: data.userId,
        avatarUrl: data.avatarUrl,
      });

      if (!state.turnOrder.includes(data.userId)) {
        state.turnOrder.push(data.userId);
      }

      socketToRoom.set(socket.id, data.roomCode);
      socket.join(state.roomId);

      // Save updated participants list to DB
      try {
        await GameSession.findOneAndUpdate(
          { roomCode: data.roomCode },
          {
            $set: {
              participants: Array.from(state.participants.values()).map((p) => ({
                userId: p.userId,
                displayName: p.displayName,
                avatarUrl: p.avatarUrl,
                role: p.userId === state?.hostUserId ? 'host' : 'player',
                isConnected: true,
              })),
            },
          }
        );
      } catch (dbErr) {
        console.error('❌ Failed to update GameSession participants in DB:', dbErr);
      }

      // Send full state to joining player
      socket.emit('room:joined', { room: serializeRoomState(state) } as any);

      // If a card is already drawn, send it immediately to the joining client
      if (state.currentPosition) {
        socket.emit('card:loaded', {
          position: state.currentPosition,
          assignedText: state.assignedText,
          isRevealed: state.isRevealed,
          revealProgress: state.revealProgress,
        });
      }

      // Notify others
      socket.to(state.roomId).emit('room:player-joined', {
        participant: {
          userId: data.userId,
          displayName: data.displayName,
          avatarUrl: data.avatarUrl,
          role: 'player',
          isConnected: true,
        },
      });

      console.log(`👤 ${data.displayName} joined room ${data.roomCode}`);
    });

    socket.on('room:leave', ({ roomId }: { roomId: string }) => {
      handleLeaveRoom(socket, io);
    });

    socket.on('room:start', async ({ roomId }: { roomId: string }) => {
      const roomCode = socketToRoom.get(socket.id);
      if (!roomCode) return;
      const state = rooms.get(roomCode);
      if (!state || state.hostUserId !== getUserIdFromSocket(socket.id, state)) return;

      state.status = 'active';
      try {
        await GameSession.findOneAndUpdate({ roomCode }, { status: 'active' });
      } catch (err) {
        console.error('❌ Failed to update GameSession status in DB:', err);
      }
      io.to(state.roomId).emit('room:started' as any, { position: null, assignedText: '' });
      console.log(`🎮 Room ${roomCode} started`);
    });

    // ========================================
    // SCRATCH SYNCHRONIZATION
    // ========================================

    socket.on('scratch:stroke', (data: ScratchStroke) => {
      const roomCode = socketToRoom.get(socket.id);
      if (!roomCode) return;
      const state = rooms.get(roomCode);
      if (!state) return;

      // Broadcast to all other players in room
      socket.to(state.roomId).emit('scratch:stroke', {
        ...data,
        userId: getUserIdFromSocket(socket.id, state),
      });
    });

    socket.on('scratch:progress', async (data: { roomId: string; percentage: number }) => {
      const roomCode = socketToRoom.get(socket.id);
      if (!roomCode) return;
      const state = rooms.get(roomCode);
      if (!state) return;

      state.revealProgress = data.percentage;
      try {
        await GameSession.findOneAndUpdate({ roomCode }, { revealProgress: data.percentage });
      } catch (err) {
        console.error('❌ Failed to update GameSession progress in DB:', err);
      }
      socket.to(state.roomId).emit('scratch:progress', { percentage: data.percentage });
    });

    socket.on('scratch:reveal', async (data: { roomId: string }) => {
      const roomCode = socketToRoom.get(socket.id);
      if (!roomCode) return;
      const state = rooms.get(roomCode);
      if (!state) return;

      state.isRevealed = true;
      state.revealProgress = 100;
      try {
        await GameSession.findOneAndUpdate({ roomCode }, { isRevealed: true, revealProgress: 100 });
        
        // Add position to history of all registered users in the room
        if (state.currentPosition && state.currentPosition._id) {
          const userIds = Array.from(state.participants.values())
            .map(p => p.userId)
            .filter(id => id && id.length === 24); // simplistic objectid length check
            
          await User.updateMany(
            { _id: { $in: userIds } },
            { $addToSet: { history: state.currentPosition._id } }
          );
        }
      } catch (err) {
        console.error('❌ Failed to update GameSession reveal status or user history in DB:', err);
      }
      io.to(state.roomId).emit('scratch:reveal', {
        position: state.currentPosition,
        assignedText: state.assignedText,
      });
    });

    // ========================================
    // CARD MANAGEMENT
    // ========================================

    socket.on('card:next', async ({ roomId }: { roomId: string }) => {
      const roomCode = socketToRoom.get(socket.id);
      if (!roomCode) return;
      const state = rooms.get(roomCode);
      if (!state) return;

      state.revealProgress = 0;
      state.isRevealed = false;
      state.currentTurnIndex = 0;
      state.currentPosition = undefined;
      state.assignedText = undefined;

      try {
        await GameSession.findOneAndUpdate(
          { roomCode },
          {
            currentPositionId: null,
            assignedText: null,
            revealProgress: 0,
            isRevealed: false,
          }
        );
      } catch (err) {
        console.error('❌ Failed to reset GameSession card in DB (card:next):', err);
      }

      io.to(state.roomId).emit('card:loaded', { position: null } as any);
    });

    socket.on('card:reset', async ({ roomId }: { roomId: string }) => {
      const roomCode = socketToRoom.get(socket.id);
      if (!roomCode) return;
      const state = rooms.get(roomCode);
      if (!state) return;

      state.revealProgress = 0;
      state.isRevealed = false;
      state.currentPosition = undefined;
      state.assignedText = undefined;

      try {
        await GameSession.findOneAndUpdate(
          { roomCode },
          {
            currentPositionId: null,
            assignedText: null,
            revealProgress: 0,
            isRevealed: false,
          }
        );
      } catch (err) {
        console.error('❌ Failed to reset GameSession card in DB (card:reset):', err);
      }

      io.to(state.roomId).emit('card:loaded', { position: null } as any);
    });

    socket.on('card:sync', async (data: { roomId: string; position: any; assignedText: string }) => {
      const roomCode = socketToRoom.get(socket.id);
      if (!roomCode) return;
      const state = rooms.get(roomCode);
      if (!state) return;

      state.currentPosition = data.position;
      state.assignedText = data.assignedText;

      try {
        await GameSession.findOneAndUpdate(
          { roomCode },
          {
            currentPositionId: data.position?._id || null,
            assignedText: data.assignedText || '',
            revealProgress: 0,
            isRevealed: false,
          }
        );
      } catch (err) {
        console.error('❌ Failed to sync GameSession card in DB:', err);
      }

      socket.to(state.roomId).emit('card:loaded', {
        position: data.position,
        assignedText: data.assignedText,
        isRevealed: false,
        revealProgress: 0,
      });
    });

    // ========================================
    // VETO VOTING
    // ========================================

    socket.on('vote:veto-call', ({ roomId }: { roomId: string }) => {
      const roomCode = socketToRoom.get(socket.id);
      if (!roomCode) return;
      const state = rooms.get(roomCode);
      if (!state) return;

      const callerId = getUserIdFromSocket(socket.id, state);
      state.vetoVotes.clear();

      io.to(state.roomId).emit('vote:veto-prompt', {
        callerId: callerId || socket.id,
        expiresIn: 10000,
      });

      // Auto-resolve after 10 seconds
      state.vetoTimeout = setTimeout(() => {
        resolveVeto(state, io);
      }, 10000);
    });

    socket.on('vote:cast', ({ roomId, vote }) => {
      const roomCode = socketToRoom.get(socket.id);
      if (!roomCode) return;
      const state = rooms.get(roomCode);
      if (!state) return;

      const userId = getUserIdFromSocket(socket.id, state);
      if (userId) {
        state.vetoVotes.set(userId, vote);
      }

      // If all voted, resolve immediately
      if (state.vetoVotes.size >= state.participants.size) {
        if (state.vetoTimeout) clearTimeout(state.vetoTimeout);
        resolveVeto(state, io);
      }
    });

    // ========================================
    // PRESENCE & CURSORS
    // ========================================

    socket.on('cursor:move', (data: CursorPosition) => {
      const roomCode = socketToRoom.get(socket.id);
      if (!roomCode) return;
      const state = rooms.get(roomCode);
      if (!state) return;

      socket.to(state.roomId).emit('cursor:move', data);
    });

    socket.on('presence:update', (data) => {
      const roomCode = socketToRoom.get(socket.id);
      if (!roomCode) return;
      const state = rooms.get(roomCode);
      if (!state) return;

      socket.to(state.roomId).emit('presence:update', data);
    });

    // ========================================
    // REACTIONS & CHAT
    // ========================================

    socket.on('reaction:send', (data: ReactionPayload) => {
      const roomCode = socketToRoom.get(socket.id);
      if (!roomCode) return;
      const state = rooms.get(roomCode);
      if (!state) return;

      io.to(state.roomId).emit('reaction:send', data);
    });

    socket.on('chat:message', ({ roomId, text }) => {
      const roomCode = socketToRoom.get(socket.id);
      if (!roomCode) return;
      const state = rooms.get(roomCode);
      if (!state) return;

      const userId = getUserIdFromSocket(socket.id, state);
      const participant = userId ? state.participants.get(userId) : null;

      io.to(state.roomId).emit('chat:message', {
        roomId,
        text: text.slice(0, 200), // Max 200 chars
        userId: userId || socket.id,
        displayName: participant?.displayName || 'Unknown',
        timestamp: Date.now(),
      });
    });

    // ========================================
    // TURN MANAGEMENT
    // ========================================

    socket.on('turn:pass', ({ roomId }: { roomId: string }) => {
      const roomCode = socketToRoom.get(socket.id);
      if (!roomCode) return;
      const state = rooms.get(roomCode);
      if (!state || !state.turnBased) return;

      state.currentTurnIndex = (state.currentTurnIndex + 1) % state.turnOrder.length;
      const nextUserId = state.turnOrder[state.currentTurnIndex];

      io.to(state.roomId).emit('turn:current', {
        userId: nextUserId,
        turnIndex: state.currentTurnIndex,
      });
    });

    // ========================================
    // DISCONNECT
    // ========================================

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      handleLeaveRoom(socket, io);
    });
  });
}

// ============================================
// Helper Functions
// ============================================

function handleLeaveRoom(socket: Socket, io: Server): void {
  const roomCode = socketToRoom.get(socket.id);
  if (!roomCode) return;

  const state = rooms.get(roomCode);
  if (!state) return;

  const userId = getUserIdFromSocket(socket.id, state);

  if (userId) {
    state.participants.delete(userId);
    state.turnOrder = state.turnOrder.filter((id) => id !== userId);
  }

  socketToRoom.delete(socket.id);
  socket.leave(state.roomId);

  if (userId) {
    io.to(state.roomId).emit('room:player-left', { userId });
  }

  // Clean up empty rooms
  if (state.participants.size === 0) {
    if (state.vetoTimeout) clearTimeout(state.vetoTimeout);
    rooms.delete(roomCode);
    console.log(`🗑️ Room ${roomCode} deleted (empty)`);
  }
}

function getUserIdFromSocket(socketId: string, state: RoomState): string | null {
  for (const [userId, p] of state.participants) {
    if (p.socketId === socketId) return userId;
  }
  return null;
}

function resolveVeto(state: RoomState, io: Server): void {
  let yes = 0;
  let no = 0;
  state.vetoVotes.forEach((vote) => {
    if (vote) yes++;
    else no++;
  });

  const passed = yes > no;

  io.to(state.roomId).emit('vote:result', { passed, tally: { yes, no } });
  state.vetoVotes.clear();
}

function serializeRoomState(state: RoomState): Record<string, any> {
  const participants: any[] = [];
  state.participants.forEach((p, userId) => {
    participants.push({
      userId,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      role: userId === state.hostUserId ? 'host' : 'player',
      isConnected: true,
    });
  });

  return {
    roomCode: state.roomCode,
    roomId: state.roomId,
    participants,
    revealProgress: state.revealProgress,
    isRevealed: state.isRevealed,
    turnBased: state.turnBased,
    currentTurnIndex: state.currentTurnIndex,
    status: state.status,
    currentPosition: state.currentPosition,
    assignedText: state.assignedText,
  };
}
