import mongoose from 'mongoose';

async function main() {
  const uri = 'mongodb+srv://baruaprathik06_db_user:4UHHCvQAKD5yGOCE@cluster0.ekbjlos.mongodb.net/the-reveal?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(uri);
  
  const users = await mongoose.connection.collection('users').find({}).toArray();
  console.log(`Found ${users.length} users.`);
  for (const u of users) {
    if (u.email) {
      console.log(`User: ${u.email} | _id: ${u._id} | typeof _id: ${typeof u._id} | constructor: ${u._id?.constructor?.name}`);
    }
  }
  
  process.exit(0);
}
main();
