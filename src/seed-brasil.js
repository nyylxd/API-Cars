const db = require('./database');

// Clear previous Brazilian entries
db.exec("DELETE FROM cars WHERE is_brazilian = 1 OR source = 'brasil-seed'");

const img = (brand, model, year) =>
  `https://placehold.co/800x500/009c3b/ffdf00?text=${encodeURIComponent(brand + ' ' + model + ' ' + year)}`;

const usdToBrl = (usd) => Math.round(usd * 5.5);

const insert = db.prepare(`
  INSERT INTO cars (
    brand, model, year, fuel_type, engine, power_hp, transmission, doors, category,
    engine_cc, price_usd, price_brl, image_url, source,
    is_brazilian, flex_fuel, generation, description, color
  ) VALUES (?,?,?,?,?,?,?,?,?, ?,?,?,?,?, 1,?,?,?,?)
`);

// ==================== CARROS DO BRASIL 1920-2026 ====================
// Era: Pre-1956 assembly, 1956-69 GEIA, 1970-79 Milagre, 1980-89 Etanol, 1990-99 Abertura, 2000-2026 Moderno

// ---- ERA 1920-1955: Montadoras pioneiras (assembled in Brazil) ----
const eraPioneira = [
  // Ford Model T (first assembled in Brazil 1919, CKD kits from USA)
  ['Ford', 'Model T', 1920,1928, 'Gasoline', '2.9L 4-cil', 20, 'Manual', 2, 'Sedan', 2896, 300, 'Montagem CKD Brasil', 'Primeiro automóvel montado no Brasil. Motor 4 cilindros, 20cv, icônico Ford Bigode.'],
  ['Ford', 'Model A', 1928,1931, 'Gasoline', '3.3L 4-cil', 40, 'Manual', 2, 'Sedan', 3285, 400, 'Montagem CKD Brasil', 'Sucessor do Model T. Motor mais potente, freios nas 4 rodas.'],
  ['Ford', 'V8', 1932,1953, 'Gasoline', '3.6L V8', 85, 'Manual', 2, 'Sedan', 3622, 600, 'Montagem CKD Brasil', 'Primeiro V8 popular do mundo. Motor Flathead, robusto e confiável.'],

  // Chevrolet (assembled from 1925 in São Paulo)
  ['Chevrolet', 'Master', 1925,1942, 'Gasoline', '3.2L 6-cil', 65, 'Manual', 4, 'Sedan', 3180, 500, 'Montagem CKD São Paulo', 'Linha Chevrolet montada em São Paulo. Motor 6 cilindros.'],
  ['Chevrolet', 'Styleline', 1946,1952, 'Gasoline', '3.5L 6-cil', 90, 'Manual', 4, 'Sedan', 3548, 700, 'Montagem CKD Brasil', 'Pós-guerra, design americano, motor 6 cilindros.'],

  // Studebaker (assembled in Brazil 1945-1953)
  ['Studebaker', 'Champion', 1945,1953, 'Gasoline', '2.8L 6-cil', 80, 'Manual', 4, 'Sedan', 2780, 600, 'Montagem Brasil', 'Design americano avançado, carroceria aerodinâmica.'],
];

// ---- ERA 1956-1969: Nacionalização GEIA ----
const eraGeia = [
  // Romi-Isetta (1956-1961) - first vehicle produced in Brazil
  ['Romi', 'Isetta', 1956,1961, 'Gasoline', '0.25L 1-cil', 9, 'Manual', 1, 'Microcarro', 250, 255, '1ª geração', 'Primeiro veículo produzido no Brasil. Motor BMW/ISO. Porta dianteira única.'],

  // VW Kombi (1957-2013) - longest-produced vehicle in Brazil
  ['Volkswagen', 'Kombi', 1957,1975, 'Gasoline', '1.2L/1.5L Boxer', 44, 'Manual', 2, 'Van', 1493, 350, 'T1 (Split Window)', 'A Kombi mais antiga, janela dividida. Motor boxer refrigerado a ar.'],
  ['Volkswagen', 'Kombi', 1976,1996, 'Gasoline', '1.6L Boxer', 58, 'Manual', 2, 'Van', 1584, 400, 'T1.5/T2', 'Motor 1.6 boxer, carroceria bay window.'],
  ['Volkswagen', 'Kombi', 1997,2013, 'Gasoline', '1.4L T4 EA111', 80, 'Manual', 2, 'Van', 1390, 1300, 'Última geração', 'Motor dianteiro 1.4, refrigerado a água. Fim da produção em 2013.'],

  // VW Fusca / Beetle (1959-1996)
  ['Volkswagen', 'Fusca', 1959,1986, 'Gasoline', '1.2L/1.3L/1.6L Boxer', 65, 'Manual', 2, 'Sedan', 1584, 200, 'Clássico (1959-1986)', 'O carro mais icônico do Brasil. Motor boxer refrigerado a ar. Produção de 27 anos.'],
  ['Volkswagen', 'Fusca', 1993,1996, 'Gasoline', '1.6L Boxer', 65, 'Manual', 2, 'Sedan', 1584, 700, 'Fusca Itamar (1993-1996)', 'Retorno do Fusca por decreto do Presidente Itamar Franco.'],

  // DKW-Vemag (1956-1967) - DKW 3=6/1000, first Brazilian national automotive industry
  ['DKW-Vemag', 'Belcar', 1956,1967, 'Gasoline', '1.0L 3-cil 2T', 50, 'Manual', 2, 'Sedan', 980, 225, 'DKW 3=6/1000', 'Motor DKW 3 cilindros 2 tempos. Primeira linha de montagem nacional.'],
  ['DKW-Vemag', 'Vemaguet', 1960,1967, 'Gasoline', '1.0L 3-cil 2T', 50, 'Manual', 4, 'Wagon', 980, 275, 'DKW 3=6/1000', 'Station wagon familiar, 3 portas. Transmissão por rosca sem-fim.'],
  ['DKW-Vemag', 'Candango', 1958,1963, 'Gasoline', '1.0L 3-cil 2T', 42, 'Manual', 2, 'Pickup', 980, 250, 'DKW 3=6/1000', 'Utilitário 4x4. Nome em homenagem a JK. Raro e valorizado.'],

  // Simca Chambord (1959-1969)
  ['Simca', 'Chambord', 1959,1969, 'Gasoline', '2.4L V8', 120, 'Manual', 4, 'Sedan', 2351, 280, 'Chambord', 'Motor V8 francês. Primeiro V8 fabricado no Brasil. Luxo e potência.'],
  ['Simca', 'Rallye', 1961,1969, 'Gasoline', '2.4L V8', 140, 'Manual', 2, 'Coupe', 2351, 320, 'Rallye/Esplanada', 'Versão esportiva do Chambord. Carburador duplo, mais potente.'],

  // Willys Overland (1954-1967)
  ['Willys', 'Jeep', 1954,1967, 'Gasoline', '2.6L 6-cil', 90, 'Manual', 2, 'SUV', 2638, 180, 'Universal (CJ-5)', 'Primeiro Jeep fabricado fora dos EUA. Motor Hurricane. Genuíno off-road.'],
  ['Willys', 'Rural', 1958,1977, 'Gasoline', '2.6L/3.0L 6-cil', 110, 'Manual', 4, 'Wagon', 3000, 200, 'Rural Willys', 'Station wagon 4x4, amplo espaço. Depois fabricado pela Ford como Ford Rural.'],
  ['Willys', 'Aero-Willys', 1960,1971, 'Gasoline', '2.6L/3.0L 6-cil', 110, 'Manual', 4, 'Sedan', 3000, 225, 'Aero-Willys', 'Sedan de luxo, carroceria aerodinâmica. Motor Hurricane de 6 cilindros.'],
  ['Willys', 'Gordini', 1962,1968, 'Gasoline', '0.85L 4-cil', 40, 'Manual', 4, 'Hatchback', 845, 225, 'Renault Dauphine', 'Projeto Renault. Compacto, econômico, motor traseiro.'],
  ['Willys', 'Itamaraty', 1966,1971, 'Gasoline', '3.0L 6-cil', 130, 'Manual', 4, 'Sedan', 3000, 250, 'Itamaraty Executivo', 'Versão de luxo do Aero-Willys. Nomeado em homenagem ao Palácio.'],
  ['Willys', 'Interlagos', 1962,1966, 'Gasoline', '0.85L 4-cil', 70, 'Manual', 2, 'Coupe', 845, 280, 'Renault Alpine A108', 'Esportivo brasileiro. Motor Gordini preparado. Fibra de vidro.'],

  // VW Karmann Ghia (1962-1975)
  ['Volkswagen', 'Karmann Ghia', 1962,1975, 'Gasoline', '1.5L/1.6L Boxer', 65, 'Manual', 2, 'Coupe', 1584, 300, 'Tipo 14 / TC', 'Coupé esportivo desenhado pela Ghia. Plataforma Fusca, carroceria artesanal.'],

  // VW Variant / TL (1969-1980)
  ['Volkswagen', 'Variant', 1969,1980, 'Gasoline', '1.6L Boxer', 65, 'Manual', 2, 'Wagon', 1584, 350, '1600/TL/Variant', 'Station wagon boxer. Segunda porta traseira lateral. Motor Flat-4.'],

  // Puma GT (1966-1985) - Brazilian sports car
  ['Puma', 'GT', 1966,1980, 'Gasoline', '1.6L Boxer', 65, 'Manual', 2, 'Coupe', 1584, 350, 'GT / GTE', 'Esportivo brasileiro icônico. Fibra de vidro, plataforma VW. Exportado.'],
  ['Puma', 'GTB', 1973,1985, 'Gasoline', '4.1L 6-cil', 171, 'Manual', 2, 'Coupe', 4093, 500, 'GTB (Opala)', 'Motor e plataforma Chevrolet Opala. O esportivo mais rápido do Brasil.'],
];

