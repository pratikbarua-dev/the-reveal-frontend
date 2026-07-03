import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(200);

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
