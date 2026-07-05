import mongoose from 'mongoose';

const PositionSchema = new mongoose.Schema({}, { strict: false });
const Position = mongoose.models.Position || mongoose.model('Position', PositionSchema);

const GameSessionSchema = new mongoose.Schema({
  participants: Array,
  currentPositionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Position' }
}, { strict: false });
const GameSession = mongoose.models.GameSession || mongoose.model('GameSession', GameSessionSchema);
const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
  const uri = 'mongodb+srv://baruaprathik06_db_user:4UHHCvQAKD5yGOCE@cluster0.ekbjlos.mongodb.net/the-reveal?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(uri);
  
  const idStr = '6a4a61719d088d586873e8e2';
  
  try {
    const sessions = await GameSession.find({
      'participants.userId': idStr
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('currentPositionId', 'title')
    .lean();
    console.log("Sessions populated:", sessions.length);

  } catch (error) {
    console.error("API error during populate:", error);
  }
  
  process.exit(0);
}
main();
