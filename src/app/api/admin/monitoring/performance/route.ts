import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import MonitoringMetric from '@/models/MonitoringMetric';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Aggregate by route for the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const performanceStats = await MonitoringMetric.aggregate([
      { $match: { type: 'api_request', timestamp: { $gte: yesterday } } },
      {
        $group: {
          _id: "$route",
          avgResponseTime: { $avg: "$responseTimeMs" },
          maxResponseTime: { $max: "$responseTimeMs" },
          totalRequests: { $sum: 1 },
          errorCount: {
            $sum: {
              $cond: [{ $gte: ["$statusCode", 400] }, 1, 0]
            }
          }
        }
      },
      { $sort: { avgResponseTime: -1 } }
    ]);

    const globalStats = await MonitoringMetric.aggregate([
      { $match: { type: 'api_request', timestamp: { $gte: yesterday } } },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: "$responseTimeMs" },
          totalRequests: { $sum: 1 },
          errorCount: {
            $sum: {
              $cond: [{ $gte: ["$statusCode", 400] }, 1, 0]
            }
          }
        }
      }
    ]);

    return NextResponse.json({
      routes: performanceStats,
      global: globalStats[0] || { avgResponseTime: 0, totalRequests: 0, errorCount: 0 }
    });
  } catch (error: any) {
    console.error('Error fetching performance stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
