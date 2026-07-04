const fs = require('fs');
const path = require('path');
const https = require('https');

const html = fs.readFileSync('squirt.html', 'utf8');

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.schoolofsquirt.com/'
      }
    };

    https.get(options, (res) => {
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
  // Split by position headers like <h2><strong>1. The Oral Overload</strong></h2>
  const blocks = html.split(/<h2><strong>\d+\.\s*/).slice(1);
  const positions = [];
  
  const imgDir = path.join(__dirname, 'public', 'images', 'group_play_3');
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    // Extract Headline
    const headlineMatch = block.match(/^([^<]+)<\/strong><\/h2>/);
    if (!headlineMatch) continue;
    let headline = headlineMatch[1].trim();
    
    // Check if it's MMF or MFF based on index (first 10 are MMF, next 10 are MFF)
    const type = i < 10 ? "MMF" : "MFF";
    const tags = ["threesome", "group play", type];

    // Extract Image URL
    // We want the largest image from the srcset or just the base src.
    // Base src usually has a -300x200 appended which we can try to strip for higher res, 
    // but taking the base src is safer.
    const imgMatch = block.match(/<img[^>]*src="([^"]+)"/);
    let imageUrl = '';
    let localImageUrl = '';
    if (imgMatch) {
      imageUrl = imgMatch[1];
      
      // Attempt to get the original high-res by removing the resolution suffix like -300x248
      imageUrl = imageUrl.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
      
      const filename = `squirt_${positions.length + 1}.png`;
      localImageUrl = `/images/group_play_3/${filename}`;
      
      console.log(`Downloading ${filename}...`);
      try {
        await downloadImage(imageUrl, path.join(imgDir, filename));
      } catch (e) {
        console.error(`Failed to download ${imageUrl}`, e.message);
      }
    }
    
    // Extract description text
    const pRegex = /<p>(.*?)<\/p>/g;
    let match;
    let description = '';
    while ((match = pRegex.exec(block)) !== null) {
      // Exclude p tags with img
      if (!match[1].includes('<img') && !match[1].includes('<script') && !match[1].includes('<style')) {
         let text = match[1].replace(/<[^>]+>/g, '').trim();
         if (text.length > 0) {
             description += text + ' ';
         }
      }
    }

    positions.push({
      headline,
      description: description.trim(),
      keywords: tags,
      image_url: localImageUrl,
      url: "https://www.schoolofsquirt.com/threesome-positions/"
    });
  }
  
  const dest = path.join(__dirname, 'scripts', 'sexpositions', 'group-positions-3.json');
  fs.writeFileSync(dest, JSON.stringify(positions, null, 2));
  console.log(`Saved ${positions.length} positions to ${dest}`);
}

scrape();
