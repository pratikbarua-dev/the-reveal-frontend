import mongoose from 'mongoose';

async function main() {
  await mongoose.connect('mongodb://localhost:27017/reveal');
  const user = await mongoose.connection.collection('users').findOne({ _id: '6a4a61719d088d586873e8e2' });
  console.log("Raw query with string _id:", user);
  
  const userObjectId = await mongoose.connection.collection('users').findOne({ _id: new mongoose.Types.ObjectId('6a4a61719d088d586873e8e2') });
  console.log("Raw query with ObjectId:", userObjectId);
  
  const users = await mongoose.connection.collection('users').find({}).toArray();
  console.log("All users length:", users.length);
  if (users.length > 0) {
    console.log("Sample user _id type:", typeof users[0]._id, users[0]._id);
  }
  process.exit(0);
}
main();
