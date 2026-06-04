import { prisma } from '../src/lib/prisma';
import { getCities, getDistrictsOfEachCity, getDistrictsAndNeighbourhoodsByCityCode } from 'turkey-neighbourhoods';
import slugify from 'slugify';

function getSlug(text: string): string {
  return slugify(text, { lower: true, locale: 'tr', strict: true });
}

// Simple random helper
function randomItem<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('Seeding started...');

  // 1. Seed Users
  console.log('Seeding users...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin Kullanıcı',
      role: 'admin',
      emailVerified: true,
      status: 'active',
    },
  });

  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@example.com' },
    update: {},
    create: {
      email: 'moderator@example.com',
      name: 'Moderatör',
      role: 'moderator',
      emailVerified: true,
      status: 'active',
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Demo Kullanıcı',
      role: 'user',
      emailVerified: true,
      status: 'active',
    },
  });

  console.log('Users seeded:', { admin: admin.email, user: demoUser.email });

  // 2. Seed Cities & Districts
  console.log('Seeding cities & districts (all 81)...');
  const citiesData = getCities();
  const districtsMap = getDistrictsOfEachCity() as Record<string, string[]>;

  // We will seed all 81 cities and all districts
  // To avoid memory limits or timeout, we insert them efficiently
  for (const city of citiesData) {
    const citySlug = getSlug(city.name);
    const createdCity = await prisma.city.upsert({
      where: { plateCode: city.code },
      update: {},
      create: {
        name: city.name,
        slug: citySlug,
        plateCode: city.code,
      },
    });

    const districts = districtsMap[city.code] || [];
    for (const distName of districts) {
      const distSlug = getSlug(distName);
      await prisma.district.upsert({
        where: {
          cityId_slug: {
            cityId: createdCity.id,
            slug: distSlug,
          },
        },
        update: {},
        create: {
          cityId: createdCity.id,
          name: distName,
          slug: distSlug,
        },
      });
    }
  }
  console.log('Cities and districts seeded successfully!');

  // 3. Seed Neighborhoods for major cities (Istanbul 34, Ankara 06, Izmir 35)
  console.log('Seeding neighborhoods for major cities (İstanbul, Ankara, İzmir)...');
  const majorCities = [
    { code: '34', name: 'İstanbul' },
    { code: '06', name: 'Ankara' },
    { code: '35', name: 'İzmir' },
  ];

  for (const mCity of majorCities) {
    const dbCity = await prisma.city.findUnique({ where: { plateCode: mCity.code } });
    if (!dbCity) continue;

    console.log(`Seeding neighborhoods for ${mCity.name}...`);
    const distAndNeighs = getDistrictsAndNeighbourhoodsByCityCode(mCity.code);

    for (const [distName, neighs] of Object.entries(distAndNeighs)) {
      const distSlug = getSlug(distName);
      const dbDistrict = await prisma.district.findFirst({
        where: { cityId: dbCity.id, slug: distSlug },
      });

      if (!dbDistrict) continue;

      // Seed neighborhoods for this district
      // We will take a subset to avoid overwhelming the database with 50,000 neighborhoods in a quick demo,
      // but we will insert the main ones (let's do up to 15 neighborhoods per district)
      const subsetNeighs = neighs.slice(0, 15);

      for (const neighName of subsetNeighs) {
        const cleanNeighName = neighName.endsWith(' Mah') ? neighName : `${neighName} Mah`;
        const neighSlug = getSlug(cleanNeighName);

        // Approximate coordinates (just centered around city coordinates)
        let lat = 39.9334;
        let lng = 32.8597;
        if (mCity.code === '34') { lat = 41.0082 + (Math.random() - 0.5) * 0.15; lng = 28.9784 + (Math.random() - 0.5) * 0.3; }
        else if (mCity.code === '35') { lat = 38.4192 + (Math.random() - 0.5) * 0.1; lng = 27.1287 + (Math.random() - 0.5) * 0.1; }
        else { lat = 39.9334 + (Math.random() - 0.5) * 0.1; lng = 32.8597 + (Math.random() - 0.5) * 0.1; }

        await prisma.neighborhood.upsert({
          where: {
            districtId_slug: {
              districtId: dbDistrict.id,
              slug: neighSlug,
            },
          },
          update: {},
          create: {
            cityId: dbCity.id,
            districtId: dbDistrict.id,
            name: cleanNeighName,
            slug: neighSlug,
            latitude: lat,
            longitude: lng,
          },
        });
      }
    }
  }
  console.log('Neighborhoods seeded!');

  // 4. Seed Demo Rent Reports
  console.log('Seeding demo rent reports...');
  const istanbul = await prisma.city.findUnique({ where: { plateCode: '34' } });
  const ankara = await prisma.city.findUnique({ where: { plateCode: '06' } });
  const izmir = await prisma.city.findUnique({ where: { plateCode: '35' } });

  const propertyTypes = ['daire', 'rezidans', 'mustakil', 'villa', 'studyo', 'apart'];
  const roomCounts = ['1+0', '1+1', '2+1', '3+1', '4+1', '5+1'];
  const buildingAges = ['0', '1-5', '6-10', '11-15', '16-20', '21-30', '30+'];
  const heatingTypes = ['kombi', 'merkezi', 'klima', 'soba', 'yerden', 'diger'];
  const floorTypes = ['Giriş Kat', '1. Kat', '2. Kat', '3. Kat', 'Ara Kat', 'En Üst Kat'];
  const rentTypes = ['actual_paid', 'new_contract', 'old_contract', 'asking_price'];
  const confidenceSources = ['self', 'close_contact', 'realtor', 'listing', 'estimate'];

  // Helper to create reports for a city
  const createReportsForCity = async (
    cityId: number,
    baseRent: number,
    reportCount: number
  ) => {
    const districts = await prisma.district.findMany({ where: { cityId } }) as any[];
    if (districts.length === 0) return;

    for (let i = 0; i < reportCount; i++) {
      const district = randomItem(districts) as any;
      const neighborhoods = await prisma.neighborhood.findMany({
        where: { districtId: district.id },
      }) as any[];
      if (neighborhoods.length === 0) continue;
      const neighborhood = randomItem(neighborhoods) as any;

      // Property specifications
      const pType = randomItem(propertyTypes);
      const rooms = randomItem(roomCounts);
      const netSqm = randomInt(40, 200);
      const grossSqm = Math.round(netSqm * 1.2);
      const bAge = randomItem(buildingAges);
      const floor = randomItem(floorTypes);

      // Distort base price depending on district name and properties
      let priceMultiplier = 1.0;
      
      // District specific adjustments
      const distNameLower = district.name.toLowerCase();
      if (distNameLower.includes('kadıköy') || distNameLower.includes('beşiktaş') || distNameLower.includes('sarıyer') || distNameLower.includes('çankaya') || distNameLower.includes('karşıyaka') || distNameLower.includes('çeşme')) {
        priceMultiplier += 0.8;
      } else if (distNameLower.includes('esenyurt') || distNameLower.includes('arnavutköy') || distNameLower.includes('mamak') || distNameLower.includes('buca') || distNameLower.includes('sincan')) {
        priceMultiplier -= 0.3;
      }

      // Room and type adjustments
      if (rooms === '3+1') priceMultiplier += 0.3;
      else if (rooms === '4+1' || rooms === '5+1') priceMultiplier += 0.6;
      else if (rooms === '1+1' || rooms === '1+0') priceMultiplier -= 0.2;

      if (pType === 'rezidans' || pType === 'villa') priceMultiplier += 0.5;

      const calculatedRent = Math.round(baseRent * priceMultiplier * randomInt(85, 115) / 100);
      const dues = Math.round(calculatedRent * 0.05 * randomInt(80, 120) / 100);
      const deposit = Math.round(calculatedRent * randomItem([1, 2]));

      const source = randomItem(confidenceSources);
      const trustScore = randomInt(40, 100);
      
      // Determine status based on trustScore and random moderation
      let status = 'approved';
      if (trustScore < 45) {
        status = randomItem(['pending', 'rejected', 'flagged']);
      }

      const randomDaysAgo = randomInt(0, 180);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - randomDaysAgo);

      await prisma.rentReport.create({
        data: {
          userId: randomItem([demoUser.id, moderator.id, null]),
          sessionId: `sess_${randomInt(1000, 9999)}`,
          cityId,
          districtId: district.id,
          neighborhoodId: neighborhood.id,
          approximateLat: neighborhood.latitude ? neighborhood.latitude + (Math.random() - 0.5) * 0.005 : null,
          approximateLng: neighborhood.longitude ? neighborhood.longitude + (Math.random() - 0.5) * 0.005 : null,
          propertyType: pType,
          roomCount: rooms,
          netSqm,
          grossSqm,
          buildingAgeRange: bAge,
          floorType: floor,
          floorNumber: randomInt(1, 10),
          totalFloors: 10,
          hasElevator: Math.random() > 0.4,
          hasParking: Math.random() > 0.5,
          isFurnished: Math.random() > 0.8,
          isInSite: Math.random() > 0.7,
          hasBalcony: Math.random() > 0.2,
          heatingType: randomItem(heatingTypes),
          hasSecurity: Math.random() > 0.7,
          hasSocialFacility: Math.random() > 0.8,
          isPostEarthquake: Math.random() > 0.3,
          rentAmount: calculatedRent,
          duesAmount: dues,
          depositAmount: deposit,
          rentType: randomItem(rentTypes),
          contractStartMonth: randomInt(1, 12),
          contractStartYear: 2025 - randomInt(0, 2),
          dataSourceConfidence: source,
          trustScore,
          status,
          ipHash: `ip_${randomInt(100, 999)}`,
          userAgentHash: 'Mozilla/5.0...',
          createdAt,
          approvedAt: status === 'approved' ? createdAt : null,
        },
      });
    }
  };

  console.log('Generating rent reports for İstanbul (approx 100)...');
  await createReportsForCity(istanbul!.id, 25000, 100);

  console.log('Generating rent reports for Ankara (approx 60)...');
  await createReportsForCity(ankara!.id, 18000, 60);

  console.log('Generating rent reports for İzmir (approx 60)...');
  await createReportsForCity(izmir!.id, 20000, 60);

  // 5. Seed RentAnalyticsDaily
  console.log('Calculating and seeding daily analytics summaries...');
  const reports = await prisma.rentReport.findMany({
    where: { status: 'approved' },
  });

  // Basic aggregation by city/district/room/type
  const groups: Record<string, {
    cityId: number;
    districtId: number;
    neighborhoodId: number;
    roomCount: string;
    propertyType: string;
    rents: number[];
    sqms: number[];
    trusts: number[];
  }> = {};

  reports.forEach(r => {
    const key = `${r.cityId}_${r.districtId}_${r.neighborhoodId}_${r.roomCount}_${r.propertyType}`;
    if (!groups[key]) {
      groups[key] = {
        cityId: r.cityId,
        districtId: r.districtId,
        neighborhoodId: r.neighborhoodId,
        roomCount: r.roomCount,
        propertyType: r.propertyType,
        rents: [],
        sqms: [],
        trusts: [],
      };
    }
    groups[key].rents.push(r.rentAmount);
    groups[key].sqms.push(r.netSqm);
    groups[key].trusts.push(r.trustScore);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const group of Object.values(groups)) {
    const count = group.rents.length;
    const avgRent = Math.round(group.rents.reduce((a, b) => a + b, 0) / count);
    const sortedRents = [...group.rents].sort((a, b) => a - b);
    const medianRent = sortedRents[Math.floor(count / 2)];
    
    const sqmPrices = group.rents.map((r, i) => r / group.sqms[i]);
    const avgSqmPrice = Math.round(sqmPrices.reduce((a, b) => a + b, 0) / count);

    const avgTrust = Math.round(group.trusts.reduce((a, b) => a + b, 0) / count);

    await prisma.rentAnalyticsDaily.create({
      data: {
        date: today,
        cityId: group.cityId,
        districtId: group.districtId,
        neighborhoodId: group.neighborhoodId,
        roomCount: group.roomCount,
        propertyType: group.propertyType,
        averageRent: avgRent,
        medianRent,
        rentPerSqm: avgSqmPrice,
        reportCount: count,
        confidenceScore: avgTrust,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