// ---- ERA 1970-1979: Milagre Econômico ----
const eraMilagre = [
  // Chevrolet Opala (1968-1992) — the Brazilian "muscle car"
  ['Chevrolet', 'Opala', 1968,1979, 'Gasoline', '2.5L/3.8L/4.1L', 171, 'Manual', 4, 'Sedan', 4093, 250, '1ª geração', 'Primeiro Chevrolet nacional. Motor 6 cilindros. O muscle car brasileiro.'],
  ['Chevrolet', 'Opala', 1980,1992, 'Gasoline', '2.5L/4.1L', 140, 'Manual', 4, 'Sedan', 4093, 300, '2ª geração', 'Reestilização, destaque para o modelo Diplomata de luxo.'],
  ['Chevrolet', 'Opala SS', 1971,1980, 'Gasoline', '4.1L 6-cil', 171, 'Manual', 2, 'Coupe', 4093, 400, 'SS 250-S', 'Versão esportiva. O carro mais rápido do Brasil em sua época.'],
  ['Chevrolet', 'Caravan', 1975,1992, 'Gasoline', '2.5L/4.1L', 140, 'Manual', 4, 'Wagon', 4093, 350, 'Caravan', 'Station wagon do Opala. 3 portas, espaço familiar.'],

  // Ford Corcel (1968-1986)
  ['Ford', 'Corcel', 1968,1977, 'Gasoline', '1.3L/1.4L CHT', 75, 'Manual', 4, 'Sedan', 1372, 225, 'Corcel I', 'Projeto Renault com motor CHT Ford. Tração dianteira, econômico.'],
  ['Ford', 'Corcel II', 1978,1986, 'Gasoline', '1.6L CHT', 90, 'Manual', 4, 'Sedan', 1555, 250, 'Corcel II', 'Reestilização completa. Motor 1.6 CHT, 4 portas.'],
  ['Ford', 'Belina', 1970,1991, 'Gasoline', '1.6L CHT', 90, 'Manual', 4, 'Wagon', 1555, 250, 'Belina', 'Station wagon do Corcel. Amplo porta-malas, versão L com luxo.'],

  // Dodge Dart / Charger (1969-1981)
  ['Dodge', 'Dart', 1969,1981, 'Gasoline', '5.2L V8', 205, 'Manual', 4, 'Sedan', 5210, 300, 'Dart/Charger', 'Luxo americano feito no Brasil. Motor V8, automático opcional.'],
  ['Dodge', 'Charger R/T', 1971,1980, 'Gasoline', '5.2L V8', 215, 'Automatic', 2, 'Coupe', 5210, 450, 'Charger R/T', 'Versão esportiva do Dart. Motor V8 318, o muscle car de luxo.'],

  // Ford Galaxie / Landau (1967-1983)
  ['Ford', 'Galaxie', 1967,1983, 'Gasoline', '4.8L V8', 198, 'Automatic', 4, 'Sedan', 4779, 350, 'Galaxie/LTD', 'Luxo máximo. Motor V8 292. Carro presidencial até 1990.'],
  ['Ford', 'Landau', 1971,1983, 'Gasoline', '4.8L V8', 198, 'Automatic', 4, 'Sedan', 4779, 400, 'Landau', 'Versão mais luxuosa do Galaxie. Teto de vinil, acabamento premium.'],

  // VW Brasília (1973-1982)
  ['Volkswagen', 'Brasília', 1973,1982, 'Gasoline', '1.6L Boxer', 65, 'Manual', 2, 'Hatchback', 1584, 200, 'Brasília', 'Projeto brasileiro. Motor boxer traseiro, design de hatch compacto.'],

  // VW Passat (1974-1988)
  ['Volkswagen', 'Passat', 1974,1988, 'Gasoline', '1.6L/1.8L', 96, 'Manual', 4, 'Sedan', 1781, 250, 'B1/B2', 'Motor dianteiro refrigerado a água. Design alemão, motor potente.'],
  ['Volkswagen', 'Passat TS', 1976,1988, 'Gasoline', '1.6L', 96, 'Manual', 2, 'Coupe', 1588, 300, 'Passat TS', 'Versão esportiva 2 portas. Motor 1.6, painel esportivo.'],

  // VW SP2 (1972-1976) — Brazilian exclusive
  ['Volkswagen', 'SP2', 1972,1976, 'Gasoline', '1.7L Boxer', 75, 'Manual', 2, 'Coupe', 1679, 400, 'SP2', 'Esportivo 100% brasileiro. Motor boxer traseiro. Design de Márcio Piancastelli.'],

  // Ford Maverick (1973-1979)
  ['Ford', 'Maverick', 1973,1979, 'Gasoline', '3.0L V6/4.8L V8', 197, 'Manual', 2, 'Coupe', 302, 275, 'Maverick GT', 'Coupe esportivo. Motor V8 302 opcional. Visual americano musculoso.'],

  // Chevrolet Chevette (1973-1993)
  ['Chevrolet', 'Chevette', 1973,1993, 'Gasoline', '1.4L/1.6L', 81, 'Manual', 2, 'Hatchback', 1598, 150, 'Chevette', 'Compacto popular. Motor 1.4/1.6, tração traseira. 20 anos de produção.'],
  ['Chevrolet', 'Chevette', 1973,1993, 'Gasoline', '1.4L/1.6L', 81, 'Manual', 4, 'Sedan', 1598, 150, 'Chevette Sedan', 'Versão sedan do Chevette. 4 portas, motor 1.6.'],
];

