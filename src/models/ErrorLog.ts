// ============================================
// Mongoose Model: Error Log
// ============================================

import mongoose, { Schema, type Document } from 'mongoose';

export interface IErrorLog {
  _id: mongoose.Types.ObjectId;
  level: 'error' | 'warn' | 'fatal';
  source: 'api' | 'socket' | 'client' | 'db';
  message: string;
  stack?: string;
  route?: string;
  userId?: string;
  metadata?: Record<string, any>;
  fingerprint: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface ErrorLogDocument extends Omit<IErrorLog, '_id'>, Document {}

const ErrorLogSchema = new Schema<ErrorLogDocument>(
  {
    level: {
      type: String,
      enum: ['error', 'warn', 'fatal'],
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['api', 'socket', 'client', 'db'],
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    stack: {
      type: String,
    },
    route: {
      type: String,
    },
    userId: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    fingerprint: {
      type: String,
      required: true,
      index: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    firstSeen: {
      type: Date,
      default: Date.now,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
      index: true,
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedBy: {
      type: String,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: false,
  }
);

// TTL: Auto-delete resolved errors after 90 days, or all errors after some time
ErrorLogSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const ErrorLog =
  mongoose.models.ErrorLog ||
  mongoose.model<ErrorLogDocument>('ErrorLog', ErrorLogSchema);

export default ErrorLog;
