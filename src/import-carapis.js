const db = require('./database');

const API_KEY = 'car_LYjiQjb1TsK4EGnGBNUVZqWyO_sOSLaC0MtNSt73Oqs';
const BASE_URL = 'https://api.carapis.com/apix/catalog_private/vehicles';
const PAGE_SIZE = 500;
const DELAY_MS = 300; // Polite delay between requests

// Clear old seed data (keep carapis imports if re-running)
db.exec("DELETE FROM cars WHERE carapis_id IS NULL OR carapis_id = ''");
console.log('🧹 Cleared old seed data, keeping any existing carapis imports.');

// Map fuel types to our normalized format
function normalizeFuel(fuel) {
  const map = {
    'diesel': 'Diesel',
    'petrol': 'Gasoline',
    'gasoline': 'Gasoline',
    'gas': 'Gasoline',
    'electric': 'Electric',
    'hybrid': 'Hybrid',
    'plug_in_hybrid': 'Hybrid',
    'lpg': 'Gasoline',
    'cng': 'Gasoline',
    'hydrogen': 'Hydrogen',
    'ethanol': 'Flex',
    'flex': 'Flex',
  };
  return map[fuel?.toLowerCase()] || fuel || 'Gasoline';
}

// Map body types
function normalizeBodyType(body) {
  const map = {
    'suv': 'SUV',
    'crossover': 'SUV',
    'sedan': 'Sedan',
    'hatchback': 'Hatchback',
    'coupe': 'Coupe',
    'convertible': 'Convertible',
    'cabriolet': 'Convertible',
    'wagon': 'Wagon',
    'estate': 'Wagon',
    'pickup': 'Pickup',
    'truck': 'Pickup',
    'minivan': 'Minivan',
    'mpv': 'Minivan',
    'van': 'Van',
    'compact': 'Hatchback',
    'roadster': 'Convertible',
    'sport': 'Coupe',
  };
  return map[body?.toLowerCase()] || body || 'Sedan';
}

// Map transmissions
function normalizeTransmission(trans) {
  const map = {
    'auto': 'Automatic',
    'automatic': 'Automatic',
    'manual': 'Manual',
    'cvt': 'CVT',
    'dct': 'DCT',
    'semi_automatic': 'Semi-Automatic',
  };
  return map[trans?.toLowerCase()] || trans || 'Automatic';
}

// Format engine CC to string like "2.2L"
function formatEngine(cc) {
  if (!cc) return null;
  return `${(cc / 1000).toFixed(1)}L`;
}

const insertCar = db.prepare(`
  INSERT OR REPLACE INTO cars (
    brand, model, year, fuel_type, engine, transmission, category,
    engine_cc, color, mileage_km, price_usd, image_url, photo_urls,
    source, is_new, carapis_id
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

async function fetchPage(page) {
  const url = `${BASE_URL}?page_size=${PAGE_SIZE}&page=${page}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on page ${page}`);
  return res.json();
}

async function importAll() {
  console.log('📡 Fetching first page to get total count...');
  const firstPage = await fetchPage(1);
  const total = firstPage.count;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  console.log(`🚗 Total vehicles: ${total.toLocaleString()}`);
  console.log(`📄 Total pages: ${totalPages} (${PAGE_SIZE} per page)`);
  console.log(`⏱️  Estimated time: ~${Math.ceil(totalPages * DELAY_MS / 1000 / 60)} min\n`);

  let inserted = 0;
  let processed = 0;

  // Insert first page
  const insertPage = (data) => {
    const stmt = db.prepare(`INSERT OR REPLACE INTO cars (
      brand, model, year, fuel_type, engine, transmission, category,
      engine_cc, color, mileage_km, price_usd, image_url, photo_urls,
      source, is_new, carapis_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    const insertMany = db.transaction((vehicles) => {
      for (const v of vehicles) {
        const brandName = v.brand?.name || 'Unknown';
        const modelName = v.model?.name || 'Unknown';
        const fuelType = normalizeFuel(v.fuel_type);
        const bodyType = normalizeBodyType(v.body_type || v.model?.body_type);
        const transmission = normalizeTransmission(v.transmission);
        const engine = formatEngine(v.engine_cc);
        const photoUrls = v.preview_photos?.map(p => p.url) || [];
        const mainPhoto = v.main_photo_url || (photoUrls.length > 0 ? photoUrls[0] : null);

        stmt.run(
          brandName,
          modelName,
          v.year || 0,
          fuelType,
          engine,
          transmission,
          bodyType,
          v.engine_cc || null,
          v.color || null,
          v.mileage || null,
          v.price_usd ? parseFloat(v.price_usd) : null,
          mainPhoto,
          JSON.stringify(photoUrls),
          v.source?.code || 'carapis',
          v.is_new_vehicle ? 1 : 0,
          v.id
        );
      }
    });

    insertMany(data);
    return data.length;
  };

  // Process first page
  const batchSize = insertPage(firstPage.results);
  inserted += batchSize;
  processed += firstPage.results.length;

  const pct = ((processed / total) * 100).toFixed(1);
  process.stdout.write(`\r📥 Page 1/${totalPages} | ${inserted.toLocaleString()} inserted | ${pct}%`);

  // Process remaining pages
  for (let page = 2; page <= totalPages; page++) {
    await new Promise(r => setTimeout(r, DELAY_MS));

    try {
      const data = await fetchPage(page);
      if (!data.results || data.results.length === 0) break;

      const count = insertPage(data.results);
      inserted += count;
      processed += data.results.length;

      const pct = ((processed / total) * 100).toFixed(1);
      process.stdout.write(`\r📥 Page ${page}/${totalPages} | ${inserted.toLocaleString()} inserted | ${pct}%`);
    } catch (err) {
      console.error(`\n❌ Error on page ${page}: ${err.message}`);
      // Continue despite errors
    }

    // Progress update every 10 pages
    if (page % 10 === 0) {
      const elapsed = Math.round(process.uptime());
      process.stdout.write(` | ${elapsed}s elapsed`);
    }
  }

  console.log('\n');
  console.log('═'.repeat(50));
  console.log(`✅ IMPORT COMPLETE!`);
  console.log(`   Vehicles fetched: ${processed.toLocaleString()}`);
  console.log(`   Vehicles inserted: ${inserted.toLocaleString()}`);

  // Stats
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      COUNT(DISTINCT brand) as brands,
      COUNT(DISTINCT model) as models,
      MIN(year) as min_year,
      MAX(year) as max_year
    FROM cars
  `).get();

  console.log(`   Brands: ${stats.brands}`);
  console.log(`   Models: ${stats.models}`);
  console.log(`   Year range: ${stats.min_year} - ${stats.max_year}`);

  const fuelStats = db.prepare(`
    SELECT fuel_type, COUNT(*) as cnt FROM cars
    GROUP BY fuel_type ORDER BY cnt DESC
  `).all();
  console.log(`   Fuel types: ${fuelStats.map(f => `${f.fuel_type}(${f.cnt})`).join(', ')}`);

  console.log('═'.repeat(50));
}

importAll().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
