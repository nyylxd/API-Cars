const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Build all path definitions programmatically
const paths = {};

// ---- ROOT ----
paths['/'] = {
  get: {
    tags: ['General'],
    summary: 'API overview and live statistics',
    description: 'Returns API metadata, current database totals, available endpoints, dynamic fuel types, and sources.',
    responses: { 200: { description: 'API information' } }
  }
};

// ---- CARS ----
paths['/cars'] = {
  get: {
    tags: ['Cars'],
    summary: 'List and filter all vehicles — 9 vehicle types',
    description: 'Primary car listing endpoint with 20+ filter params. Supports combined global + Brazilian market filtering.',
    parameters: [
      { in: 'query', name: 'brand', schema: { type: 'string' }, description: 'Filter by brand (LIKE match)' },
      { in: 'query', name: 'model', schema: { type: 'string' }, description: 'Filter by model (LIKE match)' },
      { in: 'query', name: 'year', schema: { type: 'integer' }, description: 'Exact year match' },
      { in: 'query', name: 'year_min', schema: { type: 'integer' }, description: 'Minimum year' },
      { in: 'query', name: 'year_max', schema: { type: 'integer' }, description: 'Maximum year' },
      { in: 'query', name: 'fuel_type', schema: { type: 'string' }, description: 'Exact fuel type (Gasoline, Diesel, Flex, Electric, Hybrid)' },
      { in: 'query', name: 'category', schema: { type: 'string' }, description: 'Vehicle category (SUV, Sedan, Hatchback, Pickup, etc.)' },
      { in: 'query', name: 'transmission', schema: { type: 'string' }, description: 'Transmission type' },
      { in: 'query', name: 'color', schema: { type: 'string' }, description: 'Vehicle color' },
      { in: 'query', name: 'source', schema: { type: 'string' }, description: 'Data source (encar, brasil-seed, etc.)' },
      { in: 'query', name: 'min_price', schema: { type: 'number' }, description: 'Minimum price in USD' },
      { in: 'query', name: 'max_price', schema: { type: 'number' }, description: 'Maximum price in USD' },
      { in: 'query', name: 'price_brl_min', schema: { type: 'number' }, description: 'Minimum price in BRL (R$)' },
      { in: 'query', name: 'price_brl_max', schema: { type: 'number' }, description: 'Maximum price in BRL (R$)' },
      { in: 'query', name: 'min_mileage', schema: { type: 'integer' }, description: 'Minimum mileage in km' },
      { in: 'query', name: 'max_mileage', schema: { type: 'integer' }, description: 'Maximum mileage in km' },
      { in: 'query', name: 'is_new', schema: { type: 'boolean' }, description: 'Filter new vehicles only' },
      { in: 'query', name: 'is_brazilian', schema: { type: 'boolean' }, description: 'Filter Brazilian market cars only' },
      { in: 'query', name: 'flex_fuel', schema: { type: 'boolean' }, description: 'Filter flex-fuel vehicles only' },
      { in: 'query', name: 'has_accident', schema: { type: 'boolean' }, description: 'Vehicles with accident history' },
      { in: 'query', name: 'has_recall', schema: { type: 'boolean' }, description: 'Vehicles with open recalls' },
      { in: 'query', name: 'vehicle_type', schema: { type: 'string', enum: ['car','motorcycle','truck','bus','van','bicycle','tractor','motorhome'] }, description: 'Filter by vehicle type' },
      { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Full-text search (brand, model, description)' },
      { in: 'query', name: 'page', schema: { type: 'integer', default: 1 }, description: 'Page number' },
      { in: 'query', name: 'limit', schema: { type: 'integer', default: 20, maximum: 100 }, description: 'Items per page' },
      { in: 'query', name: 'sort', schema: { type: 'string', default: 'id', enum: ['id','brand','model','year','fuel_type','power_hp','category','price_usd','price_brl','mileage_km','engine_cc'] }, description: 'Sort field' },
      { in: 'query', name: 'order', schema: { type: 'string', default: 'asc', enum: ['asc','desc'] }, description: 'Sort order' },
    ],
    responses: { 200: { description: 'Paginated car list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedCars' } } } } }
  }
};

paths['/cars/{id}'] = {
  get: {
    tags: ['Cars'],
    summary: 'Get a single car by ID',
    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' }, description: 'Car database ID' }],
    responses: {
      200: { description: 'Car details with parsed photos and metadata' },
      404: { description: 'Car not found' }
    }
  }
};