// ---- ERA 1976-1989: Entrada da Fiat e boom do etanol ----
const eraFiat = [
  // Fiat 147 (1976-1987) - first Fiat in Brazil, first ethanol car worldwide (1979)
  ['Fiat', '147', 1976,1987, 'Gasoline', '1.0L/1.3L', 61, 'Manual', 2, 'Hatchback', 1297, 175, '147 (Spazio)', 'Primeiro Fiat brasileiro. 1979: primeiro carro a álcool do mundo.'],
  ['Fiat', '147 Pickup', 1978,1987, 'Gasoline', '1.3L', 61, 'Manual', 2, 'Pickup', 1297, 200, '147 City', 'Picape leve derivada do 147. Pintura especial "saia e blusa".'],
  ['Fiat', 'Oggi', 1983,1985, 'Gasoline', '1.3L', 65, 'Manual', 4, 'Sedan', 1297, 225, 'Oggi', 'Versão sedan do 147. Produção curta, hoje item de colecionador.'],
  ['Fiat', 'Panorama', 1980,1986, 'Gasoline', '1.3L', 65, 'Manual', 4, 'Wagon', 1297, 225, 'Panorama', 'Station wagon do 147. Prática e espaçosa.'],

  // Fiat Uno (1984-2013)
  ['Fiat', 'Uno Mille', 1984,1997, 'Gasoline', '1.0L/1.5L', 66, 'Manual', 2, 'Hatchback', 999, 85, '1ª geração', 'Carro mais vendido do Brasil. Motor Fire 1.0. Robusto e econômico.'],
  ['Fiat', 'Uno Mille', 1998,2013, 'Flex', '1.0L Fire', 66, 'Manual', 2, 'Hatchback', 999, 200, '1ª geração (Flex)', 'Motor Fire 1.0 agora Flex. Continuação do sucesso de vendas.'],
  ['Fiat', 'Uno', 2014,2021, 'Flex', '1.0L/1.4L Fire EVO', 88, 'Manual', 4, 'Hatchback', 1368, 650, '2ª geração (Novo Uno)', 'Design moderno, motor EVO Flex.'],

  // Fiat Prêmio / Elba (1985-1996)
  ['Fiat', 'Prêmio', 1985,1996, 'Gasoline', '1.3L/1.5L/1.6L', 92, 'Manual', 4, 'Sedan', 1580, 125, 'Prêmio', 'Sedan derivado do Uno. Porta-malas amplo, versão CSL luxuosa.'],
  ['Fiat', 'Elba', 1985,1996, 'Gasoline', '1.5L/1.6L', 92, 'Manual', 4, 'Wagon', 1580, 150, 'Elba', 'Station wagon, sucessora do Panorama. Versátil e familiar.'],
  ['Fiat', 'Duna', 1987,1996, 'Gasoline', '1.6L', 82, 'Manual', 4, 'Sedan', 1580, 175, 'Duna/Innocenti', 'Sedan/Wagon. Também exportado para Europa como Innocenti Elba.'],

  // Alfa Romeo (FNM) - license-produced in Brazil 1974-1986
  ['Alfa Romeo', '2300', 1974,1986, 'Gasoline', '2.3L 4-cil', 110, 'Manual', 4, 'Sedan', 2310, 475, 'FNM Alfa Romeo', 'Produzido pela FNM. Motor Alfetta, câmbio de 5 marchas. Exclusivo.'],

  // Chevrolet Monza (1982-1996)
  ['Chevrolet', 'Monza', 1982,1996, 'Gasoline', '1.8L/2.0L', 116, 'Manual', 4, 'Sedan', 1998, 175, 'Monza (Ascona C)', 'Projeto Opel. Design alemão, motor Family II. Vendas recordes.'],
  ['Chevrolet', 'Monza Hatch', 1982,1996, 'Gasoline', '1.8L/2.0L', 116, 'Manual', 2, 'Hatchback', 1998, 175, 'Monza Hatch', 'Versão hatch esportiva. Motor 2.0, painel digital.'],

  // Ford Del Rey / Scala (1981-1991)
  ['Ford', 'Del Rey', 1981,1991, 'Gasoline', '1.6L CHT', 90, 'Manual', 4, 'Sedan', 1555, 180, 'Del Rey', 'Sedan médio de luxo. Teto de vinil, acabamento requintado.'],
  ['Ford', 'Scala', 1983,1986, 'Gasoline', '1.6L CHT', 90, 'Manual', 4, 'Wagon', 1555, 200, 'Scala', 'Station wagon do Del Rey. 3 portas na primeira versão.'],

  // Ford Pampa (1982-1997)
  ['Ford', 'Pampa', 1982,1997, 'Gasoline', '1.6L CHT', 90, 'Manual', 2, 'Pickup', 1555, 175, 'Pampa', 'Picape leve derivada do Corcel. Cabine simples, caçamba espaçosa.'],

  // Ford Escort (1983-2003)
  ['Ford', 'Escort', 1983,1996, 'Gasoline', '1.6L/1.8L/2.0L', 116, 'Manual', 4, 'Hatchback', 1984, 200, 'Escort Mk3/Mk4', 'Projeto europeu. Motor Zetec 1.8/2.0. Versão XR3 esportiva.'],
  ['Ford', 'Escort', 1997,2003, 'Gasoline', '1.8L/2.0L', 130, 'Manual', 4, 'Hatchback', 1984, 275, 'Escort Mk5/Mk6', 'Reestilização oval. Motor Zetec 2.0, versão Zetec esportiva.'],

  // VW Santana / Quantum (1984-2002)
  ['Volkswagen', 'Santana', 1984,2002, 'Gasoline', '1.8L/2.0L', 112, 'Manual', 4, 'Sedan', 1984, 275, 'Santana', 'Sedan de luxo. Ampla aceitação como táxi e executivo.'],
  ['Volkswagen', 'Quantum', 1985,2002, 'Gasoline', '1.8L/2.0L', 112, 'Manual', 4, 'Wagon', 1984, 300, 'Quantum', 'Station wagon do Santana. 7 lugares opcionais.'],

  // Gurgel (1969-1993) - Brazilian fiberglass vehicles
  ['Gurgel', 'Xavante', 1970,1982, 'Gasoline', '1.6L Boxer', 65, 'Manual', 2, 'SUV', 1584, 300, 'Xavante X10/X12', 'Veículo 100% brasileiro. Carroceria de fibra de vidro, mecânica VW.'],
  ['Gurgel', 'Carajás', 1989,1993, 'Gasoline', '1.6L Boxer', 65, 'Manual', 2, 'SUV', 1584, 350, 'Carajás', 'Último modelo Gurgel. Design moderno, carroceria fiberglass.'],

  // Chevrolet Kadett (1989-1998)
  ['Chevrolet', 'Kadett', 1989,1998, 'Gasoline', '1.8L/2.0L', 116, 'Manual', 4, 'Hatchback', 1998, 200, 'Kadett (Opel Astra F)', 'Projeto Opel. Motor Family II. Versão GSi esportiva 2.0 16v.'],
  ['Chevrolet', 'Ipanema', 1989,1998, 'Gasoline', '1.8L/2.0L', 116, 'Manual', 4, 'Wagon', 1998, 225, 'Ipanema', 'Station wagon do Kadett. Nome em homenagem à praia do Rio.'],

  // Chevrolet Veraneio (1964-1995) - full-size SUV
  ['Chevrolet', 'Veraneio', 1964,1995, 'Gasoline', '4.1L 6-cil', 140, 'Manual', 4, 'SUV', 4093, 200, 'Veraneio', 'SUV de grande porte. Motor 6 cilindros Opala. 3 portas. Usado por polícia.'],
];

