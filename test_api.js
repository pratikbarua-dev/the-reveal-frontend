import mongoose from 'mongoose';

const GameSessionSchema = new mongoose.Schema({}, { strict: false });
const GameSession = mongoose.models.GameSession || mongoose.model('GameSession', GameSessionSchema);
const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
  const uri = 'mongodb+srv://baruaprathik06_db_user:4UHHCvQAKD5yGOCE@cluster0.ekbjlos.mongodb.net/the-reveal?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(uri);
  
  const idStr = '6a4a61719d088d586873e8e2';
  
  try {
    let user = await User.findById(idStr).select('-__v').lean();
    console.log("User findById:", user ? user.email : null);
    
    const sessions = await GameSession.find({
      'participants.userId': idStr
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
    console.log("Sessions found:", sessions.length);

    const stringified = JSON.stringify({ user, sessions });
    console.log("JSON stringify successful");

  } catch (error) {
    console.error("API error:", error);
  }
  
  process.exit(0);
}
main();
