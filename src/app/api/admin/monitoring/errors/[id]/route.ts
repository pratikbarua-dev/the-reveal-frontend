import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ErrorLog from '@/models/ErrorLog';
import { recordAudit } from '@/lib/auditLog';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const resolvedParams = await params;

    const error = await ErrorLog.findByIdAndUpdate(
      resolvedParams.id,
      {
        resolved: true,
        resolvedBy: (session.user as any).name || (session.user as any).email,
        resolvedAt: new Date(),
      },
      { new: true }
    );

    if (error) {
      await recordAudit({
        action: 'error.resolved',
        category: 'monitoring',
        performedBy: {
          userId: (session.user as any).id,
          name: (session.user as any).name || 'Unknown',
          email: (session.user as any).email || 'Unknown',
        },
        target: {
          type: 'error',
          id: error._id.toString(),
          label: error.fingerprint,
        }
      });
    }

    return NextResponse.json({ success: true, error });
  } catch (error: any) {
    console.error('Error resolving error log:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