// ---- ERA 1990-1999: Abertura do mercado ----
const eraAbertura = [
  // Fiat Tempra / Tipo
  ['Fiat', 'Tempra', 1991,1998, 'Gasoline', '1.6L/2.0L', 127, 'Manual', 4, 'Sedan', 1995, 225, 'Tempra', 'Sedan médio. Motor 2.0 16v no Tempra Turbo. Visual italiano.'],
  ['Fiat', 'Tipo', 1992,1996, 'Gasoline', '1.6L', 92, 'Manual', 4, 'Hatchback', 1580, 175, 'Tipo', 'Hatch italiano. Design premiado (Car of the Year 1989).'],

  // Chevrolet Omega / Suprema (1992-1998)
  ['Chevrolet', 'Omega', 1992,1998, 'Gasoline', '2.0L/3.0L/4.1L', 168, 'Manual', 4, 'Sedan', 2962, 350, 'Omega A', 'Opel Omega. Motor 3.0 6 cilindros. Luxo alemão no Brasil.'],
  ['Chevrolet', 'Suprema', 1992,1998, 'Gasoline', '2.0L/3.0L', 168, 'Manual', 4, 'Wagon', 1998, 375, 'Omega Suprema', 'Station wagon do Omega. Amplo espaço, desempenho.'],

  // Chevrolet Vectra (1993-2005)
  ['Chevrolet', 'Vectra', 1993,2005, 'Gasoline', '2.0L/2.2L', 138, 'Manual', 4, 'Sedan', 2198, 275, 'Vectra A/B', 'Opel Vectra. Motor 2.0/2.2 16v. Concorrente de Santana e Tempra.'],

  // Volkswagen Logus / Pointer (1992-1996)
  ['Volkswagen', 'Logus', 1992,1996, 'Gasoline', '1.8L/2.0L', 112, 'Manual', 4, 'Sedan', 1984, 225, 'Logus', 'Sedan 2 portas ou 4 portas. Projeto Autolatina (Ford+VW).'],
  ['Volkswagen', 'Pointer', 1994,1996, 'Gasoline', '1.8L/2.0L', 112, 'Manual', 2, 'Hatchback', 1984, 250, 'Pointer', 'Versão hatch do Logus. Motor 2.0 AP.'],

  // Ford Versailles / Royale (1992-1996)
  ['Ford', 'Versailles', 1992,1996, 'Gasoline', '1.8L/2.0L', 112, 'Manual', 4, 'Sedan', 1984, 225, 'Versailles', 'Sedan do projeto Autolatina. Motor AP. Versão GL/Ghia.'],
  ['Ford', 'Royale', 1992,1996, 'Gasoline', '1.8L/2.0L', 112, 'Manual', 4, 'Wagon', 1984, 250, 'Versailles Royale', 'Station wagon. 3 portas, amplo espaço.'],

  // Ford Fiesta (1995-2019)
  ['Ford', 'Fiesta', 1995,2002, 'Gasoline', '1.0L/1.4L/1.6L Zetec', 95, 'Manual', 4, 'Hatchback', 1596, 200, 'Fiesta Mk4', 'Hatch europeu. Motor Zetec 1.4/1.6. Compacto e ágil.'],

  // Honda Civic (national production since 1997)
  ['Honda', 'Civic', 1997,2005, 'Gasoline', '1.6L/1.7L VTEC', 130, 'Manual', 4, 'Sedan', 1668, 400, 'Civic 6ª/7ª geração', 'Primeiro Civic nacional (Sumaré-SP). Motor VTEC, confiabilidade.'],

  // Toyota Corolla (national since 1998)
  ['Toyota', 'Corolla', 1998,2005, 'Gasoline', '1.8L VVT-i', 136, 'Manual', 4, 'Sedan', 1794, 425, 'Corolla 8ª/9ª geração', 'Produção nacional em Indaiatuba-SP. Motor VVT-i.'],

  // Peugeot 206 (2001-2014)
  ['Peugeot', '206', 2001,2014, 'Flex', '1.4L/1.6L', 110, 'Manual', 4, 'Hatchback', 1587, 275, '206 Brasil', 'Hatch compacto. Produção nacional no RJ. Flex a partir de 2006.'],
];

