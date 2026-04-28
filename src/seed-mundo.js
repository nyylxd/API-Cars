const db = require('./database');

const img = (t) => `https://placehold.co/800x500/1a1a2e/e94560?text=${encodeURIComponent(t.substring(0,40))}`;

const insert = db.prepare(`
  INSERT INTO cars (brand,model,year,fuel_type,engine,power_hp,transmission,doors,category,
    engine_cc,price_usd,image_url,source,is_brazilian,flex_fuel,generation,description,color,vehicle_type)
  VALUES (?,?,?,?,?,?,?,?,?, ?,?,?,?, 0,0,?,?,?,?)
`);

const colors = ['Black','White','Silver','Red','Blue','Gray','Green','Yellow','Orange'];

function add(entries) {
  for (const [brand,model,ys,ye,fuel,eng,hp,trans,doors,cat,cc,price,gen,desc,vtype,country] of entries) {
    const step = Math.max(1, Math.floor((ye - ys) / 5) || 1);
    for (let y = ys; y <= Math.min(ye, 2026); y += step) {
      insert.run(brand,model,y,fuel,eng,hp,trans,doors,cat,cc||null,price||5000,img(`${brand} ${model}`),'mundo-seed',gen,`${desc} (${country})`,colors[y%9],vtype);
    }
  }
}

