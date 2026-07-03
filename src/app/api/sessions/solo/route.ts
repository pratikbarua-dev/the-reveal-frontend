import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import GameSession from '@/models/GameSession';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user ? (session.user as any).id : null;
    const body = await req.json();

    const { positionId, soloSessionId, isRevealed } = body;

    if (!soloSessionId || !positionId) {
      return NextResponse.json({ error: 'Missing session or position ID' }, { status: 400 });
    }

    await dbConnect();

    // Find or create the solo session
    let gameSession = await GameSession.findOne({ roomCode: soloSessionId });
    
    if (!gameSession) {
      // Create new solo session
      gameSession = await GameSession.create({
        roomCode: soloSessionId,
        hostUserId: userId || 'anonymous',
        playMode: 'solo',
        participants: [{
          userId: userId || null,
          displayName: session?.user?.name || 'Solo Player',
          role: 'host',
          isConnected: true
        }],
        status: 'active',
        settings: { partySize: 1, turnBased: false, hardLimits: [] },
      });

      // Update User Stats for a new session
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          $inc: { 'statistics.sessionsPlayed': 1 },
          $set: { lastSeen: new Date() }
        }).catch(err => console.error(err));
      }
    }

    // Add to session history
    const historyEntry = {
      positionId,
      revealedAt: new Date(),
      vetoed: false
    };

    await GameSession.findByIdAndUpdate(gameSession._id, {
      currentPositionId: positionId,
      isRevealed: isRevealed,
      revealProgress: isRevealed ? 100 : 0,
      $push: { history: historyEntry }
    });

    // Also add to User history for global favorites/library
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { history: positionId },
        $set: { lastSeen: new Date() }
      }).catch(err => console.error(err));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error logging solo session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