// ---- BRANDS ----
paths['/brands'] = {
  get: {
    tags: ['Brands'],
    summary: 'List all car brands with statistics',
    description: 'Returns every brand with car count, model count, year range, avg prices, fuel types, logo URL, and country of origin.',
    responses: { 200: { description: 'Brand listing with stats' } }
  }
};

paths['/brands/{name}'] = {
  get: {
    tags: ['Brands'],
    summary: 'Get detailed info for a specific brand',
    description: 'Returns brand summary (totals, prices, fuel types) plus complete model list with per-model stats. Examples: /brands/Fiat, /brands/Jeep, /brands/Volkswagen',
    parameters: [{ in: 'path', name: 'name', required: true, schema: { type: 'string' }, description: 'Brand name (LIKE match)' }],
    responses: { 200: { description: 'Brand with model list' }, 404: { description: 'Brand not found' } }
  }
};

// ---- MODELS ----
paths['/models'] = {
  get: {
    tags: ['Models'],
    summary: 'List all car models grouped by brand',
    parameters: [{ in: 'query', name: 'brand', schema: { type: 'string' }, description: 'Filter by brand' }],
    responses: { 200: { description: 'Model listing grouped by brand and model' } }
  }
};

// ---- YEARS ----
paths['/years'] = {
  get: {
    tags: ['Years'],
    summary: 'Get yearly car statistics',
    description: 'Aggregated stats per year including brand count, model count, and average prices.',
    responses: { 200: { description: 'Year-by-year statistics' } }
  }
};

