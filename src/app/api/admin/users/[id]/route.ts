import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import User from '@/models/User';
import GameSession from '@/models/GameSession';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const resolvedParams = await params;

    let user;
    try {
      user = await User.findById(resolvedParams.id).select('-__v').lean();
    } catch (e) {
      user = null;
    }
    
    // If not found, it might be stored as a raw string instead of an ObjectId in the DB
    if (!user) {
      user = await mongoose.connection.collection('users').findOne({ _id: resolvedParams.id });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch the recent game sessions where this user was a participant
    const sessions = await GameSession.find({
      'participants.userId': resolvedParams.id
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('currentPositionId', 'title');

    return NextResponse.json({
      user,
      sessions
    });

  } catch (error: any) {
    console.error('Error fetching user profile stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
