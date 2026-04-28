const db = require('./database');

// Fix fuel type normalization
db.exec("UPDATE cars SET fuel_type='Hybrid' WHERE fuel_type IN ('plug_hybrid','plug_in_hybrid')");
db.exec("UPDATE cars SET fuel_type='Unknown' WHERE fuel_type IN ('unknown','other')");
db.exec("DELETE FROM cars WHERE year < 1990");

const s = db.prepare('SELECT fuel_type, COUNT(*) c FROM cars GROUP BY fuel_type ORDER BY c DESC').all();
console.log('Fuel types after fix:');
s.forEach(r => console.log(' ', r.fuel_type, '-', r.c));
console.log('Total cars:', db.prepare('SELECT COUNT(*) c FROM cars').get().c);
console.log('Brands:', db.prepare('SELECT COUNT(DISTINCT brand) c FROM cars').get().c);
