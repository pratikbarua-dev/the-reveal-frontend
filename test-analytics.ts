import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import GameSession from './src/models/GameSession';
import User from './src/models/User';
import Position from './src/models/Position';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Users
    const totalUsers = await User.countDocuments();
    console.log('totalUsers', totalUsers);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
    console.log('newUsersToday', newUsersToday);

    // Sessions breakdown
    const totalSessions = await GameSession.countDocuments();
    console.log('totalSessions', totalSessions);

    const sessions = await GameSession.find({ createdAt: { $gte: sevenDaysAgo } }).populate('history.positionId');
    console.log('sessions count', sessions.length);
    
    // Tally
    sessions.forEach(s => {
      s.history?.forEach((h: any) => {
        const pos = h.positionId;
        console.log('pos', typeof pos, pos ? pos.spiceLevel : null);
      });
    });

    console.log('Done without error');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    mongoose.disconnect();
  }
}
run();
