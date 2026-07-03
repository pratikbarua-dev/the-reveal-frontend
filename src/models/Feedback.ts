import mongoose, { Schema, type Document } from 'mongoose';

export interface IFeedback {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  email?: string;
  type: 'bug' | 'feature' | 'general';
  message: string;
  rating?: number;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: Date;
}

export interface FeedbackDocument extends Omit<IFeedback, '_id'>, Document {}

const FeedbackSchema = new Schema<FeedbackDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, trim: true },
    type: { type: String, enum: ['bug', 'feature', 'general'], required: true },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    status: { type: String, enum: ['new', 'reviewed', 'resolved'], default: 'new' },
  },
  { timestamps: true }
);

const Feedback = mongoose.models.Feedback || mongoose.model<FeedbackDocument>('Feedback', FeedbackSchema);
export default Feedback;
