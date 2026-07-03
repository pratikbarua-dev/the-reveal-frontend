// ============================================
// Admin API: GET/PUT /api/admin/config — Manage site configuration
// ============================================

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import SiteConfig from '@/models/SiteConfig';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    let config = await SiteConfig.findOne({ key: 'global' });
    if (!config) {
      config = await SiteConfig.create({ key: 'global', authMode: 'hybrid' });
    }

    return NextResponse.json({
      authMode: config.authMode,
      updatedAt: config.updatedAt,
      updatedBy: config.updatedBy,
    });
  } catch (error: any) {
    console.error('Error fetching admin config:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { authMode } = body;

    if (!['login', 'guest', 'hybrid'].includes(authMode)) {
      return NextResponse.json({ error: 'Invalid authMode. Must be login, guest, or hybrid.' }, { status: 400 });
    }

    await dbConnect();

    const config = await SiteConfig.findOneAndUpdate(
      { key: 'global' },
      {
        authMode,
        updatedBy: session.user?.email || 'admin',
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      authMode: config.authMode,
      updatedAt: config.updatedAt,
      updatedBy: config.updatedBy,
    });
  } catch (error: any) {
    console.error('Error updating admin config:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
