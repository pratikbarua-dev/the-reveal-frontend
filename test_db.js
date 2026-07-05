import mongoose from 'mongoose';
import User from './src/models/User.js';

async function main() {
  await mongoose.connect('mongodb://localhost:27017/reveal');
  const user = await mongoose.connection.collection('users').findOne({ _id: '6a4a61719d088d586873e8e2' });
  console.log("Raw query with string _id:", user);
  
  const userObjectId = await mongoose.connection.collection('users').findOne({ _id: new mongoose.Types.ObjectId('6a4a61719d088d586873e8e2') });
  console.log("Raw query with ObjectId:", userObjectId);
  
  process.exit(0);
}
main();
