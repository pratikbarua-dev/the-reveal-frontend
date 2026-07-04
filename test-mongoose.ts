import mongoose from 'mongoose';
import User from './src/models/User';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const user = await User.findById('6a479f1f69e8a1db2882d659');
  console.log("Mongoose findById:", user ? user._id : 'Not found');
  process.exit(0);
}
test();
