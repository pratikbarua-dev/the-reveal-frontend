import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const UserSchema = new Schema({
  email: String,
  name: String,
}, { timestamps: true });
const User = mongoose.model('User', UserSchema);

async function main() {
  const uri = 'mongodb+srv://baruaprathik06_db_user:4UHHCvQAKD5yGOCE@cluster0.ekbjlos.mongodb.net/the-reveal?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(uri);
  
  const idStr = '6a4a61719d088d586873e8e2';
  const user = await User.findById(idStr);
  console.log("findById returned:", user ? user.email : null);
  
  const rawUser = await mongoose.connection.collection('users').findOne({ _id: new mongoose.Types.ObjectId(idStr) });
  console.log("raw collection findOne returned:", rawUser ? rawUser.email : null);

  process.exit(0);
}
main();
