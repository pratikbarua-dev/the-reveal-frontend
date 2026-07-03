import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Feedback from '@/models/Feedback';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'new';

    const filter = status === 'all' ? {} : { status };
    
    const feedbackList = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email image')
      .limit(100);

    return NextResponse.json(feedbackList);
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