// ---- MODERN ERA (2000-2026) - extending existing entries + new ones ----
const eraModerna = [
  // ========== FIAT ==========
  ['Fiat', 'Palio', 1996,2009, 'Flex', '1.0L/1.8R', 106, 'Manual', 4, 'Hatchback', 1796, 175, '1ª/2ª geração', 'Hatch campeão de vendas, confiável e de baixa manutenção.'],
  ['Fiat', 'Palio', 2010,2017, 'Flex', '1.0L/1.4L/1.6L', 117, 'Manual', 4, 'Hatchback', 1598, 275, '3ª geração (Novo Palio)', 'Redesign completo, plataforma moderna.'],
  ['Fiat', 'Palio Weekend', 1997,2020, 'Flex', '1.4L/1.8R', 132, 'Manual', 4, 'Wagon', 1796, 300, 'Todas gerações', 'Station wagon familiar, ideal para viagens.'],
  ['Fiat', 'Strada', 1998,2013, 'Flex', '1.4L/1.8R', 112, 'Manual', 2, 'Pickup', 1796, 250, '1ª/2ª geração', 'Picape leve líder de vendas no Brasil.'],
  ['Fiat', 'Strada', 2014,2020, 'Flex', '1.4L/1.8L EVO', 132, 'Manual', 4, 'Pickup', 1747, 400, '3ª geração', 'Cabine dupla, maior capacidade de carga.'],
  ['Fiat', 'Strada', 2020,2026, 'Flex', '1.3L/1.0L Turbo', 130, 'CVT', 4, 'Pickup', 1332, 700, '4ª geração (Nova Strada)', 'Picape mais vendida do Brasil, 4 portas, multimídia.'],
  ['Fiat', 'Toro', 2016,2026, 'Diesel', '2.0L Multijet', 170, 'Automatic', 4, 'Pickup', 1956, 1100, 'Única geração', 'Picape média, conforto de SUV, motor diesel/turbo flex.'],
  ['Fiat', 'Siena', 1997,2016, 'Flex', '1.0L/1.4L/1.6L', 117, 'Manual', 4, 'Sedan', 1598, 250, 'Todas gerações', 'Sedan compacto familiar, sucessor do Prêmio.'],
  ['Fiat', 'Mobi', 2016,2026, 'Flex', '1.0L Fire EVO', 75, 'Manual', 4, 'Hatchback', 999, 450, 'Única geração', 'Subcompacto urbano, sucessor do Uno Mille.'],
  ['Fiat', 'Argo', 2017,2026, 'Flex', '1.0L/1.3L/1.8L', 139, 'CVT', 4, 'Hatchback', 1747, 650, 'Única geração', 'Hatch premium, plataforma global, central Uconnect.'],
  ['Fiat', 'Cronos', 2018,2026, 'Flex', '1.3L/1.8L', 139, 'CVT', 4, 'Sedan', 1747, 700, 'Única geração', 'Sedan compacto baseado no Argo.'],
  ['Fiat', 'Pulse', 2021,2026, 'Flex', '1.0L Turbo/1.3L', 130, 'CVT', 4, 'SUV', 1332, 900, 'Única geração', 'SUV compacto brasileiro, motor turbo flex.'],
  ['Fiat', 'Fastback', 2022,2026, 'Flex', '1.0L Turbo/1.3L', 185, 'Automatic', 4, 'SUV', 1332, 1150, 'Única geração', 'SUV cupê, o mais potente Fiat nacional.'],
  ['Fiat', 'Titano', 2024,2026, 'Diesel', '2.2L Turbo Diesel', 200, 'Automatic', 4, 'Pickup', 2179, 1700, 'Única geração', 'Picape média. Motor diesel. Nova aposta da Fiat.'],

  // ========== VOLKSWAGEN ==========
  ['Volkswagen', 'Gol', 1980,2008, 'Flex', '1.0L/1.6L/1.8L', 103, 'Manual', 2, 'Hatchback', 1781, 175, 'G1-G4', 'O carro mais vendido da história do Brasil (até 2013).'],
  ['Volkswagen', 'Gol', 2009,2022, 'Flex', '1.0L/1.6L MSI', 120, 'Manual', 4, 'Hatchback', 1598, 450, 'G5-G8 (Novo Gol)', 'Redesign completo, motor EA211 1.6 MSI.'],
  ['Volkswagen', 'Voyage', 1981,2022, 'Flex', '1.0L/1.6L', 120, 'Manual', 4, 'Sedan', 1598, 425, 'Todas gerações', 'Versão sedan do Gol, sucesso entre frotistas.'],
  ['Volkswagen', 'Saveiro', 1982,2026, 'Flex', '1.6L MSI', 120, 'Manual', 2, 'Pickup', 1598, 700, 'Todas gerações', 'Picape leve derivada do Gol, robusta e confiável.'],
  ['Volkswagen', 'Parati', 1982,2012, 'Flex', '1.6L/1.8L', 103, 'Manual', 4, 'Wagon', 1781, 225, 'G1-G4', 'Station wagon clássica da VW no Brasil.'],
  ['Volkswagen', 'Fox', 2003,2019, 'Flex', '1.0L/1.6L', 104, 'Manual', 4, 'Hatchback', 1598, 300, 'Única geração', 'Hatch alto (high-roof), design europeu.'],
  ['Volkswagen', 'CrossFox', 2005,2019, 'Flex', '1.6L MSI', 120, 'Manual', 4, 'SUV', 1598, 375, 'Única geração', 'Versão aventureira do Fox, visual off-road.'],
  ['Volkswagen', 'SpaceFox', 2006,2017, 'Flex', '1.6L MSI', 120, 'Manual', 4, 'Wagon', 1598, 325, 'Única geração', 'Station wagon familiar, 7 lugares.'],
  ['Volkswagen', 'Up!', 2014,2021, 'Flex', '1.0L TSI', 105, 'Manual', 4, 'Hatchback', 999, 425, 'Única geração', 'Subcompacto global, motor turbo TSI premiado.'],
  ['Volkswagen', 'Polo', 2018,2026, 'Flex', '1.0L TSI/1.4L', 150, 'Automatic', 4, 'Hatchback', 1395, 850, 'MQB-A0 (Novo Polo)', 'Plataforma MQB, design europeu, motor turbo.'],
  ['Volkswagen', 'Virtus', 2018,2026, 'Flex', '1.0L TSI/1.4L', 150, 'Automatic', 4, 'Sedan', 1395, 900, 'MQB-A0 (Novo Virtus)', 'Sedan baseado no Polo, amplo porta-malas.'],
  ['Volkswagen', 'T-Cross', 2019,2026, 'Flex', '1.0L TSI/1.4L', 150, 'Automatic', 4, 'SUV', 1395, 1050, 'MQB-A0', 'SUV compacto, produzido em São José dos Pinhais.'],
  ['Volkswagen', 'Nivus', 2020,2026, 'Flex', '1.0L TSI', 128, 'Automatic', 4, 'SUV', 999, 1000, 'MQB-A0 (Nivus)', 'SUV cupê, primeiro VW com VW Play.'],
  ['Volkswagen', 'Taos', 2021,2026, 'Flex', '1.4L TSI', 150, 'Automatic', 4, 'SUV', 1395, 1350, 'MQB (Taos)', 'SUV médio argentino, rival do Compass.'],
  ['Volkswagen', 'Amarok', 2010,2026, 'Diesel', '3.0L V6 TDI', 258, 'Automatic', 4, 'Pickup', 2996, 1750, '1ª/2ª geração', 'Picape média, motor V6 diesel, produzida na Argentina.'],

  // ========== CHEVROLET ==========
  ['Chevrolet', 'Corsa', 1994,2010, 'Flex', '1.0L/1.8L', 114, 'Manual', 2, 'Hatchback', 1796, 150, '1ª/2ª geração', 'Hatch de sucesso nos anos 90/2000.'],
  ['Chevrolet', 'Classic', 1996,2016, 'Flex', '1.0L VHCE', 78, 'Manual', 4, 'Sedan', 999, 200, 'Única geração', 'Sedan de entrada, baseado no Corsa B.'],
  ['Chevrolet', 'Celta', 2000,2015, 'Flex', '1.0L VHCE', 78, 'Manual', 2, 'Hatchback', 999, 175, 'Única geração', 'Popular de entrada, sucessor do Corsa.'],
  ['Chevrolet', 'Onix', 2012,2019, 'Flex', '1.0L/1.4L', 106, 'Manual', 4, 'Hatchback', 1389, 375, '1ª geração', 'Hatch mais vendido do Brasil de 2015 a 2021.'],
  ['Chevrolet', 'Onix', 2020,2026, 'Flex', '1.0L Turbo', 116, 'Automatic', 4, 'Hatchback', 999, 750, '2ª geração (Novo Onix)', 'Plataforma GEM, turbo flex, MyLink, WiFi.'],
  ['Chevrolet', 'Onix Plus', 2019,2026, 'Flex', '1.0L Turbo', 116, 'Automatic', 4, 'Sedan', 999, 800, 'Única geração', 'Sedan mais vendido do Brasil.'],
  ['Chevrolet', 'Prisma', 2006,2019, 'Flex', '1.0L/1.4L', 106, 'Manual', 4, 'Sedan', 1389, 325, '1ª/2ª geração', 'Sedan derivado do Onix/Celta.'],
  ['Chevrolet', 'Cobalt', 2011,2022, 'Flex', '1.4L/1.8L', 111, 'Automatic', 4, 'Sedan', 1796, 450, 'Única geração', 'Sedan médio, amplo espaço, bom custo-benefício.'],
  ['Chevrolet', 'Cruze', 2011,2023, 'Flex', '1.4L Turbo', 153, 'Automatic', 4, 'Sedan', 1399, 900, '1ª/2ª geração', 'Sedan médio premium, motor turbo, boa dirigibilidade.'],
  ['Chevrolet', 'Spin', 2012,2026, 'Flex', '1.8L', 111, 'Automatic', 4, 'Minivan', 1796, 750, 'Única geração', 'Minivan 7 lugares, única do segmento no Brasil.'],
  ['Chevrolet', 'Tracker', 2013,2026, 'Flex', '1.0L/1.2L Turbo', 133, 'Automatic', 4, 'SUV', 1199, 1000, '1ª/2ª geração', 'SUV compacto global.'],
  ['Chevrolet', 'S10', 1995,2026, 'Diesel', '2.8L Turbo Diesel', 200, 'Automatic', 4, 'Pickup', 2776, 1500, 'Todas gerações', 'Picape média, motor diesel, capacidade off-road.'],
  ['Chevrolet', 'Trailblazer', 2012,2026, 'Diesel', '2.8L Turbo Diesel', 200, 'Automatic', 4, 'SUV', 2776, 1600, '1ª/2ª geração', 'SUV 7 lugares, baseado na S10.'],
  ['Chevrolet', 'Montana', 2023,2026, 'Flex', '1.2L Turbo', 133, 'Automatic', 4, 'Pickup', 1199, 900, 'Nova Montana', 'Picape monobloco, rival da Fiat Toro.'],

  // ========== HYUNDAI ==========
  ['Hyundai', 'HB20', 2012,2019, 'Flex', '1.0L/1.6L', 128, 'Manual', 4, 'Hatchback', 1591, 375, '1ª geração', 'Hatch desenvolvido para o Brasil, design fluido.'],
  ['Hyundai', 'HB20', 2020,2026, 'Flex', '1.0L Turbo/1.0L', 120, 'Automatic', 4, 'Hatchback', 998, 750, '2ª geração (Novo HB20)', 'Redesign, motor turbo, central BlueNav.'],
  ['Hyundai', 'HB20S', 2012,2026, 'Flex', '1.0L Turbo/1.6L', 128, 'Automatic', 4, 'Sedan', 1591, 725, '1ª/2ª geração', 'Versão sedan do HB20.'],
  ['Hyundai', 'HB20X', 2014,2026, 'Flex', '1.6L', 128, 'Automatic', 4, 'SUV', 1591, 825, '1ª/2ª geração', 'Versão aventureira com suspensão elevada.'],

  // ========== RENAULT ==========
  ['Renault', 'Kwid', 2017,2026, 'Flex', '1.0L SCE', 71, 'Manual', 4, 'Hatchback', 999, 400, 'Única geração', 'Subcompacto de entrada, o mais barato do Brasil.'],
  ['Renault', 'Sandero', 2007,2026, 'Flex', '1.0L/1.6L/2.0L', 118, 'Manual', 4, 'Hatchback', 1598, 500, '1ª/2ª geração', 'Hatch compacto, robusto, derivado do Logan.'],
  ['Renault', 'Logan', 2007,2026, 'Flex', '1.0L/1.6L', 118, 'Manual', 4, 'Sedan', 1598, 500, '1ª/2ª geração', 'Sedan espaçoso, excelente porta-malas.'],
  ['Renault', 'Stepway', 2008,2026, 'Flex', '1.6L', 118, 'Manual', 4, 'Hatchback', 1598, 600, '1ª/2ª geração', 'Versão aventureira do Sandero.'],
  ['Renault', 'Duster', 2011,2026, 'Flex', '1.6L/2.0L', 148, 'CVT', 4, 'SUV', 1998, 850, '1ª/2ª geração', 'SUV médio, 4x4, excelente custo-benefício.'],
  ['Renault', 'Oroch', 2015,2026, 'Flex', '1.6L/2.0L', 148, 'CVT', 4, 'Pickup', 1998, 900, 'Única geração', 'Picape derivada do Duster, 4 portas.'],
  ['Renault', 'Captur', 2017,2026, 'Flex', '1.3L Turbo', 170, 'CVT', 4, 'SUV', 1332, 1100, 'Única geração', 'SUV compacto premium, design europeu.'],
  ['Renault', 'Kardian', 2024,2026, 'Flex', '1.0L Turbo', 125, 'Automatic', 4, 'SUV', 999, 950, 'Única geração (Kardian)', 'Novo SUV compacto brasileiro.'],

  // ========== TOYOTA ==========
  ['Toyota', 'Bandeirante', 1961,2001, 'Diesel', '3.7L/4.0L Diesel', 98, 'Manual', 2, 'SUV', 3661, 300, 'Bandeirante (J40)', 'Land Cruiser brasileiro. Motor Mercedes Diesel. Produção de 40 anos.'],
  ['Toyota', 'Corolla', 1998,2026, 'Flex', '2.0L/1.8L Hybrid', 177, 'CVT', 4, 'Sedan', 1987, 1250, 'Todas gerações BR', 'Sedan médio mais vendido do mundo, feito em Indaiatuba-SP.'],
  ['Toyota', 'Corolla Cross', 2022,2026, 'Flex', '2.0L/1.8L Hybrid', 177, 'CVT', 4, 'SUV', 1987, 1400, 'Única geração', 'SUV baseado no Corolla, híbrido flex inédito.'],
  ['Toyota', 'Hilux', 1990,2026, 'Diesel', '2.8L Turbo Diesel', 204, 'Automatic', 4, 'Pickup', 2755, 1900, 'Todas gerações', 'Picape média, referência em robustez e revenda.'],
  ['Toyota', 'SW4', 2005,2026, 'Diesel', '2.8L Turbo Diesel', 204, 'Automatic', 4, 'SUV', 2755, 2000, 'Todas gerações', 'SUV 7 lugares baseado na Hilux.'],
  ['Toyota', 'Yaris', 2018,2026, 'Flex', '1.5L', 110, 'CVT', 4, 'Hatchback', 1496, 800, 'Única geração', 'Hatch compacto premium.'],
  ['Toyota', 'Yaris Sedan', 2018,2026, 'Flex', '1.5L', 110, 'CVT', 4, 'Sedan', 1496, 850, 'Única geração', 'Sedan compacto, sucessor do Etios.'],
  ['Toyota', 'Etios', 2012,2021, 'Flex', '1.3L/1.5L', 96, 'Manual', 4, 'Hatchback', 1496, 400, 'Única geração', 'Hatch de entrada da Toyota no Brasil.'],

  // ========== JEEP ==========
  ['Jeep', 'Renegade', 2015,2026, 'Flex', '1.8L/1.3L Turbo', 185, 'Automatic', 4, 'SUV', 1332, 1000, 'Única geração', 'SUV compacto mais vendido do Brasil, feito em Goiana-PE.'],
  ['Jeep', 'Compass', 2017,2026, 'Flex', '2.0L/1.3L Turbo', 185, 'Automatic', 4, 'SUV', 1332, 1350, '1ª/2ª geração', 'SUV médio, líder do segmento no Brasil.'],
  ['Jeep', 'Commander', 2022,2026, 'Flex', '2.0L Turbo/1.3L', 185, 'Automatic', 4, 'SUV', 1995, 1650, 'Única geração', 'SUV 7 lugares, topo de linha Jeep no Brasil.'],

  // ========== HONDA ==========
  ['Honda', 'City', 2009,2026, 'Flex', '1.5L', 126, 'CVT', 4, 'Sedan', 1497, 900, 'Todas gerações', 'Sedan compacto premium, confiabilidade Honda.'],
  ['Honda', 'City Hatch', 2022,2026, 'Flex', '1.5L', 126, 'CVT', 4, 'Hatchback', 1497, 850, 'Única geração', 'Versão hatch do City, importado.'],
  ['Honda', 'HR-V', 2015,2026, 'Flex', '1.5L Turbo', 177, 'CVT', 4, 'SUV', 1498, 1150, '1ª/2ª geração', 'SUV compacto, motor turbo, design arrojado.'],
  ['Honda', 'WR-V', 2017,2026, 'Flex', '1.5L', 116, 'CVT', 4, 'SUV', 1497, 800, 'Única geração', 'SUV de entrada, baseado no Fit.'],
  ['Honda', 'Fit', 2003,2021, 'Flex', '1.5L', 116, 'CVT', 4, 'Hatchback', 1497, 450, 'Todas gerações', 'Hatch versátil, sistema Magic Seat.'],

  // ========== FORD ==========
  ['Ford', 'Ka', 1997,2021, 'Flex', '1.0L/1.5L', 136, 'Manual', 4, 'Hatchback', 1497, 350, 'Todas gerações', 'Hatch compacto, ágil e econômico.'],
  ['Ford', 'Ka Sedan', 2015,2021, 'Flex', '1.5L', 136, 'Manual', 4, 'Sedan', 1497, 400, 'Única geração', 'Sedan compacto baseado no Ka.'],
  ['Ford', 'EcoSport', 2003,2020, 'Flex', '1.5L/2.0L', 176, 'Automatic', 4, 'SUV', 1999, 600, '1ª/2ª geração', 'SUV compacto pioneiro no Brasil.'],
  ['Ford', 'Ranger', 1995,2026, 'Diesel', '3.0L/2.0L Turbo Diesel', 213, 'Automatic', 4, 'Pickup', 1996, 1600, 'Todas gerações', 'Picape média, produzida na Argentina.'],
  ['Ford', 'Maverick', 2022,2026, 'Hybrid', '2.5L Hybrid', 194, 'CVT', 4, 'Pickup', 2488, 1500, 'Única geração', 'Picape monobloco híbrida, importada do México.'],
  ['Ford', 'Bronco Sport', 2021,2026, 'Flex', '2.0L Turbo', 253, 'Automatic', 4, 'SUV', 1999, 1600, 'Única geração', 'SUV off-road, visual retrô.'],
  ['Ford', 'Territory', 2022,2026, 'Flex', '1.5L Turbo', 150, 'CVT', 4, 'SUV', 1490, 1150, 'Única geração', 'SUV médio, projeto chinês, vendido no Brasil.'],

  // ========== NISSAN ==========
  ['Nissan', 'Kicks', 2017,2026, 'Flex', '1.6L', 114, 'CVT', 4, 'SUV', 1598, 900, 'Única geração', 'SUV compacto, design moderno, feito em Resende-RJ.'],
  ['Nissan', 'Versa', 2012,2026, 'Flex', '1.6L', 114, 'CVT', 4, 'Sedan', 1598, 750, '1ª/2ª geração', 'Sedan compacto, amplo espaço interno.'],
  ['Nissan', 'Frontier', 2002,2026, 'Diesel', '2.3L Turbo Diesel', 190, 'Automatic', 4, 'Pickup', 2298, 1600, 'Todas gerações', 'Picape média, motor diesel, robusta.'],
  ['Nissan', 'March', 2011,2020, 'Flex', '1.0L/1.6L', 111, 'Manual', 4, 'Hatchback', 1598, 325, 'Única geração', 'Hatch subcompacto, ágil na cidade.'],

  // ========== PEUGEOT & CITROËN ==========
  ['Peugeot', '208', 2013,2026, 'Flex', '1.6L/1.0L Turbo', 130, 'Automatic', 4, 'Hatchback', 1598, 750, '1ª/2ª geração', 'Hatch premium, motor turbo, i-Cockpit.'],
  ['Peugeot', '2008', 2015,2026, 'Flex', '1.6L/1.0L Turbo', 173, 'Automatic', 4, 'SUV', 1598, 1000, '1ª/2ª geração', 'SUV compacto, design arrojado.'],
  ['Citroën', 'C3', 2003,2026, 'Flex', '1.6L/1.0L Turbo', 130, 'Automatic', 4, 'Hatchback', 1598, 700, '1ª/2ª/3ª geração', 'Hatch compacto, estilo único.'],
  ['Citroën', 'C3 Aircross', 2010,2026, 'Flex', '1.6L', 118, 'Manual', 4, 'SUV', 1598, 600, 'Única geração', 'SUV compacto, versão antiga com 7 lugares.'],
  ['Citroën', 'C4 Cactus', 2020,2026, 'Flex', '1.6L Turbo', 173, 'Automatic', 4, 'SUV', 1598, 950, 'Única geração', 'SUV médio, suspensão confortável.'],

  // ========== CAOA CHERY ==========
  ['Chery', 'Tiggo 5X', 2018,2026, 'Flex', '1.5L Turbo', 150, 'CVT', 4, 'SUV', 1498, 900, 'Única geração', 'SUV médio, design global, feito em Anápolis-GO.'],
  ['Chery', 'Tiggo 7 Pro', 2022,2026, 'Flex', '1.5L Turbo', 150, 'CVT', 4, 'SUV', 1498, 1050, 'Única geração', 'SUV médio premium, teto panorâmico.'],
  ['Chery', 'Tiggo 8', 2020,2026, 'Flex', '1.6L Turbo', 187, 'Automatic', 4, 'SUV', 1598, 1300, 'Única geração', 'SUV grande 7 lugares.'],
  ['Chery', 'Arrizo 6', 2020,2026, 'Flex', '1.5L Turbo', 150, 'CVT', 4, 'Sedan', 1498, 850, 'Única geração', 'Sedan médio, design elegante.'],

  // ========== BYD ==========
  ['BYD', 'Dolphin', 2023,2026, 'Electric', 'Elétrico 95cv', 95, 'Automatic', 4, 'Hatchback', 0, 1150, 'Única geração', 'Elétrico mais vendido do Brasil.'],
  ['BYD', 'Seal', 2023,2026, 'Electric', 'Elétrico 531cv', 531, 'Automatic', 4, 'Sedan', 0, 2250, 'Única geração', 'Sedan elétrico premium, 0-100 em 3.8s.'],
  ['BYD', 'Yuan Plus', 2024,2026, 'Electric', 'Elétrico 204cv', 204, 'Automatic', 4, 'SUV', 0, 1600, 'Única geração', 'SUV elétrico compacto.'],
  ['BYD', 'Song Plus', 2024,2026, 'Hybrid', '1.5L+Elétrico', 235, 'Automatic', 4, 'SUV', 1498, 1600, 'Única geração', 'SUV híbrido plug-in.'],

  // ========== MITSUBISHI ==========
  ['Mitsubishi', 'Eclipse Cross', 2019,2026, 'Flex', '1.5L Turbo', 165, 'CVT', 4, 'SUV', 1499, 1100, 'Única geração', 'SUV médio, feito em Catalão-GO.'],
  ['Mitsubishi', 'Pajero Sport', 2016,2026, 'Diesel', '2.4L Turbo Diesel', 190, 'Automatic', 4, 'SUV', 2442, 1750, 'Única geração', 'SUV 7 lugares, motor diesel.'],
  ['Mitsubishi', 'L200 Triton', 2016,2026, 'Diesel', '2.4L Turbo Diesel', 190, 'Automatic', 4, 'Pickup', 2442, 1650, 'Única geração', 'Picape média diesel.'],

  // ========== GWM ==========
  ['GWM', 'Haval H6', 2023,2026, 'Hybrid', '1.5L Turbo+Elétrico', 393, 'Automatic', 4, 'SUV', 1499, 1900, 'Única geração', 'SUV híbrido mais vendido do Brasil em 2024.'],
  ['GWM', 'Ora 03', 2023,2026, 'Electric', 'Elétrico 171cv', 171, 'Automatic', 4, 'Hatchback', 0, 1350, 'Única geração', 'Hatch elétrico premium, estilo retrô.'],

  // ========== Troller (Brazilian brand, 1995-2022) ==========
  ['Troller', 'T4', 1998,2022, 'Diesel', '3.2L/2.2L Turbo Diesel', 200, 'Manual', 2, 'SUV', 2198, 1250, 'T4/T4-X4', 'SUV 4x4 genuinamente brasileiro. Motor MWM/Ford. Fim da produção em 2022.'],
];

