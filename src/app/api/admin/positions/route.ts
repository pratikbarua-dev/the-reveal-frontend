import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Position from '@/models/Position';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    
    await dbConnect();

    const query = search 
      ? { 
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } }
          ]
        } 
      : {};

    const positions = await Position.find(query)
      .sort({ createdAt: -1 })
      .limit(100) // Usually want pagination, simplified for now
      .lean();

    const mappedPositions = positions.map((pos: any) => ({
      _id: pos._id.toString(),
      title: pos.title,
      description: pos.description,
      spiceLevel: pos.spiceLevel,
      partySize: pos.partySize,
      tagsCount: pos.tags?.length || 0,
      createdAt: pos.createdAt,
    }));

    return NextResponse.json({ positions: mappedPositions });
  } catch (error: any) {
    console.error('Error fetching admin positions:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Basic validation
    if (!body.title || !body.description || !body.imageUrl) {
      return NextResponse.json({ error: 'Title, description, and imageUrl are required' }, { status: 400 });
    }

    await dbConnect();

    const newPosition = await Position.create({
      title: body.title,
      description: body.description,
      descriptionTemplate: body.descriptionTemplate || body.description,
      spiceLevel: body.spiceLevel || 1,
      partySize: body.partySize || 2,
      tags: body.tags || [],
      imageUrl: body.imageUrl,
      sourceUrl: body.sourceUrl || '',
    });

    return NextResponse.json({ success: true, position: newPosition });
  } catch (error: any) {
    console.error('Error creating admin position:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
