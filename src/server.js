const express = require('express');
const cors = require('cors');
const db = require('./database');
const { setupSwagger } = require('./swagger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
setupSwagger(app);

// Carapis.com config
const CARAPIS_KEY = 'xxxxxxxxxxxxxxxxxxxxxxxxxxx';
const CARAPIS_BASE = 'https://api.carapis.com/apix/catalog_private/vehicles';

// ==================== ROOT ====================

app.get('/', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as total FROM cars').get();
  const brands = db.prepare('SELECT COUNT(DISTINCT brand) as total FROM cars').get();
  const years = db.prepare('SELECT MIN(year) as min, MAX(year) as max FROM cars').get();
  const brTotal = db.prepare('SELECT COUNT(*) as total FROM cars WHERE is_brazilian = 1').get();
  const mundoTotal = db.prepare("SELECT COUNT(*) as total FROM cars WHERE source='mundo-seed'").get();
  const fuelTypes = db.prepare('SELECT DISTINCT fuel_type FROM cars ORDER BY fuel_type').all().map(r => r.fuel_type);
  const sources = db.prepare('SELECT DISTINCT source FROM cars WHERE source IS NOT NULL ORDER BY source').all().map(r => r.source);
  const vTypes = db.prepare('SELECT vehicle_type, COUNT(*) as c FROM cars GROUP BY vehicle_type ORDER BY c DESC').all();

  res.json({
    name: 'API-Cars', version: '4.0.0',
    description: '34,000+ vehicles — 9 vehicle types, global + Americas focus, real photos',
    total_vehicles: count.total, total_brands: brands.total,
    brazilian_cars: brTotal.total, mundo_vehicles: mundoTotal.total,
    year_range: `${years.min} - ${years.max}`,
    vehicle_types: vTypes,
    fuel_types: fuelTypes, sources,
    endpoints: {
      cars: '/cars', car_by_id: '/cars/:id', brands: '/brands',
      models: '/models', years: '/years', fuel_types: '/fuel-types',
      categories: '/categories', vehicle_types: '/vehicle-types',
      sources: '/sources', stats: '/stats',
      brasil_cars: '/brasil/cars', brasil_brands: '/brasil/brands',
      brasil_stats: '/brasil/stats',
      mundo: '/mundo',
      carapis_detail: '/carapis/detail/:uuid',
      carapis_enrich: '/carapis/enrich/:id',
      carapis_search: '/carapis/search',
      docs: '/api-docs',
    }
  });
});

// ==================== CARS ====================

