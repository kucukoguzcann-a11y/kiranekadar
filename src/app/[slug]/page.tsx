import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

// Import Views
import DirectoryView from './views/directory-view';
import CityView from './views/city-view';
import DistrictView from './views/district-view';
import NeighborhoodView from './views/neighborhood-view';

interface Props {
  params: Promise<{ slug: string }>;
}

export interface ResolvedLocation {
  type: 'directory' | 'city' | 'district' | 'neighborhood';
  citySlug?: string;
  districtSlug?: string;
  neighborhoodSlug?: string;
  cityName?: string;
  districtName?: string;
  neighborhoodName?: string;
  roomCount?: string;
}

// Slug Resolution Helper
async function resolveSlug(slug: string): Promise<ResolvedLocation & { approvedCount?: number } | null> {
  const decoded = decodeURIComponent(slug).toLowerCase();
  
  // 1. Directory Page
  if (decoded === 'kira-fiyatlari' || decoded === 'kira-fiyatları') {
    return { type: 'directory', approvedCount: 1 }; // Always index directories
  }

  // Check suffix
  const suffixes = ['-kira-fiyatlari', '-kira-fiyatları'];
  let matchedSuffix = '';
  for (const s of suffixes) {
    if (decoded.endsWith(s)) {
      matchedSuffix = s;
      break;
    }
  }

  if (!matchedSuffix) {
    return null;
  }

  const remainder = decoded.slice(0, -matchedSuffix.length);

  // Check if remainder ends with a room count pattern (e.g. -1+1)
  let roomCount: string | undefined = undefined;
  let locationRemainder = remainder;
  const roomMatch = remainder.match(/-(\d\+\d)$/);
  if (roomMatch) {
    roomCount = roomMatch[1]; // e.g. "1+1"
    locationRemainder = remainder.slice(0, -roomMatch[0].length);
  }

  // Helper for report counting
  const getApprovedCount = async (whereClause: any) => {
    return prisma.rentReport.count({
      where: { ...whereClause, status: 'approved', roomCount: roomCount || undefined }
    });
  };

  // 2. City Page
  const city = await prisma.city.findUnique({
    where: { slug: locationRemainder },
  });
  if (city) {
    const approvedCount = await getApprovedCount({ cityId: city.id });
    return {
      type: 'city',
      citySlug: city.slug,
      cityName: city.name,
      approvedCount,
      roomCount,
    };
  }

  // 3. District / Neighborhood Page
  const cities = await prisma.city.findMany({ select: { slug: true, name: true, id: true } });
  
  // Find matching city prefix (e.g. istanbul- in istanbul-atasehir)
  const matchingCity = cities.find((c: any) => locationRemainder.startsWith(c.slug + '-'));
  if (!matchingCity) {
    return null;
  }

  const cityRest = locationRemainder.slice(matchingCity.slug.length + 1);

  // Find all districts of this city
  const districts = await prisma.district.findMany({
    where: { cityId: matchingCity.id },
    select: { slug: true, name: true, id: true },
  });

  // Check if remainder after city matches a district exactly
  const exactDistrict = districts.find((d: any) => d.slug === cityRest);
  if (exactDistrict) {
    const approvedCount = await getApprovedCount({ districtId: exactDistrict.id });
    return {
      type: 'district',
      citySlug: matchingCity.slug,
      districtSlug: exactDistrict.slug,
      cityName: matchingCity.name,
      districtName: exactDistrict.name,
      approvedCount,
      roomCount,
    };
  }

  // Check prefix matching for district (e.g. atasehir- in atasehir-ataturk-mah)
  const matchingDistrict = districts.find((d: any) => cityRest.startsWith(d.slug + '-'));
  if (!matchingDistrict) {
    return null;
  }

  const neighSlug = cityRest.slice(matchingDistrict.slug.length + 1);

  // Check if neighborhood exists
  const neighborhood = await prisma.neighborhood.findFirst({
    where: { districtId: matchingDistrict.id, slug: neighSlug },
    select: { id: true, slug: true, name: true },
  });

  if (neighborhood) {
    const approvedCount = await getApprovedCount({ neighborhoodId: neighborhood.id });
    return {
      type: 'neighborhood',
      citySlug: matchingCity.slug,
      districtSlug: matchingDistrict.slug,
      neighborhoodSlug: neighborhood.slug,
      cityName: matchingCity.name,
      districtName: matchingDistrict.name,
      neighborhoodName: neighborhood.name,
      approvedCount,
      roomCount,
    };
  }

  return null;
}

