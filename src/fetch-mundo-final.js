const db = require('./database');

const WIKI_API = 'https://commons.wikimedia.org/w/api.php';

const models = db.prepare(`
  SELECT DISTINCT brand, model, vehicle_type 
  FROM cars 
  WHERE source='mundo-seed' AND image_url LIKE '%placehold%'
  ORDER BY vehicle_type, brand, model
`).all();

console.log(`${new Date().toISOString()} | ${models.length} models to fetch\n`);

function buildQuery(brand, model, vtype) {
  const m = model.replace(/\s+/g, '+');
  const b = brand.replace(/\s+/g, '+');
  switch (vtype) {
    case 'motorcycle': return `${b}+${m}+motorcycle`;
    case 'truck': return `${b}+${m}+truck`;
    case 'bus': return `${b}+${m}+bus`;
    case 'van': return `${b}+${m}+van`;
    case 'tractor': return `${b}+${m}+tractor`;
    case 'motorhome': return `${b}+${m}+motorhome`;
    case 'bicycle': return `${b}+${m}+bicycle`;
    default: return `${b}+${m}+vehicle`;
  }
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(url);
      const t = await r.text();
      if (t.includes('making too many requests')) {
        console.log('  Rate limited, waiting 30s...');
        await new Promise(r => setTimeout(r, 30000));
        continue;
      }
      return JSON.parse(t);
    } catch (e) {
      if (i < retries - 1) await new Promise(r => setTimeout(r, 5000));
    }
  }
  return null;
}

async function main() {
  let ok = 0, fail = 0;
  const upI = db.prepare('UPDATE cars SET image_url=? WHERE source=? AND brand=? AND model=? AND vehicle_type=?');
  const upP = db.prepare('UPDATE cars SET photo_urls=? WHERE source=? AND brand=? AND model=? AND vehicle_type=?');
  
  for (let i = 0; i < models.length; i++) {
    const { brand, model, vehicle_type: vt } = models[i];
    const pct = ((i+1)/models.length*100).toFixed(1);
    console.log(`[${pct}%] ${brand} ${model} (${vt})`);
    
    // Search
    const q = buildQuery(brand, model, vt);
    const data = await fetchWithRetry(
      `${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=6&format=json&origin=*&srlimit=8`
    );
    
    if (!data?.query?.search?.length) {
      fail++;
      console.log(`  No results`);
      await new Promise(r => setTimeout(r, 4000));
      continue;
    }
    
    // Filter
    const bad = ['svg','logo','drawing','diagram','sketch','blueprint','badge','emblem'];
    const files = data.query.search.map(s => s.title).filter(t => !bad.some(p => t.toLowerCase().includes(p)));
    
    if (!files.length) {
      fail++;
      console.log(`  All SVGs/drawings`);
      await new Promise(r => setTimeout(r, 4000));
      continue;
    }
    
    // Get image URLs
    const ts = files.slice(0, 3).map(t => `File:${t.replace('File:', '')}`).join('|');
    await new Promise(r => setTimeout(r, 1500));
    const imgData = await fetchWithRetry(
      `${WIKI_API}?action=query&titles=${encodeURIComponent(ts)}&prop=imageinfo&iiprop=url&format=json&origin=*`
    );
    
    const urls = [];
    if (imgData?.query?.pages) {
      for (const p of Object.values(imgData.query.pages)) {
        if (p.imageinfo?.[0]?.url) urls.push(p.imageinfo[0].url);
      }
    }
    
    if (urls.length > 0) {
      upI.run(urls[0], 'mundo-seed', brand, model, vt);
      upP.run(JSON.stringify(urls), 'mundo-seed', brand, model, vt);
      ok++;
      console.log(`  Got ${urls.length} photos`);
    } else {
      fail++;
      console.log(`  No photo URLs`);
    }
    
    // 5 second delay between models
    await new Promise(r => setTimeout(r, 4000));
  }
  
  const rem = db.prepare("SELECT COUNT(*) as c FROM cars WHERE source='mundo-seed' AND image_url LIKE '%placehold%'").get().c;
  console.log(`\nDONE: ${ok} ok, ${fail} failed | Placeholders left: ${rem}`);
}

main().catch(console.error);
