import MonitoringMetric from '@/models/MonitoringMetric';
import ErrorLog from '@/models/ErrorLog';
import dbConnect from './db';
import crypto from 'crypto';

export async function recordApiMetric(route: string, method: string, statusCode: number, responseTimeMs: number) {
  try {
    await dbConnect();
    await MonitoringMetric.create({
      type: 'api_request',
      route,
      method,
      statusCode,
      responseTimeMs,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Failed to record API metric:', err);
  }
}

export async function recordError(level: 'error' | 'warn' | 'fatal', source: 'api' | 'client', message: string, stack?: string, route?: string, userId?: string) {
  try {
    await dbConnect();
    
    // Create a fingerprint based on message and route (or stack trace structure in a real app)
    const fingerprintString = `${level}:${source}:${route || 'none'}:${message.substring(0, 100)}`;
    const fingerprint = crypto.createHash('md5').update(fingerprintString).digest('hex');

    const existingError = await ErrorLog.findOne({ fingerprint, resolved: false });

    if (existingError) {
      await ErrorLog.updateOne(
        { _id: existingError._id },
        { 
          $inc: { count: 1 },
          $set: { lastSeen: new Date() }
        }
      );
    } else {
      await ErrorLog.create({
        level,
        source,
        message,
        stack,
        route,
        userId,
        fingerprint,
        count: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
        resolved: false,
      });
    }

    // In a fully event-driven architecture, we would also emit to socket server here.
    // e.g., fetch('http://localhost:4000/internal/alert-webhook', ...)
  } catch (err) {
    console.error('Failed to record error:', err);
  }
}

// Higher order function for API route wrapping
export function withMonitoring(handler: Function, routeName: string) {
  return async (req: Request, ...args: any[]) => {
    const start = Date.now();
    try {
      const response = await handler(req, ...args);
      const latency = Date.now() - start;
      await recordApiMetric(routeName, req.method, response.status, latency);
      return response;
    } catch (err: any) {
      const latency = Date.now() - start;
      await recordApiMetric(routeName, req.method, 500, latency);
      await recordError('error', 'api', err.message, err.stack, routeName);
      throw err;
    }
  };
}