// ============ 1. AMERICAS CARS (US, Canada, Mexico) ============
const americasCars = [
  // --- CADILLAC (USA luxury) ---
  ['Cadillac','Eldorado',1953,2002,'Gasoline','6.4L/8.2L V8',345,'Automatic',2,'Coupe',8200,12000,'Eldorado','Ícone do luxo americano. Motor V8 potente, design com rabo de peixe.','car','USA'],
  ['Cadillac','DeVille',1959,2005,'Gasoline','6.4L/7.0L V8',275,'Automatic',4,'Sedan',7000,8000,'DeVille','Sedan de luxo full-size. Bancos de couro, suspensão macia.','car','USA'],
  ['Cadillac','Escalade',1999,2026,'Gasoline','6.2L V8',420,'Automatic',4,'SUV',6200,40000,'Escalade','SUV de luxo imponente. Até 8 lugares, motor V8 6.2L.','car','USA'],
  ['Cadillac','CT5',2020,2026,'Gasoline','2.0L Turbo/6.2L V8',668,'Automatic',4,'Sedan',6200,35000,'CT5','Sedan esportivo. Versão CT5-V Blackwing com 668cv.','car','USA'],
  ['Cadillac','Lyriq',2022,2026,'Electric','Elétrico 500cv',500,'Automatic',4,'SUV',0,45000,'Lyriq','SUV elétrico de luxo. Autonomia de 500km.','car','USA'],

  // --- LINCOLN (USA luxury) ---
  ['Lincoln','Continental',1939,2020,'Gasoline','3.0L/5.0L V8',400,'Automatic',4,'Sedan',5000,15000,'Continental','Sedan presidencial. Portas suicidas no modelo 1961.','car','USA'],
  ['Lincoln','Navigator',1998,2026,'Gasoline','3.5L V6 Twin-Turbo',450,'Automatic',4,'SUV',3500,50000,'Navigator','SUV de luxo tamanho máximo. 7 lugares.','car','USA'],
  ['Lincoln','Aviator',2020,2026,'Hybrid','3.0L V6 PHEV',494,'Automatic',4,'SUV',3000,45000,'Aviator','SUV híbrido plug-in de luxo. Motor biturbo.','car','USA'],

  // --- CHRYSLER (USA) ---
  ['Chrysler','300',2005,2023,'Gasoline','5.7L/6.4L HEMI V8',485,'Automatic',4,'Sedan',6400,18000,'300/300C','Sedan full-size com motor HEMI. Design imponente.','car','USA'],
  ['Chrysler','Pacifica',2017,2026,'Hybrid','3.6L V6 PHEV',287,'Automatic',4,'Minivan',3600,30000,'Pacifica','Minivan híbrida. Portas deslizantes, Stow n Go.','car','USA'],
  ['Chrysler','PT Cruiser',2000,2010,'Gasoline','2.4L 4-cil',150,'Automatic',4,'Hatchback',2429,6000,'PT Cruiser','Design retro. Espaço interno versátil.','car','USA'],

  // --- DODGE (expand beyond Dart/Charger from BR seed) ---
  ['Dodge','Challenger',2008,2023,'Gasoline','6.2L HEMI V8',807,'Automatic',2,'Coupe',6200,35000,'Challenger','Muscle car moderno. Hellcat com 807cv.','car','USA'],
  ['Dodge','Charger',2006,2023,'Gasoline','6.2L HEMI V8',807,'Automatic',4,'Sedan',6200,35000,'Charger','Sedan muscle. Motor HEMI Hellcat 6.2L supercharged.','car','USA'],
  ['Dodge','Durango',1998,2026,'Gasoline','6.4L HEMI V8',475,'Automatic',4,'SUV',6400,30000,'Durango','SUV de 7 lugares com motor HEMI.','car','USA'],
  ['Dodge','Ram 1500',1981,2026,'Diesel','5.7L/6.7L Cummins',395,'Automatic',4,'Pickup',6700,25000,'Ram','Picape full-size. Motor Cummins diesel.','car','USA'],
  ['Dodge','Viper',1992,2017,'Gasoline','8.4L V10',645,'Manual',2,'Coupe',8400,45000,'Viper','Superesportivo americano. Motor V10 8.4L.','car','USA'],

  // --- BUICK (USA) ---
  ['Buick','Enclave',2008,2026,'Gasoline','3.6L V6',310,'Automatic',4,'SUV',3600,25000,'Enclave','SUV de luxo 7 lugares.','car','USA'],
  ['Buick','Encore',2013,2026,'Gasoline','1.4L Turbo',155,'Automatic',4,'SUV',1400,18000,'Encore','SUV compacto de luxo.','car','USA'],

  // --- GMC (USA professional grade) ---
  ['GMC','Sierra 1500',1999,2026,'Diesel','6.6L Duramax',445,'Automatic',4,'Pickup',6600,30000,'Sierra','Picape premium. Motor Duramax diesel.','car','USA'],
  ['GMC','Yukon',1992,2026,'Gasoline','6.2L V8',420,'Automatic',4,'SUV',6200,35000,'Yukon','SUV de luxo full-size.','car','USA'],
  ['GMC','Hummer EV',2022,2026,'Electric','Elétrico 1000cv',1000,'Automatic',4,'SUV',0,55000,'Hummer EV','SUV elétrico monstro. Modo CrabWalk.','car','USA'],

  // --- TESLA (expand) ---
  ['Tesla','Model 3',2017,2026,'Electric','Elétrico 283cv',283,'Automatic',4,'Sedan',0,25000,'Model 3','Sedan elétrico mais vendido do mundo.','car','USA'],
  ['Tesla','Model Y',2020,2026,'Electric','Elétrico 384cv',384,'Automatic',4,'SUV',0,30000,'Model Y','SUV elétrico mais vendido globalmente.','car','USA'],
  ['Tesla','Cybertruck',2024,2026,'Electric','Elétrico 845cv',845,'Automatic',4,'Pickup',0,45000,'Cybertruck','Picape elétrica futurista. Aço inoxidável.','car','USA'],

  // --- RIVIAN (USA electric) ---
  ['Rivian','R1T',2022,2026,'Electric','Elétrico 835cv',835,'Automatic',4,'Pickup',0,40000,'R1T','Picape elétrica premium. Motor quádruplo.','car','USA'],
  ['Rivian','R1S',2022,2026,'Electric','Elétrico 835cv',835,'Automatic',4,'SUV',0,42000,'R1S','SUV elétrico 7 lugares.','car','USA'],

  // --- LUCID (USA electric luxury) ---
  ['Lucid','Air',2022,2026,'Electric','Elétrico 1111cv',1111,'Automatic',4,'Sedan',0,55000,'Air','Sedan elétrico de luxo. 0-100 em 2.5s. 830km autonomia.','car','USA'],

  // --- PONTIAC (USA, defunct) ---
  ['Pontiac','GTO',1964,2006,'Gasoline','6.0L V8',400,'Manual',2,'Coupe',6000,12000,'GTO','Primeiro muscle car. Motor 389 V8.','car','USA'],
  ['Pontiac','Firebird',1967,2002,'Gasoline','5.7L V8',325,'Automatic',2,'Coupe',5700,10000,'Firebird','Muscle car com motor V8. Versão Trans Am icônica.','car','USA'],
  ['Pontiac','Trans Am',1969,2002,'Gasoline','6.6L V8',345,'Automatic',2,'Coupe',6600,15000,'Trans Am','Versão top do Firebird. Teto T-Top.','car','USA'],

  // --- PLYMOUTH (USA, defunct) ---
  ['Plymouth','Barracuda',1964,1974,'Gasoline','7.0L HEMI V8',425,'Manual',2,'Coupe',7000,25000,'Barracuda','Muscle car. Motor HEMI 426. Um dos mais valiosos.','car','USA'],
  ['Plymouth','Road Runner',1968,1980,'Gasoline','7.0L HEMI V8',425,'Manual',2,'Coupe',7000,20000,'Road Runner','Muscle car acessível. Buzina "beep beep".','car','USA'],

  // --- OLDSMOBILE (USA, defunct) ---
  ['Oldsmobile','Cutlass',1961,1999,'Gasoline','5.7L V8',310,'Automatic',2,'Coupe',5700,6000,'Cutlass','Um dos carros mais vendidos dos EUA nos anos 70.','car','USA'],
  ['Oldsmobile','442',1964,1991,'Gasoline','7.5L V8',390,'Manual',2,'Coupe',7500,12000,'442','Muscle car clássico. Motor 455 V8.','car','USA'],

  // --- SHELBY (USA performance) ---
  ['Shelby','Cobra',1962,1967,'Gasoline','7.0L V8',485,'Manual',2,'Roadster',7000,750000,'Cobra 427','Um dos carros mais valiosos do mundo. Motor 427.','car','USA'],
  ['Shelby','GT500',1967,2022,'Gasoline','5.2L V8 Supercharged',760,'Automatic',2,'Coupe',5200,40000,'GT500','Mustang Shelby. Motor Predator supercharged.','car','USA'],

  // --- CHEVROLET CORVETTE (iconic US sports car) ---
  ['Chevrolet','Corvette',1953,2026,'Gasoline','6.2L V8',495,'Automatic',2,'Coupe',6200,35000,'Corvette C1-C8','O esportivo americano. Motor central a partir do C8.','car','USA'],
  ['Chevrolet','Corvette Z06',1963,2026,'Gasoline','5.5L V8',670,'Automatic',2,'Coupe',5500,55000,'Corvette Z06','Versão de pista do Corvette.','car','USA'],

  // --- FORD GT / MUSTANG ---
  ['Ford','GT',2005,2022,'Gasoline','3.5L V6 EcoBoost',660,'Automatic',2,'Coupe',3500,250000,'Ford GT','Supercarro americano. Motor EcoBoost V6 biturbo.','car','USA'],
  ['Ford','Mustang',1964,2026,'Gasoline','5.0L V8',480,'Automatic',2,'Coupe',5000,20000,'Mustang','O pony car original. Motor V8 Coyote.','car','USA'],
  ['Ford','Mustang Mach-E',2020,2026,'Electric','Elétrico 480cv',480,'Automatic',4,'SUV',0,25000,'Mach-E','SUV elétrico com nome Mustang.','car','USA'],
  ['Ford','Bronco',1966,2026,'Gasoline','2.7L V6 EcoBoost',330,'Automatic',2,'SUV',2700,25000,'Bronco','SUV off-road. Concorrente do Jeep Wrangler.','car','USA'],
  ['Ford','Explorer',1990,2026,'Gasoline','3.0L V6 EcoBoost',400,'Automatic',4,'SUV',3000,20000,'Explorer','SUV familiar americano. 7 lugares.','car','USA'],
  ['Ford','Expedition',1997,2026,'Gasoline','3.5L V6 EcoBoost',440,'Automatic',4,'SUV',3500,30000,'Expedition','SUV full-size. Até 8 lugares.','car','USA'],

  // --- JEEP (expand US models) ---
  ['Jeep','Wrangler',1986,2026,'Gasoline','3.6L V6',285,'Manual',2,'SUV',3600,23000,'Wrangler','O Jeep original. Capota removível, portas removíveis.','car','USA'],
  ['Jeep','Grand Cherokee',1993,2026,'Gasoline','5.7L/6.4L V8',475,'Automatic',4,'SUV',6400,30000,'Grand Cherokee','SUV médio de luxo. Motor V8 HEMI.','car','USA'],
  ['Jeep','Gladiator',2019,2026,'Diesel','3.0L V6 EcoDiesel',260,'Automatic',4,'Pickup',3000,28000,'Gladiator','Picape Jeep. Única picape conversível.','car','USA'],
  ['Jeep','Wagoneer',2022,2026,'Gasoline','6.4L V8',471,'Automatic',4,'SUV',6400,50000,'Wagoneer','SUV de luxo máximo. Até 8 lugares.','car','USA'],

  // --- RAM (USA trucks, spun off from Dodge) ---
  ['RAM','1500',2010,2026,'Diesel','5.7L/6.7L Cummins',420,'Automatic',4,'Pickup',6700,28000,'1500','Picape full-size premium. Suspensão a ar.','car','USA'],
  ['RAM','2500',2010,2026,'Diesel','6.7L Cummins Turbo',420,'Automatic',4,'Pickup',6700,35000,'2500 Heavy Duty','Picape pesada. Motor Cummins 6.7L.','car','USA'],
  ['RAM','3500',2010,2026,'Diesel','6.7L Cummins HO',420,'Automatic',4,'Pickup',6700,40000,'3500 Heavy Duty','Picape super pesada. Capacidade de reboque 16 ton.','car','USA'],
  ['RAM','TRX',2021,2026,'Gasoline','6.2L HEMI V8',702,'Automatic',4,'Pickup',6200,50000,'TRX','Picape esportiva. Motor Hellcat 702cv.','car','USA'],

  // --- ARGENTINA CARS ---
  ['Ford','Falcon',1962,1991,'Gasoline','3.6L 6-cil',132,'Manual',4,'Sedan',3600,4000,'Falcon Argentina','Sedan icônico argentino. Produção de 30 anos.','car','Argentina'],
  ['Renault','Torino',1966,1981,'Gasoline','3.8L 6-cil',215,'Manual',2,'Coupe','Torino','Esportivo argentino. Baseado no AMC Rambler.','car','Argentina'],
  ['IKA','Torino',1966,1975,'Gasoline','3.0L/3.8L 6-cil',215,'Manual',2,'Coupe','IKA Torino','IKA = Industrias Kaiser Argentina. Motor Tornado.','car','Argentina'],
  ['IKA','Estanciera',1957,1979,'Gasoline','2.5L 4-cil',77,'Manual',4,'Wagon',2500,2500,'Estanciera','Utilitário argentino. Versão rural do Kaiser Jeep.','car','Argentina'],

  // --- MEXICO CARS ---
  ['VUHL','05',2016,2026,'Gasoline','2.3L EcoBoost',400,'Manual',2,'Coupe',2300,45000,'05','Supercarro mexicano. Motor Ford EcoBoost. Fibra de carbono.','car','Mexico'],
  ['Mastretta','MXT',2011,2019,'Gasoline','2.0L Turbo',250,'Manual',2,'Coupe',2000,25000,'MXT','Esportivo mexicano. Motor Ford Duratec turbo.','car','Mexico'],

  // --- CANADA ---
  ['BRP','Can-Am Spyder',2007,2026,'Gasoline','1.3L Rotax',115,'Automatic',0,'Trike',1330,12000,'Spyder','Trike canadense. Motor Rotax. 3 rodas.','car','Canada'],
  ['BRP','Can-Am Ryker',2019,2026,'Gasoline','0.9L Rotax',82,'Automatic',0,'Trike',900,8000,'Ryker','Trike acessível. Motor Rotax 900.','car','Canada'],
];

