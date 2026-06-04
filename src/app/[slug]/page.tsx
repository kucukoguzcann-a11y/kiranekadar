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
async function resolveSlug(slug: string): Promise<ResolvedLocation | null> {
  const decoded = decodeURIComponent(slug).toLowerCase();
  
  // 1. Directory Page
  if (decoded === 'kira-fiyatlari' || decoded === 'kira-fiyatları') {
    return { type: 'directory' };
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
    return {
      type: 'city',
      citySlug: city.slug,
      cityName: city.name,
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
    return {
      type: 'district',
      citySlug: matchingCity.slug,
      districtSlug: exactDistrict.slug,
      cityName: matchingCity.name,
      districtName: exactDistrict.name,
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
    select: { slug: true, name: true },
  });

  if (neighborhood) {
    return {
      type: 'neighborhood',
      citySlug: matchingCity.slug,
      districtSlug: matchingDistrict.slug,
      neighborhoodSlug: neighborhood.slug,
      cityName: matchingCity.name,
      districtName: matchingDistrict.name,
      neighborhoodName: neighborhood.name,
    };
  }

  return null;
}

// ─── Generate Metadata ───────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved) return {};

  switch (resolved.type) {
    case 'directory':
      return {
        title: 'İllere Göre Kira Fiyatları Analizi',
        description: 'Türkiye\'nin tüm illerine ait güncel, kullanıcı paylaşımlı gerçek kira fiyatlarını ve mahalle bazlı analizleri inceleyin.',
      };
    case 'city':
      return {
        title: `${resolved.cityName} Kira Fiyatları 2025 – İlçe ve Mahalle Bazlı Analiz`,
        description: `${resolved.cityName} genelinde gerçek kullanıcı verilerine dayalı kira analizleri. En ucuz ilçeler, en ucuz mahalleler, oda tipi bazlı fiyatlar ve ${resolved.cityName} kira piyasası hakkında tüm detaylar.`,
        keywords: [`${resolved.cityName} kira fiyatları`, `${resolved.cityName} kira`, `${resolved.cityName} ilçe kira`, `${resolved.cityName} en ucuz mahalle`],
      };
    case 'district':
      return {
        title: `${resolved.cityName} ${resolved.districtName} Kira Fiyatları 2025 – Mahalle Bazlı Analiz`,
        description: `${resolved.cityName} ${resolved.districtName} ilçesinde mahalle mahalle gerçek kira fiyatları. En ucuz mahalleler, oda tipi bazlı kira ortalamaları ve ${resolved.districtName} kira piyasası analizi.`,
        keywords: [`${resolved.districtName} kira`, `${resolved.cityName} ${resolved.districtName} kira`, `${resolved.districtName} mahalle kira`, `${resolved.districtName} en ucuz mahalle`],
      };
    case 'neighborhood':
      return {
        title: `${resolved.cityName} ${resolved.districtName} ${resolved.neighborhoodName} Kira Fiyatları & Analizi`,
        description: `${resolved.cityName} ${resolved.districtName} ${resolved.neighborhoodName} mahallesi güncel gerçek kira bedelleri, oda sayısına göre ortalama kiralar, m² fiyat trendleri ve benzer daire analizleri.`,
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
