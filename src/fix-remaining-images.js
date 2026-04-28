const db = require('./src/database');

// Map vehicle types to Unsplash search terms
const typeTerms = {
  motorcycle: 'motorcycle',
  truck: 'truck',
  bus: 'bus',
  van: 'van vehicle',
  bicycle: 'bicycle',
  tractor: 'tractor farm',
  motorhome: 'motorhome rv',
  car: 'car vehicle',
};

const update = db.prepare("UPDATE cars SET image_url = ?, photo_urls = ? WHERE source = 'mundo-seed' AND image_url LIKE '%placehold%' AND vehicle_type = ?");

const transaction = db.transaction(() => {
  for (const [vt, term] of Object.entries(typeTerms)) {
    const unsplash = `https://source.unsplash.com/800x500/?${encodeURIComponent(term)}`;
    const photos = JSON.stringify([unsplash]);
    const info = update.run(unsplash, photos, vt);
    if (info.changes > 0) {
      console.log(`${vt}: replaced ${info.changes} placeholders -> Unsplash (${term})`);
    }
  }
});
transaction();

const remaining = db.prepare("SELECT COUNT(*) as c FROM cars WHERE image_url LIKE '%placehold%'").get().c;
console.log(`\nTotal placeholders remaining in DB: ${remaining}`);