// ============ 2. MOTORCYCLES ============
const motorcycles = [
  // --- HONDA ---
  ['Honda','CG 125',1976,2026,'Gasoline','0.125L 1-cil',11,'Manual',0,'Street',125,1200,'CG 125','Moto mais vendida do Brasil. Motor 4 tempos indestrutível.','motorcycle','Japan'],
  ['Honda','CB 300R',2010,2026,'Gasoline','0.3L 1-cil',31,'Manual',0,'Naked',300,4000,'CB 300R','Naked urbana. Motor monocilíndrico.','motorcycle','Japan'],
  ['Honda','CB 500F',2013,2026,'Gasoline','0.5L 2-cil',47,'Manual',0,'Naked',500,5500,'CB 500F','Naked média. Motor bicilíndrico paralelo.','motorcycle','Japan'],
  ['Honda','CB 650R',2019,2026,'Gasoline','0.65L 4-cil',95,'Manual',0,'Naked',650,8000,'CB 650R','Neo Sports Café. Motor 4 cilindros.','motorcycle','Japan'],
  ['Honda','CBR 600RR',2003,2026,'Gasoline','0.6L 4-cil',120,'Manual',0,'Sport',600,9000,'CBR 600RR','Superesportiva. Motor 4 cilindros.','motorcycle','Japan'],
  ['Honda','CBR 1000RR-R',2004,2026,'Gasoline','1.0L 4-cil',215,'Manual',0,'Sport',1000,20000,'CBR 1000RR-R','Fireblade. Superbike topo de linha.','motorcycle','Japan'],
  ['Honda','Africa Twin',2016,2026,'Gasoline','1.1L 2-cil',101,'Manual',0,'Adventure',1100,12000,'Africa Twin','Big trail. Motor bicilíndrico.','motorcycle','Japan'],
  ['Honda','Gold Wing',1975,2026,'Gasoline','1.8L 6-cil',125,'Automatic',0,'Touring',1833,22000,'Gold Wing','Tourer de luxo. Motor 6 cilindros boxer.','motorcycle','Japan'],
  ['Honda','XRE 300',2009,2026,'Gasoline','0.3L 1-cil',25,'Manual',0,'Adventure',300,3500,'XRE 300','Trail urbana. Motor flex (Brasil).','motorcycle','Japan'],
  ['Honda','PCX',2010,2026,'Gasoline','0.16L 1-cil',16,'Automatic',0,'Scooter',160,2800,'PCX','Scooter premium. Câmbio CVT.','motorcycle','Japan'],
  ['Honda','Biz',1998,2026,'Gasoline','0.125L 1-cil',9,'Automatic',0,'Scooter',125,1500,'Biz','Cub mais vendida do Brasil.','motorcycle','Japan'],
  ['Honda','CB 1000R',2008,2026,'Gasoline','1.0L 4-cil',145,'Manual',0,'Naked',1000,11000,'CB 1000R','Naked de alta performance.','motorcycle','Japan'],

  // --- YAMAHA ---
  ['Yamaha','MT-03',2016,2026,'Gasoline','0.32L 2-cil',42,'Manual',0,'Naked',321,4500,'MT-03','Naked esportiva. Motor bicilíndrico.','motorcycle','Japan'],
  ['Yamaha','MT-07',2014,2026,'Gasoline','0.69L 2-cil',73,'Manual',0,'Naked',689,7000,'MT-07','Naked média. Motor CP2 crossplane.','motorcycle','Japan'],
  ['Yamaha','MT-09',2014,2026,'Gasoline','0.89L 3-cil',119,'Manual',0,'Naked',890,9500,'MT-09','Naked de alta performance. Motor CP3.','motorcycle','Japan'],
  ['Yamaha','MT-10',2016,2026,'Gasoline','1.0L 4-cil',165,'Manual',0,'Naked',998,13000,'MT-10','Hyper naked. Motor R1 crossplane.','motorcycle','Japan'],
  ['Yamaha','YZF-R1',1998,2026,'Gasoline','1.0L 4-cil',200,'Manual',0,'Sport',998,17000,'YZF-R1','Superbike. Motor crossplane 4 cilindros.','motorcycle','Japan'],
  ['Yamaha','YZF-R6',1999,2020,'Gasoline','0.6L 4-cil',118,'Manual',0,'Sport',599,8000,'YZF-R6','Superesportiva 600cc.','motorcycle','Japan'],
  ['Yamaha','YZF-R3',2015,2026,'Gasoline','0.32L 2-cil',42,'Manual',0,'Sport',321,5000,'YZF-R3','Esportiva de entrada.','motorcycle','Japan'],
  ['Yamaha','Ténéré 700',2019,2026,'Gasoline','0.69L 2-cil',73,'Manual',0,'Adventure',689,10000,'Ténéré 700','Big trail. Motor CP2.','motorcycle','Japan'],
  ['Yamaha','XMAX',2018,2026,'Gasoline','0.3L 1-cil',28,'Automatic',0,'Scooter',300,5000,'XMAX','Scooter premium esportivo.','motorcycle','Japan'],
  ['Yamaha','Factor 125',2008,2026,'Gasoline','0.125L 1-cil',11,'Manual',0,'Street',125,1500,'Factor','Moto de entrada. Econômica.','motorcycle','Japan'],
  ['Yamaha','Fazer 250',2005,2026,'Gasoline','0.25L 1-cil',21,'Manual',0,'Naked',250,3000,'Fazer 250','Naked de entrada. Motor flex (Brasil).','motorcycle','Japan'],

  // --- KAWASAKI ---
  ['Kawasaki','Ninja 400',2018,2026,'Gasoline','0.4L 2-cil',45,'Manual',0,'Sport',399,5500,'Ninja 400','Esportiva de entrada. Motor bicilíndrico.','motorcycle','Japan'],
  ['Kawasaki','Ninja ZX-6R',1995,2026,'Gasoline','0.636L 4-cil',128,'Manual',0,'Sport',636,11000,'ZX-6R','Superesportiva 636cc.','motorcycle','Japan'],
  ['Kawasaki','Ninja ZX-10R',2004,2026,'Gasoline','1.0L 4-cil',203,'Manual',0,'Sport',998,17000,'ZX-10R','Superbike. Motor 4 cilindros.','motorcycle','Japan'],
  ['Kawasaki','Z400',2019,2026,'Gasoline','0.4L 2-cil',45,'Manual',0,'Naked',399,5000,'Z400','Naked esportiva.','motorcycle','Japan'],
  ['Kawasaki','Z650',2017,2026,'Gasoline','0.65L 2-cil',68,'Manual',0,'Naked',649,7000,'Z650','Naked média.','motorcycle','Japan'],
  ['Kawasaki','Z900',2017,2026,'Gasoline','0.95L 4-cil',125,'Manual',0,'Naked',948,9000,'Z900','Naked de alta performance.','motorcycle','Japan'],
  ['Kawasaki','Z H2',2020,2026,'Gasoline','1.0L 4-cil Supercharged',200,'Manual',0,'Naked',998,18000,'Z H2','Hyper naked supercharged.','motorcycle','Japan'],

  // --- SUZUKI ---
  ['Suzuki','GSX-R1000',2001,2026,'Gasoline','1.0L 4-cil',202,'Manual',0,'Sport',999,16000,'GSX-R1000','Superbike. Motor 4 cilindros.','motorcycle','Japan'],
  ['Suzuki','Hayabusa',1999,2026,'Gasoline','1.34L 4-cil',190,'Manual',0,'Sport',1340,15000,'Hayabusa','Moto mais rápida do mundo por 10 anos.','motorcycle','Japan'],
  ['Suzuki','V-Strom 650',2004,2026,'Gasoline','0.65L V2',70,'Manual',0,'Adventure',645,8000,'V-Strom 650','Big trail. Motor V-Twin.','motorcycle','Japan'],
  ['Suzuki','V-Strom 1050',2020,2026,'Gasoline','1.05L V2',107,'Manual',0,'Adventure',1037,12000,'V-Strom 1050','Big trail premium.','motorcycle','Japan'],
  ['Suzuki','DR-Z400',2000,2026,'Gasoline','0.4L 1-cil',40,'Manual',0,'Dirt',398,5500,'DR-Z400','Moto de trilha e supermoto.','motorcycle','Japan'],

  // --- HARLEY-DAVIDSON (USA) ---
  ['Harley-Davidson','Sportster',1957,2022,'Gasoline','1.2L V2 Evolution',70,'Manual',0,'Cruiser',1202,8000,'Sportster','Motor Evolution. A Harley de entrada por décadas.','motorcycle','USA'],
  ['Harley-Davidson','Softail',1984,2026,'Gasoline','1.75L V2 Milwaukee-Eight',95,'Manual',0,'Cruiser',1746,16000,'Softail','Motor Milwaukee-Eight. Visual clássico.','motorcycle','USA'],
  ['Harley-Davidson','Road King',1994,2026,'Gasoline','1.75L V2 Milwaukee-Eight',95,'Manual',0,'Touring',1746,20000,'Road King','Tourer clássica com alforges.','motorcycle','USA'],
  ['Harley-Davidson','Street Glide',2006,2026,'Gasoline','1.75L V2 Milwaukee-Eight',95,'Manual',0,'Touring',1746,25000,'Street Glide','Tourer com fairing batwing.','motorcycle','USA'],
  ['Harley-Davidson','Fat Boy',1990,2026,'Gasoline','1.75L V2 Milwaukee-Eight',95,'Manual',0,'Cruiser',1746,18000,'Fat Boy','Ícone custom. Rodas sólidas.','motorcycle','USA'],
  ['Harley-Davidson','Pan America',2021,2026,'Gasoline','1.25L V2 Revolution Max',150,'Manual',0,'Adventure',1250,18000,'Pan America','A primeira big trail da Harley.','motorcycle','USA'],
  ['Harley-Davidson','LiveWire',2019,2026,'Electric','Elétrico 105cv',105,'Automatic',0,'Naked',0,25000,'LiveWire','Primeira elétrica Harley-Davidson.','motorcycle','USA'],

  // --- INDIAN (USA) ---
  ['Indian','Scout',2015,2026,'Gasoline','1.2L V2',100,'Manual',0,'Cruiser',1200,12000,'Scout','Cruiser de entrada Indian. Motor V-Twin.','motorcycle','USA'],
  ['Indian','Chief',2014,2026,'Gasoline','1.9L V2 Thunderstroke',120,'Manual',0,'Cruiser',1890,18000,'Chief','Motor Thunderstroke 116. Visual clássico.','motorcycle','USA'],
  ['Indian','Challenger',2020,2026,'Gasoline','1.8L V2 PowerPlus',122,'Manual',0,'Touring',1769,28000,'Challenger','Tourer com fairing fixo. Motor PowerPlus.','motorcycle','USA'],

  // --- BMW MOTORRAD (Germany) ---
  ['BMW','R 1250 GS',2019,2026,'Gasoline','1.25L 2-cil Boxer',136,'Manual',0,'Adventure',1254,18000,'R 1250 GS','A big trail referência. Motor boxer.','motorcycle','Germany'],
  ['BMW','S 1000 RR',2009,2026,'Gasoline','1.0L 4-cil',207,'Manual',0,'Sport',999,19000,'S 1000 RR','Superbike alemã. Motor 4 cilindros.','motorcycle','Germany'],
  ['BMW','R 18',2020,2026,'Gasoline','1.8L 2-cil Boxer',91,'Manual',0,'Cruiser',1802,18000,'R 18','Cruiser com o maior motor boxer da BMW.','motorcycle','Germany'],
  ['BMW','F 850 GS',2018,2026,'Gasoline','0.85L 2-cil',95,'Manual',0,'Adventure',853,12000,'F 850 GS','Big trail média. Motor bicilíndrico.','motorcycle','Germany'],

  // --- DUCATI (Italy) ---
  ['Ducati','Panigale V4',2018,2026,'Gasoline','1.1L V4',216,'Manual',0,'Sport',1103,25000,'Panigale V4','Superbike italiana. Motor V4.','motorcycle','Italy'],
  ['Ducati','Monster',1993,2026,'Gasoline','0.94L V2 Testastretta',111,'Manual',0,'Naked',937,11000,'Monster','Naked icônica. Motor L-Twin.','motorcycle','Italy'],
  ['Ducati','Multistrada V4',2021,2026,'Gasoline','1.16L V4',170,'Manual',0,'Adventure',1158,22000,'Multistrada V4','Big trail premium. Motor V4.','motorcycle','Italy'],
  ['Ducati','Scrambler',2015,2026,'Gasoline','0.8L V2',73,'Manual',0,'Scrambler',803,9000,'Scrambler','Estilo retrô. Motor L-Twin.','motorcycle','Italy'],
  ['Ducati','Streetfighter V4',2020,2026,'Gasoline','1.1L V4',208,'Manual',0,'Naked',1103,22000,'Streetfighter V4','Hyper naked. Motor Panigale V4.','motorcycle','Italy'],
  ['Ducati','Diavel',2011,2026,'Gasoline','1.16L V2 Testastretta',162,'Manual',0,'Cruiser',1158,20000,'Diavel','Muscle cruiser italiana.','motorcycle','Italy'],

  // --- KTM (Austria) ---
  ['KTM','Duke 390',2013,2026,'Gasoline','0.37L 1-cil',44,'Manual',0,'Naked',373,5000,'Duke 390','Naked esportiva. Motor monocilíndrico.','motorcycle','Austria'],
  ['KTM','Duke 790',2018,2026,'Gasoline','0.8L 2-cil',105,'Manual',0,'Naked',799,9000,'Duke 790','Naked média. Motor bicilíndrico LC8c.','motorcycle','Austria'],
  ['KTM','Super Duke 1290',2014,2026,'Gasoline','1.3L V2',180,'Manual',0,'Naked',1301,18000,'Super Duke 1290','Hyper naked. "The Beast".','motorcycle','Austria'],
  ['KTM','Adventure 390',2020,2026,'Gasoline','0.37L 1-cil',43,'Manual',0,'Adventure',373,6000,'390 Adventure','Trail de entrada.','motorcycle','Austria'],

  // --- TRIUMPH (UK) ---
  ['Triumph','Bonneville',1959,2026,'Gasoline','1.2L 2-cil',80,'Manual',0,'Classic',1200,10000,'Bonneville','Ícone britânico. Motor bicilíndrico paralelo.','motorcycle','UK'],
  ['Triumph','Street Triple',2007,2026,'Gasoline','0.765L 3-cil',121,'Manual',0,'Naked',765,10000,'Street Triple','Naked esportiva. Motor 3 cilindros.','motorcycle','UK'],
  ['Triumph','Tiger 900',2020,2026,'Gasoline','0.89L 3-cil',95,'Manual',0,'Adventure',888,14000,'Tiger 900','Big trail. Motor tricilíndrico.','motorcycle','UK'],
  ['Triumph','Rocket 3',2019,2026,'Gasoline','2.5L 3-cil',167,'Manual',0,'Cruiser',2458,23000,'Rocket 3','Maior motor de moto em produção. 2500cc.','motorcycle','UK'],

  // --- ROYAL ENFIELD (India) ---
  ['Royal Enfield','Classic 350',2009,2026,'Gasoline','0.35L 1-cil',20,'Manual',0,'Classic',349,4000,'Classic 350','Estilo retrô. Motor monocilíndrico.','motorcycle','India'],
  ['Royal Enfield','Interceptor 650',2018,2026,'Gasoline','0.65L 2-cil',47,'Manual',0,'Classic',648,6000,'Interceptor 650','Motor bicilíndrico paralelo.','motorcycle','India'],
  ['Royal Enfield','Himalayan',2016,2026,'Gasoline','0.41L 1-cil',24,'Manual',0,'Adventure',411,4500,'Himalayan','Trail de entrada.','motorcycle','India'],
];

