import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Position from './src/models/Position';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  try {
    const tags = await Position.distinct('tags');
    console.log(tags.sort().join(', '));
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