// ==================== BUILD ====================

const colorOptions = ['Branco', 'Preto', 'Prata', 'Cinza', 'Vermelho', 'Azul', 'Verde', 'Marrom', 'Bege', 'Amarelo'];

function addCars(entries) {
  for (const entry of entries) {
    const [brand, model, yearStart, yearEnd, fuel, engine, hp, trans, doors, cat, cc, priceUsd, gen, desc] = entry;
    const step = Math.max(1, Math.floor((yearEnd - yearStart) / 6) || 1);

    for (let y = yearStart; y <= Math.min(yearEnd, 2026); y += step) {
      const isFlex = fuel === 'Flex' || fuel === 'Hybrid' ? 1 : 0;
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      const isOld = y < 1990;
      const fuelActual = isOld ? fuel.replace('Flex', 'Gasoline') : fuel;

      insert.run(
        brand, model, y, fuelActual,
        engine, hp, trans, doors, cat,
        cc || null, priceUsd || 8000, usdToBrl(priceUsd || 8000),
        img(brand, model, y), 'brasil-seed',
        isFlex, gen, desc, color
      );
    }
  }
}

const allEntries = [
  ...eraPioneira,
  ...eraGeia,
  ...eraMilagre,
  ...eraFiat,
  ...eraAbertura,
  ...eraModerna,
];