// ============ 3. TRUCKS (Caminhões) ============
const trucks = [
  // European brands popular in Americas
  ['Volvo','FH',1993,2026,'Diesel','12.8L/16.1L Turbo Diesel',750,'Automated',2,'Truck',16000,80000,'FH','Caminhão pesado topo de linha. Motor D16 até 750cv.','truck','Sweden'],
  ['Volvo','FM',1985,2026,'Diesel','10.8L/12.8L Turbo Diesel',460,'Automated',2,'Truck',12800,60000,'FM','Caminhão médio-pesado. Versátil.','truck','Sweden'],
  ['Volvo','VM',2003,2026,'Diesel','7.2L Turbo Diesel',330,'Manual',2,'Toco',7200,45000,'VM','Caminhão semipesado. Produzido no Brasil.','truck','Sweden'],
  ['Volvo','FH16',1993,2026,'Diesel','16.1L Turbo Diesel',750,'Automated',2,'Carreta',16000,95000,'FH16','Caminhão mais potente da Volvo.','truck','Sweden'],

  ['Scania','R 770',2020,2026,'Diesel','16.4L V8 Turbo Diesel',770,'Automated',2,'Carreta',16400,100000,'R 770','Caminhão mais potente do Brasil. Motor V8 770cv.','truck','Sweden'],
  ['Scania','R 540',2016,2026,'Diesel','12.7L Turbo Diesel',540,'Automated',2,'Carreta',12700,80000,'R 540','Caminhão pesado. Motor 6 cilindros 540cv.','truck','Sweden'],
  ['Scania','P 360',2010,2026,'Diesel','8.9L Turbo Diesel',360,'Manual',2,'Truck',8900,60000,'P 360','Caminhão semipesado. Cabine P.','truck','Sweden'],

  ['Mercedes-Benz','Actros',1996,2026,'Diesel','10.6L/15.6L Turbo Diesel',625,'Automated',2,'Carreta',15600,85000,'Actros','Caminhão pesado premium. MirrorCam.','truck','Germany'],
  ['Mercedes-Benz','Axor',2004,2026,'Diesel','7.2L/12.0L Turbo Diesel',428,'Manual',2,'Truck',12000,65000,'Axor','Caminhão médio. Sucessor do L-Series.','truck','Germany'],
  ['Mercedes-Benz','Atego',1998,2026,'Diesel','4.2L/6.4L Turbo Diesel',299,'Manual',2,'VUC',6400,40000,'Atego','Caminhão leve/VUC. Manobrabilidade urbana.','truck','Germany'],
  ['Mercedes-Benz','Accelo',2003,2026,'Diesel','4.8L Turbo Diesel',177,'Manual',2,'VUC',4800,35000,'Accelo','VUC leve. Ideal para entregas urbanas.','truck','Germany'],

  ['MAN','TGX',2007,2026,'Diesel','10.5L/15.2L Turbo Diesel',640,'Automated',2,'Carreta',15200,80000,'TGX','Caminhão pesado. Cabine XXL.','truck','Germany'],
  ['MAN','TGS',2007,2026,'Diesel','10.5L/12.4L Turbo Diesel',480,'Manual',2,'Truck',12400,65000,'TGS','Caminhão médio-pesado.','truck','Germany'],
  ['MAN','TGL',2010,2026,'Diesel','4.5L Turbo Diesel',220,'Manual',2,'VUC',4500,35000,'TGL','Caminhão leve.','truck','Germany'],

  ['Iveco','S-Way',2019,2026,'Diesel','12.9L Turbo Diesel',570,'Automated',2,'Carreta',12900,75000,'S-Way','Caminhão pesado. Produzido em MG.','truck','Italy'],
  ['Iveco','Tector',2004,2026,'Diesel','5.9L Turbo Diesel',280,'Manual',2,'Toco',5900,45000,'Tector','Caminhão médio. Motor FPT.','truck','Italy'],
  ['Iveco','Daily City',1999,2026,'Diesel','3.0L Turbo Diesel',210,'Manual',2,'VUC',3000,30000,'Daily City','VUC leve.','truck','Italy'],

  ['DAF','XF',2013,2026,'Diesel','10.8L/12.9L Turbo Diesel',530,'Automated',2,'Carreta',12900,75000,'XF','Caminhão pesado.','truck','Netherlands'],

  // American trucks
  ['Freightliner','Cascadia',2007,2026,'Diesel','12.8L/15.6L Turbo Diesel',600,'Automated',2,'Carreta',15600,85000,'Cascadia','Caminhão americano mais vendido.','truck','USA'],
  ['Kenworth','T680',2012,2026,'Diesel','12.9L Paccar MX-13',510,'Automated',2,'Carreta',12900,90000,'T680','Caminhão aerodinâmico premium.','truck','USA'],
  ['Kenworth','W900',1961,2026,'Diesel','12.9L Paccar MX-13',510,'Manual',2,'Carreta',12900,95000,'W900','Caminhão clássico americano. Design tradicional.','truck','USA'],
  ['Peterbilt','579',2012,2026,'Diesel','12.9L Paccar MX-13',510,'Automated',2,'Carreta',12900,95000,'579','Caminhão premium americano.','truck','USA'],
  ['Peterbilt','389',2006,2026,'Diesel','15.0L Cummins',605,'Manual',2,'Carreta',15000,100000,'389','Caminhão clássico. Design icônico.','truck','USA'],
  ['Mack','Anthem',2018,2026,'Diesel','13.0L MP8',505,'Automated',2,'Carreta',13000,85000,'Anthem','Caminhão pesado americano.','truck','USA'],
  ['International','LT Series',2016,2026,'Diesel','12.4L Cummins X15',565,'Automated',2,'Carreta',12400,80000,'LT Series','Caminhão pesado. Motor Cummins.','truck','USA'],

  // Brazilian trucks
  ['Volkswagen','Constellation',2005,2026,'Diesel','4.6L/9.3L Turbo Diesel',367,'Manual',2,'Truck',9300,50000,'Constellation','Caminhão brasileiro. Motor MAN D08.','truck','Brazil'],
  ['Volkswagen','Delivery',2017,2026,'Diesel','3.0L/4.6L Turbo Diesel',185,'Manual',2,'VUC',4600,30000,'Delivery','VUC brasileiro.','truck','Brazil'],

  // Japanese
  ['Hino','500 Series',2000,2026,'Diesel','5.1L/7.7L Turbo Diesel',280,'Manual',2,'Toco',7700,40000,'500 Series','Caminhão médio japonês.','truck','Japan'],
];

