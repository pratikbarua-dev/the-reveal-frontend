// ============================================
// Mongoose Model: Monitoring Metric (Time-Series)
// ============================================

import mongoose, { Schema, type Document } from 'mongoose';

export interface IMonitoringMetric {
  _id: mongoose.Types.ObjectId;
  type: 'api_request' | 'db_query' | 'socket_event';
  route?: string;
  method?: string;
  statusCode?: number;
  responseTimeMs: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface MonitoringMetricDocument extends Omit<IMonitoringMetric, '_id'>, Document {}

const MonitoringMetricSchema = new Schema<MonitoringMetricDocument>(
  {
    type: {
      type: String,
      enum: ['api_request', 'db_query', 'socket_event'],
      required: true,
      index: true,
    },
    route: {
      type: String,
      index: true,
    },
    method: {
      type: String,
    },
    statusCode: {
      type: Number,
    },
    responseTimeMs: {
      type: Number,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
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

// TTL: auto-delete after 30 days
MonitoringMetricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Compound index for common queries
MonitoringMetricSchema.index({ type: 1, timestamp: -1 });
MonitoringMetricSchema.index({ route: 1, timestamp: -1 });

const MonitoringMetric =
  mongoose.models.MonitoringMetric ||
  mongoose.model<MonitoringMetricDocument>('MonitoringMetric', MonitoringMetricSchema);

export default MonitoringMetric;