// ─── Generate Metadata ───────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved) return {};

  const currentYear = new Date().getFullYear();
  const isNoindex = resolved.approvedCount === 0;

  const robots = isNoindex
    ? { index: false, follow: true }
    : { index: true, follow: true };

  const canonicalUrl = `https://kiranekadar.com.tr/${slug}`;

  let title = '';
  let description = '';

  if (resolved.roomCount) {
    let locationName = '';
    if (resolved.type === 'city') locationName = resolved.cityName!;
    else if (resolved.type === 'district') locationName = resolved.districtName!;
    else if (resolved.type === 'neighborhood') locationName = resolved.neighborhoodName!;

    title = `${locationName} ${resolved.roomCount} Kira Fiyatları ${currentYear} | m² ve Medyan Kira`;
    description = `${locationName} ${resolved.roomCount} kira fiyatlarını medyan kira, m² ve oda tipi bazında inceleyin. Veriler anonim paylaşılan gerçek bildirimlerden oluşur.`;
  } else {
    if (resolved.type === 'directory') {
      title = 'İllere Göre Kira Fiyatları Analizi | KiraNeKadar';
      description = 'Türkiye\'nin tüm illerine ait güncel, kullanıcı paylaşımlı gerçek kira fiyatlarını ve mahalle bazlı kira analizlerini detaylıca inceleyin. Hemen analiz edin.';
    } else if (resolved.type === 'city') {
      title = `${resolved.cityName} Kira Fiyatları ${currentYear} | İlçe ve Mahalle Bazlı Gerçek Kira Verisi`;
      description = `${resolved.cityName} kira fiyatlarını medyan, m² ve oda tipi bazında inceleyin. Veriler kullanıcıların anonim olarak paylaştığı gerçek kira bildirimlerinden oluşturulur.`;
    } else if (resolved.type === 'district') {
      title = `${resolved.districtName} Kira Fiyatları ${currentYear} | ${resolved.cityName} Mahalle Bazlı Kira Analizi`;
      description = `${resolved.cityName} ${resolved.districtName} kira fiyatlarını medyan, m² ve oda tipi bazında inceleyin. Veriler kullanıcıların anonim olarak paylaştığı gerçek kira bildirimlerinden oluşturulur.`;
    } else if (resolved.type === 'neighborhood') {
      title = `${resolved.neighborhoodName} Kira Fiyatları ${currentYear} | ${resolved.districtName} Gerçek Kira Verileri`;
      description = `${resolved.cityName} ${resolved.districtName} ${resolved.neighborhoodName} Mahallesi kira fiyatlarını medyan, m² ve oda tipi bazında inceleyin. Veriler gerçek kira bildirimlerinden oluşur.`;
    }
  }

  return {
    title,
    description,
    robots,
    alternates: { canonical: canonicalUrl },
  };
}

// ─── Page Component ──────────────────────────────────────────────────────────
export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved) {
    notFound();
  }

  switch (resolved.type) {
    case 'directory':
      return <DirectoryView />;
    case 'city':
      return <CityView city={resolved.citySlug!} roomCount={resolved.roomCount} />;
    case 'district':
      return <DistrictView city={resolved.citySlug!} district={resolved.districtSlug!} roomCount={resolved.roomCount} />;
    case 'neighborhood':
      return <NeighborhoodView city={resolved.citySlug!} district={resolved.districtSlug!} neighborhood={resolved.neighborhoodSlug!} roomCount={resolved.roomCount} />;
    default:
      notFound();
  }
}
