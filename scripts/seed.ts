// ============================================
// Database Seed Script
// Reads positions.json and populates MongoDB
// Usage: npm run seed
// ============================================

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Import models directly (can't use @ alias in scripts)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/the-reveal';

interface RawPosition {
  headline: string;
  keywords: string[];
  url: string;
  description: string;
  image_url: string;
  local_image: string;
}

function extractTitle(headline: string | undefined): string {
  if (typeof headline !== 'string') return 'Intimate Position';
  // "369. Milk chocolate" → "Milk chocolate"
  const match = headline.match(/^\d+\.\s*(.+)$/);
  return match ? match[1].trim() : headline.trim();
}

function deriveSpiceLevel(keywords: string[] | undefined): 1 | 2 | 3 {
  const kws = Array.isArray(keywords) ? keywords : [];
  if (kws.includes('hard') || kws.includes('crazy')) return 3;
  if (kws.includes('easy')) return 1;
  return 2; // default medium
}

function generateTemplate(title: string, keywords: string[] | undefined): string {
  const kws = Array.isArray(keywords) ? keywords : [];
  const isManActive = kws.includes('man active');
  const isWomanActive = kws.includes('woman active');
  const isFaceToFace = kws.includes('face to face');
  const hasKissing = kws.includes('kissing');
  const isFromBehind = kws.includes('from behind');
  const isDoggy = kws.includes('doggy style');
  const isCowgirl = kws.includes('cowgirl');
  const isOral = kws.includes('oral sex');
  const isStanding = kws.includes('standing');
  const isSitting = kws.includes('sitting');
  const isLyingDown = kws.includes('lying down');

  const parts: string[] = [];

  parts.push(`{Player1} and {Player2} explore the "${title}" position together.`);

  if (isManActive && !isWomanActive) {
    parts.push(`{Player1} takes the lead, setting the rhythm and pace.`);
  } else if (isWomanActive && !isManActive) {
    parts.push(`{Player2} takes control, guiding the movement and intensity.`);
  } else {
    parts.push(`Both partners share the rhythm, moving in sync together.`);
  }

  if (isStanding) parts.push(`Standing together, feel the energy of each other's bodies.`);
  else if (isSitting) parts.push(`Seated intimately, use this closeness to deepen the connection.`);
  else if (isLyingDown) parts.push(`Lying together, let gravity melt away the tension.`);

  if (isFaceToFace) parts.push(`Facing each other, lock eyes and breathe together.`);
  else if (isFromBehind || isDoggy) parts.push(`{Player1} positions behind, hands exploring freely.`);
  else if (isCowgirl) parts.push(`{Player2} climbs on top, controlling the depth and angle.`);

  if (hasKissing) parts.push(`Let your lips find each other — kiss deeply and passionately.`);
  if (isOral) parts.push(`Use your mouth to discover what makes your partner shiver.`);

  parts.push(`Communicate openly — whisper what feels incredible.`);

  return parts.join(' ');
}

async function seed() {
  console.log('🌱 Starting seed...');
  console.log(`📡 Connecting to: ${MONGODB_URI}`);

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Define schema inline (avoiding path alias issues)
  const PositionSchema = new mongoose.Schema({
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    descriptionTemplate: { type: String, required: true },
    spiceLevel: { type: Number, min: 1, max: 3, required: true },
    partySize: { type: Number, min: 2, default: 2 },
    tags: [{ type: String }],
    imageUrl: { type: String },
    sourceUrl: { type: String },
  }, { timestamps: true });

  const Position = mongoose.models.Position || mongoose.model('Position', PositionSchema);

  // Read source data
  const dataPath = path.resolve(__dirname, '../sexpositions/positions.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ File not found: ${dataPath}`);
    process.exit(1);
  }

  const rawData: RawPosition[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`📂 Found ${rawData.length} positions in source data`);

  // Clear existing
  const deleted = await Position.deleteMany({});
  console.log(`🗑️ Cleared ${deleted.deletedCount} existing positions`);

  // Transform and insert
  const positions = rawData.map((raw) => {
    const title = extractTitle(raw.headline);
    const imageFile = raw.local_image ? path.basename(raw.local_image) : '';

    return {
      title,
      description: raw.description || '',
      descriptionTemplate: generateTemplate(title, raw.keywords),
      spiceLevel: deriveSpiceLevel(raw.keywords),
      partySize: 2,
      tags: Array.isArray(raw.keywords) ? raw.keywords : [],
      imageUrl: imageFile ? `/images/${imageFile}` : '',
      sourceUrl: raw.url || '',
    };
  });

  const result = await Position.insertMany(positions);
  console.log(`✅ Seeded ${result.length} positions`);

  // Stats
  const spiceCounts = { mild: 0, spicy: 0, inferno: 0 };
  positions.forEach((p) => {
    if (p.spiceLevel === 1) spiceCounts.mild++;
    else if (p.spiceLevel === 2) spiceCounts.spicy++;
    else spiceCounts.inferno++;
  });

  console.log(`
  📊 Seed Summary:
  ├── Mild (🌶):    ${spiceCounts.mild}
  ├── Spicy (🌶🌶):  ${spiceCounts.spicy}
  └── Inferno (🌶🌶🌶): ${spiceCounts.inferno}
  `);

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
