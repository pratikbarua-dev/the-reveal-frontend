// ============================================
// Mongoose Model: Game Session (Live Rooms)
// ============================================

import mongoose, { Schema, type Document } from 'mongoose';
import type { IGameSession } from '@/types';

export interface GameSessionDocument
  extends Omit<IGameSession, '_id'>,
    Document {}

const ParticipantSchema = new Schema(
  {
    userId: {
      type: Schema.Types.Mixed,
      ref: 'User',
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    role: {
      type: String,
      enum: ['host', 'player'],
      default: 'player',
    },
    isConnected: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const GameSessionSchema = new Schema<GameSessionDocument>(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    playMode: {
      type: String,
      enum: ['solo', 'partner'],
      default: 'partner',
    },
    hostUserId: {
      type: Schema.Types.Mixed,
      ref: 'User',
      required: true,
    },
    participants: [ParticipantSchema],
    settings: {
      partySize: { type: Number, default: 2 },
      hardLimits: [{ type: String }],
      turnBased: { type: Boolean, default: false },
    },
    currentPositionId: {
      type: Schema.Types.ObjectId,
      ref: 'Position',
    },
    assignedText: {
      type: String,
    },
    revealProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isRevealed: {
      type: Boolean,
      default: false,
    },
    history: [
      {
        positionId: { type: Schema.Types.ObjectId, ref: 'Position' },
        revealedAt: { type: Date },
        vetoed: { type: Boolean, default: false },
      },
    ],
    status: {
      type: String,
      enum: ['waiting', 'active', 'ended'],
      default: 'waiting',
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

// TTL index: auto-delete expired sessions
GameSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const GameSession =
  mongoose.models.GameSession ||
  mongoose.model<GameSessionDocument>('GameSession', GameSessionSchema);

export default GameSession;
