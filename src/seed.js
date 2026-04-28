const db = require('./database');

// Clear existing data
db.exec('DELETE FROM cars');
db.exec("DELETE FROM SQLITE_SEQUENCE WHERE name='cars'");

const insertCar = db.prepare(`
  INSERT INTO cars (brand, model, year, fuel_type, engine, power_hp, transmission, doors, category, image_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Helper to generate image URL using a placeholder service
const img = (brand, model, year) =>
  `https://placehold.co/800x500/1a1a2e/e94560?text=${encodeURIComponent(brand + ' ' + model + ' ' + year)}`;

// ===================== MASSIVE CAR DATABASE =====================
const cars = [];

// Brand definitions with models
const brands = {
  // --- JAPANESE ---
  Toyota: {
    models: ['Corolla', 'Camry', 'Yaris', 'RAV4', 'Hilux', 'Land Cruiser', 'Prius', 'Supra', 'GR86', 'C-HR', 'Highlander', 'Tacoma', 'Tundra', 'Avalon', 'Sienna'],
    fuel: ['Gasoline', 'Hybrid', 'Diesel', 'Flex'],
    categories: { Corolla:'Sedan', Camry:'Sedan', Yaris:'Hatchback', RAV4:'SUV', Hilux:'Pickup', 'Land Cruiser':'SUV', Prius:'Hatchback', Supra:'Coupe', GR86:'Coupe', 'C-HR':'SUV', Highlander:'SUV', Tacoma:'Pickup', Tundra:'Pickup', Avalon:'Sedan', Sienna:'Minivan' },
    engines: { Corolla:'1.8L/2.0L', Camry:'2.5L/3.5L', Yaris:'1.5L', RAV4:'2.5L', Hilux:'2.8L Diesel', 'Land Cruiser':'3.3L/4.0L', Prius:'1.8L Hybrid', Supra:'3.0L Turbo', GR86:'2.4L', 'C-HR':'2.0L', Highlander:'2.4L Turbo', Tacoma:'2.4L/3.5L', Tundra:'3.4L Turbo', Avalon:'3.5L', Sienna:'2.5L Hybrid' },
    hp: { Corolla:169, Camry:301, Yaris:106, RAV4:203, Hilux:204, 'Land Cruiser':409, Prius:196, Supra:382, GR86:228, 'C-HR':144, Highlander:265, Tacoma:278, Tundra:389, Avalon:301, Sienna:245 },
    trans: { Corolla:'CVT', Camry:'8-speed Auto', Yaris:'6-speed Manual', RAV4:'8-speed Auto', Hilux:'6-speed Auto', 'Land Cruiser':'10-speed Auto', Prius:'CVT', Supra:'8-speed Auto', GR86:'6-speed Manual', 'C-HR':'CVT', Highlander:'8-speed Auto', Tacoma:'6-speed Auto', Tundra:'10-speed Auto', Avalon:'8-speed Auto', Sienna:'CVT' },
    doors: { Corolla:4, Camry:4, Yaris:4, RAV4:5, Hilux:4, 'Land Cruiser':5, Prius:5, Supra:2, GR86:2, 'C-HR':5, Highlander:5, Tacoma:4, Tundra:4, Avalon:4, Sienna:5 },
  },
  Honda: {
    models: ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'Fit', 'City', 'Passport', 'Ridgeline', 'Odyssey', 'NSX', 'Integra'],
    fuel: ['Gasoline', 'Hybrid', 'Flex'],
    categories: { Civic:'Sedan', Accord:'Sedan', 'CR-V':'SUV', 'HR-V':'SUV', Pilot:'SUV', Fit:'Hatchback', City:'Sedan', Passport:'SUV', Ridgeline:'Pickup', Odyssey:'Minivan', NSX:'Coupe', Integra:'Sedan' },
    engines: { Civic:'2.0L/1.5L Turbo', Accord:'1.5L/2.0L Turbo', 'CR-V':'1.5L Turbo', 'HR-V':'2.0L', Pilot:'3.5L V6', Fit:'1.5L', City:'1.5L', Passport:'3.5L V6', Ridgeline:'3.5L V6', Odyssey:'3.5L V6', NSX:'3.5L V6 Hybrid', Integra:'1.5L Turbo' },
    hp: { Civic:180, Accord:252, 'CR-V':190, 'HR-V':158, Pilot:285, Fit:130, City:121, Passport:280, Ridgeline:280, Odyssey:280, NSX:600, Integra:200 },
    trans: { Civic:'CVT', Accord:'10-speed Auto', 'CR-V':'CVT', 'HR-V':'CVT', Pilot:'10-speed Auto', Fit:'CVT', City:'CVT', Passport:'9-speed Auto', Ridgeline:'9-speed Auto', Odyssey:'10-speed Auto', NSX:'9-speed DCT', Integra:'CVT' },
    doors: { Civic:4, Accord:4, 'CR-V':5, 'HR-V':5, Pilot:5, Fit:5, City:4, Passport:5, Ridgeline:4, Odyssey:5, NSX:2, Integra:4 },
  },
  Nissan: {
    models: ['Altima', 'Sentra', 'Versa', 'Kicks', 'Rogue', 'Murano', 'Pathfinder', 'Frontier', 'Titan', 'Z', 'GT-R', 'Armada', 'Leaf', 'Ariya'],
    fuel: ['Gasoline', 'Electric', 'Hybrid'],
    categories: { Altima:'Sedan', Sentra:'Sedan', Versa:'Sedan', Kicks:'SUV', Rogue:'SUV', Murano:'SUV', Pathfinder:'SUV', Frontier:'Pickup', Titan:'Pickup', Z:'Coupe', 'GT-R':'Coupe', Armada:'SUV', Leaf:'Hatchback', Ariya:'SUV' },
    engines: { Altima:'2.5L/2.0L Turbo', Sentra:'2.0L', Versa:'1.6L', Kicks:'1.6L', Rogue:'1.5L Turbo', Murano:'3.5L V6', Pathfinder:'3.5L V6', Frontier:'3.8L V6', Titan:'5.6L V8', Z:'3.0L Turbo', 'GT-R':'3.8L V6 Turbo', Armada:'5.6L V8', Leaf:'Electric', Ariya:'Electric' },
    hp: { Altima:248, Sentra:149, Versa:122, Kicks:122, Rogue:201, Murano:260, Pathfinder:284, Frontier:310, Titan:400, Z:400, 'GT-R':565, Armada:400, Leaf:214, Ariya:389 },
    trans: { Altima:'CVT', Sentra:'CVT', Versa:'CVT', Kicks:'CVT', Rogue:'CVT', Murano:'CVT', Pathfinder:'9-speed Auto', Frontier:'9-speed Auto', Titan:'9-speed Auto', Z:'6-speed Manual', 'GT-R':'6-speed DCT', Armada:'7-speed Auto', Leaf:'Single-speed', Ariya:'Single-speed' },
    doors: { Altima:4, Sentra:4, Versa:4, Kicks:5, Rogue:5, Murano:5, Pathfinder:5, Frontier:4, Titan:4, Z:2, 'GT-R':2, Armada:5, Leaf:5, Ariya:5 },
  },
  Mazda: {
    models: ['Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-9', 'CX-90', 'MX-5 Miata', 'MX-30'],
    fuel: ['Gasoline', 'Diesel', 'Electric'],
    categories: { Mazda3:'Sedan', Mazda6:'Sedan', 'CX-3':'SUV', 'CX-30':'SUV', 'CX-5':'SUV', 'CX-50':'SUV', 'CX-9':'SUV', 'CX-90':'SUV', 'MX-5 Miata':'Convertible', 'MX-30':'SUV' },
    engines: { Mazda3:'2.5L/2.5L Turbo', Mazda6:'2.5L Turbo', 'CX-3':'2.0L', 'CX-30':'2.5L', 'CX-5':'2.5L Turbo', 'CX-50':'2.5L Turbo', 'CX-9':'2.5L Turbo', 'CX-90':'3.3L Turbo', 'MX-5 Miata':'2.0L', 'MX-30':'Electric' },
    hp: { Mazda3:250, Mazda6:250, 'CX-3':148, 'CX-30':191, 'CX-5':256, 'CX-50':256, 'CX-9':250, 'CX-90':340, 'MX-5 Miata':181, 'MX-30':143 },
    trans: { Mazda3:'6-speed Auto', Mazda6:'6-speed Auto', 'CX-3':'6-speed Auto', 'CX-30':'6-speed Auto', 'CX-5':'6-speed Auto', 'CX-50':'6-speed Auto', 'CX-9':'6-speed Auto', 'CX-90':'8-speed Auto', 'MX-5 Miata':'6-speed Manual', 'MX-30':'Single-speed' },
    doors: { Mazda3:4, Mazda6:4, 'CX-3':5, 'CX-30':5, 'CX-5':5, 'CX-50':5, 'CX-9':5, 'CX-90':5, 'MX-5 Miata':2, 'MX-30':5 },
  },
  Subaru: {
    models: ['Impreza', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'Ascent', 'BRZ', 'WRX', 'Solterra'],
    fuel: ['Gasoline', 'Electric'],
    categories: { Impreza:'Sedan', Legacy:'Sedan', Outback:'SUV', Forester:'SUV', Crosstrek:'SUV', Ascent:'SUV', BRZ:'Coupe', WRX:'Sedan', Solterra:'SUV' },
    engines: { Impreza:'2.0L/2.5L', Legacy:'2.4L Turbo', Outback:'2.4L Turbo', Forester:'2.5L', Crosstrek:'2.0L/2.5L', Ascent:'2.4L Turbo', BRZ:'2.4L', WRX:'2.4L Turbo', Solterra:'Electric' },
    hp: { Impreza:182, Legacy:260, Outback:260, Forester:180, Crosstrek:182, Ascent:260, BRZ:228, WRX:271, Solterra:215 },
    trans: { Impreza:'CVT', Legacy:'CVT', Outback:'CVT', Forester:'CVT', Crosstrek:'CVT', Ascent:'CVT', BRZ:'6-speed Manual', WRX:'6-speed Manual', Solterra:'Single-speed' },
    doors: { Impreza:4, Legacy:4, Outback:5, Forester:5, Crosstrek:5, Ascent:5, BRZ:2, WRX:4, Solterra:5 },
  },
  Mitsubishi: {
    models: ['Mirage', 'Outlander', 'Eclipse Cross', 'Pajero', 'L200 Triton', 'ASX'],
    fuel: ['Gasoline', 'Diesel', 'Hybrid'],
    categories: { Mirage:'Hatchback', Outlander:'SUV', 'Eclipse Cross':'SUV', Pajero:'SUV', 'L200 Triton':'Pickup', ASX:'SUV' },
    engines: { Mirage:'1.2L', Outlander:'2.5L/Plug-in Hybrid', 'Eclipse Cross':'1.5L Turbo', Pajero:'3.2L Diesel', 'L200 Triton':'2.4L Diesel', ASX:'2.0L' },
    hp: { Mirage:78, Outlander:181, 'Eclipse Cross':152, Pajero:190, 'L200 Triton':181, ASX:148 },
    trans: { Mirage:'CVT', Outlander:'CVT', 'Eclipse Cross':'CVT', Pajero:'5-speed Auto', 'L200 Triton':'6-speed Auto', ASX:'CVT' },
    doors: { Mirage:5, Outlander:5, 'Eclipse Cross':5, Pajero:5, 'L200 Triton':4, ASX:5 },
  },
  Suzuki: {
    models: ['Swift', 'Vitara', 'Jimny', 'S-Cross', 'Ignis', 'Baleno'],
    fuel: ['Gasoline', 'Hybrid'],
    categories: { Swift:'Hatchback', Vitara:'SUV', Jimny:'SUV', 'S-Cross':'SUV', Ignis:'SUV', Baleno:'Hatchback' },
    engines: { Swift:'1.2L/1.4L Turbo', Vitara:'1.4L Turbo', Jimny:'1.5L', 'S-Cross':'1.4L Turbo', Ignis:'1.2L Hybrid', Baleno:'1.5L' },
    hp: { Swift:140, Vitara:140, Jimny:102, 'S-Cross':140, Ignis:83, Baleno:105 },
    trans: { Swift:'6-speed Auto', Vitara:'6-speed Auto', Jimny:'5-speed Manual', 'S-Cross':'6-speed Auto', Ignis:'CVT', Baleno:'5-speed Manual' },
    doors: { Swift:5, Vitara:5, Jimny:3, 'S-Cross':5, Ignis:5, Baleno:5 },
  },

  // --- GERMAN ---
  BMW: {
    models: ['Series 1', 'Series 2', 'Series 3', 'Series 4', 'Series 5', 'Series 6', 'Series 7', 'Series 8', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'i4', 'iX', 'i7', 'M2', 'M3', 'M4', 'M5', 'M8', 'X3 M', 'X5 M', 'XM'],
    fuel: ['Gasoline', 'Diesel', 'Hybrid', 'Electric'],
    categories: { 'Series 1':'Hatchback', 'Series 2':'Coupe', 'Series 3':'Sedan', 'Series 4':'Coupe', 'Series 5':'Sedan', 'Series 6':'Coupe', 'Series 7':'Sedan', 'Series 8':'Coupe', X1:'SUV', X2:'SUV', X3:'SUV', X4:'SUV', X5:'SUV', X6:'SUV', X7:'SUV', Z4:'Convertible', i4:'Sedan', iX:'SUV', i7:'Sedan', M2:'Coupe', M3:'Sedan', M4:'Coupe', M5:'Sedan', M8:'Coupe', 'X3 M':'SUV', 'X5 M':'SUV', XM:'SUV' },
    engines: { 'Series 1':'1.5L/2.0L', 'Series 2':'2.0L/3.0L', 'Series 3':'2.0L/3.0L', 'Series 4':'2.0L/3.0L', 'Series 5':'2.0L/3.0L/4.4L', 'Series 6':'3.0L/4.4L', 'Series 7':'3.0L/4.4L', 'Series 8':'3.0L/4.4L', X1:'2.0L', X2:'2.0L', X3:'2.0L/3.0L', X4:'2.0L/3.0L', X5:'3.0L/4.4L', X6:'3.0L/4.4L', X7:'3.0L/4.4L', Z4:'2.0L/3.0L', i4:'Electric', iX:'Electric', i7:'Electric', M2:'3.0L Turbo', M3:'3.0L Turbo', M4:'3.0L Turbo', M5:'4.4L V8 Turbo', M8:'4.4L V8 Turbo', 'X3 M':'3.0L Turbo', 'X5 M':'4.4L V8 Turbo', XM:'4.4L V8 Hybrid' },
    hp: { 'Series 1':302, 'Series 2':382, 'Series 3':382, 'Series 4':382, 'Series 5':523, 'Series 6':523, 'Series 7':536, 'Series 8':523, X1:241, X2:302, X3:382, X4:382, X5:523, X6:523, X7:536, Z4:382, i4:536, iX:610, i7:536, M2:453, M3:503, M4:503, M5:617, M8:617, 'X3 M':503, 'X5 M':617, XM:644 },
    trans: { 'Series 1':'8-speed Auto', 'Series 2':'8-speed Auto', 'Series 3':'8-speed Auto', 'Series 4':'8-speed Auto', 'Series 5':'8-speed Auto', 'Series 6':'8-speed Auto', 'Series 7':'8-speed Auto', 'Series 8':'8-speed Auto', X1:'7-speed DCT', X2:'8-speed Auto', X3:'8-speed Auto', X4:'8-speed Auto', X5:'8-speed Auto', X6:'8-speed Auto', X7:'8-speed Auto', Z4:'8-speed Auto', i4:'Single-speed', iX:'Single-speed', i7:'Single-speed', M2:'8-speed Auto', M3:'8-speed Auto', M4:'8-speed Auto', M5:'8-speed Auto', M8:'8-speed Auto', 'X3 M':'8-speed Auto', 'X5 M':'8-speed Auto', XM:'8-speed Auto' },
    doors: { 'Series 1':5, 'Series 2':2, 'Series 3':4, 'Series 4':2, 'Series 5':4, 'Series 6':2, 'Series 7':4, 'Series 8':2, X1:5, X2:5, X3:5, X4:5, X5:5, X6:5, X7:5, Z4:2, i4:4, iX:5, i7:4, M2:2, M3:4, M4:2, M5:4, M8:2, 'X3 M':5, 'X5 M':5, XM:5 },
  },
  'Mercedes-Benz': {
    models: ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'EQS', 'EQE', 'EQB', 'AMG GT', 'SL', 'Maybach S-Class'],
    fuel: ['Gasoline', 'Diesel', 'Hybrid', 'Electric'],
    categories: { 'A-Class':'Hatchback', 'B-Class':'MPV', 'C-Class':'Sedan', 'E-Class':'Sedan', 'S-Class':'Sedan', CLA:'Sedan', CLS:'Sedan', GLA:'SUV', GLB:'SUV', GLC:'SUV', GLE:'SUV', GLS:'SUV', 'G-Class':'SUV', EQS:'Sedan', EQE:'Sedan', EQB:'SUV', 'AMG GT':'Coupe', SL:'Convertible', 'Maybach S-Class':'Sedan' },
    engines: { 'A-Class':'1.3L/2.0L', 'B-Class':'1.3L/2.0L', 'C-Class':'2.0L Turbo', 'E-Class':'2.0L/3.0L', 'S-Class':'3.0L/4.0L V8', CLA:'2.0L Turbo', CLS:'3.0L Turbo', GLA:'2.0L Turbo', GLB:'2.0L Turbo', GLC:'2.0L Turbo', GLE:'3.0L/4.0L V8', GLS:'3.0L/4.0L V8', 'G-Class':'4.0L V8', EQS:'Electric', EQE:'Electric', EQB:'Electric', 'AMG GT':'4.0L V8 Turbo', SL:'4.0L V8 Turbo', 'Maybach S-Class':'4.0L V8/6.0L V12' },
    hp: { 'A-Class':302, 'B-Class':224, 'C-Class':402, 'E-Class':429, 'S-Class':496, CLA:302, CLS:429, GLA:302, GLB:302, GLC:402, GLE:603, GLS:603, 'G-Class':577, EQS:649, EQE:617, EQB:288, 'AMG GT':577, SL:577, 'Maybach S-Class':621 },
    trans: { 'A-Class':'7-speed DCT', 'B-Class':'7-speed DCT', 'C-Class':'9-speed Auto', 'E-Class':'9-speed Auto', 'S-Class':'9-speed Auto', CLA:'7-speed DCT', CLS:'9-speed Auto', GLA:'8-speed DCT', GLB:'8-speed DCT', GLC:'9-speed Auto', GLE:'9-speed Auto', GLS:'9-speed Auto', 'G-Class':'9-speed Auto', EQS:'Single-speed', EQE:'Single-speed', EQB:'Single-speed', 'AMG GT':'9-speed DCT', SL:'9-speed Auto', 'Maybach S-Class':'9-speed Auto' },
    doors: { 'A-Class':5, 'B-Class':5, 'C-Class':4, 'E-Class':4, 'S-Class':4, CLA:4, CLS:4, GLA:5, GLB:5, GLC:5, GLE:5, GLS:5, 'G-Class':5, EQS:4, EQE:4, EQB:5, 'AMG GT':2, SL:2, 'Maybach S-Class':4 },
  },
  Audi: {
    models: ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8', 'e-tron GT', 'R8', 'TT', 'RS3', 'RS5', 'RS6', 'RS7', 'RS Q8'],
    fuel: ['Gasoline', 'Diesel', 'Hybrid', 'Electric'],
    categories: { A1:'Hatchback', A3:'Sedan', A4:'Sedan', A5:'Coupe', A6:'Sedan', A7:'Sedan', A8:'Sedan', Q2:'SUV', Q3:'SUV', 'Q4 e-tron':'SUV', Q5:'SUV', Q7:'SUV', Q8:'SUV', 'e-tron GT':'Sedan', R8:'Coupe', TT:'Coupe', RS3:'Sedan', RS5:'Coupe', RS6:'Wagon', RS7:'Sedan', 'RS Q8':'SUV' },
    engines: { A1:'1.0L/1.5L', A3:'2.0L Turbo', A4:'2.0L Turbo', A5:'2.0L Turbo', A6:'2.0L/3.0L', A7:'3.0L Turbo', A8:'3.0L/4.0L V8', Q2:'1.5L/2.0L', Q3:'2.0L Turbo', 'Q4 e-tron':'Electric', Q5:'2.0L Turbo', Q7:'3.0L/4.0L V8', Q8:'3.0L/4.0L V8', 'e-tron GT':'Electric', R8:'5.2L V10', TT:'2.0L Turbo', RS3:'2.5L Turbo', RS5:'2.9L V6 Turbo', RS6:'4.0L V8 Turbo', RS7:'4.0L V8 Turbo', 'RS Q8':'4.0L V8 Turbo' },
    hp: { A1:150, A3:333, A4:261, A5:261, A6:335, A7:335, A8:460, Q2:190, Q3:228, 'Q4 e-tron':295, Q5:261, Q7:500, Q8:500, 'e-tron GT':637, R8:602, TT:228, RS3:401, RS5:444, RS6:621, RS7:621, 'RS Q8':631 },
    trans: { A1:'7-speed DSG', A3:'7-speed DSG', A4:'7-speed DSG', A5:'7-speed DSG', A6:'7-speed DSG', A7:'7-speed DSG', A8:'8-speed Tiptronic', Q2:'7-speed DSG', Q3:'8-speed Tiptronic', 'Q4 e-tron':'Single-speed', Q5:'7-speed DSG', Q7:'8-speed Tiptronic', Q8:'8-speed Tiptronic', 'e-tron GT':'2-speed Auto', R8:'7-speed DSG', TT:'7-speed DSG', RS3:'7-speed DSG', RS5:'8-speed Tiptronic', RS6:'8-speed Tiptronic', RS7:'8-speed Tiptronic', 'RS Q8':'8-speed Tiptronic' },
    doors: { A1:3, A3:4, A4:4, A5:2, A6:4, A7:4, A8:4, Q2:5, Q3:5, 'Q4 e-tron':5, Q5:5, Q7:5, Q8:5, 'e-tron GT':4, R8:2, TT:2, RS3:4, RS5:2, RS6:5, RS7:4, 'RS Q8':5 },
  },
  Volkswagen: {
    models: ['Polo', 'Golf', 'Passat', 'Arteon', 'T-Cross', 'T-Roc', 'Tiguan', 'Touareg', 'Atlas', 'ID.3', 'ID.4', 'ID.5', 'ID.Buzz', 'Jetta', 'Nivus', 'Taos', 'Virtus', 'Saveiro', 'Amarok'],
    fuel: ['Gasoline', 'Diesel', 'Electric', 'Flex', 'Hybrid'],
    categories: { Polo:'Hatchback', Golf:'Hatchback', Passat:'Sedan', Arteon:'Sedan', 'T-Cross':'SUV', 'T-Roc':'SUV', Tiguan:'SUV', Touareg:'SUV', Atlas:'SUV', 'ID.3':'Hatchback', 'ID.4':'SUV', 'ID.5':'SUV', 'ID.Buzz':'Van', Jetta:'Sedan', Nivus:'SUV', Taos:'SUV', Virtus:'Sedan', Saveiro:'Pickup', Amarok:'Pickup' },
    engines: { Polo:'1.0L TSI', Golf:'2.0L TSI', Passat:'2.0L TSI', Arteon:'2.0L TSI', 'T-Cross':'1.0L/1.4L TSI', 'T-Roc':'1.4L/2.0L TSI', Tiguan:'2.0L TSI', Touareg:'3.0L V6', Atlas:'2.0L/3.6L V6', 'ID.3':'Electric', 'ID.4':'Electric', 'ID.5':'Electric', 'ID.Buzz':'Electric', Jetta:'1.4L/2.0L TSI', Nivus:'1.0L TSI', Taos:'1.5L TSI', Virtus:'1.0L/2.0L TSI', Saveiro:'1.6L', Amarok:'3.0L V6 TDI' },
    hp: { Polo:150, Golf:315, Passat:280, Arteon:300, 'T-Cross':150, 'T-Roc':300, Tiguan:235, Touareg:335, Atlas:276, 'ID.3':201, 'ID.4':295, 'ID.5':295, 'ID.Buzz':201, Jetta:228, Nivus:128, Taos:150, Virtus:150, Saveiro:110, Amarok:258 },
    trans: { Polo:'6-speed DSG', Golf:'7-speed DSG', Passat:'7-speed DSG', Arteon:'7-speed DSG', 'T-Cross':'6-speed DSG', 'T-Roc':'7-speed DSG', Tiguan:'8-speed Auto', Touareg:'8-speed Auto', Atlas:'8-speed Auto', 'ID.3':'Single-speed', 'ID.4':'Single-speed', 'ID.5':'Single-speed', 'ID.Buzz':'Single-speed', Jetta:'8-speed Auto', Nivus:'6-speed Auto', Taos:'7-speed DSG', Virtus:'6-speed Auto', Saveiro:'5-speed Manual', Amarok:'8-speed Auto' },
    doors: { Polo:4, Golf:4, Passat:4, Arteon:4, 'T-Cross':5, 'T-Roc':5, Tiguan:5, Touareg:5, Atlas:5, 'ID.3':5, 'ID.4':5, 'ID.5':5, 'ID.Buzz':5, Jetta:4, Nivus:5, Taos:5, Virtus:4, Saveiro:2, Amarok:4 },
  },
  Porsche: {
    models: ['718 Cayman', '718 Boxster', '911 Carrera', '911 Turbo', '911 GT3', 'Panamera', 'Taycan', 'Macan', 'Cayenne', 'Cayenne Coupe'],
    fuel: ['Gasoline', 'Hybrid', 'Electric'],
    categories: { '718 Cayman':'Coupe', '718 Boxster':'Convertible', '911 Carrera':'Coupe', '911 Turbo':'Coupe', '911 GT3':'Coupe', Panamera:'Sedan', Taycan:'Sedan', Macan:'SUV', Cayenne:'SUV', 'Cayenne Coupe':'SUV' },
    engines: { '718 Cayman':'2.0L/4.0L', '718 Boxster':'2.0L/4.0L', '911 Carrera':'3.0L Turbo', '911 Turbo':'3.8L Turbo', '911 GT3':'4.0L', Panamera:'2.9L/4.0L Turbo', Taycan:'Electric', Macan:'2.0L/2.9L Turbo', Cayenne:'3.0L/4.0L Turbo', 'Cayenne Coupe':'3.0L/4.0L Turbo' },
    hp: { '718 Cayman':414, '718 Boxster':414, '911 Carrera':473, '911 Turbo':640, '911 GT3':502, Panamera:620, Taycan:750, Macan:434, Cayenne:650, 'Cayenne Coupe':650 },
    trans: { '718 Cayman':'7-speed PDK', '718 Boxster':'7-speed PDK', '911 Carrera':'8-speed PDK', '911 Turbo':'8-speed PDK', '911 GT3':'7-speed PDK', Panamera:'8-speed PDK', Taycan:'2-speed Auto', Macan:'7-speed PDK', Cayenne:'8-speed Tiptronic', 'Cayenne Coupe':'8-speed Tiptronic' },
    doors: { '718 Cayman':2, '718 Boxster':2, '911 Carrera':2, '911 Turbo':2, '911 GT3':2, Panamera:4, Taycan:4, Macan:5, Cayenne:5, 'Cayenne Coupe':5 },
  },

  // --- ITALIAN ---
  Ferrari: {
    models: ['Roma', 'Portofino M', '296 GTB', 'SF90 Stradale', '812 Superfast', 'Purosangue', 'F8 Tributo', 'SF90 Spider', '296 GTS', 'Daytona SP3'],
    fuel: ['Gasoline', 'Hybrid'],
    categories: { Roma:'Coupe', 'Portofino M':'Convertible', '296 GTB':'Coupe', 'SF90 Stradale':'Coupe', '812 Superfast':'Coupe', Purosangue:'SUV', 'F8 Tributo':'Coupe', 'SF90 Spider':'Convertible', '296 GTS':'Convertible', 'Daytona SP3':'Convertible' },
    engines: { Roma:'3.9L V8 Turbo', 'Portofino M':'3.9L V8 Turbo', '296 GTB':'3.0L V6 Hybrid', 'SF90 Stradale':'4.0L V8 Hybrid', '812 Superfast':'6.5L V12', Purosangue:'6.5L V12', 'F8 Tributo':'3.9L V8 Turbo', 'SF90 Spider':'4.0L V8 Hybrid', '296 GTS':'3.0L V6 Hybrid', 'Daytona SP3':'6.5L V12' },
    hp: { Roma:612, 'Portofino M':612, '296 GTB':819, 'SF90 Stradale':986, '812 Superfast':830, Purosangue:715, 'F8 Tributo':710, 'SF90 Spider':986, '296 GTS':819, 'Daytona SP3':829 },
    trans: { Roma:'8-speed DCT', 'Portofino M':'8-speed DCT', '296 GTB':'8-speed DCT', 'SF90 Stradale':'8-speed DCT', '812 Superfast':'7-speed DCT', Purosangue:'8-speed DCT', 'F8 Tributo':'7-speed DCT', 'SF90 Spider':'8-speed DCT', '296 GTS':'8-speed DCT', 'Daytona SP3':'7-speed DCT' },
    doors: { Roma:2, 'Portofino M':2, '296 GTB':2, 'SF90 Stradale':2, '812 Superfast':2, Purosangue:4, 'F8 Tributo':2, 'SF90 Spider':2, '296 GTS':2, 'Daytona SP3':2 },
  },
  Lamborghini: {
    models: ['Huracan', 'Revuelto', 'Urus', 'Countach LPI 800-4', 'Aventador'],
    fuel: ['Gasoline', 'Hybrid'],
    categories: { Huracan:'Coupe', Revuelto:'Coupe', Urus:'SUV', 'Countach LPI 800-4':'Coupe', Aventador:'Coupe' },
    engines: { Huracan:'5.2L V10', Revuelto:'6.5L V12 Hybrid', Urus:'4.0L V8 Turbo', 'Countach LPI 800-4':'6.5L V12 Hybrid', Aventador:'6.5L V12' },
    hp: { Huracan:640, Revuelto:1001, Urus:657, 'Countach LPI 800-4':802, Aventador:769 },
    trans: { Huracan:'7-speed DCT', Revuelto:'8-speed DCT', Urus:'8-speed Auto', 'Countach LPI 800-4':'7-speed ISR', Aventador:'7-speed ISR' },
    doors: { Huracan:2, Revuelto:2, Urus:5, 'Countach LPI 800-4':2, Aventador:2 },
  },
  Maserati: {
    models: ['Ghibli', 'Quattroporte', 'Levante', 'MC20', 'Grecale', 'GranTurismo'],
    fuel: ['Gasoline', 'Diesel', 'Hybrid', 'Electric'],
    categories: { Ghibli:'Sedan', Quattroporte:'Sedan', Levante:'SUV', MC20:'Coupe', Grecale:'SUV', GranTurismo:'Coupe' },
    engines: { Ghibli:'3.0L V6/3.8L V8', Quattroporte:'3.0L V6/3.8L V8', Levante:'3.0L V6', MC20:'3.0L V6 Nettuno', Grecale:'2.0L/3.0L V6', GranTurismo:'3.0L V6 Nettuno' },
    hp: { Ghibli:572, Quattroporte:572, Levante:580, MC20:621, Grecale:523, GranTurismo:542 },
    trans: { Ghibli:'8-speed Auto', Quattroporte:'8-speed Auto', Levante:'8-speed Auto', MC20:'8-speed DCT', Grecale:'8-speed Auto', GranTurismo:'8-speed Auto' },
    doors: { Ghibli:4, Quattroporte:4, Levante:5, MC20:2, Grecale:5, GranTurismo:2 },
  },

  // --- AMERICAN ---
  Ford: {
    models: ['Mustang', 'F-150', 'Ranger', 'Maverick', 'Bronco', 'Explorer', 'Expedition', 'Escape', 'Edge', 'Mustang Mach-E', 'F-150 Lightning', 'Bronco Sport', 'Focus', 'Puma', 'Territory', 'Everest'],
    fuel: ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Flex'],
    categories: { Mustang:'Coupe', 'F-150':'Pickup', Ranger:'Pickup', Maverick:'Pickup', Bronco:'SUV', Explorer:'SUV', Expedition:'SUV', Escape:'SUV', Edge:'SUV', 'Mustang Mach-E':'SUV', 'F-150 Lightning':'Pickup', 'Bronco Sport':'SUV', Focus:'Hatchback', Puma:'SUV', Territory:'SUV', Everest:'SUV' },
    engines: { Mustang:'5.0L V8/2.3L Turbo', 'F-150':'2.7L/3.5L/5.0L', Ranger:'2.3L Turbo', Maverick:'2.0L Turbo', Bronco:'2.3L/2.7L Turbo', Explorer:'2.3L/3.0L Turbo', Expedition:'3.5L Turbo', Escape:'1.5L/2.0L Turbo', Edge:'2.0L/2.7L Turbo', 'Mustang Mach-E':'Electric', 'F-150 Lightning':'Electric', 'Bronco Sport':'1.5L/2.0L Turbo', Focus:'1.0L/2.3L Turbo', Puma:'1.0L Turbo', Territory:'1.5L Turbo', Everest:'2.0L/3.0L Turbo' },
    hp: { Mustang:500, 'F-150':430, Ranger:270, Maverick:250, Bronco:330, Explorer:400, Expedition:440, Escape:250, Edge:335, 'Mustang Mach-E':480, 'F-150 Lightning':580, 'Bronco Sport':250, Focus:280, Puma:200, Territory:150, Everest:250 },
    trans: { Mustang:'10-speed Auto', 'F-150':'10-speed Auto', Ranger:'10-speed Auto', Maverick:'8-speed Auto', Bronco:'10-speed Auto', Explorer:'10-speed Auto', Expedition:'10-speed Auto', Escape:'8-speed Auto', Edge:'8-speed Auto', 'Mustang Mach-E':'Single-speed', 'F-150 Lightning':'Single-speed', 'Bronco Sport':'8-speed Auto', Focus:'7-speed Auto', Puma:'7-speed Auto', Territory:'CVT', Everest:'10-speed Auto' },
    doors: { Mustang:2, 'F-150':4, Ranger:4, Maverick:4, Bronco:5, Explorer:5, Expedition:5, Escape:5, Edge:5, 'Mustang Mach-E':5, 'F-150 Lightning':4, 'Bronco Sport':5, Focus:5, Puma:5, Territory:5, Everest:5 },
  },
  Chevrolet: {
    models: ['Camaro', 'Corvette', 'Silverado', 'Colorado', 'Tahoe', 'Suburban', 'Traverse', 'Equinox', 'Trailblazer', 'Blazer', 'Bolt EV', 'Blazer EV', 'Onix', 'Tracker', 'Spin', 'S10', 'Montana'],
    fuel: ['Gasoline', 'Diesel', 'Electric', 'Flex', 'Hybrid'],
    categories: { Camaro:'Coupe', Corvette:'Coupe', Silverado:'Pickup', Colorado:'Pickup', Tahoe:'SUV', Suburban:'SUV', Traverse:'SUV', Equinox:'SUV', Trailblazer:'SUV', Blazer:'SUV', 'Bolt EV':'Hatchback', 'Blazer EV':'SUV', Onix:'Hatchback', Tracker:'SUV', Spin:'Minivan', S10:'Pickup', Montana:'Pickup' },
    engines: { Camaro:'6.2L V8/3.6L V6', Corvette:'6.2L V8', Silverado:'5.3L/6.2L V8/3.0L Diesel', Colorado:'2.7L Turbo', Tahoe:'5.3L/6.2L V8', Suburban:'5.3L/6.2L V8', Traverse:'2.5L Turbo', Equinox:'1.5L Turbo', Trailblazer:'1.2L/1.3L Turbo', Blazer:'2.5L/3.6L V6', 'Bolt EV':'Electric', 'Blazer EV':'Electric', Onix:'1.0L Turbo', Tracker:'1.2L Turbo', Spin:'1.8L', S10:'2.8L Diesel', Montana:'1.2L Turbo' },
    hp: { Camaro:650, Corvette:670, Silverado:420, Colorado:310, Tahoe:420, Suburban:420, Traverse:328, Equinox:175, Trailblazer:155, Blazer:308, 'Bolt EV':200, 'Blazer EV':288, Onix:116, Tracker:133, Spin:111, S10:200, Montana:133 },
    trans: { Camaro:'10-speed Auto', Corvette:'8-speed DCT', Silverado:'10-speed Auto', Colorado:'8-speed Auto', Tahoe:'10-speed Auto', Suburban:'10-speed Auto', Traverse:'9-speed Auto', Equinox:'6-speed Auto', Trailblazer:'CVT', Blazer:'9-speed Auto', 'Bolt EV':'Single-speed', 'Blazer EV':'Single-speed', Onix:'6-speed Auto', Tracker:'6-speed Auto', Spin:'6-speed Auto', S10:'6-speed Auto', Montana:'CVT' },
    doors: { Camaro:2, Corvette:2, Silverado:4, Colorado:4, Tahoe:5, Suburban:5, Traverse:5, Equinox:5, Trailblazer:5, Blazer:5, 'Bolt EV':5, 'Blazer EV':5, Onix:5, Tracker:5, Spin:5, S10:4, Montana:4 },
  },
  Jeep: {
    models: ['Wrangler', 'Grand Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Cherokee', 'Wagoneer', 'Grand Wagoneer', 'Commander', 'Avenger'],
    fuel: ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Flex'],
    categories: { Wrangler:'SUV', 'Grand Cherokee':'SUV', Compass:'SUV', Renegade:'SUV', Gladiator:'Pickup', Cherokee:'SUV', Wagoneer:'SUV', 'Grand Wagoneer':'SUV', Commander:'SUV', Avenger:'SUV' },
    engines: { Wrangler:'2.0L/3.6L/6.4L', 'Grand Cherokee':'3.6L V6/6.2L V8', Compass:'1.3L Turbo/2.0L Diesel', Renegade:'1.3L Turbo', Gladiator:'3.6L V6', Cherokee:'2.0L/2.4L', Wagoneer:'5.7L V8/3.0L Turbo', 'Grand Wagoneer':'6.4L V8', Commander:'1.3L/2.0L Turbo', Avenger:'Electric' },
    hp: { Wrangler:470, 'Grand Cherokee':707, Compass:185, Renegade:185, Gladiator:285, Cherokee:270, Wagoneer:510, 'Grand Wagoneer':510, Commander:185, Avenger:156 },
    trans: { Wrangler:'8-speed Auto', 'Grand Cherokee':'8-speed Auto', Compass:'6-speed Auto', Renegade:'9-speed Auto', Gladiator:'8-speed Auto', Cherokee:'9-speed Auto', Wagoneer:'8-speed Auto', 'Grand Wagoneer':'8-speed Auto', Commander:'6-speed Auto', Avenger:'Single-speed' },
    doors: { Wrangler:4, 'Grand Cherokee':5, Compass:5, Renegade:5, Gladiator:4, Cherokee:5, Wagoneer:5, 'Grand Wagoneer':5, Commander:5, Avenger:5 },
  },
  Dodge: {
    models: ['Challenger', 'Charger', 'Durango', 'Hornet'],
    fuel: ['Gasoline', 'Hybrid'],
    categories: { Challenger:'Coupe', Charger:'Sedan', Durango:'SUV', Hornet:'SUV' },
    engines: { Challenger:'3.6L V6/6.2L V8 Supercharged', Charger:'3.6L V6/6.2L V8 Supercharged', Durango:'3.6L V6/6.2L V8 Supercharged', Hornet:'1.3L Turbo/Plug-in Hybrid' },
    hp: { Challenger:807, Charger:807, Durango:710, Hornet:288 },
    trans: { Challenger:'8-speed Auto', Charger:'8-speed Auto', Durango:'8-speed Auto', Hornet:'6-speed Auto' },
    doors: { Challenger:2, Charger:4, Durango:5, Hornet:5 },
  },
  Tesla: {
    models: ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck'],
    fuel: ['Electric'],
    categories: { 'Model S':'Sedan', 'Model 3':'Sedan', 'Model X':'SUV', 'Model Y':'SUV', Cybertruck:'Pickup' },
    engines: { 'Model S':'Electric', 'Model 3':'Electric', 'Model X':'Electric', 'Model Y':'Electric', Cybertruck:'Electric' },
    hp: { 'Model S':1020, 'Model 3':510, 'Model X':1020, 'Model Y':510, Cybertruck:845 },
    trans: { 'Model S':'Single-speed', 'Model 3':'Single-speed', 'Model X':'Single-speed', 'Model Y':'Single-speed', Cybertruck:'Single-speed' },
    doors: { 'Model S':4, 'Model 3':4, 'Model X':5, 'Model Y':5, Cybertruck:4 },
  },

  // --- KOREAN ---
  Hyundai: {
    models: ['HB20', 'Creta', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Ioniq 5', 'Ioniq 6', 'Elantra', 'Sonata', 'Azera', 'Staria', 'Bayon', 'i20', 'i30'],
    fuel: ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Flex'],
    categories: { HB20:'Hatchback', Creta:'SUV', Tucson:'SUV', 'Santa Fe':'SUV', Palisade:'SUV', Kona:'SUV', 'Ioniq 5':'SUV', 'Ioniq 6':'Sedan', Elantra:'Sedan', Sonata:'Sedan', Azera:'Sedan', Staria:'Van', Bayon:'SUV', i20:'Hatchback', i30:'Hatchback' },
    engines: { HB20:'1.0L Turbo', Creta:'1.6L/2.0L', Tucson:'2.5L/1.6L Turbo Hybrid', 'Santa Fe':'2.5L Turbo/1.6L Hybrid', Palisade:'3.8L V6', Kona:'2.0L/1.6L Turbo', 'Ioniq 5':'Electric', 'Ioniq 6':'Electric', Elantra:'2.0L/1.6L Turbo', Sonata:'2.5L/2.5L Turbo', Azera:'3.5L V6', Staria:'3.5L V6/2.2L Diesel', Bayon:'1.0L Turbo', i20:'1.0L Turbo', i30:'1.5L/2.0L' },
    hp: { HB20:120, Creta:167, Tucson:226, 'Santa Fe':277, Palisade:291, Kona:190, 'Ioniq 5':320, 'Ioniq 6':320, Elantra:201, Sonata:290, Azera:300, Staria:272, Bayon:120, i20:120, i30:160 },
    trans: { HB20:'6-speed Auto', Creta:'6-speed Auto', Tucson:'8-speed Auto', 'Santa Fe':'8-speed DCT', Palisade:'8-speed Auto', Kona:'CVT', 'Ioniq 5':'Single-speed', 'Ioniq 6':'Single-speed', Elantra:'CVT', Sonata:'8-speed Auto', Azera:'8-speed Auto', Staria:'8-speed Auto', Bayon:'6-speed Manual', i20:'7-speed DCT', i30:'7-speed DCT' },
    doors: { HB20:5, Creta:5, Tucson:5, 'Santa Fe':5, Palisade:5, Kona:5, 'Ioniq 5':5, 'Ioniq 6':4, Elantra:4, Sonata:4, Azera:4, Staria:5, Bayon:5, i20:5, i30:5 },
  },
  Kia: {
    models: ['Picanto', 'Rio', 'Cerato', 'K5', 'Stinger', 'Seltos', 'Sportage', 'Sorento', 'Telluride', 'Carnival', 'EV6', 'EV9', 'Niro', 'Soul', 'Mohave'],
    fuel: ['Gasoline', 'Diesel', 'Hybrid', 'Electric'],
    categories: { Picanto:'Hatchback', Rio:'Hatchback', Cerato:'Sedan', K5:'Sedan', Stinger:'Sedan', Seltos:'SUV', Sportage:'SUV', Sorento:'SUV', Telluride:'SUV', Carnival:'Minivan', EV6:'SUV', EV9:'SUV', Niro:'SUV', Soul:'Hatchback', Mohave:'SUV' },
    engines: { Picanto:'1.0L/1.2L', Rio:'1.4L/1.6L', Cerato:'2.0L', K5:'2.5L Turbo', Stinger:'3.3L V6 Turbo', Seltos:'1.6L/2.0L', Sportage:'2.5L/1.6L Turbo Hybrid', Sorento:'2.5L Turbo/1.6L Hybrid', Telluride:'3.8L V6', Carnival:'3.5L V6', EV6:'Electric', EV9:'Electric', Niro:'1.6L Hybrid/Electric', Soul:'2.0L/Electric', Mohave:'3.0L V6 Diesel' },
    hp: { Picanto:84, Rio:123, Cerato:147, K5:290, Stinger:365, Seltos:175, Sportage:226, Sorento:281, Telluride:291, Carnival:290, EV6:576, EV9:379, Niro:201, Soul:201, Mohave:256 },
    trans: { Picanto:'5-speed Manual', Rio:'6-speed Auto', Cerato:'CVT', K5:'8-speed DCT', Stinger:'8-speed Auto', Seltos:'CVT', Sportage:'8-speed Auto', Sorento:'8-speed DCT', Telluride:'8-speed Auto', Carnival:'8-speed Auto', EV6:'Single-speed', EV9:'Single-speed', Niro:'6-speed DCT', Soul:'CVT', Mohave:'8-speed Auto' },
    doors: { Picanto:5, Rio:5, Cerato:4, K5:4, Stinger:4, Seltos:5, Sportage:5, Sorento:5, Telluride:5, Carnival:5, EV6:5, EV9:5, Niro:5, Soul:5, Mohave:5 },
  },
  Genesis: {
    models: ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80'],
    fuel: ['Gasoline', 'Diesel', 'Electric'],
    categories: { G70:'Sedan', G80:'Sedan', G90:'Sedan', GV60:'SUV', GV70:'SUV', GV80:'SUV' },
    engines: { G70:'2.0L/3.3L V6 Turbo', G80:'2.5L/3.5L Turbo', G90:'3.5L Turbo', GV60:'Electric', GV70:'2.5L/3.5L Turbo', GV80:'2.5L/3.5L Turbo' },
    hp: { G70:365, G80:375, G90:409, GV60:483, GV70:375, GV80:375 },
    trans: { G70:'8-speed Auto', G80:'8-speed Auto', G90:'8-speed Auto', GV60:'Single-speed', GV70:'8-speed Auto', GV80:'8-speed Auto' },
    doors: { G70:4, G80:4, G90:4, GV60:5, GV70:5, GV80:5 },
  },

  // --- BRITISH ---
  'Land Rover': {
    models: ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque'],
    fuel: ['Gasoline', 'Diesel', 'Hybrid', 'Electric'],
    categories: { Defender:'SUV', Discovery:'SUV', 'Discovery Sport':'SUV', 'Range Rover':'SUV', 'Range Rover Sport':'SUV', 'Range Rover Velar':'SUV', 'Range Rover Evoque':'SUV' },
    engines: { Defender:'2.0L/3.0L/5.0L V8', Discovery:'2.0L/3.0L', 'Discovery Sport':'2.0L', 'Range Rover':'3.0L/4.4L V8', 'Range Rover Sport':'3.0L/4.4L V8', 'Range Rover Velar':'2.0L/3.0L', 'Range Rover Evoque':'2.0L' },
    hp: { Defender:518, Discovery:355, 'Discovery Sport':246, 'Range Rover':606, 'Range Rover Sport':626, 'Range Rover Velar':395, 'Range Rover Evoque':300 },
    trans: { Defender:'8-speed Auto', Discovery:'8-speed Auto', 'Discovery Sport':'9-speed Auto', 'Range Rover':'8-speed Auto', 'Range Rover Sport':'8-speed Auto', 'Range Rover Velar':'8-speed Auto', 'Range Rover Evoque':'9-speed Auto' },
    doors: { Defender:5, Discovery:5, 'Discovery Sport':5, 'Range Rover':5, 'Range Rover Sport':5, 'Range Rover Velar':5, 'Range Rover Evoque':5 },
  },
  Jaguar: {
    models: ['XE', 'XF', 'F-Type', 'E-Pace', 'F-Pace', 'I-Pace'],
    fuel: ['Gasoline', 'Diesel', 'Electric'],
    categories: { XE:'Sedan', XF:'Sedan', 'F-Type':'Coupe', 'E-Pace':'SUV', 'F-Pace':'SUV', 'I-Pace':'SUV' },
    engines: { XE:'2.0L Turbo', XF:'2.0L Turbo', 'F-Type':'2.0L/5.0L V8', 'E-Pace':'2.0L Turbo', 'F-Pace':'2.0L/5.0L V8', 'I-Pace':'Electric' },
    hp: { XE:296, XF:296, 'F-Type':575, 'E-Pace':296, 'F-Pace':575, 'I-Pace':394 },
    trans: { XE:'8-speed Auto', XF:'8-speed Auto', 'F-Type':'8-speed Auto', 'E-Pace':'9-speed Auto', 'F-Pace':'8-speed Auto', 'I-Pace':'Single-speed' },
    doors: { XE:4, XF:4, 'F-Type':2, 'E-Pace':5, 'F-Pace':5, 'I-Pace':5 },
  },
  'Aston Martin': {
    models: ['Vantage', 'DB12', 'DBS', 'DBX', 'Valhalla', 'Valkyrie'],
    fuel: ['Gasoline', 'Hybrid'],
    categories: { Vantage:'Coupe', DB12:'Coupe', DBS:'Coupe', DBX:'SUV', Valhalla:'Coupe', Valkyrie:'Coupe' },
    engines: { Vantage:'4.0L V8 Turbo', DB12:'4.0L V8 Turbo', DBS:'5.2L V12 Turbo', DBX:'4.0L V8 Turbo', Valhalla:'4.0L V8 Hybrid', Valkyrie:'6.5L V12 Hybrid' },
    hp: { Vantage:656, DB12:671, DBS:759, DBX:697, Valhalla:998, Valkyrie:1140 },
    trans: { Vantage:'8-speed Auto', DB12:'8-speed Auto', DBS:'8-speed Auto', DBX:'9-speed Auto', Valhalla:'8-speed DCT', Valkyrie:'7-speed DCT' },
    doors: { Vantage:2, DB12:2, DBS:2, DBX:5, Valhalla:2, Valkyrie:2 },
  },
  'Rolls-Royce': {
    models: ['Ghost', 'Phantom', 'Cullinan', 'Spectre', 'Dawn', 'Wraith'],
    fuel: ['Gasoline', 'Electric'],
    categories: { Ghost:'Sedan', Phantom:'Sedan', Cullinan:'SUV', Spectre:'Coupe', Dawn:'Convertible', Wraith:'Coupe' },
    engines: { Ghost:'6.75L V12', Phantom:'6.75L V12', Cullinan:'6.75L V12', Spectre:'Electric', Dawn:'6.6L V12', Wraith:'6.6L V12' },
    hp: { Ghost:591, Phantom:563, Cullinan:591, Spectre:577, Dawn:624, Wraith:624 },
    trans: { Ghost:'8-speed Auto', Phantom:'8-speed Auto', Cullinan:'8-speed Auto', Spectre:'Single-speed', Dawn:'8-speed Auto', Wraith:'8-speed Auto' },
    doors: { Ghost:4, Phantom:4, Cullinan:5, Spectre:2, Dawn:2, Wraith:2 },
  },
  Bentley: {
    models: ['Continental GT', 'Flying Spur', 'Bentayga', 'Bacalar'],
    fuel: ['Gasoline', 'Hybrid'],
    categories: { 'Continental GT':'Coupe', 'Flying Spur':'Sedan', Bentayga:'SUV', Bacalar:'Convertible' },
    engines: { 'Continental GT':'4.0L V8/6.0L W12', 'Flying Spur':'4.0L V8/6.0L W12', Bentayga:'4.0L V8/6.0L W12/3.0L Hybrid', Bacalar:'6.0L W12' },
    hp: { 'Continental GT':650, 'Flying Spur':650, Bentayga:650, Bacalar:650 },
    trans: { 'Continental GT':'8-speed DCT', 'Flying Spur':'8-speed DCT', Bentayga:'8-speed Auto', Bacalar:'8-speed DCT' },
    doors: { 'Continental GT':2, 'Flying Spur':4, Bentayga:5, Bacalar:2 },
  },
  Mini: {
    models: ['Cooper', 'Cooper S', 'Countryman', 'Clubman', 'Aceman', 'Electric'],
    fuel: ['Gasoline', 'Diesel', 'Electric'],
    categories: { Cooper:'Hatchback', 'Cooper S':'Hatchback', Countryman:'SUV', Clubman:'Wagon', Aceman:'SUV', Electric:'Hatchback' },
    engines: { Cooper:'1.5L Turbo', 'Cooper S':'2.0L Turbo', Countryman:'2.0L Turbo', Clubman:'2.0L Turbo', Aceman:'Electric', Electric:'Electric' },
    hp: { Cooper:134, 'Cooper S':189, Countryman:301, Clubman:301, Aceman:215, Electric:181 },
    trans: { Cooper:'7-speed DCT', 'Cooper S':'7-speed DCT', Countryman:'7-speed DCT', Clubman:'8-speed Auto', Aceman:'Single-speed', Electric:'Single-speed' },
    doors: { Cooper:3, 'Cooper S':3, Countryman:5, Clubman:5, Aceman:5, Electric:3 },
  },

  // --- FRENCH ---
  Peugeot: {
    models: ['208', '308', '408', '508', '2008', '3008', '5008', 'Landtrek', 'Partner', 'e-208', 'e-308'],
    fuel: ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Flex'],
    categories: { '208':'Hatchback', '308':'Hatchback', '408':'Sedan', '508':'Sedan', '2008':'SUV', '3008':'SUV', '5008':'SUV', Landtrek:'Pickup', Partner:'Van', 'e-208':'Hatchback', 'e-308':'Hatchback' },
    engines: { '208':'1.0L/1.2L Turbo', '308':'1.2L/1.6L Turbo', '408':'1.6L Turbo', '508':'1.6L Turbo', '2008':'1.2L/1.6L Turbo', '3008':'1.2L/1.6L Turbo', '5008':'1.6L Turbo', Landtrek:'1.9L/2.4L Diesel', Partner:'1.6L', 'e-208':'Electric', 'e-308':'Electric' },
    hp: { '208':130, '308':225, '408':225, '508':225, '2008':155, '3008':180, '5008':180, Landtrek:150, Partner:120, 'e-208':156, 'e-308':156 },
    trans: { '208':'6-speed Auto', '308':'8-speed Auto', '408':'8-speed Auto', '508':'8-speed Auto', '2008':'6-speed Auto', '3008':'8-speed Auto', '5008':'8-speed Auto', Landtrek:'6-speed Manual', Partner:'5-speed Manual', 'e-208':'Single-speed', 'e-308':'Single-speed' },
    doors: { '208':5, '308':5, '408':4, '508':4, '2008':5, '3008':5, '5008':5, Landtrek:4, Partner:5, 'e-208':5, 'e-308':5 },
  },
  Renault: {
    models: ['Clio', 'Megane', 'Arkana', 'Captur', 'Kadjar', 'Austral', 'Koleos', 'Zoe', 'Twingo', 'Duster', 'Oroch', 'Sandero', 'Logan', 'Kwid'],
    fuel: ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Flex'],
    categories: { Clio:'Hatchback', Megane:'Hatchback', Arkana:'SUV', Captur:'SUV', Kadjar:'SUV', Austral:'SUV', Koleos:'SUV', Zoe:'Hatchback', Twingo:'Hatchback', Duster:'SUV', Oroch:'Pickup', Sandero:'Hatchback', Logan:'Sedan', Kwid:'Hatchback' },
    engines: { Clio:'1.0L/1.6L Hybrid', Megane:'1.3L Turbo', Arkana:'1.3L Turbo Hybrid', Captur:'1.3L Turbo', Kadjar:'1.3L Turbo', Austral:'1.2L/1.3L Hybrid', Koleos:'1.3L/2.0L Turbo', Zoe:'Electric', Twingo:'1.0L', Duster:'1.6L/2.0L', Oroch:'1.6L/2.0L', Sandero:'1.0L/1.6L', Logan:'1.0L/1.6L', Kwid:'1.0L' },
    hp: { Clio:143, Megane:158, Arkana:158, Captur:158, Kadjar:158, Austral:200, Koleos:190, Zoe:135, Twingo:92, Duster:148, Oroch:148, Sandero:113, Logan:113, Kwid:71 },
    trans: { Clio:'CVT', Megane:'7-speed DCT', Arkana:'7-speed DCT', Captur:'7-speed DCT', Kadjar:'7-speed DCT', Austral:'CVT', Koleos:'CVT', Zoe:'Single-speed', Twingo:'5-speed Manual', Duster:'CVT', Oroch:'CVT', Sandero:'CVT', Logan:'CVT', Kwid:'5-speed Manual' },
    doors: { Clio:5, Megane:5, Arkana:5, Captur:5, Kadjar:5, Austral:5, Koleos:5, Zoe:5, Twingo:5, Duster:5, Oroch:4, Sandero:5, Logan:4, Kwid:5 },
  },
  Citroen: {
    models: ['C3', 'C4', 'C5 Aircross', 'C3 Aircross', 'Berlingo', 'Jumpy', 'Ami', 'e-C4'],
    fuel: ['Gasoline', 'Diesel', 'Electric', 'Flex'],
    categories: { C3:'Hatchback', C4:'Hatchback', 'C5 Aircross':'SUV', 'C3 Aircross':'SUV', Berlingo:'Van', Jumpy:'Van', Ami:'Microcar', 'e-C4':'Hatchback' },
    engines: { C3:'1.0L/1.2L Turbo', C4:'1.2L Turbo/1.5L Diesel', 'C5 Aircross':'1.6L Turbo', 'C3 Aircross':'1.2L Turbo', Berlingo:'1.6L', Jumpy:'1.5L/2.0L Diesel', Ami:'Electric', 'e-C4':'Electric' },
    hp: { C3:130, C4:130, 'C5 Aircross':180, 'C3 Aircross':130, Berlingo:120, Jumpy:177, Ami:8, 'e-C4':136 },
    trans: { C3:'6-speed Auto', C4:'8-speed Auto', 'C5 Aircross':'8-speed Auto', 'C3 Aircross':'6-speed Auto', Berlingo:'6-speed Manual', Jumpy:'8-speed Auto', Ami:'Single-speed', 'e-C4':'Single-speed' },
    doors: { C3:5, C4:5, 'C5 Aircross':5, 'C3 Aircross':5, Berlingo:5, Jumpy:5, Ami:2, 'e-C4':5 },
  },

  // --- CHINESE ---
  BYD: {
    models: ['Dolphin', 'Seal', 'Han', 'Atto 3', 'Song Plus', 'Tang', 'Yuan Plus', 'Seagull', 'Destroyer 05'],
    fuel: ['Electric', 'Hybrid'],
    categories: { Dolphin:'Hatchback', Seal:'Sedan', Han:'Sedan', 'Atto 3':'SUV', 'Song Plus':'SUV', Tang:'SUV', 'Yuan Plus':'SUV', Seagull:'Hatchback', 'Destroyer 05':'Sedan' },
    engines: { Dolphin:'Electric', Seal:'Electric', Han:'Electric/Hybrid', 'Atto 3':'Electric', 'Song Plus':'Electric/Hybrid', Tang:'Electric/Hybrid', 'Yuan Plus':'Electric', Seagull:'Electric', 'Destroyer 05':'Hybrid' },
    hp: { Dolphin:201, Seal:523, Han:517, 'Atto 3':201, 'Song Plus':201, Tang:517, 'Yuan Plus':201, Seagull:75, 'Destroyer 05':197 },
    trans: { Dolphin:'Single-speed', Seal:'Single-speed', Han:'Single-speed', 'Atto 3':'Single-speed', 'Song Plus':'Single-speed', Tang:'Single-speed', 'Yuan Plus':'Single-speed', Seagull:'Single-speed', 'Destroyer 05':'CVT' },
    doors: { Dolphin:5, Seal:4, Han:4, 'Atto 3':5, 'Song Plus':5, Tang:5, 'Yuan Plus':5, Seagull:5, 'Destroyer 05':4 },
  },
  GWM: {
    models: ['Haval H6', 'Haval Jolion', 'Ora 03', 'Tank 300', 'Tank 500', 'Poer'],
    fuel: ['Gasoline', 'Diesel', 'Hybrid', 'Electric'],
    categories: { 'Haval H6':'SUV', 'Haval Jolion':'SUV', 'Ora 03':'Hatchback', 'Tank 300':'SUV', 'Tank 500':'SUV', Poer:'Pickup' },
    engines: { 'Haval H6':'1.5L/2.0L Turbo', 'Haval Jolion':'1.5L Turbo', 'Ora 03':'Electric', 'Tank 300':'2.0L Turbo', 'Tank 500':'3.0L V6 Turbo', Poer:'2.0L Turbo/2.4L Diesel' },
    hp: { 'Haval H6':201, 'Haval Jolion':147, 'Ora 03':171, 'Tank 300':220, 'Tank 500':348, Poer:197 },
    trans: { 'Haval H6':'7-speed DCT', 'Haval Jolion':'7-speed DCT', 'Ora 03':'Single-speed', 'Tank 300':'8-speed Auto', 'Tank 500':'9-speed Auto', Poer:'8-speed Auto' },
    doors: { 'Haval H6':5, 'Haval Jolion':5, 'Ora 03':5, 'Tank 300':5, 'Tank 500':5, Poer:4 },
  },
  Chery: {
    models: ['Tiggo 5x', 'Tiggo 7 Pro', 'Tiggo 8 Pro', 'Arrizo 6', 'Omoda 5', 'iCar'],
    fuel: ['Gasoline', 'Electric', 'Hybrid', 'Flex'],
    categories: { 'Tiggo 5x':'SUV', 'Tiggo 7 Pro':'SUV', 'Tiggo 8 Pro':'SUV', 'Arrizo 6':'Sedan', 'Omoda 5':'SUV', iCar:'Hatchback' },
    engines: { 'Tiggo 5x':'1.5L Turbo', 'Tiggo 7 Pro':'1.5L/1.6L Turbo', 'Tiggo 8 Pro':'2.0L Turbo', 'Arrizo 6':'1.5L Turbo', 'Omoda 5':'1.5L/1.6L Turbo', iCar:'Electric' },
    hp: { 'Tiggo 5x':147, 'Tiggo 7 Pro':186, 'Tiggo 8 Pro':254, 'Arrizo 6':147, 'Omoda 5':197, iCar:61 },
    trans: { 'Tiggo 5x':'CVT', 'Tiggo 7 Pro':'7-speed DCT', 'Tiggo 8 Pro':'7-speed DCT', 'Arrizo 6':'CVT', 'Omoda 5':'7-speed DCT', iCar:'Single-speed' },
    doors: { 'Tiggo 5x':5, 'Tiggo 7 Pro':5, 'Tiggo 8 Pro':5, 'Arrizo 6':4, 'Omoda 5':5, iCar:3 },
  },

  // --- SWEDISH ---
  Volvo: {
    models: ['XC40', 'XC60', 'XC90', 'S60', 'S90', 'V60', 'V90', 'C40', 'EX30', 'EX90'],
    fuel: ['Gasoline', 'Diesel', 'Hybrid', 'Electric'],
    categories: { XC40:'SUV', XC60:'SUV', XC90:'SUV', S60:'Sedan', S90:'Sedan', V60:'Wagon', V90:'Wagon', C40:'SUV', EX30:'SUV', EX90:'SUV' },
    engines: { XC40:'2.0L Turbo/Electric', XC60:'2.0L Turbo/Plug-in Hybrid', XC90:'2.0L Turbo/Plug-in Hybrid', S60:'2.0L Turbo', S90:'2.0L Turbo/Plug-in Hybrid', V60:'2.0L Turbo', V90:'2.0L Turbo/Plug-in Hybrid', C40:'Electric', EX30:'Electric', EX90:'Electric' },
    hp: { XC40:248, XC60:455, XC90:455, S60:316, S90:455, V60:316, V90:455, C40:402, EX30:422, EX90:496 },
    trans: { XC40:'8-speed Auto', XC60:'8-speed Auto', XC90:'8-speed Auto', S60:'8-speed Auto', S90:'8-speed Auto', V60:'8-speed Auto', V90:'8-speed Auto', C40:'Single-speed', EX30:'Single-speed', EX90:'Single-speed' },
    doors: { XC40:5, XC60:5, XC90:5, S60:4, S90:4, V60:5, V90:5, C40:5, EX30:5, EX90:5 },
  },

  // --- INDIAN ---
  'Tata Motors': {
    models: ['Nexon', 'Harrier', 'Safari', 'Punch', 'Altroz', 'Tiago', 'Tigor'],
    fuel: ['Gasoline', 'Diesel', 'Electric'],
    categories: { Nexon:'SUV', Harrier:'SUV', Safari:'SUV', Punch:'SUV', Altroz:'Hatchback', Tiago:'Hatchback', Tigor:'Sedan' },
    engines: { Nexon:'1.2L Turbo/1.5L Diesel/Electric', Harrier:'2.0L Diesel', Safari:'2.0L Diesel', Punch:'1.2L', Altroz:'1.2L/1.5L Diesel', Tiago:'1.2L/CNG', Tigor:'1.2L/CNG' },
    hp: { Nexon:118, Harrier:168, Safari:168, Punch:86, Altroz:108, Tiago:86, Tigor:86 },
    trans: { Nexon:'6-speed Manual', Harrier:'6-speed Auto', Safari:'6-speed Auto', Punch:'5-speed Manual', Altroz:'6-speed Manual', Tiago:'5-speed Manual', Tigor:'5-speed Manual' },
    doors: { Nexon:5, Harrier:5, Safari:5, Punch:5, Altroz:5, Tiago:5, Tigor:4 },
  },
};

