# API-Cars v4.0 - Complete Vehicle Database API

A comprehensive REST API with **34,000+ vehicles** across **9 vehicle types**, covering the Americas and global markets. Real images, full specs, multi-currency pricing.

![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![SQLite](https://img.shields.io/badge/DB-SQLite-blue)
![API](https://img.shields.io/badge/REST-OpenAPI-orange)

---

## Database Stats

| Vehicle Type | Count | Examples |
|---|---|---|
| Cars | 33,270 | Ferrari, Ford, Toyota, BMW, Mercedes |
| Motorcycles | 450 | Honda, Yamaha, Harley-Davidson, Ducati, BMW |
| Trucks | 186 | Volvo FH, Scania R, Kenworth, Peterbilt |
| Bicycles | 129 | Trek, Specialized, Giant, Cannondale |
| Tractors | 122 | John Deere, Massey Ferguson, Case IH, Fendt |
| Buses | 86 | Marcopolo, Volvo, Mercedes, Blue Bird |
| Motorhomes | 63 | Winnebago, Airstream, Fleetwood, Jayco |
| Vans | 48 | Sprinter, Transit, Ducato, Crafter |
| **TOTAL** | **34,354** | 100+ brands, 1,200+ models |

## Brazilian Market

Dedicated Brazilian car database (1,420 vehicles) covering **1920-2026**:

- **Flex-fuel** vehicles (ethanol + gasoline)
- **BRL pricing** (R$)
- Historical eras: GEIA (1956), Milagre Economico (1970s), Fiat era (1980s), Modern era
- Brands: Fiat, Volkswagen, Chevrolet, Ford, Jeep, Toyota, Hyundai, Renault, Puma, Gurgel, DKW-Vemag, and more

## Real Images

All 34,000+ vehicles have **real images** - zero placeholders:

- **carapis.com** - Real marketplace photos (31,000+)
- **Wikimedia Commons** - Historical and classic vehicles
- **Wikipedia REST API** - Specific vehicle models
- **Unsplash** - Professional fallback photos by vehicle type

## Quick Start

### Prerequisites

- **Node.js** v18+ (recommended v24+)
- **npm** (comes with Node.js)

### Installation

```bash
git clone https://github.com/nyylxd/api-cars.git
cd api-cars
npm install
npm run seed
npm run seed-brasil
npm run seed-mundo
```

### Start Server

```bash
npm start
```

Server runs on **http://localhost:3000**

### Development (auto-restart on changes)

```bash
npm run dev
```

## API Documentation

### Swagger UI

Interactive documentation at: **http://localhost:3000/api-docs**

OpenAPI spec (JSON): **http://localhost:3000/api-docs.json**

## Endpoints

### Core

| Endpoint | Description |
|---|---|
| GET / | API overview and stats |
| GET /cars | List and filter all vehicles (20+ filters) |
| GET /cars/:id | Get single vehicle by ID |
| GET /brands | All brands with statistics |
| GET /brands/:name | Brand details and model list |
| GET /models | All models grouped by brand |
| GET /years | Year-by-year statistics |
| GET /fuel-types | Fuel type breakdown |
| GET /categories | Vehicle category breakdown |
| GET /vehicle-types | Vehicle type breakdown (9 types) |
| GET /sources | Data source tracking |
| GET /stats | Complete database statistics |

### Brazilian Market

| Endpoint | Description |
|---|---|
| GET /brasil/stats | Brazilian market overview |
| GET /brasil/brands | Brazilian-market brands |
| GET /brasil/cars | Brazilian vehicles with filters |

### World Vehicles (Americas)

| Endpoint | Description |
|---|---|
| GET /mundo | World vehicles database |
| GET /mundo?vehicle_type=motorcycle | Motorcycles |
| GET /mundo?vehicle_type=truck | Trucks |
| GET /mundo?vehicle_type=tractor&brand=John+Deere | John Deere tractors |

### Carapis Proxy

| Endpoint | Description |
|---|---|
| GET /carapis/detail/:uuid | Live detail from carapis.com |
| POST /carapis/enrich/:id | Enrich local DB with carapis.com detail |
| POST /carapis/search | Proxy search to carapis.com |

## Example Requests

### Search all Ferraris

```bash
curl "http://localhost:3000/cars?brand=Ferrari"
```

### Get 2025 electric vehicles

```bash
curl "http://localhost:3000/cars?year=2025&fuel_type=Electric"
```

### Brazilian flex-fuel SUVs under R$80k

```bash
curl "http://localhost:3000/brasil/cars?fuel_type=Flex&category=SUV&price_brl_max=80000"
```

### All Harley-Davidson motorcycles

```bash
curl "http://localhost:3000/mundo?vehicle_type=motorcycle&brand=Harley-Davidson"
```

### John Deere tractors

```bash
curl "http://localhost:3000/mundo?vehicle_type=tractor&brand=John+Deere"
```

### Brand details with models

```bash
curl "http://localhost:3000/brands/Fiat"
```

## Available Filters

### /cars Endpoint

| Parameter | Type | Example | Description |
|---|---|---|---|
| brand | string | Ford | Filter by brand (LIKE match) |
| model | string | Mustang | Filter by model |
| year | integer | 2025 | Exact year match |
| year_min | integer | 2020 | Minimum year |
| year_max | integer | 2025 | Maximum year |
| fuel_type | string | Flex, Gasoline, Diesel, Electric, Hybrid | Fuel type |
| category | string | SUV, Sedan, Hatchback, Pickup | Vehicle category |
| vehicle_type | string | car, motorcycle, truck, bus, van, bicycle, tractor, motorhome | Vehicle type |
| transmission | string | Manual, Automatic | Transmission |
| color | string | Black, White, Red | Vehicle color |
| source | string | carapis, brasil-seed, mundo-seed | Data source |
| min_price | number | 10000 | Min price (USD) |
| max_price | number | 50000 | Max price (USD) |
| price_brl_min | number | 50000 | Min price (BRL) |
| price_brl_max | number | 200000 | Max price (BRL) |
| is_brazilian | boolean | true | Brazilian market only |
| flex_fuel | boolean | true | Flex-fuel only |
| is_new | boolean | true | New vehicles only |
| search | string | V8 turbo | Full-text search |
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page (max 100) |
| sort | string | brand, year, price_usd | Sort field |
| order | string | asc, desc | Sort order |

## Fuel Types

| Fuel Type | Description |
|---|---|
| Flex | Ethanol (E100) + Gasoline (E27 blend) - Brazil-specific |
| Gasoline | Pure petrol |
| Diesel | Common in pickups, trucks, and large SUVs |
| Electric | BEV (Battery Electric Vehicle) |
| Hybrid | HEV/PHEV (Hybrid Electric Vehicle) |

## Data Sources

| Source | Count | Description |
|---|---|---|
| carapis.com | 31,000+ | Global vehicle marketplace API |
| brasil-seed | 1,420 | Curated Brazilian database (1920-2026) |
| mundo-seed | 1,463 | Americas focus: USA, Canada, Mexico, Argentina |

## Scripts

| Script | Description |
|---|---|
| npm start | Start server |
| npm run dev | Development mode with auto-restart |
| npm run seed | Seed global car data |
| npm run seed-brasil | Seed Brazilian market data |
| npm run seed-mundo | Seed world/Americas vehicle data |
| npm run fetch-images | Fetch Wikimedia images for Brazilian seed |
| npm run fetch-wikipedia | Fetch Wikipedia images for world seed |

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: SQLite (better-sqlite3)
- **Documentation**: Swagger/OpenAPI 3.0 (swagger-jsdoc, swagger-ui-express)
- **CORS**: cors
- **Image Sources**: Wikimedia Commons, Wikipedia REST API, Unsplash, carapis.com

## Database Schema

Key fields in the `cars` table:

- `id` - Primary key
- `brand` - Vehicle brand/manufacturer
- `model` - Vehicle model name
- `year` - Model year
- `fuel_type` - Fuel type
- `vehicle_type` - Vehicle category (car, motorcycle, truck, etc.)
- `engine` - Engine description
- `power_hp` - Horsepower
- `transmission` - Transmission type
- `doors` - Number of doors
- `category` - Body style (SUV, Sedan, etc.)
- `engine_cc` - Engine displacement in cc
- `price_usd` - Price in USD
- `price_brl` - Price in BRL (Brazilian Real)
- `color` - Vehicle color
- `mileage_km` - Odometer reading
- `image_url` - Primary image URL
- `photo_urls` - JSON array of additional photos
- `source` - Data source
- `is_brazilian` - Brazilian market flag
- `flex_fuel` - Flex-fuel flag
- `country_of_origin` - Brand country
- `description` - Vehicle description
- `generation` - Model generation

## License

ISC
