import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    const users = await mongoose.connection.collection('users').find({}).toArray();
    
    const mapped = users.map(u => ({
      rawId: u._id,
      idType: typeof u._id,
      constructor: u._id?.constructor?.name,
      isObjectId: u._id instanceof mongoose.Types.ObjectId,
      stringified: u._id?.toString(),
      email: u.email
    }));

    return NextResponse.json({ users: mapped });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
