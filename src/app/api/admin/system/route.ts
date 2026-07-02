import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import os from 'os';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Ping backend
    let backendStatus = 'down';
    let backendPingMs = 0;
    try {
      const start = Date.now();
      const res = await fetch(process.env.NEXT_PUBLIC_SOCKET_URL + '/health' || 'http://localhost:4000/health', { 
        signal: AbortSignal.timeout(2000) 
      });
      if (res.ok) {
        backendStatus = 'up';
        backendPingMs = Date.now() - start;
      }
    } catch (e) {
      // Backend is down
    }

    const systemStats = {
      backend: {
        status: backendStatus,
        pingMs: backendPingMs,
      },
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      },
      frontend: {
        uptime: Math.round(process.uptime()),
        memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
        nodeVersion: process.version,
        platform: os.platform(),
      }
    };

    return NextResponse.json(systemStats);
  } catch (error: any) {
    console.error('Error fetching admin system stats:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
