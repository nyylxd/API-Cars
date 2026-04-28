const db = require('./database');

const WIKI_API = 'https://commons.wikimedia.org/w/api.php';

// Sleep helper
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Search Wikimedia Commons for car images
async function searchWikiImages(brand, model) {
  const queries = [
    `${brand}+${model}+car`,
    `${brand}+${model}+Brasil`,
    `${brand}+${model}+automovel`,
    `${brand}+${model}`,
  ];

  for (const q of queries) {
    try {
      const url = `${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=6&format=json&origin=*&srlimit=10`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const hits = (data.query?.search || [])
        .filter(h => {
          const t = h.title.toLowerCase();
          // Filter out drawings, logos, diagrams, SVGs
          const skip = ['.svg', 'logo', 'drawing', 'diagram', 'sketch', 'blueprint', 'badge', 'emblem', 'sign'];
          return !skip.some(s => t.includes(s));
        })
        .map(h => h.title);
      if (hits.length > 0) return hits;
      await sleep(200);
    } catch (e) { /* continue to next query */ }
  }
  return [];
}

// Get actual image URLs from file page titles
async function getImageUrls(files) {
  const urls = [];
  const batch = files.slice(0, 5);

  // Build titles parameter
  const titles = batch.map(f => f.replace(/^File:/, 'File:')).join('|');
  try {
    const url = `${WIKI_API}?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return urls;
    const data = await res.json();
    const pages = Object.values(data.query?.pages || {});
    for (const page of pages) {
      if (page.imageinfo?.[0]?.url) {
        urls.push(page.imageinfo[0].url);
      }
    }
  } catch (e) { /* ignore */ }
  return urls;
}

// Main function
async function replaceImages() {
  console.log('🔍 Finding Brazilian cars with placeholder images...');

  // Get unique brand+model combos that have placeholders
  const models = db.prepare(`
    SELECT brand, model, COUNT(*) as cnt
    FROM cars
    WHERE is_brazilian = 1 AND image_url LIKE '%placehold%'
    GROUP BY brand, model
    ORDER BY brand, model
  `).all();

  console.log(`Found ${models.length} unique brand/model combos to fix (affecting 1,420 cars)\n`);

  let success = 0;
  let failed = 0;
  let totalPhotos = 0;

  const updateImage = db.prepare(`
    UPDATE cars SET image_url = ?, photo_urls = ?
    WHERE is_brazilian = 1 AND brand = ? AND model = ?
  `);

  const transaction = db.transaction(() => {
    // We'll do updates outside transaction since we're async
  });

  for (let i = 0; i < models.length; i++) {
    const { brand, model, cnt } = models[i];
    const pct = Math.round((i / models.length) * 100);
    process.stdout.write(`\r[${pct}%] ${brand} ${model} (${cnt} cars)...`);

    try {
      // Search Wikimedia
      const files = await searchWikiImages(brand, model);

      if (files.length === 0) {
        failed++;
        continue;
      }

      // Get real image URLs
      const urls = await getImageUrls(files);

      if (urls.length === 0) {
        failed++;
        continue;
      }

      // Update all cars of this brand+model
      const mainImage = urls[0];
      const photoUrlsJson = JSON.stringify(urls);

      const updated = db.prepare(`
        UPDATE cars SET image_url = ?, photo_urls = ?
        WHERE is_brazilian = 1 AND brand = ? AND model = ?
      `).run(mainImage, photoUrlsJson, brand, model);

      success++;
      totalPhotos += urls.length;

      // Rate limiting
      await sleep(250);
    } catch (e) {
      failed++;
      console.error(`\n  ❌ ${brand} ${model}: ${e.message}`);
    }
  }

  console.log(`\n\n✅ Done!`);
  console.log(`   Success: ${success} models (${models.length - failed} with real photos)`);
  console.log(`   Failed:  ${failed} models (no photos found)`);
  console.log(`   Total photos downloaded: ${totalPhotos}`);

  // Final stats
  const remaining = db.prepare("SELECT COUNT(*) as c FROM cars WHERE is_brazilian = 1 AND image_url LIKE '%placehold%'").get().c;
  const withReal = db.prepare("SELECT COUNT(*) as c FROM cars WHERE is_brazilian = 1 AND image_url IS NOT NULL AND image_url NOT LIKE '%placehold%'").get().c;

  console.log(`\n📊 Final stats:`);
  console.log(`   Brazilian cars with real photos: ${withReal}`);
  console.log(`   Still with placeholders: ${remaining}`);
}

replaceImages().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
