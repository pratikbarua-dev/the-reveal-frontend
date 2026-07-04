import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import GameSession from '@/models/GameSession';
import User from '@/models/User';
import Position from '@/models/Position'; // Ensure model is registered

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Users
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Sessions breakdown
    const totalSessions = await GameSession.countDocuments();
    const totalSoloSessions = await GameSession.countDocuments({ playMode: 'solo' });
    const totalPartnerSessions = await GameSession.countDocuments({ playMode: 'partner' });
    
    const activeSessionsToday = await GameSession.countDocuments({ createdAt: { $gte: today } });
    const activeSoloSessionsToday = await GameSession.countDocuments({ playMode: 'solo', createdAt: { $gte: today } });
    const activePartnerSessionsToday = await GameSession.countDocuments({ playMode: 'partner', createdAt: { $gte: today } });

    // Engagement & Preferences (last 7 days)
    const sessions = await GameSession.find({ createdAt: { $gte: sevenDaysAgo } }).populate({
      path: 'history.positionId',
      model: Position
    });
    
    let soloSessionsCount = 0;
    let partnerSessionsCount = 0;
    let soloCardsRevealed = 0;
    let partnerCardsRevealed = 0;
    let totalCardsRevealed = 0;
    let totalCardsVetoed = 0;

    let soloSpiceMild = 0;
    let soloSpiceSpicy = 0;
    let soloSpiceInferno = 0;

    sessions.forEach(s => {
      const cardCount = s.history?.length || 0;
      const vetoCount = s.history?.filter((h: any) => h.vetoed).length || 0;

      totalCardsRevealed += cardCount;
      totalCardsVetoed += vetoCount;

      if (s.playMode === 'solo') {
        soloSessionsCount++;
        soloCardsRevealed += cardCount;

        // Tally spice levels for solo play
        s.history?.forEach((h: any) => {
          const pos = h.positionId;
          if (pos && typeof pos === 'object' && 'spiceLevel' in pos) {
            const spice = pos.spiceLevel;
            if (spice === 1) soloSpiceMild++;
            else if (spice === 2) soloSpiceSpicy++;
            else if (spice === 3) soloSpiceInferno++;
          }
        });
      } else {
        partnerSessionsCount++;
        partnerCardsRevealed += cardCount;
      }
    });

    const vetoRate = totalCardsRevealed > 0 ? (totalCardsVetoed / totalCardsRevealed) * 100 : 0;
    const avgCardsPerSoloSession = soloSessionsCount > 0 ? soloCardsRevealed / soloSessionsCount : 0;
    const avgCardsPerPartnerSession = partnerSessionsCount > 0 ? partnerCardsRevealed / partnerSessionsCount : 0;

    // Build the analytics payload
    const analytics = {
      overview: {
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        totalSessions,
        totalSoloSessions,
        totalPartnerSessions,
        activeSessionsToday,
        activeSoloSessionsToday,
        activePartnerSessionsToday,
      },
      engagement: {
        avgCardsPerSoloSession,
        avgCardsPerPartnerSession,
        vetoRate,
        totalCardsRevealedRecent: totalCardsRevealed,
      },
      soloPreferences: {
        mild: soloSpiceMild,
        spicy: soloSpiceSpicy,
        inferno: soloSpiceInferno,
        total: soloSpiceMild + soloSpiceSpicy + soloSpiceInferno
      }
    };

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
