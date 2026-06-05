import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDistrictsAndNeighbourhoodsByCityCode } from 'turkey-neighbourhoods';
import slugify from 'slugify';

function getSlug(text: string): string {
  return slugify(text, { lower: true, locale: 'tr', strict: true });
}

function approximateCityCoordinates(plateCode: string) {
  if (plateCode === '34') return { lat: 41.0082, lng: 28.9784, latSpread: 0.15, lngSpread: 0.3 };
  if (plateCode === '35') return { lat: 38.4192, lng: 27.1287, latSpread: 0.1, lngSpread: 0.1 };
  if (plateCode === '06') return { lat: 39.9334, lng: 32.8597, latSpread: 0.1, lngSpread: 0.1 };
  if (plateCode === '16') return { lat: 40.1824, lng: 29.0610, latSpread: 0.08, lngSpread: 0.08 };
  if (plateCode === '07') return { lat: 36.8841, lng: 30.7056, latSpread: 0.08, lngSpread: 0.08 };
  return { lat: 39.0, lng: 35.0, latSpread: 0.5, lngSpread: 0.5 };
}

async function ensureDistrictNeighborhoodsComplete(districtId: number) {
  const district = await prisma.district.findUnique({
    where: { id: districtId },
    include: { city: true },
  });

  if (!district) return;

  let distAndNeighs;
  try {
    distAndNeighs = getDistrictsAndNeighbourhoodsByCityCode(district.city.plateCode);
  } catch (err) {
    console.error(`getDistrictsAndNeighbourhoodsByCityCode error for ${district.city.plateCode}:`, err);
    return;
  }

  const foundNeighs = Object.entries(distAndNeighs).find(([distName]) => getSlug(distName) === district.slug)?.[1] as
    | string[]
    | undefined;

  if (!foundNeighs?.length) return;

  const existingNeighs = await prisma.neighborhood.findMany({
    where: { districtId },
    select: { slug: true },
  });
  const existingSlugs = new Set(existingNeighs.map((n) => n.slug));
  const coords = approximateCityCoordinates(district.city.plateCode);

  const toCreate = foundNeighs
    .map((neighName) => {
      const cleanNeighName = neighName.endsWith(' Mah') ? neighName : `${neighName} Mah`;
      const neighSlug = getSlug(cleanNeighName);

      if (existingSlugs.has(neighSlug)) return null;

      return {
        cityId: district.cityId,
        districtId,
        name: cleanNeighName,
        slug: neighSlug,
        latitude: coords.lat + (Math.random() - 0.5) * coords.latSpread,
        longitude: coords.lng + (Math.random() - 0.5) * coords.lngSpread,
      };
    })
    .filter((neigh): neigh is NonNullable<typeof neigh> => Boolean(neigh));

  if (toCreate.length > 0) {
    await prisma.neighborhood.createMany({
      data: toCreate,
      skipDuplicates: true,
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtIdStr = searchParams.get('districtId');

    if (!districtIdStr) {
      return NextResponse.json({ error: 'districtId parametresi zorunludur' }, { status: 400 });
    }

    const districtId = parseInt(districtIdStr);
    if (isNaN(districtId)) {
      return NextResponse.json({ error: 'Geçersiz districtId' }, { status: 400 });
    }

    let neighborhoods = await prisma.neighborhood.findMany({
      where: { districtId },
      orderBy: { name: 'asc' },
    });

    await ensureDistrictNeighborhoodsComplete(districtId);

    neighborhoods = await prisma.neighborhood.findMany({
      where: { districtId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(neighborhoods);
  } catch (error) {
    console.error('Neighborhoods fetch error:', error);
    return NextResponse.json({ error: 'Mahalleler yüklenemedi' }, { status: 500 });
  }
}
