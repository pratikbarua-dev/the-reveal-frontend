const fs = require('fs');
const path = require('path');
const dataPath = path.resolve(__dirname, 'sexpositions/positions.json');
if (fs.existsSync(dataPath)) {
  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const tags = new Set();
  rawData.forEach(raw => {
    if (Array.isArray(raw.keywords)) {
      raw.keywords.forEach(kw => tags.add(kw));
    }
  });
  console.log(Array.from(tags).sort().join(', '));
} else {
  console.log("File not found");
}
