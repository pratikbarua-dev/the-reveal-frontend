import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Position from '@/models/Position';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const partySizeParam = searchParams.get('partySize');
    const spiceLevelParam = searchParams.get('spiceLevel');

    await dbConnect();

    // Fetch user profiles to find hardLimits and pre-set preferences
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const query: any = {};

    // Apply user boundaries
    if (user.hardLimits && user.hardLimits.length > 0) {
      query.tags = { $nin: user.hardLimits };
    }

    // Filter by partySize (either requested in query or from user onboarding preference)
    const activePartySize = partySizeParam ? parseInt(partySizeParam, 10) : user.preferredPartySize;
    if (activePartySize) {
      query.partySize = activePartySize;
    }

    // Filter by spiceLevel if requested
    if (spiceLevelParam) {
      query.spiceLevel = parseInt(spiceLevelParam, 10);
    }

    // Use MongoDB aggregation to sample 1 random document
    const randomPositions = await Position.aggregate([
      { $match: query },
      { $sample: { size: 1 } },
    ]);

    if (!randomPositions || randomPositions.length === 0) {
      // Fallback: try querying without partySize/spiceLevel filters if no match, keeping hard limits
      const fallbackQuery: any = {};
      if (query.tags) {
        fallbackQuery.tags = query.tags;
      }
      const fallbackPositions = await Position.aggregate([
        { $match: fallbackQuery },
        { $sample: { size: 1 } },
      ]);

      if (!fallbackPositions || fallbackPositions.length === 0) {
        return NextResponse.json({ error: 'No positions found' }, { status: 404 });
      }
      return NextResponse.json(fallbackPositions[0]);
    }

    return NextResponse.json(randomPositions[0]);
  } catch (error: any) {
    console.error('Error fetching random position:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