const transaction = db.transaction(() => addCars(allEntries));
transaction();

const stats = db.prepare('SELECT COUNT(*) as total, COUNT(DISTINCT brand) as brands, COUNT(DISTINCT model) as models, MIN(year) as min_year, MAX(year) as max_year FROM cars WHERE is_brazilian = 1').get();
console.log(`Brazilian Cars: ${stats.total} vehicles | ${stats.brands} brands | ${stats.models} models | ${stats.min_year}-${stats.max_year}`);

const fuel = db.prepare("SELECT fuel_type, COUNT(*) as c FROM cars WHERE is_brazilian = 1 GROUP BY fuel_type ORDER BY c DESC").all();
console.log('Fuels:', fuel.map(f => `${f.fuel_type}(${f.c})`).join(', '));

const top10 = db.prepare('SELECT brand, COUNT(*) as c FROM cars WHERE is_brazilian = 1 GROUP BY brand ORDER BY c DESC LIMIT 10').all();
console.log('Top brands:', top10.map(b => `${b.brand}(${b.c})`).join(', '));

const decades = db.prepare(`SELECT (year / 10) * 10 as decade, COUNT(*) as c FROM cars WHERE is_brazilian = 1 GROUP BY decade ORDER BY decade`).all();
console.log('By decade:', decades.map(d => `${d.decade}s:${d.c}`).join(', '));
