import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import GameSession from '@/models/GameSession';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    
    await dbConnect();

    const query = search 
      ? { roomCode: { $regex: search, $options: 'i' } } 
      : {};

    const gameSessions = await GameSession.find(query)
      .populate('hostUserId', 'name email image')
      .populate('history.positionId', 'title imageUrl spiceLevel')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const mappedSessions = gameSessions.map((s: any) => ({
      _id: s._id.toString(),
      roomCode: s.roomCode,
      status: s.status,
      hostName: s.hostUserId?.name || 'Unknown',
      players: s.participants.map((p: any) => p.displayName),
      revealedCount: s.history?.length || 0,
      vetoedCount: s.history?.filter((h: any) => h.vetoed).length || 0,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      // Pass the full populated history to view exact positions
      history: s.history?.map((h: any) => ({
        positionTitle: h.positionId?.title || 'Unknown',
        imageUrl: h.positionId?.imageUrl,
        spiceLevel: h.positionId?.spiceLevel,
        revealedAt: h.revealedAt,
        vetoed: h.vetoed,
      })) || [],
    }));

    return NextResponse.json({ sessions: mappedSessions });
  } catch (error: any) {
    console.error('Error fetching admin sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
