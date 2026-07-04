const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://www.womenshealthmag.com/sex-and-love/a19994724/threesome-sex-positions/';

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

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', async () => {
    console.log('Downloaded HTML');
    
    const positions = [];
    // The positions are in <h2> elements like <h2>1. 69 Plus One</h2>
    // Followed by <p>How to: ...</p>
    // Followed by <p>Benefits: ...</p>
    // There are also images before or after.
    
    // We will extract all unique images containing 'sexillustrations-threesome'
    const imgRegex = /https:\/\/hips\.hearstapps\.com\/hmg-prod\/images\/sexillustrations-threesome-[^" ]*\.png/g;
    let images = [...new Set(data.match(imgRegex) || [])];
    
    console.log(`Found ${images.length} unique images.`);
    
    const imgDir = path.join(__dirname, 'public', 'images', 'group_play');
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir, { recursive: true });
    }
    
    for (let i = 0; i < images.length; i++) {
      const imgUrl = images[i];
      const filename = `group_play_${i+1}.png`;
      console.log(`Downloading ${filename}...`);
      await downloadImage(imgUrl, path.join(imgDir, filename));
    }
    
    console.log('All images downloaded successfully!');
  });
}).on('error', (err) => {
  console.error(err);
});
