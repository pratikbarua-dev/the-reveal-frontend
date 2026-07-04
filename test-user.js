require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ _id: '6a479f1f69e8a1db2882d659' });
  console.log("User by string ID:", user ? user._id : 'Not found');
  
  const userObj = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId('6a479f1f69e8a1db2882d659') });
  console.log("User by ObjectId:", userObj ? userObj._id : 'Not found');
  
  process.exit(0);
}
test();
