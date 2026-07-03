import AuditLog from '@/models/AuditLog';
import dbConnect from './db';

interface AuditLogPayload {
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
  details?: Record<string, any>;
  ipAddress?: string;
}

export async function recordAudit(payload: AuditLogPayload) {
  try {
    await dbConnect();
    await AuditLog.create({
      ...payload,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
}