// ============ 4. BUSES (Ônibus) ============
const buses = [
  ['Marcopolo','Paradiso G8',2018,2026,'Diesel','12.8L Turbo Diesel',460,'Automated',2,'Bus',12800,120000,'Paradiso G8 1800 DD','Ônibus rodoviário double-decker.','bus','Brazil'],
  ['Marcopolo','Viaggio G8',2018,2026,'Diesel','12.8L Turbo Diesel',410,'Manual',2,'Bus',12800,80000,'Viaggio G8','Ônibus rodoviário.','bus','Brazil'],
  ['Marcopolo','Torino',1999,2026,'Diesel','4.8L Turbo Diesel',220,'Automatic',2,'Bus',4800,60000,'Torino','Ônibus urbano brasileiro clássico.','bus','Brazil'],
  ['Marcopolo','Senior',2000,2026,'Diesel','3.0L Turbo Diesel',165,'Manual',2,'Microbus',3000,40000,'Senior','Micro-ônibus.','bus','Brazil'],

  ['Mercedes-Benz','O 500',2003,2026,'Diesel','12.0L Turbo Diesel',428,'Manual',2,'Bus',12000,85000,'O 500','Chassi de ônibus rodoviário.','bus','Germany'],
  ['Mercedes-Benz','OF 1721',2000,2026,'Diesel','4.8L Turbo Diesel',210,'Manual',2,'Bus',4800,50000,'OF 1721','Chassi de ônibus urbano.','bus','Germany'],
  ['Mercedes-Benz','Citaro',2012,2026,'Diesel','7.7L Turbo Diesel',299,'Automatic',2,'Bus',7700,95000,'Citaro','Ônibus urbano alemão.','bus','Germany'],

  ['Volvo','B450R',2016,2026,'Diesel','12.8L Turbo Diesel',450,'Automated',2,'Bus',12800,95000,'B450R','Chassi rodoviário.','bus','Sweden'],
  ['Volvo','B270F',2010,2026,'Diesel','7.2L Turbo Diesel',270,'Automatic',2,'Bus',7200,70000,'B270F','Chassi de ônibus urbano articulado.','bus','Sweden'],

  ['Scania','K 410',2016,2026,'Diesel','12.7L Turbo Diesel',410,'Automated',2,'Bus',12700,95000,'K 410','Chassi rodoviário.','bus','Sweden'],
  ['Scania','K 280',2015,2026,'Diesel','8.9L Turbo Diesel',280,'Automatic',2,'Bus',8900,70000,'K 280','Chassi urbano.','bus','Sweden'],

  ['Blue Bird','Vision',2000,2026,'Diesel','6.7L Turbo Diesel',250,'Automatic',2,'Bus',6700,35000,'Vision','Ônibus escolar americano. Amarelo icônico.','bus','USA'],
  ['Thomas','Saf-T-Liner',1995,2026,'Diesel','6.7L Turbo Diesel',250,'Automatic',2,'Bus',6700,35000,'Saf-T-Liner','Ônibus escolar americano.','bus','USA'],
];

