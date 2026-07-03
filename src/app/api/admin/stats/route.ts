import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Position from '@/models/Position';
import GameSession from '@/models/GameSession';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const totalUsers = await User.countDocuments();
    
    // New users in last 24h
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const newUsers24h = await User.countDocuments({ createdAt: { $gte: oneDayAgo } });

    const totalPositions = await Position.countDocuments();
    const totalSessions = await GameSession.countDocuments();
    const totalSoloSessions = await GameSession.countDocuments({ playMode: 'solo' });
    const totalPartnerSessions = await GameSession.countDocuments({ playMode: 'partner' });

    // Cards revealed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionsWithRevealsToday = await GameSession.find({
      'history.revealedAt': { $gte: today }
    });

    let cardsRevealedToday = 0;
    sessionsWithRevealsToday.forEach(session => {
      session.history.forEach((h: any) => {
        if (h.revealedAt >= today) {
          cardsRevealedToday++;
        }
      });
    });

    return NextResponse.json({
      totalUsers,
      newUsers24h,
      totalPositions,
      totalSessions,
      totalSoloSessions,
      totalPartnerSessions,
      cardsRevealedToday,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
