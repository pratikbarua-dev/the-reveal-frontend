import mongoose, { Schema, type Document } from 'mongoose';

export interface IAlertHistory {
  _id: mongoose.Types.ObjectId;
  ruleId: mongoose.Types.ObjectId;
  ruleName: string;
  severity: string;
  message: string;
  metricValue: number;
  threshold: number;
  triggeredAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface AlertHistoryDocument extends Omit<IAlertHistory, '_id'>, Document {}

const AlertHistorySchema = new Schema<AlertHistoryDocument>(
  {
    ruleId: { type: Schema.Types.ObjectId, ref: 'AlertRule', required: true },
    ruleName: { type: String, required: true },
    severity: { type: String, required: true },
    message: { type: String, required: true },
    metricValue: { type: Number, required: true },
    threshold: { type: Number, required: true },
    triggeredAt: { type: Date, default: Date.now },
    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: { type: String },
    acknowledgedAt: { type: Date },
  },
  { timestamps: false }
);

// TTL: 90 days
AlertHistorySchema.index({ triggeredAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const AlertHistory = mongoose.models.AlertHistory || mongoose.model<AlertHistoryDocument>('AlertHistory', AlertHistorySchema);
export default AlertHistory;