// ============ 5. VANS (Vans e Furgões) ============
const vans = [
  ['Mercedes-Benz','Sprinter',1995,2026,'Diesel','2.1L/3.0L Turbo Diesel',190,'Automatic',3,'Van',3000,25000,'Sprinter','Van premium. Amplamente usada como ambulância.','van','Germany'],
  ['Ford','Transit',1965,2026,'Diesel','2.0L EcoBlue Turbo',185,'Manual',3,'Van',2000,18000,'Transit','Van mais vendida da Europa.','van','USA'],
  ['Fiat','Ducato',1981,2026,'Diesel','2.3L/3.0L Turbo Diesel',180,'Manual',3,'Van',3000,15000,'Ducato','Van versátil. Base para motorhomes.','van','Italy'],
  ['Renault','Master',1980,2026,'Diesel','2.3L Turbo Diesel',180,'Manual',3,'Van',2300,15000,'Master','Van francesa. Ampla gama de versões.','van','France'],
  ['Volkswagen','Crafter',2006,2026,'Diesel','2.0L TDI',177,'Manual',3,'Van',2000,20000,'Crafter','Van alemã. Irmã da Sprinter.','van','Germany'],
  ['Iveco','Daily',1978,2026,'Diesel','2.3L/3.0L Turbo Diesel',210,'Manual',3,'Van',3000,18000,'Daily','Van robusta. Chassi de longarina.','van','Italy'],
  ['Peugeot','Boxer',1994,2026,'Diesel','2.2L Turbo Diesel',165,'Manual',3,'Van',2200,14000,'Boxer','Van. Irmã da Fiat Ducato.','van','France'],
  ['Citroën','Jumper',1994,2026,'Diesel','2.2L Turbo Diesel',165,'Manual',3,'Van',2200,14000,'Jumper','Van. Irmã da Fiat Ducato.','van','France'],
];

