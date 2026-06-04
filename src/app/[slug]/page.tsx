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

  // 2. City Page
  const city = await prisma.city.findUnique({
    where: { slug: remainder },
  });
  if (city) {
    const approvedCount = await prisma.rentReport.count({
      where: { cityId: city.id, status: 'approved' },
    });
    return {
      type: 'city',
      citySlug: city.slug,
      cityName: city.name,
      approvedCount,
    };
  }

  // 3. District / Neighborhood Page
  const cities = await prisma.city.findMany({ select: { slug: true, name: true, id: true } });
  
  // Find matching city prefix (e.g. istanbul- in istanbul-atasehir)
  const matchingCity = cities.find((c: any) => remainder.startsWith(c.slug + '-'));
  if (!matchingCity) {
    return null;
  }

  const cityRest = remainder.slice(matchingCity.slug.length + 1);

  // Find all districts of this city
  const districts = await prisma.district.findMany({
    where: { cityId: matchingCity.id },
    select: { slug: true, name: true, id: true },
  });

  // Check if remainder after city matches a district exactly
  const exactDistrict = districts.find((d: any) => d.slug === cityRest);
  if (exactDistrict) {
    const approvedCount = await prisma.rentReport.count({
      where: { districtId: exactDistrict.id, status: 'approved' },
    });
    return {
      type: 'district',
      citySlug: matchingCity.slug,
      districtSlug: exactDistrict.slug,
      cityName: matchingCity.name,
      districtName: exactDistrict.name,
      approvedCount,
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
    const approvedCount = await prisma.rentReport.count({
      where: { neighborhoodId: neighborhood.id, status: 'approved' },
    });
    return {
      type: 'neighborhood',
      citySlug: matchingCity.slug,
      districtSlug: matchingDistrict.slug,
      neighborhoodSlug: neighborhood.slug,
      cityName: matchingCity.name,
      districtName: matchingDistrict.name,
      neighborhoodName: neighborhood.name,
      approvedCount,
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

  switch (resolved.type) {
    case 'directory':
      return {
        title: 'İllere Göre Kira Fiyatları Analizi | KiraNeKadar',
        description: 'Türkiye\'nin tüm illerine ait güncel, kullanıcı paylaşımlı gerçek kira fiyatlarını ve mahalle bazlı analizleri inceleyin.',
        robots,
        alternates: { canonical: canonicalUrl },
      };
    case 'city':
      return {
        title: `${resolved.cityName} Kira Fiyatları ${currentYear} | İlçe & Mahalle Gerçek Kira Verisi`,
        description: `${resolved.cityName} kira fiyatlarını medyan, m² ve oda tipi bazında inceleyin. Veriler kullanıcıların anonim olarak paylaştığı gerçek kira bildirimlerinden oluşur.`,
        keywords: [`${resolved.cityName} kira fiyatları`, `${resolved.cityName} kira`, `${resolved.cityName} ilçe kira`, `${resolved.cityName} en ucuz mahalle`],
        robots,
        alternates: { canonical: canonicalUrl },
      };
    case 'district':
      return {
        title: `${resolved.districtName} Kira Fiyatları ${currentYear} | ${resolved.cityName} Mahalle Kira Analizi`,
        description: `${resolved.cityName} ${resolved.districtName} kira fiyatlarını medyan, m² ve oda tipi bazında inceleyin. Veriler kullanıcıların anonim olarak paylaştığı gerçek kira bildirimlerinden oluşur.`,
        keywords: [`${resolved.districtName} kira`, `${resolved.cityName} ${resolved.districtName} kira`, `${resolved.districtName} mahalle kira`, `${resolved.districtName} en ucuz mahalle`],
        robots,
        alternates: { canonical: canonicalUrl },
      };
    case 'neighborhood':
      return {
        title: `${resolved.neighborhoodName} Kira Fiyatları ${currentYear} | ${resolved.districtName} Gerçek Kira Verisi`,
        description: `${resolved.cityName} ${resolved.districtName} ${resolved.neighborhoodName} Mahallesi kira fiyatlarını medyan, m² ve oda tipi bazında inceleyin. Veriler gerçek kira bildirimlerinden oluşur.`,
        robots,
        alternates: { canonical: canonicalUrl },
      };
    default:
      return {};
  }
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
      return <CityView city={resolved.citySlug!} />;
    case 'district':
      return <DistrictView city={resolved.citySlug!} district={resolved.districtSlug!} />;
    case 'neighborhood':
      return <NeighborhoodView city={resolved.citySlug!} district={resolved.districtSlug!} neighborhood={resolved.neighborhoodSlug!} />;
    default:
      notFound();
  }
}
