import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Feedback from '@/models/Feedback';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await auth();
    const body = await req.json();

    const { type, message, rating, email } = body;

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const feedback = await Feedback.create({
      userId: session?.user ? (session.user as any).id : undefined,
      email: email || (session?.user?.email),
      type: type || 'general',
      message: message.trim(),
      rating,
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    console.error('Feedback submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
