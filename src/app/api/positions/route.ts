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
    const search = searchParams.get('search') || '';
    const spiceLevel = searchParams.get('spiceLevel'); // comma-separated e.g. "1,2"
    const partySize = searchParams.get('partySize'); // comma-separated e.g. "2,3"
    const selectedTags = searchParams.get('tags') || ''; // comma-separated
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const filterFavorites = searchParams.get('favorites') === 'true';

    await dbConnect();

    // Fetch user for hardLimits & savedFavorites filters
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build query
    const query: any = {};

    // 1. Exclude user boundaries (hard limits)
    if (user.hardLimits && user.hardLimits.length > 0) {
      query.tags = { $nin: user.hardLimits };
    }

    // 2. Favorites filter
    if (filterFavorites) {
      query._id = { $in: user.savedFavorites || [] };
    }

    // 3. Search query
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // 4. Spice levels
    if (spiceLevel) {
      const levels = spiceLevel.split(',').map((l) => parseInt(l, 10));
      query.spiceLevel = { $in: levels };
    }

    // 5. Party sizes
    if (partySize) {
      const sizes = partySize.split(',').map((s) => parseInt(s, 10));
      query.partySize = { $in: sizes };
    }

    // 6. Selected Tags
    if (selectedTags) {
      const tagsArray = selectedTags.split(',');
      if (query.tags) {
        query.tags.$all = tagsArray;
      } else {
        query.tags = { $all: tagsArray };
      }
    }

    // Execute paginated query
    const skip = (page - 1) * limit;
    const items = await Position.find(query)
      .sort({ title: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Position.countDocuments(query);

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Error fetching positions:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
