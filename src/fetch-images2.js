const db = require('./database');

const WIKI_API = 'https://commons.wikimedia.org/w/api.php';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function searchWikiImages(brand, model) {
  // Smarter queries — try English, Portuguese, and brand-specific
  const queries = [
    `${brand}+${model}+car+-logo+-drawing`,
    `${brand}+${model}+vehicle`,
    `${brand}+${model}+automovel+Brasil`,
    `${brand}+${model}+carro`,
    `${brand}+${model}+photo`,
    `${brand}+${model}`,  // bare query last
  ];

  for (const q of queries) {
    try {
      const url = `${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=6&format=json&origin=*&srlimit=15`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const hits = (data.query?.search || [])
        .filter(h => {
          const t = h.title.toLowerCase();
          // Only skip obvious non-photo files
          const skip = ['drawing', 'diagram', 'sketch', 'blueprint', 'badge', 'emblem'];
          return !skip.some(s => t.includes(s));
        })
        .map(h => h.title);
      if (hits.length > 0) return hits;
      await sleep(300);
    } catch (e) { /* continue */ }
  }
  return [];
}

async function getImageUrls(files) {
  const urls = [];
  const batch = files.slice(0, 5);
  const titles = batch.join('|');
  try {
    const url = `${WIKI_API}?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return urls;
    const data = await res.json();
    for (const page of Object.values(data.query?.pages || {})) {
      if (page.imageinfo?.[0]?.url) {
        urls.push(page.imageinfo[0].url);
      }
    }
  } catch (e) { /* ignore */ }
  return urls;
}

async function secondPass() {
  const models = db.prepare(`
    SELECT brand, model, COUNT(*) as cnt
    FROM cars
    WHERE is_brazilian = 1 AND image_url LIKE '%placehold%'
    GROUP BY brand, model
    ORDER BY cnt DESC
  `).all();

  console.log(`${models.length} models remaining for second pass\n`);

  let fixed = 0;
  let stillFail = 0;
  let totalPhotos = 0;

  for (let i = 0; i < models.length; i++) {
    const { brand, model, cnt } = models[i];
    process.stdout.write(`\r[${Math.round(i/models.length*100)}%] ${brand} ${model} (${cnt} cars)...  `);

    try {
      const files = await searchWikiImages(brand, model);
      if (files.length === 0) {
        stillFail++;
        continue;
      }

      const urls = await getImageUrls(files);
      if (urls.length === 0) {
        stillFail++;
        continue;
      }

      const updated = db.prepare(`
        UPDATE cars SET image_url = ?, photo_urls = ?
        WHERE is_brazilian = 1 AND brand = ? AND model = ?
      `).run(urls[0], JSON.stringify(urls), brand, model);

      fixed++;
      totalPhotos += urls.length;
      await sleep(300);
    } catch (e) {
      stillFail++;
      console.error(`\n  ❌ ${brand} ${model}: ${e.message}`);
    }
  }

  console.log(`\n\n✅ Second pass done! Fixed: ${fixed}, Still missing: ${stillFail}`);
  console.log(`   Total new photos: ${totalPhotos}`);

  const remaining = db.prepare("SELECT COUNT(*) as c FROM cars WHERE is_brazilian = 1 AND image_url LIKE '%placehold%'").get().c;
  console.log(`   Remaining placeholders: ${remaining}`);
  console.log(`   Brazilian cars with real photos: ${1420 - remaining}`);
}

secondPass().catch(e => { console.error(e); process.exit(1); });