// ============ 6. MOTORHOMES ============
const motorhomes = [
  ['Winnebago','Revel',2018,2026,'Diesel','3.0L V6 Turbo',188,'Automatic',2,'Motorhome',3000,85000,'Revel','Motorhome 4x4 off-road.','motorhome','USA'],
  ['Winnebago','Vista',2000,2026,'Gasoline','7.3L V8',350,'Automatic',2,'Motorhome',7300,65000,'Vista','Motorhome Classe A.','motorhome','USA'],
  ['Airstream','Classic',1970,2026,'Gasoline','N/A (Trailer)',0,'N/A',1,'Trailer',0,50000,'Classic','Trailer prateado icônico. Design aerodinâmico.','motorhome','USA'],
  ['Airstream','Basecamp',2017,2026,'Gasoline','N/A (Trailer)',0,'N/A',1,'Trailer',0,25000,'Basecamp','Trailer compacto para aventura.','motorhome','USA'],
  ['Fleetwood','Discovery',1995,2026,'Diesel','6.7L Cummins Turbo',360,'Automatic',2,'Motorhome',6700,80000,'Discovery','Motorhome Classe A diesel.','motorhome','USA'],
  ['Jayco','Greyhawk',2000,2026,'Gasoline','7.3L V8',350,'Automatic',2,'Motorhome',7300,45000,'Greyhawk','Motorhome Classe C.','motorhome','USA'],
  ['Jayco','Eagle',2005,2026,'N/A','N/A (Trailer)',0,'N/A',1,'Trailer',0,20000,'Eagle','Trailer familiar.','motorhome','USA'],
  ['Roadtrek','Zion',2015,2026,'Gasoline','3.6L V6',280,'Automatic',2,'Motorhome',3600,55000,'Zion','Motorhome Classe B (camper van).','motorhome','USA'],
  ['Hymer','ML-T',2019,2026,'Diesel','2.3L Turbo Diesel',180,'Automatic',2,'Motorhome',2300,70000,'ML-T','Motorhome premium alemão.','motorhome','Germany'],
];

