const fs = require('fs');
const path = require('path');
const https = require('https');

const html = fs.readFileSync('lauvette.html', 'utf8');

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
        return;
      }
      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
      file.on('error', err => {
        fs.unlink(filepath, () => reject(err));
      });
    }).on('error', reject);
  });
}

async function scrape() {
  const blocks = html.split(/<h3><span class="designed_number "[^>]*>\d+<\/span>/).slice(1);
  const positions = [];
  
  const imgDir = path.join(__dirname, 'public', 'images', 'group_play_2');
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    // Extract Headline
    const headlineMatch = block.match(/^([^<]+)<\/h3>/);
    const headline = headlineMatch ? headlineMatch[1].trim() : `Position ${i+1}`;
    
    // Extract Image URL
    const imgMatch = block.match(/<img[^>]*src="([^"]+)"/);
    let imageUrl = '';
    let localImageUrl = '';
    if (imgMatch) {
      imageUrl = imgMatch[1];
      const filename = `lauvette_${i+1}.jpg`;
      localImageUrl = `/images/group_play_2/${filename}`;
      
      console.log(`Downloading ${filename}...`);
      try {
        await downloadImage(imageUrl, path.join(imgDir, filename));
      } catch (e) {
        console.error(`Failed to download ${imageUrl}`, e.message);
      }
    }
    
    // Extract description text
    const pRegex = /<p>(?:<strong>)?(?:How to do it:)?(?:<\/strong>)?(.*?)(?:<\/strong>)?<\/p>/g;
    let match;
    let description = '';
    while ((match = pRegex.exec(block)) !== null) {
      // Exclude p tags with img
      if (!match[1].includes('<img') && !match[1].includes('<strong>This might happen')) {
         let text = match[1].replace(/<[^>]+>/g, '').trim();
         if (text.length > 0) {
             description += text + ' ';
         }
      }
    }
    
    // Fallback if description is empty
    if (!description.trim()) {
        description = `Enjoy the ${headline} position!`;
    }

    positions.push({
      headline,
      description: description.trim(),
      keywords: ["threesome", "group play"],
      image_url: localImageUrl,
      url: "https://www.lauvette.ph/sex/threesome-sex-positions/"
    });
  }
  
  const dest = path.join(__dirname, 'scripts', 'sexpositions', 'group-positions-2.json');
  fs.writeFileSync(dest, JSON.stringify(positions, null, 2));
  console.log(`Saved ${positions.length} positions to ${dest}`);
}

scrape();
