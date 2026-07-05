import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import User from '@/models/User';
import GameSession from '@/models/GameSession';
import Position from '@/models/Position';

// Prevent tree-shaking of Position model, which is needed by GameSession populate
if (!Position) console.warn('Position model missing');

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const resolvedParams = await params;

    const rawId = resolvedParams.id;
    const cleanId = rawId ? rawId.trim() : '';

    let user;
    try {
      user = await User.findById(cleanId).select('-__v').lean();
    } catch (e) {
      console.warn(`User.findById failed for ${cleanId}:`, e);
      user = null;
    }
    
    if (!user) {
      try {
        const objectId = new mongoose.Types.ObjectId(cleanId);
        user = await mongoose.connection.collection('users').findOne({ _id: objectId });
      } catch (e) {
        console.warn(`Manual ObjectId lookup failed for ${cleanId}:`, e);
      }
    }

    if (!user) {
      user = await mongoose.connection.collection('users').findOne({ _id: cleanId as any });
    }

    if (!user) {
      console.error(`User not found for ID: '${cleanId}' (raw: '${rawId}')`);
      return NextResponse.json({ error: `User not found for ID: ${cleanId}` }, { status: 404 });
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
    .populate('currentPositionId', 'title')
    .lean();

    return NextResponse.json({
      user,
      sessions
    });

  } catch (error: any) {
    console.error('Error fetching user profile stats:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message, stack: error.stack }, { status: 500 });
  }
}
