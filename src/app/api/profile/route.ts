import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        _id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        isOnboarded: user.isOnboarded,
        playMode: (user as any).playMode || 'solo',
        preferredPartySize: user.preferredPartySize,
        hardLimits: user.hardLimits || [],
        participantNames: user.participantNames || [],
        savedFavorites: user.savedFavorites || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { playMode, preferredPartySize, hardLimits, participantNames } = body;

    const updates: any = {};
    if (playMode !== undefined) {
      if (!['solo', 'partner'].includes(playMode)) {
        return NextResponse.json({ error: 'Invalid play mode' }, { status: 400 });
      }
      updates.playMode = playMode;
    }
    if (preferredPartySize !== undefined) {
      if (![2, 3, 4].includes(preferredPartySize)) {
        return NextResponse.json({ error: 'Invalid party size preference' }, { status: 400 });
      }
      updates.preferredPartySize = preferredPartySize;
    }
    if (hardLimits !== undefined) {
      updates.hardLimits = hardLimits;
    }
    if (participantNames !== undefined) {
      updates.participantNames = participantNames;
    }

    await dbConnect();

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      updates,
      { new: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        _id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
        isOnboarded: updatedUser.isOnboarded,
        playMode: (updatedUser as any).playMode || 'solo',
        preferredPartySize: updatedUser.preferredPartySize,
        hardLimits: updatedUser.hardLimits || [],
        participantNames: updatedUser.participantNames || [],
        savedFavorites: updatedUser.savedFavorites || [],
      },
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
