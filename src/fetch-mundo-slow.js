const db = require('./database');

const WIKI_API = 'https://commons.wikimedia.org/w/api.php';
const DELAY = 800; // 800ms between requests

const models = db.prepare(`
  SELECT DISTINCT brand, model, vehicle_type 
  FROM cars 
  WHERE source='mundo-seed' AND image_url LIKE '%placehold%'
  ORDER BY vehicle_type, brand, model
`).all();

console.log(`Found ${models.length} models remaining\n`);

function buildQueries(brand, model, vtype) {
  switch (vtype) {
    case 'motorcycle':
      return [`${brand}+${model}+motorcycle`, `${brand}+${model}+moto`, `${brand}+${model}+bike`];
    case 'truck':
      return [`${brand}+${model}+truck`, `${brand}+${model}+caminhao`, `${brand}+${model}`];
    case 'bus':
      return [`${brand}+${model}+bus`, `${brand}+${model}+onibus`, `${brand}+${model}`];
    case 'van':
      return [`${brand}+${model}+van`, `${brand}+${model}+furgao`];
    case 'tractor':
      return [`${brand}+${model}+tractor`, `${brand}+${model}+trator`, `${brand}+${model}`];
    case 'motorhome':
      return [`${brand}+${model}+motorhome`, `${brand}+${model}+rv`];
    case 'bicycle':
      return [`${brand}+${model}+bicycle`, `${brand}+${model}+bike`];
    default:
      return [`${brand}+${model}+car`, `${brand}+${model}+vehicle`, `${brand}+${model}`];
  }
}

async function search(brand, model, vtype) {
  const queries = buildQueries(brand, model, vtype);
  for (const q of queries) {
    try {
      const url = `${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=6&format=json&origin=*&srlimit=10`;
      const res = await fetch(url);
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data.query?.search) {
          const bad = ['svg','logo','drawing','diagram','sketch','blueprint','badge','emblem'];
          const files = data.query.search.map(s => s.title).filter(t => !bad.some(p => t.toLowerCase().includes(p)));
          if (files.length > 0) return files.slice(0, 3);
        }
      } catch (e) {}
    } catch (e) {}
  }
  return [];
}

async function getUrls(titles) {
  if (!titles.length) return [];
  const ts = titles.map(t => `File:${t.replace('File:', '')}`).join('|');
  try {
    const url = `${WIKI_API}?action=query&titles=${encodeURIComponent(ts)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const urls = [];
    for (const p of Object.values(data.query?.pages || {})) {
      if (p.imageinfo?.[0]?.url) urls.push(p.imageinfo[0].url);
    }
    return urls;
  } catch (e) { return []; }
}

async function main() {
  let ok = 0; let fail = 0;
  const upI = db.prepare('UPDATE cars SET image_url=? WHERE source=? AND brand=? AND model=? AND vehicle_type=?');
  const upP = db.prepare('UPDATE cars SET photo_urls=? WHERE source=? AND brand=? AND model=? AND vehicle_type=?');
  
  for (let i = 0; i < models.length; i++) {
    const { brand, model, vehicle_type: vt } = models[i];
    const pct = ((i+1)/models.length*100).toFixed(1);
    
    let files = [];
    for (let attempt = 0; attempt < 3 && files.length === 0; attempt++) {
      if (attempt > 0) {
        console.log(`  Retry ${attempt}...`);
        await new Promise(r => setTimeout(r, 2000));
      }
      files = await search(brand, model, vt);
    }
    
    if (files.length > 0) {
      const urls = await getUrls(files);
      await new Promise(r => setTimeout(r, 300));
      if (urls.length > 0) {
        upI.run(urls[0], 'mundo-seed', brand, model, vt);
        upP.run(JSON.stringify(urls), 'mundo-seed', brand, model, vt);
        ok++;
        console.log(`[${pct}%] OK ${brand} ${model} (${vt}) - ${urls.length} pics`);
      } else { fail++; console.log(`[${pct}%] NO_URL ${brand} ${model} (${vt})`); }
    } else { fail++; console.log(`[${pct}%] NOT_FOUND ${brand} ${model} (${vt})`); }
    
    await new Promise(r => setTimeout(r, DELAY));
  }
  
  const rem = db.prepare("SELECT COUNT(*) as c FROM cars WHERE source='mundo-seed' AND image_url LIKE '%placehold%'").get().c;
  console.log(`\nDONE: ${ok} ok, ${fail} failed | Placeholders left: ${rem}`);
}

main().catch(console.error);
