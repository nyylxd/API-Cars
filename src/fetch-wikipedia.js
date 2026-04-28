const db = require('./database');

const WIKI_REST = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

const models = db.prepare(`
  SELECT DISTINCT brand, model, vehicle_type 
  FROM cars 
  WHERE source='mundo-seed' AND image_url LIKE '%placehold%'
  ORDER BY vehicle_type, brand, model
`).all();

console.log(`${models.length} models to fetch\n`);

function getWikipediaTitle(brand, model) {
  // Common Wikipedia article naming patterns
  return `${brand.replace(/ /g, '_')}_${model.replace(/ /g, '_')}`;
}

const FALLBACKS = {
  motorcycle: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=500&fit=crop',
  truck: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=500&fit=crop',
  bus: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=500&fit=crop',
  van: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&h=500&fit=crop',
  bicycle: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&h=500&fit=crop',
  tractor: 'https://images.unsplash.com/photo-1594643781026-abcb4bf27e4d?w=800&h=500&fit=crop',
  motorhome: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&h=500&fit=crop',
  car: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=500&fit=crop',
};

async function main() {
  let wiki = 0, unsplash = 0, fail = 0;
  const upI = db.prepare('UPDATE cars SET image_url=? WHERE source=? AND brand=? AND model=? AND vehicle_type=?');
  const upP = db.prepare('UPDATE cars SET photo_urls=? WHERE source=? AND brand=? AND model=? AND vehicle_type=?');
  
  for (let i = 0; i < models.length; i++) {
    const { brand, model, vehicle_type: vt } = models[i];
    const pct = ((i+1)/models.length*100).toFixed(0);
    let imgUrl = null;
    
    // Try Wikipedia REST API
    const title = getWikipediaTitle(brand, model);
    try {
      const r = await fetch(WIKI_REST + encodeURIComponent(title));
      if (r.ok) {
        const j = await r.json();
        if (j.thumbnail?.source) {
          imgUrl = j.thumbnail.source;
          wiki++;
          console.log(`[${pct}%] WIKI ${brand} ${model} (${vt})`);
        }
      }
    } catch (e) {}
    
    // Fallback to Unsplash
    if (!imgUrl) {
      imgUrl = FALLBACKS[vt] || FALLBACKS.car;
      unsplash++;
      console.log(`[${pct}%] UNSPLASH ${brand} ${model} (${vt})`);
    }
    
    if (imgUrl) {
      upI.run(imgUrl, 'mundo-seed', brand, model, vt);
      upP.run(JSON.stringify([imgUrl]), 'mundo-seed', brand, model, vt);
    } else {
      fail++;
    }
    
    // 500ms delay
    await new Promise(r => setTimeout(r, 500));
  }
  
  const rem = db.prepare("SELECT COUNT(*) as c FROM cars WHERE image_url LIKE '%placehold%'").get().c;
  console.log(`\nDONE: ${wiki} Wikipedia, ${unsplash} Unsplash | Placeholders: ${rem}`);
}

main().catch(console.error);
