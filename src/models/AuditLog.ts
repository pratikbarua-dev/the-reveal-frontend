// ============================================
// Mongoose Model: Audit Log
// ============================================

import mongoose, { Schema, type Document } from 'mongoose';

export interface IAuditLog {
  _id: mongoose.Types.ObjectId;
  action: string;
  category: 'config' | 'content' | 'user' | 'moderation' | 'monitoring' | 'auth';
  performedBy: {
    userId: string;
    name: string;
    email: string;
  };
  target?: {
    type: string;
    id: string;
    label: string;
  };
  details: Record<string, any>;
  ipAddress?: string;
  timestamp: Date;
}

export interface AuditLogDocument extends Omit<IAuditLog, '_id'>, Document {}

const AuditLogSchema = new Schema<AuditLogDocument>(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['config', 'content', 'user', 'moderation', 'monitoring', 'auth'],
      required: true,
      index: true,
    },
    performedBy: {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    target: {
      type: { type: String },
      id: { type: String },
      label: { type: String },
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// TTL: Auto-delete audit logs after 1 year to prevent infinite growth
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model<AuditLogDocument>('AuditLog', AuditLogSchema);

export default AuditLog;
