// ============================================
// THE REVEAL — Shared TypeScript Interfaces
// ============================================

import { Types } from 'mongoose';

// ============================================
// Database Document Types
// ============================================

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  image?: string;
  googleId: string;
  isOnboarded: boolean;
  playMode?: 'solo' | 'partner';
  preferredPartySize: 2 | 3 | 4;
  hardLimits: string[];
  participantNames: string[];
  savedFavorites: Types.ObjectId[];
  history: Types.ObjectId[];
  isAdmin?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPosition {
  _id: Types.ObjectId;
  title: string;
  description: string;
  descriptionTemplate: string;
  spiceLevel: 1 | 2 | 3;
  partySize: number;
  tags: string[];
  imageUrl: string;
  sourceUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IParticipant {
  userId?: Types.ObjectId;
  displayName: string;
  avatarUrl?: string;
  role: 'host' | 'player';
  isConnected: boolean;
}

export interface IGameSession {
  _id: Types.ObjectId;
  roomCode: string;
  hostUserId: Types.ObjectId;
  participants: IParticipant[];
  settings: {
    partySize: number;
    hardLimits: string[];
    turnBased: boolean;
  };
  currentPositionId?: Types.ObjectId;
  assignedText?: string;
  revealProgress: number;
  isRevealed: boolean;
  history: {
    positionId: Types.ObjectId;
    revealedAt: Date;
    vetoed: boolean;
  }[];
  status: 'waiting' | 'active' | 'ended';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// API / Client-Side Types
// ============================================

export interface PositionCard {
  _id: string;
  title: string;
  description: string;
  descriptionTemplate: string;
  spiceLevel: 1 | 2 | 3;
  partySize: number;
  tags: string[];
  imageUrl: string;
}

export interface UserProfile {
  _id: string;
  email: string;
  name: string;
  image?: string;
  isOnboarded: boolean;
  preferredPartySize: 2 | 3 | 4;
  hardLimits: string[];
  participantNames: string[];
  savedFavorites: string[];
}

export interface OnboardingData {
  preferredPartySize: 2 | 3 | 4;
  hardLimits: string[];
  participantNames: string[];
}

// ============================================
// Socket.IO Event Types
// ============================================

export interface ScratchStroke {
  roomId: string;
  points: { x: number; y: number }[];
  brushRadius: number;
  userId: string;
}

export interface RoomCreatePayload {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  settings: {
    partySize: number;
    hardLimits: string[];
    turnBased: boolean;
  };
}

export interface RoomJoinPayload {
  roomCode: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

export interface VetoVote {
  roomId: string;
  vote: boolean;
}

export interface VetoResult {
  passed: boolean;
  tally: { yes: number; no: number };
}

export interface ChatMessage {
  roomId: string;
  text: string;
  userId: string;
  displayName: string;
  timestamp: number;
}

export interface ReactionPayload {
  roomId: string;
  emoji: string;
  userId: string;
}

export interface CursorPosition {
  roomId: string;
  x: number;
  y: number;
  userId: string;
}

export interface PresenceUpdate {
  roomId: string;
  userId: string;
  status: 'active' | 'idle' | 'disconnected';
}

// ============================================
// Socket Event Maps (type-safe event handlers)
// ============================================

export interface ServerToClientEvents {
  'room:created': (data: { roomCode: string; roomId: string }) => void;
  'room:joined': (data: { room: IGameSession }) => void;
  'room:player-joined': (data: { participant: IParticipant }) => void;
  'room:player-left': (data: { userId: string }) => void;
  'room:started': (data: { position: PositionCard; assignedText: string }) => void;
  'scratch:stroke': (data: ScratchStroke) => void;
  'scratch:progress': (data: { percentage: number }) => void;
  'scratch:reveal': (data: { position: PositionCard; assignedText: string }) => void;
  'card:loaded': (data: { position: PositionCard; assignedText?: string; isRevealed?: boolean; revealProgress?: number }) => void;
  'vote:veto-prompt': (data: { callerId: string; expiresIn: number }) => void;
  'vote:result': (data: VetoResult) => void;
  'cursor:move': (data: CursorPosition) => void;
  'presence:update': (data: PresenceUpdate) => void;
  'reaction:send': (data: ReactionPayload) => void;
  'chat:message': (data: ChatMessage) => void;
  'turn:current': (data: { userId: string; turnIndex: number }) => void;
  'error': (data: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  'room:create': (data: RoomCreatePayload) => void;
  'room:join': (data: RoomJoinPayload) => void;
  'room:leave': (data: { roomId: string }) => void;
  'room:start': (data: { roomId: string }) => void;
  'scratch:stroke': (data: ScratchStroke) => void;
  'scratch:progress': (data: { roomId: string; percentage: number }) => void;
  'scratch:reveal': (data: { roomId: string }) => void;
  'card:next': (data: { roomId: string }) => void;
  'card:reset': (data: { roomId: string }) => void;
  'card:sync': (data: { roomId: string; position: PositionCard; assignedText: string }) => void;
  'vote:veto-call': (data: { roomId: string }) => void;
  'vote:cast': (data: VetoVote) => void;
  'cursor:move': (data: CursorPosition) => void;
  'presence:update': (data: PresenceUpdate) => void;
  'reaction:send': (data: ReactionPayload) => void;
  'chat:message': (data: { roomId: string; text: string }) => void;
  'turn:pass': (data: { roomId: string }) => void;
}

// ============================================
// Constants
// ============================================

export const SPICE_LABELS = {
  1: 'Mild',
  2: 'Spicy',
  3: 'Inferno',
} as const;

export const AVAILABLE_REACTIONS = ['🔥', '❤️', '😍', '😈', '🙈', '💀', '👀', '✨'] as const;

export const TAG_CATEGORIES = {
  'Penetration Type': ['vaginal sex', 'anal sex', 'oral sex', 'no penetration'],
  'Activity': ['blowjob', 'cunnilingus', 'anilingus', '69 sex position'],
  'Body Contact': ['kissing', 'hugging', 'breast kissing', 'breasts touching', 'feet kissing'],
  'Position Family': ['doggy style', 'cowgirl', 'man on top', 'woman on top', 'sideways', 'reverse', 'criss cross'],
  'Stimulation': ['clitoral', 'G-spot', 'A-spot', 'Deep spot', 'hand clitoris stimulation', 'anal play'],
  'Difficulty': ['easy', 'medium', 'hard', 'crazy'],
  'Depth': ['shallow', 'middle', 'deep'],
  'Who Leads': ['man active', 'woman active', 'neutral'],
  'Furniture': ['bed', 'sofa', 'chair', 'armchair', 'table', 'ball'],
  'Body Position': ['standing', 'sitting', 'kneeling', 'lying down', 'right angle'],
} as const;

export const ALL_TAGS = Object.values(TAG_CATEGORIES).flat();
