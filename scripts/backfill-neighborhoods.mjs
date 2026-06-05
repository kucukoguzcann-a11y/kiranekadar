import 'dotenv/config';
import pg from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import slugify from 'slugify';
import { getDistrictsAndNeighbourhoodsByCityCode } from 'turkey-neighbourhoods';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DIRECT_URL or DATABASE_URL is required.');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function getSlug(text) {
  return slugify(text, { lower: true, locale: 'tr', strict: true });
}

function approximateCityCoordinates(plateCode) {
  if (plateCode === '34') return { lat: 41.0082, lng: 28.9784, latSpread: 0.15, lngSpread: 0.3 };
  if (plateCode === '35') return { lat: 38.4192, lng: 27.1287, latSpread: 0.1, lngSpread: 0.1 };
  if (plateCode === '06') return { lat: 39.9334, lng: 32.8597, latSpread: 0.1, lngSpread: 0.1 };
  if (plateCode === '16') return { lat: 40.1824, lng: 29.0610, latSpread: 0.08, lngSpread: 0.08 };
  if (plateCode === '07') return { lat: 36.8841, lng: 30.7056, latSpread: 0.08, lngSpread: 0.08 };
  return { lat: 39.0, lng: 35.0, latSpread: 0.5, lngSpread: 0.5 };
}

async function main() {
  const districts = await prisma.district.findMany({
    include: { city: true },
    orderBy: [{ cityId: 'asc' }, { name: 'asc' }],
  });

  const cityNeighborhoodCache = new Map();
  let createdTotal = 0;
  let checkedTotal = 0;
  const changed = [];

  for (const district of districts) {
    checkedTotal += 1;
    let source = cityNeighborhoodCache.get(district.city.plateCode);

    if (!source) {
      source = getDistrictsAndNeighbourhoodsByCityCode(district.city.plateCode);
      cityNeighborhoodCache.set(district.city.plateCode, source);
    }

    const sourceNames = Object.entries(source).find(([districtName]) => getSlug(districtName) === district.slug)?.[1] ?? [];

    if (sourceNames.length === 0) continue;

    const existing = await prisma.neighborhood.findMany({
      where: { districtId: district.id },
      select: { slug: true },
    });
    const existingSlugs = new Set(existing.map((item) => item.slug));
    const coords = approximateCityCoordinates(district.city.plateCode);

    const toCreate = sourceNames
      .map((neighName) => {
        const cleanName = neighName.endsWith(' Mah') ? neighName : `${neighName} Mah`;
        const slug = getSlug(cleanName);

        if (existingSlugs.has(slug)) return null;

        return {
          cityId: district.cityId,
          districtId: district.id,
          name: cleanName,
          slug,
          latitude: coords.lat + (Math.random() - 0.5) * coords.latSpread,
          longitude: coords.lng + (Math.random() - 0.5) * coords.lngSpread,
        };
      })
      .filter(Boolean);

    if (toCreate.length === 0) continue;

    await prisma.neighborhood.createMany({
      data: toCreate,
      skipDuplicates: true,
    });

    createdTotal += toCreate.length;
    changed.push({
      city: district.city.name,
      district: district.name,
      before: existing.length,
      source: sourceNames.length,
      added: toCreate.length,
    });
  }

  console.log(JSON.stringify({ checkedTotal, createdTotal, changed }, null, 2));
}

try {
  await main();
} finally {
  await prisma.$disconnect();
  await pool.end();
}
