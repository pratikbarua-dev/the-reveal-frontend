import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Feedback from '@/models/Feedback';
import { recordAudit } from '@/lib/auditLog';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const { status } = await req.json();

    if (!['new', 'reviewed', 'resolved'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      resolvedParams.id,
      { status },
      { new: true }
    );

    if (feedback) {
      await recordAudit({
        action: 'feedback.status_updated',
        category: 'moderation',
        performedBy: {
          userId: (session.user as any).id,
          name: (session.user as any).name || 'Unknown',
          email: (session.user as any).email || 'Unknown',
        },
        target: {
          type: 'feedback',
          id: feedback._id.toString(),
          label: feedback.type,
        },
        details: { newStatus: status }
      });
    }

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    console.error('Error updating feedback status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
