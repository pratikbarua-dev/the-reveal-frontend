import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Position from './src/models/Position';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  try {
    const res = await Position.aggregate([
      { $match: { tags: undefined } },
      { $sample: { size: 1 } }
    ]);
    console.log(`Query { tags: undefined } matched: ${res.length}`);
    
    const res2 = await Position.aggregate([
      { $match: {} },
      { $sample: { size: 1 } }
    ]);
    console.log(`Query {} matched: ${res2.length}`);
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
