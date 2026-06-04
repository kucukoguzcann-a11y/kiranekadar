import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDistrictsAndNeighbourhoodsByCityCode } from 'turkey-neighbourhoods';
import slugify from 'slugify';

function getSlug(text: string): string {
  return slugify(text, { lower: true, locale: 'tr', strict: true });
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

    // Dynamic on-the-fly seeding if database has no neighborhoods for this district
    if (neighborhoods.length === 0) {
      const district = await prisma.district.findUnique({
        where: { id: districtId },
        include: { city: true },
      });

      if (district) {
        let distAndNeighs;
        try {
          distAndNeighs = getDistrictsAndNeighbourhoodsByCityCode(district.city.plateCode);
        } catch (err) {
          console.error(`getDistrictsAndNeighbourhoodsByCityCode error for ${district.city.plateCode}:`, err);
        }

        if (distAndNeighs) {
          let foundNeighs: string[] = [];
          const targetSlug = district.slug;

          for (const [distName, neighs] of Object.entries(distAndNeighs)) {
            if (getSlug(distName) === targetSlug) {
              foundNeighs = neighs as string[];
              break;
            }
          }

          if (foundNeighs.length > 0) {
            const existingNeighs = await prisma.neighborhood.findMany({
              where: { districtId },
              select: { slug: true }
            });
            const existingSlugs = new Set(existingNeighs.map(n => n.slug));

            const toCreate = [];
            for (const neighName of foundNeighs) {
              const cleanNeighName = neighName.endsWith(' Mah') ? neighName : `${neighName} Mah`;
              const neighSlug = getSlug(cleanNeighName);

              if (!existingSlugs.has(neighSlug)) {
                // Standard center coords with small random offset
                let lat = 39.0 + (Math.random() - 0.5) * 0.5;
                let lng = 35.0 + (Math.random() - 0.5) * 0.5;
                
                // Set approximate coords based on city plate code if known
                if (district.city.plateCode === '34') { lat = 41.0082 + (Math.random() - 0.5) * 0.15; lng = 28.9784 + (Math.random() - 0.5) * 0.3; }
                else if (district.city.plateCode === '35') { lat = 38.4192 + (Math.random() - 0.5) * 0.1; lng = 27.1287 + (Math.random() - 0.5) * 0.1; }
                else if (district.city.plateCode === '06') { lat = 39.9334 + (Math.random() - 0.5) * 0.1; lng = 32.8597 + (Math.random() - 0.5) * 0.1; }
                else if (district.city.plateCode === '16') { lat = 40.1824 + (Math.random() - 0.5) * 0.08; lng = 29.0610 + (Math.random() - 0.5) * 0.08; }
                else if (district.city.plateCode === '07') { lat = 36.8841 + (Math.random() - 0.5) * 0.08; lng = 30.7056 + (Math.random() - 0.5) * 0.08; }

                toCreate.push({
                  cityId: district.cityId,
                  districtId,
                  name: cleanNeighName,
                  slug: neighSlug,
                  latitude: lat,
                  longitude: lng,
                });
              }
            }

            if (toCreate.length > 0) {
              await prisma.neighborhood.createMany({
                data: toCreate,
              });
            }

            // Fetch updated list
            neighborhoods = await prisma.neighborhood.findMany({
              where: { districtId },
              orderBy: { name: 'asc' },
            });
          }
        }
      }
    }

    return NextResponse.json(neighborhoods);
  } catch (error) {
    console.error('Neighborhoods fetch error:', error);
    return NextResponse.json({ error: 'Mahalleler yüklenemedi' }, { status: 500 });
  }
}