// Generate cars for each brand, model, and year range
const yearsRange = [];
for (let y = 1990; y <= 2026; y++) {
  yearsRange.push(y);
}

const transaction = db.transaction(() => {
  for (const [brandName, brandData] of Object.entries(brands)) {
    for (const modelName of brandData.models) {
      // Each model gets a range of years (not all models exist in all years)
      const category = brandData.categories[modelName] || 'Sedan';
      const engine = brandData.engines[modelName] || '2.0L';
      const hp = brandData.hp[modelName] || 150;
      const trans = brandData.trans[modelName] || 'Automatic';
      const doors = brandData.doors[modelName] || 4;

      // Assign plausible year ranges for each model based on typical lifecycle
      let modelStartYear, modelEndYear;
      if (brandName === 'BYD' || brandName === 'GWM' || brandName === 'Chery') {
        modelStartYear = 2015;
      } else if (brandName === 'Tesla') {
        modelStartYear = modelName === 'Cybertruck' ? 2024 : (modelName === 'Model Y' ? 2020 : (modelName === 'Model 3' ? 2017 : 2012));
      } else if (brandName === 'Genesis') {
        modelStartYear = 2017;
      } else if (['Ferrari', 'Lamborghini', 'Maserati', 'Aston Martin', 'Rolls-Royce', 'Bentley'].includes(brandName)) {
        modelStartYear = 2005;
      } else if (brandName === 'Tata Motors') {
        modelStartYear = 2010;
      } else {
        modelStartYear = 1995 + Math.floor(Math.random() * 10);
      }
      modelEndYear = 2026;

      // Pick 5-8 representative years (not all years to keep DB manageable)
      const availableYears = yearsRange.filter(y => y >= modelStartYear && y <= modelEndYear);
      const selectedYears = [];
      const step = Math.max(1, Math.floor(availableYears.length / 6));
      for (let i = 0; i < availableYears.length; i += step) {
        selectedYears.push(availableYears[i]);
        if (selectedYears.length >= 7) break;
      }
      // Always include latest
      if (!selectedYears.includes(2025)) selectedYears.push(2025);
      if (!selectedYears.includes(2026)) selectedYears.push(2026);

      for (const year of selectedYears) {
        // Pick a fuel type relevant to the brand and year
        let fuelOptions = brandData.fuel;
        // Electric cars shouldn't exist before ~2010
        if (year < 2010) {
          fuelOptions = fuelOptions.filter(f => f !== 'Electric' && f !== 'Hybrid');
        }
        const fuel = fuelOptions[Math.floor(Math.random() * fuelOptions.length)];

        insertCar.run(
          brandName,
          modelName,
          year,
          fuel,
          engine,
          hp,
          trans,
          doors,
          category,
          img(brandName, modelName, year)
        );
      }
    }
  }
});

transaction();

const count = db.prepare('SELECT COUNT(*) as count FROM cars').get();
console.log(`✅ Database seeded with ${count.count} cars!`);
