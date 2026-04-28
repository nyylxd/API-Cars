const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'cars.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create base table
db.exec(`
  CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    fuel_type TEXT NOT NULL,
    engine TEXT,
    power_hp INTEGER,
    transmission TEXT,
    doors INTEGER,
    category TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration-safe column additions
const existingColumns = db.prepare("PRAGMA table_info(cars)").all().map(c => c.name);
const newColumns = [
  { name: 'photo_urls', type: 'TEXT' },
  { name: 'color', type: 'TEXT' },
  { name: 'mileage_km', type: 'INTEGER' },
  { name: 'price_usd', type: 'REAL' },
  { name: 'engine_cc', type: 'INTEGER' },
  { name: 'source', type: 'TEXT' },
  { name: 'is_new', type: 'INTEGER DEFAULT 0' },
  { name: 'carapis_id', type: 'TEXT' },
  { name: 'country_of_origin', type: 'TEXT' },
  { name: 'logo_url', type: 'TEXT' },
  { name: 'description', type: 'TEXT' },
  { name: 'has_accident', type: 'INTEGER' },
  { name: 'has_recall', type: 'INTEGER' },
  { name: 'recall_fulfilled', type: 'INTEGER' },
  { name: 'warranty_type', type: 'TEXT' },
  { name: 'owner_count', type: 'INTEGER' },
  { name: 'inspection_passed', type: 'INTEGER' },
  { name: 'is_undervalued', type: 'INTEGER' },
  { name: 'valuation_score', type: 'REAL' },
  { name: 'normalization_confidence', type: 'REAL' },
  { name: 'source_country', type: 'TEXT' },
  { name: 'source_currency', type: 'TEXT' },
  { name: 'price_currency', type: 'TEXT' },
  { name: 'photos_json', type: 'TEXT' },
  { name: 'metadata_json', type: 'TEXT' },
  { name: 'generation', type: 'TEXT' },
  { name: 'first_seen_at', type: 'TEXT' },
  // Brazil-specific fields
  { name: 'is_brazilian', type: 'INTEGER DEFAULT 0' },
  { name: 'price_brl', type: 'REAL' },
  { name: 'flex_fuel', type: 'INTEGER DEFAULT 0' },
  { name: 'mercado_br', type: 'TEXT' },
  { name: 'vehicle_type', type: "TEXT DEFAULT 'car'" },
];
for (const col of newColumns) {
  if (!existingColumns.includes(col.name)) {
    try { db.exec(`ALTER TABLE cars ADD COLUMN ${col.name} ${col.type}`); } catch (e) {}
  }
}

// Indexes
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
  CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
  CREATE INDEX IF NOT EXISTS idx_cars_fuel_type ON cars(fuel_type);
  CREATE INDEX IF NOT EXISTS idx_cars_brand_year ON cars(brand, year);
  CREATE INDEX IF NOT EXISTS idx_cars_brazilian ON cars(is_brazilian);
  CREATE INDEX IF NOT EXISTS idx_cars_vehicle_type ON cars(vehicle_type);
`);
try { db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_cars_carapis_id ON cars(carapis_id)'); } catch (e) {}

// Backfill vehicle_type for existing cars
try { db.exec("UPDATE cars SET vehicle_type = 'car' WHERE vehicle_type IS NULL OR vehicle_type = ''"); } catch (e) {}

module.exports = db;
