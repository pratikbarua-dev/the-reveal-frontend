import mongoose from 'mongoose';
import { env } from 'process';

async function main() {
  await mongoose.connect('mongodb://localhost:27017/reveal');
  const collection = mongoose.connection.collection('users');
  const idStr = '6a4a61719d088d586873e8e2';
  
  // Try finding as string
  let user = await collection.findOne({ _id: idStr });
  if (user) {
    console.log("Found as String:", user._id, typeof user._id);
  } else {
    // Try finding as ObjectId
    user = await collection.findOne({ _id: new mongoose.Types.ObjectId(idStr) });
    if (user) {
      console.log("Found as ObjectId:", user._id, typeof user._id);
    } else {
      console.log("User not found as either string or ObjectId in db!");
    }
  }
  process.exit(0);
}
main();
