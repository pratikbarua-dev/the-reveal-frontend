// ============================================
// Mongoose Model: User / Profile
// ============================================

import mongoose, { Schema, type Document } from 'mongoose';
import type { IUser } from '@/types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    // Google Auth metadata
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Onboarding preferences
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    playMode: {
      type: String,
      enum: ['solo', 'partner'],
      default: 'solo',
    },
    preferredPartySize: {
      type: Number,
      enum: [2, 3, 4],
      default: 2,
    },
    hardLimits: [
      {
        type: String,
        trim: true,
      },
    ],

    // Session participants
    participantNames: [
      {
        type: String,
        trim: true,
      },
    ],

    // Favorites
    savedFavorites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Position',
      },
    ],

    history: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Position',
      },
    ],

    // Admin
    // Admin
    isAdmin: {
      type: Boolean,
      default: false,
    },

    // User Statistics
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    statistics: {
      sessionsPlayed: { type: Number, default: 0 },
      sessionsHosted: { type: Number, default: 0 },
      vetoesCast: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });

const User =
  mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

export default User;
