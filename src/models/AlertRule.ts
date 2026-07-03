import mongoose, { Schema, type Document } from 'mongoose';

export interface IAlertRule {
  _id: mongoose.Types.ObjectId;
  name: string;
  condition: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
    windowMinutes: number;
  };
  severity: 'info' | 'warning' | 'critical';
  actions: ('in_app' | 'email')[];
  enabled: boolean;
  lastTriggered?: Date;
  cooldownMinutes: number;
  createdBy: string;
}

export interface AlertRuleDocument extends Omit<IAlertRule, '_id'>, Document {}

const AlertRuleSchema = new Schema<AlertRuleDocument>(
  {
    name: { type: String, required: true },
    condition: {
      metric: { type: String, required: true },
      operator: { type: String, enum: ['gt', 'lt', 'eq', 'gte', 'lte'], required: true },
      threshold: { type: Number, required: true },
      windowMinutes: { type: Number, required: true },
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      required: true,
    },
    actions: [{ type: String, enum: ['in_app', 'email'] }],
    enabled: { type: Boolean, default: true },
    lastTriggered: { type: Date },
    cooldownMinutes: { type: Number, default: 60 },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

const AlertRule = mongoose.models.AlertRule || mongoose.model<AlertRuleDocument>('AlertRule', AlertRuleSchema);
export default AlertRule;
