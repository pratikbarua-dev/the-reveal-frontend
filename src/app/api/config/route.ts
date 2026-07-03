// ============================================
// Public API: GET /api/config — Returns site config (auth mode)
// No authentication required — all clients need this to bootstrap.
// ============================================

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SiteConfig from '@/models/SiteConfig';

export async function GET() {
  try {
    await dbConnect();

    // Find or create the singleton config document
    let config = await SiteConfig.findOne({ key: 'global' });
    if (!config) {
      config = await SiteConfig.create({ key: 'global', authMode: 'hybrid' });
    }

    return NextResponse.json({
      authMode: config.authMode,
    });
  } catch (error: any) {
    console.error('Error fetching site config:', error);
    return NextResponse.json({ authMode: 'hybrid' }); // Safe fallback
  }
}
