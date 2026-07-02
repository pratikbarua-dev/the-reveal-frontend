import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Position from '@/models/Position';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Ensure Position model is loaded
    Position.schema; 

    const user = await User.findOne({ email: session.user.email })
      .populate({
        path: 'history',
        model: 'Position'
      })
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return the populated history array. Reverse it so the most recent is first.
    // If a position was deleted, it might be null, so filter out nulls.
    const historyItems = (user.history || [])
      .filter((pos: any) => pos && pos._id)
      .reverse();

    return NextResponse.json({ items: historyItems });
  } catch (error: any) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { positionId } = await req.json();
    if (!positionId) {
      return NextResponse.json({ error: 'Position ID is required' }, { status: 400 });
    }

    await dbConnect();

    // Add position to history, $addToSet prevents duplicates
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $addToSet: { history: positionId } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving to history:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