// ============ 7. TRACTORS (Tratores) ============
const tractors = [
  ['John Deere','5075E',2010,2026,'Diesel','2.9L Turbo Diesel',75,'Manual',0,'Tractor',2900,25000,'5075E','Trator utilitário. Motor PowerTech.','tractor','USA'],
  ['John Deere','6120M',2020,2026,'Diesel','4.5L Turbo Diesel',120,'Manual',0,'Tractor',4500,40000,'6120M','Trator médio. Motor PVX.','tractor','USA'],
  ['John Deere','8R 410',2018,2026,'Diesel','9.0L Turbo Diesel',410,'Automatic',0,'Tractor',9000,110000,'8R 410','Trator de grande porte. Motor JD 9.0L.','tractor','USA'],
  ['John Deere','9620RX',2020,2026,'Diesel','15.0L Turbo Diesel',620,'Automatic',0,'Tractor',15000,200000,'9620RX','Trator articulado. Esteiras.','tractor','USA'],

  ['Massey Ferguson','4707',2018,2026,'Diesel','3.3L Turbo Diesel',75,'Manual',0,'Tractor',3300,20000,'4707','Trator utilitário. Motor AGCO Power.','tractor','USA'],
  ['Massey Ferguson','6713',2016,2026,'Diesel','4.9L Turbo Diesel',135,'Manual',0,'Tractor',4900,35000,'6713','Trator médio.','tractor','USA'],
  ['Massey Ferguson','8737',2015,2026,'Diesel','8.4L Turbo Diesel',370,'Automatic',0,'Tractor',8400,90000,'8737','Trator de grande porte.','tractor','USA'],

  ['Case IH','Farmall 80',2010,2026,'Diesel','3.4L Turbo Diesel',80,'Manual',0,'Tractor',3400,22000,'Farmall 80','Trator utilitário.','tractor','USA'],
  ['Case IH','Puma 200',2015,2026,'Diesel','6.7L Turbo Diesel',200,'Automatic',0,'Tractor',6700,50000,'Puma 200','Trator médio. Motor NEF.','tractor','USA'],
  ['Case IH','Steiger 620',2018,2026,'Diesel','12.9L Turbo Diesel',620,'Automatic',0,'Tractor',12900,150000,'Steiger 620','Trator articulado topo de linha.','tractor','USA'],

  ['New Holland','T4.75',2012,2026,'Diesel','3.4L Turbo Diesel',75,'Manual',0,'Tractor',3400,20000,'T4.75','Trator utilitário.','tractor','Italy'],
  ['New Holland','T7.260',2015,2026,'Diesel','6.7L Turbo Diesel',260,'Automatic',0,'Tractor',6700,60000,'T7.260','Trator médio.','tractor','Italy'],
  ['New Holland','T9.700',2020,2026,'Diesel','12.9L Turbo Diesel',692,'Automatic',0,'Tractor',12900,170000,'T9.700','Trator articulado. Maior da NH.','tractor','Italy'],

  ['Valtra','A94',2010,2026,'Diesel','3.3L Turbo Diesel',95,'Manual',0,'Tractor',3300,25000,'A94','Trator finlandês. Popular no Brasil.','tractor','Finland'],
  ['Valtra','T195',2015,2026,'Diesel','7.4L Turbo Diesel',195,'Automatic',0,'Tractor',7400,55000,'T195','Trator médio.','tractor','Finland'],

  ['Fendt','724 Vario',2015,2026,'Diesel','6.1L Turbo Diesel',240,'Automatic',0,'Tractor',6100,75000,'724 Vario','Trator premium alemão. Transmissão CVT.','tractor','Germany'],
  ['Fendt','1050 Vario',2015,2026,'Diesel','12.4L Turbo Diesel',517,'Automatic',0,'Tractor',12400,140000,'1050 Vario','Maior trator Fendt. 517cv.','tractor','Germany'],

  ['Kubota','M7060',2015,2026,'Diesel','3.3L Turbo Diesel',71,'Manual',0,'Tractor',3300,22000,'M7060','Trator japonês utilitário.','tractor','Japan'],
];

// ============ 8. BICYCLES ============
const bicycles = [
  ['Trek','Marlin 7',2015,2026,'N/A','Tração humana',0,'Manual',0,'Mountain',0,800,'Marlin 7','Mountain bike de entrada. Quadro Alpha Aluminum.','bicycle','USA'],
  ['Trek','Domane SL 5',2018,2026,'N/A','Tração humana',0,'Manual',0,'Road',0,3000,'Domane SL 5','Bicicleta de estrada. Quadro carbono.','bicycle','USA'],
  ['Trek','Fuel EX 9.8',2020,2026,'Electric','Tração humana + Elétrica',0,'Manual',0,'Mountain',0,6000,'Fuel EX 9.8','Mountain bike full-suspension carbono.','bicycle','USA'],
  ['Trek','FX 3',2018,2026,'N/A','Tração humana',0,'Manual',0,'Urban',0,700,'FX 3','Bike urbana fitness.','bicycle','USA'],

  ['Specialized','Rockhopper',2010,2026,'N/A','Tração humana',0,'Manual',0,'Mountain',0,600,'Rockhopper','Mountain bike. Quadro A1 Aluminum.','bicycle','USA'],
  ['Specialized','Tarmac SL7',2020,2026,'N/A','Tração humana',0,'Manual',0,'Road',0,5000,'Tarmac SL7','Bicicleta de estrada carbono.','bicycle','USA'],
  ['Specialized','Turbo Levo',2018,2026,'Electric','Elétrica 565Wh',0,'Manual',0,'Mountain',0,4500,'Turbo Levo','E-MTB full-suspension.','bicycle','USA'],

  ['Giant','TCR Advanced',2017,2026,'N/A','Tração humana',0,'Manual',0,'Road',0,3000,'TCR Advanced','Bicicleta de estrada. Quadro carbono.','bicycle','Taiwan'],
  ['Giant','Escape 3',2015,2026,'N/A','Tração humana',0,'Manual',0,'Urban',0,500,'Escape 3','Bike urbana. Quadro ALUXX.','bicycle','Taiwan'],
  ['Giant','Trance X',2020,2026,'N/A','Tração humana',0,'Manual',0,'Mountain',0,3500,'Trance X','Mountain bike full-suspension.','bicycle','Taiwan'],

  ['Cannondale','Trail 5',2018,2026,'N/A','Tração humana',0,'Manual',0,'Mountain',0,700,'Trail 5','Mountain bike. Quadro SmartForm C3.','bicycle','USA'],
  ['Cannondale','Synapse',2017,2026,'N/A','Tração humana',0,'Manual',0,'Road',0,2500,'Synapse','Bicicleta de estrada endurance.','bicycle','USA'],

  ['Santa Cruz','Hightower',2019,2026,'N/A','Tração humana',0,'Manual',0,'Mountain',0,4500,'Hightower','Mountain bike full-suspension premium.','bicycle','USA'],
  ['Santa Cruz','V10',2018,2026,'N/A','Tração humana',0,'Manual',0,'Downhill',0,5500,'V10','Bicicleta de downhill. Carbono.','bicycle','USA'],

  ['Bianchi','Oltre XR4',2018,2026,'N/A','Tração humana',0,'Manual',0,'Road',0,5500,'Oltre XR4','Bicicleta de estrada italiana. Celeste.','bicycle','Italy'],
  ['Cervelo','S5',2019,2026,'N/A','Tração humana',0,'Manual',0,'Road',0,6000,'S5','Bicicleta de estrada aero premium.','bicycle','Canada'],
];

// ==================== EXECUTE ====================
console.log('Seeding world vehicles...');

const transaction = db.transaction(() => {
  const all = [
    ...americasCars,
    ...motorcycles,
    ...trucks,
    ...buses,
    ...vans,
    ...motorhomes,
    ...tractors,
    ...bicycles,
  ];
  add(all);
});
transaction();

const byType = db.prepare('SELECT vehicle_type, COUNT(*) as c FROM cars GROUP BY vehicle_type ORDER BY c DESC').all();
console.log('\nVehicle count by type:');
byType.forEach(t => console.log(`  ${t.vehicle_type}: ${t.c}`));

const total = db.prepare('SELECT COUNT(*) as c FROM cars').get().c;
const fromMundo = db.prepare("SELECT COUNT(*) as c FROM cars WHERE source='mundo-seed'").get().c;
console.log(`\nTotal cars: ${total} | New mundo entries: ${fromMundo}`);

const placeholders = db.prepare("SELECT COUNT(*) as c FROM cars WHERE image_url LIKE '%placehold%'").get().c;
console.log(`Placeholder images: ${placeholders}`);
