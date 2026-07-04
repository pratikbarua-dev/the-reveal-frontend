// ============================================
// Mongoose Model: Position
// ============================================

import mongoose, { Schema, type Document } from 'mongoose';
import type { IPosition } from '@/types';

export interface PositionDocument extends Omit<IPosition, '_id'>, Document {}

const PositionSchema = new Schema<PositionDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    descriptionTemplate: {
      type: String,
      required: true,
    },
    spiceLevel: {
      type: Number,
      min: 1,
      max: 3,
      required: true,
      index: true,
    },
    partySize: {
      type: Number,
      min: 2,
      default: 2,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
    category: {
      type: String,
      enum: ['standard', 'group', 'fetish'],
      default: 'standard',
      index: true,
    },
    genderConfig: [
      {
        type: String,
        trim: true,
      }
    ],
    imageUrl: {
      type: String,
    },
    sourceUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for filtered queries
PositionSchema.index({ partySize: 1, spiceLevel: 1 });
// Text index for search
PositionSchema.index({ title: 'text', description: 'text' });

const Position =
  mongoose.models.Position ||
  mongoose.model<PositionDocument>('Position', PositionSchema);

export default Position;
