import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ErrorLog from '@/models/ErrorLog';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const resolved = searchParams.get('resolved') === 'true';

    const errors = await ErrorLog.find({ resolved })
      .sort({ lastSeen: -1 })
      .limit(100);

    return NextResponse.json(errors);
  } catch (error: any) {
    console.error('Error fetching error logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