paths['/years/{year}'] = {
  get: {
    tags: ['Years'],
    summary: 'Get all cars from a specific year',
    parameters: [
      { in: 'path', name: 'year', required: true, schema: { type: 'integer' }, description: 'Year (e.g., 2024)' },
      { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
      { in: 'query', name: 'limit', schema: { type: 'integer', default: 50, maximum: 100 } },
    ],
    responses: { 200: { description: 'Cars for the year with stats' } }
  }
};

// ---- FUEL TYPES ----
paths['/fuel-types'] = {
  get: {
    tags: ['Fuel Types'],
    summary: 'List all fuel types with car counts',
    description: 'Fuel types found in the database. In Brazil, Flex (ethanol + gasoline) is dominant.',
    responses: { 200: { description: 'Fuel type statistics' } }
  }
};

// ---- CATEGORIES ----
paths['/categories'] = {
  get: {
    tags: ['Categories'],
    summary: 'List vehicle categories with counts',
    description: 'Vehicle body types/categories. Brazil top categories: SUV, Hatchback, Pickup, Sedan.',
    responses: { 200: { description: 'Category statistics' } }
  }
};

// ---- SOURCES ----
paths['/sources'] = {
  get: {
    tags: ['Sources'],
    summary: 'List car data sources (marketplaces)',
    description: 'Data sources: carapis.com marketplaces (encar, kbchachacha, etc.) plus brasil-seed for curated Brazilian car database.',
    responses: { 200: { description: 'Source listing with stats' } }
  }
};

// ---- STATS ----
paths['/stats'] = {
  get: {
    tags: ['Statistics'],
    summary: 'Complete database statistics',
    description: 'Full stats: totals, price ranges, mileage, new/used ratio, Brazilian market stats, top brands, fuel breakdown, categories.',
    responses: { 200: { description: 'Comprehensive statistics', content: { 'application/json': { schema: { $ref: '#/components/schemas/Stats' } } } } }
  }
};

// ---- BRASIL ----
paths['/brasil/stats'] = {
  get: {
    tags: ['Brasil 🇧🇷'],
    summary: 'Brazilian car market statistics',
    description: 'Stats exclusively for the Brazilian market: brand rankings, top models, flex-fuel breakdown, category distribution, BRL prices.',
    responses: { 200: { description: 'Brazilian market overview', content: { 'application/json': { schema: { $ref: '#/components/schemas/BrazilianStats' } } } } }
  }
};

paths['/brasil/brands'] = {
  get: {
    tags: ['Brasil 🇧🇷'],
    summary: 'List all Brazilian-market car brands',
    description: 'Brands present in the Brazilian market only, with flex-fuel counts, BRL prices, and popular categories.',
    responses: { 200: { description: 'Brazilian brand listing' } }
  }
};

paths['/brasil/cars'] = {
  get: {
    tags: ['Brasil 🇧🇷'],
    summary: 'List and filter Brazilian-market cars only',
    description: 'Same as /cars but pre-filtered to Brazilian market. All standard filters apply. Examples: /brasil/cars?fuel_type=Flex, /brasil/cars?category=Pickup, /brasil/cars?price_brl_max=80000&category=SUV',
    parameters: [
      { in: 'query', name: 'brand', schema: { type: 'string' }, description: 'Filter by brand' },
      { in: 'query', name: 'model', schema: { type: 'string' }, description: 'Filter by model' },
      { in: 'query', name: 'year', schema: { type: 'integer' }, description: 'Exact year' },
      { in: 'query', name: 'year_min', schema: { type: 'integer' }, description: 'Min year' },
      { in: 'query', name: 'year_max', schema: { type: 'integer' }, description: 'Max year' },
      { in: 'query', name: 'fuel_type', schema: { type: 'string' }, description: 'Fuel type (Flex, Gasoline, Diesel, Electric, Hybrid)' },
      { in: 'query', name: 'category', schema: { type: 'string' }, description: 'Category (SUV, Hatchback, Pickup, Sedan, etc.)' },
      { in: 'query', name: 'transmission', schema: { type: 'string' }, description: 'Transmission type' },
      { in: 'query', name: 'color', schema: { type: 'string' }, description: 'Color' },
      { in: 'query', name: 'price_brl_min', schema: { type: 'number' }, description: 'Min price in BRL (R$)' },
      { in: 'query', name: 'price_brl_max', schema: { type: 'number' }, description: 'Max price in BRL (R$)' },
      { in: 'query', name: 'flex_fuel', schema: { type: 'boolean' }, description: 'Flex-fuel only' },
      { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search brand/model/description' },
      { in: 'query', name: 'page', schema: { type: 'integer', default: 1 }, description: 'Page number' },
      { in: 'query', name: 'limit', schema: { type: 'integer', default: 20, maximum: 100 }, description: 'Items per page' },
      { in: 'query', name: 'sort', schema: { type: 'string', default: 'id', enum: ['id','brand','model','year','price_brl','power_hp'] }, description: 'Sort field' },
      { in: 'query', name: 'order', schema: { type: 'string', default: 'asc', enum: ['asc','desc'] }, description: 'Sort order' },
    ],
    responses: { 200: { description: 'Paginated Brazilian car list' } }
  }
};

// ---- VEHICLE TYPES ----
paths['/vehicle-types'] = {
  get: {
    tags: ['Vehicle Types'],
    summary: 'List all vehicle types with statistics',
    description: 'Returns all 9 vehicle types with brand, model, category, and fuel type breakdowns.',
    responses: { 200: { description: 'Vehicle type statistics' } }
  }
};

// ---- MUNDO ----
paths['/mundo'] = {
  get: {
    tags: ['Mundo \u{1F30E}'],
    summary: 'World vehicle database — Americas focus',
    description: 'Cars, motorcycles, trucks, buses, vans, bicycles, tractors, motorhomes.',
    parameters: [
      { in: 'query', name: 'vehicle_type', schema: { type: 'string', enum: ['car','motorcycle','truck','bus','van','bicycle','tractor','motorhome'] }, description: 'Vehicle type' },
      { in: 'query', name: 'brand', schema: { type: 'string' }, description: 'Brand' },
      { in: 'query', name: 'model', schema: { type: 'string' }, description: 'Model' },
      { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
      { in: 'query', name: 'limit', schema: { type: 'integer', default: 20, maximum: 100 } },
    ],
    responses: { 200: { description: 'Paginated world vehicle list' } }
  }
};

// ---- CARAPIS PROXY ----
paths['/carapis/detail/{uuid}'] = {
  get: {
    tags: ['Carapis Proxy'],
    summary: 'Live detail from carapis.com by vehicle UUID',
    parameters: [{ in: 'path', name: 'uuid', required: true, schema: { type: 'string' }, description: 'Carapis vehicle UUID' }],
    responses: { 200: { description: 'Full vehicle detail from carapis.com' }, 502: { description: 'Proxy error' } }
  }
};

paths['/carapis/enrich/{id}'] = {
  post: {
    tags: ['Carapis Proxy'],
    summary: 'Enrich a local car with full detail from carapis.com',
    description: 'Fetches complete vehicle detail (description, accident history, valuation, photos, metadata) from carapis.com and upserts into local DB. Accepts local numeric ID or carapis UUID.',
    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Local DB id or carapis UUID' }],
    responses: { 200: { description: 'Enriched car data' }, 500: { description: 'Error' } }
  }
};

paths['/carapis/enrich/batch'] = {
  post: {
    tags: ['Carapis Proxy'],
    summary: 'Batch enrich multiple vehicles',
    requestBody: {
      required: true,
      content: { 'application/json': { schema: { type: 'object', required: ['ids'], properties: { ids: { type: 'array', items: { type: 'string' }, description: 'Local IDs or carapis UUIDs' }, limit: { type: 'integer', default: 10, maximum: 50 } } } } }
    },
    responses: { 200: { description: 'Enrichment results' } }
  }
};

paths['/carapis/search'] = {
  post: {
    tags: ['Carapis Proxy'],
    summary: 'Proxy search to carapis.com with native parameters',
    requestBody: {
      required: true,
      content: { 'application/json': { schema: { type: 'object', properties: { brand: { type: 'string' }, model: { type: 'string' }, year: { type: 'integer' }, fuel_type: { type: 'string' }, page_size: { type: 'integer' }, page: { type: 'integer' } } } } }
    },
    responses: { 200: { description: 'Raw carapis.com search results' }, 502: { description: 'Proxy error' } }
  }
};

// ---- BUILD SPEC ----
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API-Cars — Complete Vehicle Database',
      version: '4.0.0',
      description: [
        '# API-Cars — The Complete Vehicle Database',
        '',
        'A comprehensive REST API with **32,000+ vehicles** combining global market data',
        'from carapis.com and a **curated Brazilian car database**.',
        '',
        '## What You Get',
        '- **Global vehicles**: 31,000+ cars from Korean, Japanese, and European markets via carapis.com',
        '- **Brazilian market**: 645+ specifically Brazilian models (Gol, Uno, Onix, Strada, HB20...)',
        '- **Flex fuel**: The complete Brazilian flex-fuel ecosystem (ethanol + gasoline)',
        '- **Dual pricing**: Prices in both USD and BRL (Brazilian Real)',
        '- **Full search**: Brand, model, description, year, fuel type, transmission, color, price range',
        '- **Photos**: Image URLs for every vehicle',
        '- **Rich stats**: Brand rankings, market breakdowns, price distributions',
        '',
        '## Brazilian Car Market',
        'Brazil has one of the world\'s largest car markets with unique characteristics:',
        '- **Flex fuel vehicles** dominate (ethanol + gasoline mix)',
        '- **Compact hatchbacks** are the most popular segment',
        '- **Pickups** (Strada, Toro, Saveiro) are top sellers',
        '- **SUVs** have exploded in popularity since 2015',
        '- Major brands: **Fiat, Volkswagen, Chevrolet, Hyundai, Jeep, Renault, Toyota, Honda**',
        '',
        '## Fuel Types',
        '| Fuel Type | Description |',
        '|-----------|-------------|',
        '| Flex | Ethanol (E100) + Gasoline (E27 blend) — Brazil-specific |',
        '| Gasoline | Pure petrol |',
        '| Diesel | Common in pickups and large SUVs |',
        '| Electric | BEV (Battery Electric Vehicle) |',
        '| Hybrid | HEV/PHEV (Hybrid Electric Vehicle) |',
        '',
        '## Quick Start',
        '',
        '### Global',
        '- `GET /cars?brand=Ferrari` — All Ferraris',
        '- `GET /cars?year=2025&fuel_type=Electric` — 2025 EVs',
        '- `GET /brands/BMW` — BMW details and models',
        '',
        '### Brazil',
        '- `GET /brasil/cars?fuel_type=Flex&year_min=2020` — Recent flex-fuel cars',
        '- `GET /brasil/cars?category=Pickup` — Brazilian pickups',
        '- `GET /brasil/cars?brand=Jeep` — Brazilian Jeep models',
        '- `GET /brasil/cars?price_brl_max=80000&category=SUV` — SUVs under R\\$80k',
        '- `GET /brasil/stats` — Brazilian market overview',
      ].join('\n'),
      contact: { name: 'API-Cars Support' }
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local development server' }],
    tags: [
      { name: 'General', description: 'API information and health status' },
      { name: 'Cars', description: 'All vehicles — search, filter, paginate across all types' },
      { name: 'Brands', description: 'Brand information, models, pricing, country of origin' },
      { name: 'Models', description: 'Model listings grouped by brand' },
      { name: 'Years', description: 'Year-based queries and statistics' },
      { name: 'Fuel Types', description: 'Fuel type breakdown (Flex, Gasoline, Diesel, Electric, Hybrid)' },
      { name: 'Categories', description: 'Vehicle/body categories' },
      { name: 'Vehicle Types', description: 'Vehicle type breakdown (car, motorcycle, truck, bus, van, bicycle, tractor, motorhome)' },
      { name: 'Sources', description: 'Data source tracking (carapis.com marketplaces, brasil-seed)' },
      { name: 'Statistics', description: 'Comprehensive database analytics' },
      { name: 'Mundo \u{1F30E}', description: 'World vehicles — Americas focus. Cars, motorcycles, trucks, tractors, bikes, RVs' },
      { name: 'Brasil \u{1F1E7}\u{1F1F7}', description: 'Brazilian market exclusive — flex-fuel cars, BRL pricing, BR models' },
      { name: 'Carapis Proxy', description: 'Live proxy to carapis.com — detail, enrich, search' },
    ],
    paths,
    components: {
      schemas: {
        Car: {
          type: 'object',
          description: 'A car/vehicle record in the database',
          properties: {
            id: { type: 'integer', example: 1 },
            brand: { type: 'string', example: 'Fiat' },
            model: { type: 'string', example: 'Strada' },
            year: { type: 'integer', example: 2023 },
            fuel_type: { type: 'string', example: 'Flex', enum: ['Flex','Gasoline','Diesel','Electric','Hybrid','Unknown'] },
            engine: { type: 'string', example: '1.3L Turbo', nullable: true },
            power_hp: { type: 'integer', example: 130, nullable: true },
            transmission: { type: 'string', example: 'CVT', nullable: true },
            doors: { type: 'integer', example: 4, nullable: true },
            category: { type: 'string', example: 'Pickup', nullable: true },
            image_url: { type: 'string', nullable: true },
            photo_urls: { type: 'string', description: 'JSON array of photo URLs', nullable: true },
            color: { type: 'string', example: 'Vermelho', nullable: true },
            mileage_km: { type: 'integer', example: 45000, nullable: true },
            price_usd: { type: 'number', format: 'float', example: 14000.0, nullable: true },
            price_brl: { type: 'number', format: 'float', description: 'Price in Brazilian Real (R$)', example: 77000.0, nullable: true },
            engine_cc: { type: 'integer', example: 1332, nullable: true },
            source: { type: 'string', example: 'brasil-seed', nullable: true },
            is_new: { type: 'integer', example: 0, nullable: true },
            is_brazilian: { type: 'integer', description: '1 = Brazilian market vehicle', example: 1 },
            flex_fuel: { type: 'integer', description: '1 = Flex-fuel (ethanol + gasoline)', example: 1 },
            description: { type: 'string', description: 'May be in Portuguese for BR cars', nullable: true },
            generation: { type: 'string', example: '4ª geração (Nova Strada)', nullable: true },
            country_of_origin: { type: 'string', example: 'Italy', nullable: true },
            has_accident: { type: 'integer', nullable: true },
            has_recall: { type: 'integer', nullable: true },
            valuation_score: { type: 'number', format: 'float', nullable: true },
          }
        },
        BrazilianStats: {
          type: 'object',
          properties: {
            total_cars: { type: 'integer', example: 645 },
            total_brands: { type: 'integer', example: 16 },
            total_models: { type: 'integer', example: 94 },
            flex_fuel_cars: { type: 'integer', example: 552 },
            flex_fuel_pct: { type: 'integer', example: 86 },
            price_range_brl: { type: 'object', properties: { min: { type: 'number' }, max: { type: 'number' }, avg: { type: 'number' } } },
            top_brands: { type: 'array', items: { type: 'object' } },
            top_models: { type: 'array', items: { type: 'object' } },
            by_fuel: { type: 'array', items: { type: 'object' } },
            by_category: { type: 'array', items: { type: 'object' } },
          }
        },
        PaginatedCars: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total_pages: { type: 'integer' },
            data: { type: 'array', items: { $ref: '#/components/schemas/Car' } }
          }
        },
        Stats: {
          type: 'object',
          properties: {
            total_cars: { type: 'integer' },
            total_brands: { type: 'integer' },
            brazilian_cars: { type: 'integer' },
            brazilian_brands: { type: 'integer' },
            flex_fuel_cars: { type: 'integer' },
            brazilian_avg_price_brl: { type: 'number' },
            new: { type: 'integer' },
            used: { type: 'integer' },
            price_stats_usd: { type: 'object' },
            price_stats_brl: { type: 'object' },
            mileage_stats: { type: 'object' },
            top_brands: { type: 'array', items: { type: 'object' } },
            top_colors: { type: 'array', items: { type: 'object' } },
            fuel_types: { type: 'array', items: { type: 'object' } },
            categories: { type: 'array', items: { type: 'object' } },
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Car not found' }
          }
        }
      }
    }
  },
  apis: [], // No file scanning — all paths defined above
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none } .swagger-ui .markdown p { line-height: 1.6 }',
    customSiteTitle: 'API-Cars Documentation',
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  }));

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

module.exports = { setupSwagger };