app.get('/cars', (req, res) => {
  const {
    brand, model, year, year_min, year_max, fuel_type, category,
    transmission, color, source, min_price, max_price,
    price_brl_min, price_brl_max,
    min_mileage, max_mileage, is_new, is_brazilian, flex_fuel,
    has_accident, has_recall, inspection_passed, is_undervalued, search,
    page = 1, limit = 20, sort = 'id', order = 'asc'
  } = req.query;

  const conditions = []; const params = [];

  if (brand) { conditions.push('brand LIKE ?'); params.push(`%${brand}%`); }
  if (model) { conditions.push('model LIKE ?'); params.push(`%${model}%`); }
  if (year) { conditions.push('year = ?'); params.push(parseInt(year)); }
  if (year_min) { conditions.push('year >= ?'); params.push(parseInt(year_min)); }
  if (year_max) { conditions.push('year <= ?'); params.push(parseInt(year_max)); }
  if (fuel_type) { conditions.push('fuel_type = ?'); params.push(fuel_type); }
  if (category) { conditions.push('category = ?'); params.push(category); }
  if (transmission) { conditions.push('transmission LIKE ?'); params.push(`%${transmission}%`); }
  if (color) { conditions.push('color LIKE ?'); params.push(`%${color}%`); }
  if (source) { conditions.push('source = ?'); params.push(source); }
  if (min_price) { conditions.push('price_usd >= ?'); params.push(parseFloat(min_price)); }
  if (max_price) { conditions.push('price_usd <= ?'); params.push(parseFloat(max_price)); }
  if (price_brl_min) { conditions.push('price_brl >= ?'); params.push(parseFloat(price_brl_min)); }
  if (price_brl_max) { conditions.push('price_brl <= ?'); params.push(parseFloat(price_brl_max)); }
  if (min_mileage) { conditions.push('mileage_km >= ?'); params.push(parseInt(min_mileage)); }
  if (max_mileage) { conditions.push('mileage_km <= ?'); params.push(parseInt(max_mileage)); }
  if (is_new !== undefined) { conditions.push('is_new = ?'); params.push(is_new === 'true' ? 1 : 0); }
  if (is_brazilian !== undefined) { conditions.push('is_brazilian = ?'); params.push(is_brazilian === 'true' ? 1 : 0); }
  if (flex_fuel !== undefined) { conditions.push('flex_fuel = ?'); params.push(flex_fuel === 'true' ? 1 : 0); }
  if (has_accident !== undefined) { conditions.push('has_accident = ?'); params.push(has_accident === 'true' ? 1 : 0); }
  if (has_recall !== undefined) { conditions.push('has_recall = ?'); params.push(has_recall === 'true' ? 1 : 0); }
  if (inspection_passed !== undefined) { conditions.push('inspection_passed = ?'); params.push(inspection_passed === 'true' ? 1 : 0); }
  if (is_undervalued !== undefined) { conditions.push('is_undervalued = ?'); params.push(is_undervalued === 'true' ? 1 : 0); }
  if (req.query.vehicle_type) { conditions.push('vehicle_type = ?'); params.push(req.query.vehicle_type); }
  if (search) { conditions.push('(brand LIKE ? OR model LIKE ? OR description LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSort = ['id','brand','model','year','fuel_type','power_hp','category','price_usd','price_brl','mileage_km','engine_cc','owner_count','first_seen_at','vehicle_type']; 
  const sortField = allowedSort.includes(sort) ? sort : 'id';
  const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  const { total } = db.prepare(`SELECT COUNT(*) as total FROM cars ${whereClause}`).get(...params);
  const cars = db.prepare(`SELECT * FROM cars ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`).all(...params, limitNum, offset);

  for (const car of cars) {
    if (car.photo_urls) { try { car.photos = JSON.parse(car.photo_urls); } catch (e) { car.photos = []; } }
  }

  res.json({ success: true, total, page: pageNum, limit: limitNum, total_pages: Math.ceil(total / limitNum), data: cars });
});

app.get('/cars/:id', (req, res) => {
  const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
  if (!car) return res.status(404).json({ success: false, error: 'Carro não encontrado / Car not found' });
  if (car.photo_urls) { try { car.photos = JSON.parse(car.photo_urls); } catch (e) { car.photos = []; } }
  if (car.photos_json) { try { car.photos_full = JSON.parse(car.photos_json); } catch (e) {} }
  if (car.description) { car.description_text = car.description; }
  res.json({ success: true, data: car });
});

// ==================== BRANDS ====================

app.get('/brands', (req, res) => {
  const brands = db.prepare(`
    SELECT brand, COUNT(*) as total_cars, COUNT(DISTINCT model) as total_models,
           MIN(year) as oldest_year, MAX(year) as newest_year,
           GROUP_CONCAT(DISTINCT fuel_type) as fuel_types,
           GROUP_CONCAT(DISTINCT source) as sources,
           ROUND(AVG(price_usd), 2) as avg_price_usd,
           ROUND(AVG(price_brl), 2) as avg_price_brl,
           COUNT(DISTINCT color) as available_colors,
           MAX(logo_url) as logo_url, MAX(country_of_origin) as country_of_origin,
           SUM(CASE WHEN is_brazilian = 1 THEN 1 ELSE 0 END) as brazilian_models
    FROM cars GROUP BY brand ORDER BY brand
  `).all();
  res.json({ success: true, total: brands.length, data: brands });
});

app.get('/brands/:name', (req, res) => {
  const bn = req.params.name;
  const info = db.prepare(`
    SELECT brand, COUNT(*) as total_cars, COUNT(DISTINCT model) as total_models,
           MIN(year) as oldest_year, MAX(year) as newest_year,
           GROUP_CONCAT(DISTINCT fuel_type) as fuel_types,
           GROUP_CONCAT(DISTINCT category) as categories,
           ROUND(MIN(price_usd),2) as min_price_usd, ROUND(MAX(price_usd),2) as max_price_usd,
           ROUND(MIN(price_brl),2) as min_price_brl, ROUND(MAX(price_brl),2) as max_price_brl,
           MAX(logo_url) as logo_url, MAX(country_of_origin) as country_of_origin,
           SUM(CASE WHEN is_brazilian = 1 THEN 1 ELSE 0 END) as brazilian_models
    FROM cars WHERE brand LIKE ?
  `).get(`%${bn}%`);
  if (!info || !info.total_cars) return res.status(404).json({ success: false, error: 'Marca não encontrada / Brand not found' });

  const models = db.prepare(`
    SELECT model, COUNT(*) as variants, MIN(year) as from_year, MAX(year) as to_year,
           GROUP_CONCAT(DISTINCT fuel_type) as fuels, category, engine, power_hp, image_url,
           ROUND(AVG(price_usd),2) as avg_price_usd,
           ROUND(AVG(price_brl),2) as avg_price_brl,
           MAX(generation) as generation,
           SUM(CASE WHEN is_brazilian = 1 THEN 1 ELSE 0 END) as br_variants
    FROM cars WHERE brand LIKE ? GROUP BY model ORDER BY model
  `).all(`%${bn}%`);

  res.json({ success: true, data: { ...info, models } });
});

// ==================== MODELS ====================

app.get('/models', (req, res) => {
  let q = `SELECT brand, model, COUNT(*) as total, MIN(year) as from_year, MAX(year) as to_year,
           category, GROUP_CONCAT(DISTINCT fuel_type) as fuels,
           ROUND(AVG(price_usd),2) as avg_price_usd,
           ROUND(AVG(price_brl),2) as avg_price_brl,
           MAX(generation) as generation,
           SUM(CASE WHEN is_brazilian = 1 THEN 1 ELSE 0 END) as br_variants FROM cars`;
  const p = [];
  if (req.query.brand) { q += ' WHERE brand LIKE ?'; p.push(`%${req.query.brand}%`); }
  q += ' GROUP BY brand, model ORDER BY brand, model';
  res.json({
    success: true,
    total: db.prepare(`SELECT COUNT(DISTINCT brand||model) as c FROM cars`).get().c,
    data: db.prepare(q).all(...p)
  });
});

// ==================== YEARS ====================

app.get('/years', (req, res) => {
  res.json({ success: true, data: db.prepare(`
    SELECT year, COUNT(*) as total_cars, COUNT(DISTINCT brand) as brands,
           COUNT(DISTINCT model) as models,
           ROUND(AVG(price_usd),2) as avg_price_usd,
           ROUND(AVG(price_brl),2) as avg_price_brl,
           SUM(CASE WHEN is_brazilian = 1 THEN 1 ELSE 0 END) as brazilian_cars
    FROM cars GROUP BY year ORDER BY year DESC
  `).all() });
});

app.get('/years/:year', (req, res) => {
  const y = parseInt(req.params.year);
  const pg = Math.max(1, parseInt(req.query.page) || 1);
  const lm = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
  const off = (pg-1)*lm;
  const { total } = db.prepare('SELECT COUNT(*) as total FROM cars WHERE year = ?').get(y);
  const cars = db.prepare('SELECT * FROM cars WHERE year = ? ORDER BY brand, model LIMIT ? OFFSET ?').all(y, lm, off);
  const stats = db.prepare(`
    SELECT COUNT(DISTINCT brand) as brands, COUNT(DISTINCT model) as models,
           GROUP_CONCAT(DISTINCT fuel_type) as fuels, GROUP_CONCAT(DISTINCT category) as categories,
           ROUND(AVG(price_usd),2) as avg_price_usd,
           ROUND(AVG(price_brl),2) as avg_price_brl,
           SUM(CASE WHEN is_brazilian = 1 THEN 1 ELSE 0 END) as brazilian_cars
    FROM cars WHERE year = ?
  `).get(y);
  res.json({ success: true, year: y, total, page: pg, limit: lm, total_pages: Math.ceil(total/lm), stats, data: cars });
});

// ==================== FUEL TYPES & CATEGORIES ====================

app.get('/fuel-types', (req, res) => {
  res.json({ success: true, data: db.prepare(`
    SELECT fuel_type, COUNT(*) as total_cars, COUNT(DISTINCT brand) as brands,
           SUM(CASE WHEN is_brazilian = 1 THEN 1 ELSE 0 END) as brazilian_cars
    FROM cars GROUP BY fuel_type ORDER BY total_cars DESC
  `).all() });
});

app.get('/categories', (req, res) => {
  res.json({ success: true, data: db.prepare(`
    SELECT category, COUNT(*) as total_cars, COUNT(DISTINCT brand) as brands,
           COUNT(DISTINCT model) as models,
           GROUP_CONCAT(DISTINCT fuel_type) as fuel_types,
           SUM(CASE WHEN is_brazilian = 1 THEN 1 ELSE 0 END) as brazilian_cars
    FROM cars GROUP BY category ORDER BY total_cars DESC
  `).all() });
});

// ==================== VEHICLE TYPES ====================

app.get('/vehicle-types', (req, res) => {
  res.json({ success: true, data: db.prepare(`
    SELECT vehicle_type, COUNT(*) as total_vehicles, COUNT(DISTINCT brand) as brands,
           COUNT(DISTINCT model) as models, MIN(year) as oldest, MAX(year) as newest,
           GROUP_CONCAT(DISTINCT category) as categories,
           GROUP_CONCAT(DISTINCT fuel_type) as fuel_types
    FROM cars GROUP BY vehicle_type ORDER BY total_vehicles DESC
  `).all() });
});

// ==================== MUNDO (World) ====================

app.get('/mundo', (req, res) => {
  req.query.source = 'mundo-seed';
  // Forward to /cars logic inline
  const {
    brand, model, year, year_min, year_max, fuel_type, category,
    transmission, color, vehicle_type,
    page = 1, limit = 20, sort = 'id', order = 'asc'
  } = req.query;

  const conditions = ["source='mundo-seed'"]; const params = [];

  if (brand) { conditions.push('brand LIKE ?'); params.push(`%${brand}%`); }
  if (model) { conditions.push('model LIKE ?'); params.push(`%${model}%`); }
  if (year) { conditions.push('year = ?'); params.push(parseInt(year)); }
  if (year_min) { conditions.push('year >= ?'); params.push(parseInt(year_min)); }
  if (year_max) { conditions.push('year <= ?'); params.push(parseInt(year_max)); }
  if (fuel_type) { conditions.push('fuel_type = ?'); params.push(fuel_type); }
  if (category) { conditions.push('category = ?'); params.push(category); }
  if (transmission) { conditions.push('transmission LIKE ?'); params.push(`%${transmission}%`); }
  if (color) { conditions.push('color LIKE ?'); params.push(`%${color}%`); }
  if (vehicle_type) { conditions.push('vehicle_type = ?'); params.push(vehicle_type); }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (pageNum - 1) * limitNum;
  const sortField = ['id','brand','model','year','fuel_type','power_hp','vehicle_type'].includes(sort) ? sort : 'id';
  const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const { total } = db.prepare(`SELECT COUNT(*) as total FROM cars ${whereClause}`).get(...params);
  const cars = db.prepare(`SELECT * FROM cars ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`).all(...params, limitNum, offset);

  for (const car of cars) {
    if (car.photo_urls) { try { car.photos = JSON.parse(car.photo_urls); } catch (e) { car.photos = []; } }
  }

  res.json({ success: true, total, page: pageNum, limit: limitNum, total_pages: Math.ceil(total / limitNum), data: cars });
});

// ==================== SOURCES ====================

app.get('/sources', (req, res) => {
  res.json({ success: true, data: db.prepare(`
    SELECT source, COUNT(*) as total_cars, COUNT(DISTINCT brand) as brands,
           MIN(year) as oldest_year, MAX(year) as newest_year,
           source_country, source_currency
    FROM cars WHERE source IS NOT NULL
    GROUP BY source ORDER BY total_cars DESC
  `).all() });
});

// ==================== STATS ====================

app.get('/stats', (req, res) => {
  const pUsd = db.prepare('SELECT MIN(price_usd) as min, MAX(price_usd) as max, ROUND(AVG(price_usd),2) as avg FROM cars WHERE price_usd IS NOT NULL').get();
  const pBrl = db.prepare('SELECT MIN(price_brl) as min, MAX(price_brl) as max, ROUND(AVG(price_brl),2) as avg FROM cars WHERE price_brl IS NOT NULL').get();
  const m = db.prepare('SELECT MIN(mileage_km) as min, MAX(mileage_km) as max, ROUND(AVG(mileage_km),0) as avg FROM cars WHERE mileage_km IS NOT NULL').get();

  res.json({ success: true, data: {
    total_cars: db.prepare('SELECT COUNT(*) as v FROM cars').get().v,
    total_brands: db.prepare('SELECT COUNT(DISTINCT brand) as v FROM cars').get().v,
    total_models: db.prepare('SELECT COUNT(DISTINCT model) as v FROM cars').get().v,
    with_photos: db.prepare('SELECT COUNT(*) as v FROM cars WHERE image_url IS NOT NULL').get().v,
    with_details: db.prepare('SELECT COUNT(*) as v FROM cars WHERE description IS NOT NULL').get().v,
    new: db.prepare('SELECT COUNT(*) as v FROM cars WHERE is_new=1').get().v,
    used: db.prepare('SELECT COUNT(*) as v FROM cars WHERE is_new=0').get().v,
    with_accident: db.prepare('SELECT COUNT(*) as v FROM cars WHERE has_accident=1').get().v,
    with_recall: db.prepare('SELECT COUNT(*) as v FROM cars WHERE has_recall=1').get().v,
    undervalued: db.prepare('SELECT COUNT(*) as v FROM cars WHERE is_undervalued=1').get().v,
    // Brazilian stats
    brazilian_cars: db.prepare('SELECT COUNT(*) as v FROM cars WHERE is_brazilian=1').get().v,
    brazilian_brands: db.prepare('SELECT COUNT(DISTINCT brand) as v FROM cars WHERE is_brazilian=1').get().v,
    flex_fuel_cars: db.prepare('SELECT COUNT(*) as v FROM cars WHERE flex_fuel=1').get().v,
    brazilian_avg_price_brl: db.prepare("SELECT ROUND(AVG(price_brl),2) as v FROM cars WHERE is_brazilian=1 AND price_brl IS NOT NULL").get().v,
    // Ranges
    year_range: db.prepare('SELECT MIN(year) as min_year, MAX(year) as max_year FROM cars').get(),
    price_stats_usd: pUsd, price_stats_brl: pBrl, mileage_stats: m,
    fuel_types: db.prepare('SELECT fuel_type, COUNT(*) as count, SUM(CASE WHEN is_brazilian = 1 THEN 1 ELSE 0 END) as br_count FROM cars GROUP BY fuel_type ORDER BY count DESC').all(),
    categories: db.prepare('SELECT category, COUNT(*) as count FROM cars GROUP BY category ORDER BY count DESC').all(),
    vehicle_types: db.prepare('SELECT vehicle_type, COUNT(*) as count FROM cars GROUP BY vehicle_type ORDER BY count DESC').all(),
    top_brands: db.prepare('SELECT brand, COUNT(*) as count, SUM(CASE WHEN is_brazilian = 1 THEN 1 ELSE 0 END) as br_count FROM cars GROUP BY brand ORDER BY count DESC LIMIT 15').all(),
    top_colors: db.prepare("SELECT color, COUNT(*) as count FROM cars WHERE color IS NOT NULL AND color != 'unknown' GROUP BY color ORDER BY count DESC LIMIT 10").all(),
    sources: db.prepare('SELECT source, COUNT(*) as count FROM cars WHERE source IS NOT NULL GROUP BY source ORDER BY count DESC').all(),
  }});
});

// ==================== BRASIL ====================

app.get('/brasil/stats', (req, res) => {
  const brCount = db.prepare('SELECT COUNT(*) as v FROM cars WHERE is_brazilian = 1').get().v;
  const brBrands = db.prepare('SELECT COUNT(DISTINCT brand) as v FROM cars WHERE is_brazilian = 1').get().v;
  const brModels = db.prepare('SELECT COUNT(DISTINCT model) as v FROM cars WHERE is_brazilian = 1').get().v;
  const brFlex = db.prepare('SELECT COUNT(*) as v FROM cars WHERE is_brazilian = 1 AND flex_fuel = 1').get().v;
  const brPrice = db.prepare('SELECT MIN(price_brl) as min, MAX(price_brl) as max, ROUND(AVG(price_brl),2) as avg FROM cars WHERE is_brazilian = 1 AND price_brl IS NOT NULL').get();

  res.json({ success: true, data: {
    total_cars: brCount, total_brands: brBrands, total_models: brModels,
    flex_fuel_cars: brFlex, flex_fuel_pct: Math.round(brFlex / brCount * 100),
    price_range_brl: brPrice,
    top_brands: db.prepare('SELECT brand, COUNT(*) as count FROM cars WHERE is_brazilian = 1 GROUP BY brand ORDER BY count DESC LIMIT 10').all(),
    top_models: db.prepare('SELECT brand, model, COUNT(*) as count, MAX(generation) as generation FROM cars WHERE is_brazilian = 1 GROUP BY brand, model ORDER BY count DESC LIMIT 15').all(),
    by_fuel: db.prepare("SELECT fuel_type, COUNT(*) as count FROM cars WHERE is_brazilian = 1 GROUP BY fuel_type ORDER BY count DESC").all(),
    by_category: db.prepare("SELECT category, COUNT(*) as count FROM cars WHERE is_brazilian = 1 GROUP BY category ORDER BY count DESC").all(),
    by_year: db.prepare("SELECT year, COUNT(*) as count FROM cars WHERE is_brazilian = 1 GROUP BY year ORDER BY year DESC LIMIT 10").all(),
    by_transmission: db.prepare("SELECT transmission, COUNT(*) as count FROM cars WHERE is_brazilian = 1 GROUP BY transmission ORDER BY count DESC").all(),
  }});
});

app.get('/brasil/brands', (req, res) => {
  const brands = db.prepare(`
    SELECT brand, COUNT(*) as total_cars, COUNT(DISTINCT model) as total_models,
           MIN(year) as oldest_year, MAX(year) as newest_year,
           GROUP_CONCAT(DISTINCT fuel_type) as fuel_types,
           ROUND(MIN(price_brl),2) as min_price_brl, ROUND(MAX(price_brl),2) as max_price_brl,
           ROUND(AVG(price_brl),2) as avg_price_brl,
           SUM(CASE WHEN flex_fuel = 1 THEN 1 ELSE 0 END) as flex_fuel_models,
           GROUP_CONCAT(DISTINCT category) as categories
    FROM cars WHERE is_brazilian = 1
    GROUP BY brand ORDER BY brand
  `).all();
  res.json({ success: true, total: brands.length, data: brands });
});

app.get('/brasil/cars', (req, res) => {
  req.query.is_brazilian = 'true';
  // Forward to the main /cars handler
  const {
    brand, model, year, year_min, year_max, fuel_type, category,
    transmission, color, price_brl_min, price_brl_max,
    flex_fuel, search,
    page = 1, limit = 20, sort = 'id', order = 'asc'
  } = req.query;

  const conditions = ['is_brazilian = 1']; const params = [];

  if (brand) { conditions.push('brand LIKE ?'); params.push(`%${brand}%`); }
  if (model) { conditions.push('model LIKE ?'); params.push(`%${model}%`); }
  if (year) { conditions.push('year = ?'); params.push(parseInt(year)); }
  if (year_min) { conditions.push('year >= ?'); params.push(parseInt(year_min)); }
  if (year_max) { conditions.push('year <= ?'); params.push(parseInt(year_max)); }
  if (fuel_type) { conditions.push('fuel_type = ?'); params.push(fuel_type); }
  if (category) { conditions.push('category = ?'); params.push(category); }
  if (transmission) { conditions.push('transmission LIKE ?'); params.push(`%${transmission}%`); }
  if (color) { conditions.push('color LIKE ?'); params.push(`%${color}%`); }
  if (price_brl_min) { conditions.push('price_brl >= ?'); params.push(parseFloat(price_brl_min)); }
  if (price_brl_max) { conditions.push('price_brl <= ?'); params.push(parseFloat(price_brl_max)); }
  if (flex_fuel !== undefined) { conditions.push('flex_fuel = ?'); params.push(flex_fuel === 'true' ? 1 : 0); }
  if (search) { conditions.push('(brand LIKE ? OR model LIKE ? OR description LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const allowedSort = ['id','brand','model','year','fuel_type','power_hp','category','price_usd','price_brl'];
  const sortField = allowedSort.includes(sort) ? sort : 'id';
  const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  const { total } = db.prepare(`SELECT COUNT(*) as total FROM cars ${whereClause}`).get(...params);
  const cars = db.prepare(`SELECT * FROM cars ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`).all(...params, limitNum, offset);

  for (const car of cars) {
    if (car.photo_urls) { try { car.photos = JSON.parse(car.photo_urls); } catch (e) { car.photos = []; } }
  }

  res.json({ success: true, total, page: pageNum, limit: limitNum, total_pages: Math.ceil(total / limitNum), data: cars });
});

// ==================== CARAPIS.COM PROXY ====================

app.get('/carapis/detail/:uuid', async (req, res) => {
  try {
    const r = await fetch(`${CARAPIS_BASE}/${req.params.uuid}/`, {
      headers: { Authorization: `Bearer ${CARAPIS_KEY}` }
    });
    if (!r.ok) return res.status(r.status).json({ success: false, error: `carapis.com: ${r.status}` });
    res.json({ success: true, data: await r.json() });
  } catch (e) { res.status(502).json({ success: false, error: e.message }); }
});

app.post('/carapis/enrich/:id', async (req, res) => {
  try {
    let uuid = req.params.id;
    if (/^\d+$/.test(uuid)) {
      const local = db.prepare('SELECT carapis_id FROM cars WHERE id = ?').get(uuid);
      if (local?.carapis_id) uuid = local.carapis_id;
    }
    const r = await fetch(`${CARAPIS_BASE}/${uuid}/`, {
      headers: { Authorization: `Bearer ${CARAPIS_KEY}` }
    });
    if (!r.ok) return res.status(r.status).json({ success: false, error: `carapis.com: ${r.status}` });
    const v = await r.json();

    const brandName = v.brand?.name || 'Unknown';
    const modelName = v.model?.name || 'Unknown';
    const engine = v.engine_cc ? `${(v.engine_cc/1000).toFixed(1)}L` : null;
    const photoUrls = v.photos?.map(p => p.url) || (v.preview_photos?.map(p => p.url) || []);
    const mainPhoto = v.main_photo_url || (photoUrls[0] || null);

    db.prepare(`
      INSERT INTO cars (
        brand,model,year,fuel_type,engine,transmission,category,
        engine_cc,color,mileage_km,price_usd,image_url,photo_urls,
        source,is_new,carapis_id,
        country_of_origin,logo_url,description,
        has_accident,has_recall,recall_fulfilled,
        warranty_type,owner_count,inspection_passed,
        is_undervalued,valuation_score,normalization_confidence,
        source_country,source_currency,price_currency,
        photos_json,metadata_json,generation,first_seen_at
      ) VALUES (?,?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?,?,?)
      ON CONFLICT(carapis_id) DO UPDATE SET
        brand=excluded.brand,model=excluded.model,year=excluded.year,
        fuel_type=excluded.fuel_type,engine=excluded.engine,transmission=excluded.transmission,
        category=excluded.category,engine_cc=excluded.engine_cc,color=excluded.color,
        mileage_km=excluded.mileage_km,price_usd=excluded.price_usd,
        image_url=excluded.image_url,photo_urls=excluded.photo_urls,
        source=excluded.source,is_new=excluded.is_new,
        country_of_origin=excluded.country_of_origin,logo_url=excluded.logo_url,
        description=excluded.description,
        has_accident=excluded.has_accident,has_recall=excluded.has_recall,
        recall_fulfilled=excluded.recall_fulfilled,
        warranty_type=excluded.warranty_type,owner_count=excluded.owner_count,
        inspection_passed=excluded.inspection_passed,
        is_undervalued=excluded.is_undervalued,valuation_score=excluded.valuation_score,
        normalization_confidence=excluded.normalization_confidence,
        source_country=excluded.source_country,source_currency=excluded.source_currency,
        price_currency=excluded.price_currency,
        photos_json=excluded.photos_json,metadata_json=excluded.metadata_json,
        generation=excluded.generation,first_seen_at=excluded.first_seen_at
    `).run(
      brandName, modelName, v.year||0, v.fuel_type||'unknown', engine, v.transmission||null, v.body_type||null,
      v.engine_cc||null, v.color||null, v.mileage||null, v.price_usd?parseFloat(v.price_usd):null, mainPhoto, JSON.stringify(photoUrls),
      v.source?.code||null, v.is_new_vehicle?1:0, v.id,
      v.brand?.country_of_origin||null, v.brand?.logo_url||null, v.description||null,
      v.has_accident?1:0, v.has_recall?1:0, v.recall_fulfilled?1:0,
      v.warranty_type||null, v.owner_count||null, v.inspection_passed?1:0,
      v.is_undervalued?1:0, v.valuation_score||null, v.normalization_confidence||null,
      v.source?.country||null, v.source?.currency||null, v.price_currency||null,
      JSON.stringify(v.photos||v.preview_photos||[]), JSON.stringify(v.metadata||{}),
      v.model?.generation||null, v.first_seen_at||null
    );

    const saved = db.prepare('SELECT * FROM cars WHERE carapis_id = ?').get(v.id);
    res.json({ success: true, message: 'Vehicle enriched with detail', data: saved });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/carapis/enrich/batch', async (req, res) => {
  const { ids, limit = 10 } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ success: false, error: 'Provide { ids: [...], limit?: N }' });

  const toEnrich = ids.slice(0, Math.min(limit, 50));
  const results = [];
  for (const id of toEnrich) {
    try {
      let uuid = id;
      if (/^\d+$/.test(String(uuid))) {
        const local = db.prepare('SELECT carapis_id FROM cars WHERE id = ?').get(uuid);
        if (local?.carapis_id) uuid = local.carapis_id;
      }
      const r = await fetch(`${CARAPIS_BASE}/${uuid}/`, {
        headers: { Authorization: `Bearer ${CARAPIS_KEY}` }
      });
      if (!r.ok) { results.push({ id, success: false, error: `HTTP ${r.status}` }); continue; }
      const v = await r.json();

      const brandName = v.brand?.name || 'Unknown';
      const modelName = v.model?.name || 'Unknown';
      const engine = v.engine_cc ? `${(v.engine_cc/1000).toFixed(1)}L` : null;
      const photoUrls = v.photos?.map(p => p.url) || (v.preview_photos?.map(p => p.url) || []);
      const mainPhoto = v.main_photo_url || (photoUrls[0] || null);

      db.prepare(`INSERT INTO cars (brand,model,year,fuel_type,engine,transmission,category,engine_cc,color,mileage_km,price_usd,image_url,photo_urls,source,is_new,carapis_id,country_of_origin,logo_url,description,has_accident,has_recall,recall_fulfilled,warranty_type,owner_count,inspection_passed,is_undervalued,valuation_score,normalization_confidence,source_country,source_currency,price_currency,photos_json,metadata_json,generation,first_seen_at) VALUES (?,?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?,?) ON CONFLICT(carapis_id) DO UPDATE SET brand=excluded.brand,model=excluded.model,year=excluded.year,fuel_type=excluded.fuel_type,engine=excluded.engine,transmission=excluded.transmission,category=excluded.category,engine_cc=excluded.engine_cc,color=excluded.color,mileage_km=excluded.mileage_km,price_usd=excluded.price_usd,image_url=excluded.image_url,photo_urls=excluded.photo_urls,source=excluded.source,is_new=excluded.is_new,country_of_origin=excluded.country_of_origin,logo_url=excluded.logo_url,description=excluded.description,has_accident=excluded.has_accident,has_recall=excluded.has_recall,recall_fulfilled=excluded.recall_fulfilled,warranty_type=excluded.warranty_type,owner_count=excluded.owner_count,inspection_passed=excluded.inspection_passed,is_undervalued=excluded.is_undervalued,valuation_score=excluded.valuation_score,normalization_confidence=excluded.normalization_confidence,source_country=excluded.source_country,source_currency=excluded.source_currency,price_currency=excluded.price_currency,photos_json=excluded.photos_json,metadata_json=excluded.metadata_json,generation=excluded.generation,first_seen_at=excluded.first_seen_at`).run(brandName,modelName,v.year||0,v.fuel_type||'unknown',engine,v.transmission||null,v.body_type||null,v.engine_cc||null,v.color||null,v.mileage||null,v.price_usd?parseFloat(v.price_usd):null,mainPhoto,JSON.stringify(photoUrls),v.source?.code||null,v.is_new_vehicle?1:0,v.id,v.brand?.country_of_origin||null,v.brand?.logo_url||null,v.description||null,v.has_accident?1:0,v.has_recall?1:0,v.recall_fulfilled?1:0,v.warranty_type||null,v.owner_count||null,v.inspection_passed?1:0,v.is_undervalued?1:0,v.valuation_score||null,v.normalization_confidence||null,v.source?.country||null,v.source?.currency||null,v.price_currency||null,JSON.stringify(v.photos||v.preview_photos||[]),JSON.stringify(v.metadata||{}),v.model?.generation||null,v.first_seen_at||null);
      results.push({ id, success: true, brand: brandName, model: modelName, year: v.year });
    } catch (e) { results.push({ id, success: false, error: e.message }); }
    await new Promise(r => setTimeout(r, 200));
  }
  res.json({ success: true, enriched: results.filter(r => r.success).length, total: results.length, results });
});

app.post('/carapis/search', async (req, res) => {
  try {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(req.body || {})) {
      if (v !== undefined && v !== null && v !== '') params.append(k, v);
    }
    const url = `${CARAPIS_BASE}?${params.toString()}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${CARAPIS_KEY}` } });
    if (!r.ok) return res.status(r.status).json({ success: false, error: `carapis.com: ${r.status}` });
    res.json({ success: true, data: await r.json() });
  } catch (e) { res.status(502).json({ success: false, error: e.message }); }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API-Cars v4.0 running on http://localhost:${PORT}`);
  console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🌎 Mundo: /mundo | 🇧🇷 Brasil: /brasil/cars`);
  const vTypes = db.prepare('SELECT vehicle_type, COUNT(*) as c FROM cars GROUP BY vehicle_type ORDER BY c DESC').all().map(v => `${v.vehicle_type}: ${v.c}`).join(' | ');
  console.log(`🚛 Vehicle types: ${vTypes}`);
  console.log(`🔗 Carapis proxy: /carapis/detail/:uuid | /carapis/enrich/:id | /carapis/search`);
});

module.exports = app;
