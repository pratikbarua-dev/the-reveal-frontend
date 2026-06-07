import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { preferredPartySize, hardLimits, participantNames } = body;

    // Validate preferredPartySize
    if (![2, 3, 4].includes(preferredPartySize)) {
      return NextResponse.json({ error: 'Invalid party size preference' }, { status: 400 });
    }

    await dbConnect();

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        preferredPartySize,
        hardLimits: hardLimits || [],
        participantNames: participantNames || [],
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        email: updatedUser.email,
        isOnboarded: updatedUser.isOnboarded,
        preferredPartySize: updatedUser.preferredPartySize,
        hardLimits: updatedUser.hardLimits,
        participantNames: updatedUser.participantNames,
      },
    });
  } catch (error: any) {
    console.error('Error in onboarding API:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
