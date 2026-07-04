// ============================================
// Database Seed Script
// Reads positions.json and group-positions*.json and populates MongoDB
// Usage: npm run seed
// ============================================

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/the-reveal';

interface RawPosition {
  headline: string;
  keywords: string[];
  url: string;
  description: string;
  image_url: string;
  local_image?: string;
  category?: 'standard' | 'group' | 'fetish';
  partySize?: number;
}

function extractTitle(headline: string | undefined): string {
  if (typeof headline !== 'string') return 'Intimate Position';
  const match = headline.match(/^\d+\.\s*(.+)$/);
  return match ? match[1].trim() : headline.trim();
}

function deriveSpiceLevel(keywords: string[] | undefined): 1 | 2 | 3 {
  const kws = Array.isArray(keywords) ? keywords : [];
  if (kws.includes('hard') || kws.includes('crazy') || kws.includes('cuckold') || kws.includes('group play')) return 3;
  if (kws.includes('easy')) return 1;
  return 2; 
}

function generateTemplate(title: string, keywords: string[] | undefined, partySize: number): string {
  const kws = Array.isArray(keywords) ? keywords : [];
  
  if (partySize === 3) {
    const parts: string[] = [];
    parts.push(`{Player1}, {Player2}, and {Player3} explore the "${title}" position together.`);
    if (kws.includes('voyeurism') || kws.includes('cuckold')) {
        parts.push(`{Player1} watches intently while {Player2} and {Player3} engage deeply.`);
    } else if (kws.includes('MMF') || kws.includes('MFF')) {
        parts.push(`{Player2} becomes the center of attention, receiving pleasure from both {Player1} and {Player3}.`);
    } else {
        parts.push(`All three partners share the rhythm, moving in sync and finding incredible connections.`);
    }
    parts.push(`Communicate openly — whisper what feels incredible to each other.`);
    return parts.join(' ');
  }

  // Standard 2-player template
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

  const PositionSchema = new mongoose.Schema({
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    descriptionTemplate: { type: String, required: true },
    spiceLevel: { type: Number, min: 1, max: 3, required: true },
    partySize: { type: Number, min: 2, default: 2 },
    category: { type: String, enum: ['standard', 'group', 'fetish'], default: 'standard' },
    genderConfig: [{ type: String }],
    tags: [{ type: String }],
    imageUrl: { type: String },
    sourceUrl: { type: String },
  }, { timestamps: true });

  const Position = mongoose.models.Position || mongoose.model('Position', PositionSchema);

  // Define files to read
  const files = [
    { file: '../sexpositions/positions.json', category: 'standard', partySize: 2 },
    { file: 'sexpositions/group-positions.json', category: 'group', partySize: 3 },
    { file: 'sexpositions/group-positions-2.json', category: 'group', partySize: 3 },
    { file: 'sexpositions/group-positions-3.json', category: 'group', partySize: 3 },
  ];

  const positionsToInsert = [];

  for (const item of files) {
    const dataPath = path.resolve(__dirname, item.file);
    if (!fs.existsSync(dataPath)) {
      console.warn(`⚠️ File not found: ${dataPath}, skipping...`);
      continue;
    }
    const rawData: RawPosition[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log(`📂 Found ${rawData.length} positions in ${path.basename(dataPath)}`);

    for (const raw of rawData) {
      const title = extractTitle(raw.headline);
      const isGroup = item.partySize === 3;
      const kws = Array.isArray(raw.keywords) ? raw.keywords : [];
      
      let imageUrl = '';
      if (raw.image_url && raw.image_url.startsWith('/images/')) {
        imageUrl = raw.image_url;
      } else if (raw.local_image) {
        imageUrl = `/images/${path.basename(raw.local_image)}`;
      }

      let category = item.category;
      if (kws.includes('cuckold') || kws.includes('voyeurism')) {
         category = 'fetish';
      }

      const genderConfig = [];
      if (kws.includes('MMF')) genderConfig.push('M', 'M', 'F');
      if (kws.includes('MFF')) genderConfig.push('M', 'F', 'F');

      positionsToInsert.push({
        title,
        description: raw.description || '',
        descriptionTemplate: generateTemplate(title, kws, item.partySize),
        spiceLevel: deriveSpiceLevel(kws),
        partySize: item.partySize,
        category: category,
        genderConfig: genderConfig,
        tags: kws,
        imageUrl: imageUrl,
        sourceUrl: raw.url || '',
      });
    }
  }

  // Clear existing
  const deleted = await Position.deleteMany({});
  console.log(`🗑️ Cleared ${deleted.deletedCount} existing positions`);

  const result = await Position.insertMany(positionsToInsert);
  console.log(`✅ Seeded ${result.length} total positions`);

  // Stats
  const stats = { mild: 0, spicy: 0, inferno: 0, standard: 0, group: 0, fetish: 0 };
  positionsToInsert.forEach((p) => {
    if (p.spiceLevel === 1) stats.mild++;
    else if (p.spiceLevel === 2) stats.spicy++;
    else stats.inferno++;

    if (p.category === 'standard') stats.standard++;
    else if (p.category === 'group') stats.group++;
    else stats.fetish++;
  });

  console.log(`
  📊 Seed Summary:
  ├── Mild (🌶):    ${stats.mild}
  ├── Spicy (🌶🌶):  ${stats.spicy}
  └── Inferno (🌶🌶🌶): ${stats.inferno}
  
  ├── Standard (2P): ${stats.standard}
  ├── Group (3P+):   ${stats.group}
  └── Fetish (3P+):  ${stats.fetish}
  `);

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
