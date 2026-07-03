// ============================================
// Mongoose Model: SiteConfig — App-wide Settings
// ============================================

import mongoose, { Schema, type Document } from 'mongoose';

export interface ISiteConfig {
  key: string;
  /**
   * Auth mode controls how users access the app:
   * - 'login'   : Google OAuth required for all users
   * - 'guest'   : Everyone is anonymous, no login option shown
   * - 'hybrid'  : Users can login or continue as guest
   */
  authMode: 'login' | 'guest' | 'hybrid';
  updatedAt: Date;
  updatedBy?: string;
}

export interface SiteConfigDocument extends ISiteConfig, Document {}

const SiteConfigSchema = new Schema<SiteConfigDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
    },
    authMode: {
      type: String,
      enum: ['login', 'guest', 'hybrid'],
      default: 'hybrid',
    },
    updatedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const SiteConfig =
  mongoose.models.SiteConfig || mongoose.model<SiteConfigDocument>('SiteConfig', SiteConfigSchema);

export default SiteConfig;
