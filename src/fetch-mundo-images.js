const db = require('./database');

const WIKI_API = 'https://commons.wikimedia.org/w/api.php';

// Get all models with placeholder images, grouped by vehicle type
const models = db.prepare(`
  SELECT DISTINCT brand, model, vehicle_type 
  FROM cars 
  WHERE source='mundo-seed' AND image_url LIKE '%placehold%'
  ORDER BY vehicle_type, brand, model
`).all();

console.log(`Found ${models.length} models to fetch images for\n`);

// Build search queries based on vehicle type
function buildQueries(brand, model, vtype) {
  const base = `${brand} ${model}`;
  switch (vtype) {
    case 'motorcycle':
      return [
        `${brand}+${model}+motorcycle`,
        `${brand}+${model}+moto`,
        `${brand}+${model}+bike`,
        `${brand}+${model}`,
      ];
    case 'truck':
      return [
        `${brand}+${model}+truck`,
        `${brand}+${model}+caminhao`,
        `${brand}+${model}+lorry`,
        `${brand}+${model}`,
      ];
    case 'bus':
      return [
        `${brand}+${model}+bus`,
        `${brand}+${model}+onibus`,
        `${brand}+${model}+coach`,
        `${brand}+${model}`,
      ];
    case 'van':
      return [
        `${brand}+${model}+van`,
        `${brand}+${model}+furgao`,
        `${brand}+${model}+vehicle`,
        `${brand}+${model}`,
      ];
    case 'tractor':
      return [
        `${brand}+${model}+tractor`,
        `${brand}+${model}+trator`,
        `${brand}+${model}+agricultural`,
        `${brand}+${model}`,
      ];
    case 'motorhome':
      return [
        `${brand}+${model}+motorhome`,
        `${brand}+${model}+rv`,
        `${brand}+${model}+camper`,
        `${brand}+${model}`,
      ];
    case 'bicycle':
      return [
        `${brand}+${model}+bicycle`,
        `${brand}+${model}+bike`,
        `${brand}+${model}+bicicleta`,
        `${brand}+${model}`,
      ];
    default: // car
      return [
        `${brand}+${model}+car`,
        `${brand}+${model}+vehicle`,
        `${brand}+${model}+automobile`,
        `${brand}+${model}`,
      ];
  }
}

async function searchWikiImages(brand, model, vtype) {
  const queries = buildQueries(brand, model, vtype);
  
  for (const q of queries) {
    try {
      const url = `${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=6&format=json&origin=*&srlimit=10`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (!data.query || !data.query.search) continue;
      
      // Filter out SVGs, logos, drawings, diagrams, sketches
      const badPatterns = ['svg', 'logo', 'drawing', 'diagram', 'sketch', 'blueprint', 'badge', 'emblem', 'line art'];
      const files = data.query.search
        .map(s => s.title)
        .filter(t => !badPatterns.some(p => t.toLowerCase().includes(p)));
      
      if (files.length > 0) return files.slice(0, 5);
    } catch (e) {}
  }
  return [];
}

async function getImageUrls(fileTitles) {
  if (!fileTitles.length) return [];
  
  const titles = fileTitles.map(t => `File:${t.replace('File:', '')}`).join('|');
  try {
    const url = `${WIKI_API}?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    
    const urls = [];
    for (const page of Object.values(data.query?.pages || {})) {
      if (page.imageinfo?.[0]?.url) {
        urls.push(page.imageinfo[0].url);
      }
    }
    return urls;
  } catch (e) {
    return [];
  }
}

async function main() {
  let success = 0;
  let failed = 0;
  const updateImg = db.prepare('UPDATE cars SET image_url=? WHERE source=? AND brand=? AND model=? AND vehicle_type=?');
  const updatePhotos = db.prepare('UPDATE cars SET photo_urls=? WHERE source=? AND brand=? AND model=? AND vehicle_type=?');
  
  for (let i = 0; i < models.length; i++) {
    const { brand, model, vehicle_type: vtype } = models[i];
    const pct = ((i + 1) / models.length * 100).toFixed(1);
    
    const files = await searchWikiImages(brand, model, vtype);
    
    if (files.length > 0) {
      const urls = await getImageUrls(files);
      if (urls.length > 0) {
        const firstUrl = urls[0];
        const photoJson = JSON.stringify(urls);
        
        updateImg.run(firstUrl, 'mundo-seed', brand, model, vtype);
        updatePhotos.run(photoJson, 'mundo-seed', brand, model, vtype);
        
        success++;
        console.log(`[${pct}%] [OK] ${brand} ${model} (${vtype}) - ${urls.length} photos`);
      } else {
        failed++;
        console.log(`[${pct}%] [NO URL] ${brand} ${model} (${vtype}) - files found but no URLs`);
      }
    } else {
      failed++;
      console.log(`[${pct}%] [NOT FOUND] ${brand} ${model} (${vtype})`);
    }
    
    // Rate limit: 200ms between requests
    await new Promise(r => setTimeout(r, 200));
  }
  
  const remaining = db.prepare("SELECT COUNT(*) as c FROM cars WHERE source='mundo-seed' AND image_url LIKE '%placehold%'").get().c;
  
  console.log(`\n=== DONE ===`);
  console.log(`Success: ${success} | Failed: ${failed}`);
  console.log(`Remaining placeholders: ${remaining}`);
}

main().catch(console.error);
