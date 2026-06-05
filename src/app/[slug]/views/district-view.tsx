import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/analytics-engine';
import NeighborhoodTable from '@/components/analytics/neighborhood-table';
import { getProgrammaticCopy } from '@/lib/programmatic-copy';
import {
  Home, ChevronRight, BarChart3, PlusCircle, MapPin, AlertTriangle, ShieldCheck
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NeighborhoodStat {
  id: number;
  name: string;
  slug: string;
  count: number;
  medianRent: number;
  avgRent: number;
  minRent: number;
  maxRent: number;
  rentPerSqm: number;
  p25: number;
  p75: number;
}

interface RoomStat {
  room: string;
  count: number;
  medianRent: number;
}

interface DistrictCompare {
  id: number;
  name: string;
  slug: string;
  count: number;
  medianRent: number;
  isCurrent: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcMedian(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function calcAvg(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function calcPercentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo));
}

const ROOM_ORDER = ['1+0', '1+1', '2+1', '3+1', '4+1', '5+1'];

// ─── Page Component ──────────────────────────────────────────────────────────

export default async function DistrictView({ city, district, roomCount }: { city: string; district: string; roomCount?: string }) {
  // 1. Fetch city
  const dbCity = await prisma.city.findUnique({ where: { slug: city } });
  if (!dbCity) notFound();

  // 2. Fetch district with neighborhoods
  const dbDistrict = await prisma.district.findFirst({
    where: { cityId: dbCity.id, slug: district },
    include: {
      neighborhoods: {
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true },
      },
    },
  });
  if (!dbDistrict) notFound();

  // 3. Fetch all approved reports for district
  const allReports = await prisma.rentReport.findMany({
    where: { districtId: dbDistrict.id, status: 'approved', roomCount: roomCount || undefined },
    select: {
      rentAmount: true,
      netSqm: true,
      neighborhoodId: true,
      roomCount: true,
      trustScore: true,
      neighborhood: { select: { name: true, slug: true } },
    },
  });

  const filtered = allReports.filter(r => r.trustScore >= 40);

  // 4. District-level stats
  const distRents = filtered.map(r => r.rentAmount);
  const distMedian = calcMedian(distRents);
  const distAvg = calcAvg(distRents);
  const sqmPrices = filtered.filter(r => r.netSqm > 0).map(r => Math.round(r.rentAmount / r.netSqm));
  const distRentPerSqm = calcMedian(sqmPrices);
  const distP25 = calcPercentile(distRents, 25);
  const distP75 = calcPercentile(distRents, 75);

  const copy = getProgrammaticCopy('district', dbDistrict.name, filtered.length, distMedian, distRentPerSqm, dbCity.name);
  const currentYear = new Date().getFullYear();

  // JSON-LD schemas
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "KiraNeKadar",
    "url": "https://kiranekadar.com.tr",
    "logo": "https://kiranekadar.com.tr/icon.svg"
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "KiraNeKadar",
    "url": "https://kiranekadar.com.tr"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": "https://kiranekadar.com.tr"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Kira Fiyatları",
        "item": "https://kiranekadar.com.tr/kira-fiyatlari"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": dbCity.name,
        "item": `https://kiranekadar.com.tr/${dbCity.slug}-kira-fiyatlari`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": roomCount ? `${dbDistrict.name} (${roomCount})` : dbDistrict.name,
        "item": roomCount
          ? `https://kiranekadar.com.tr/${dbCity.slug}-${dbDistrict.slug}-${roomCount}-kira-fiyatlari`
          : `https://kiranekadar.com.tr/${dbCity.slug}-${dbDistrict.slug}-kira-fiyatlari`
      }
    ]
  };

  const datasetSchema = filtered.length >= 5 ? {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": roomCount
      ? `${dbCity.name} ${dbDistrict.name} ${roomCount} Kira Fiyatları Veri Seti`
      : `${dbCity.name} ${dbDistrict.name} Kira Fiyatları Veri Seti`,
    "description": roomCount
      ? `${dbCity.name} ili ${dbDistrict.name} ilçesi genelinde ${roomCount} oda tipi için paylaşılan gerçek kira bedellerini içeren veri seti.`
      : `${dbCity.name} ili ${dbDistrict.name} ilçesi genelinde anonim kullanıcılar tarafından bildirilen gerçek kira bedellerini içeren veri seti.`,
    "url": roomCount
      ? `https://kiranekadar.com.tr/${dbCity.slug}-${dbDistrict.slug}-${roomCount}-kira-fiyatlari`
      : `https://kiranekadar.com.tr/${dbCity.slug}-${dbDistrict.slug}-kira-fiyatlari`,
    "creator": {
      "@type": "Organization",
      "name": "KiraNeKadar"
    }
  } : null;

  // 5. Per-neighborhood stats
  const neighMap = new Map<number, { reports: typeof filtered; name: string; slug: string }>();
  for (const n of dbDistrict.neighborhoods) {
    neighMap.set(n.id, { reports: [], name: n.name, slug: n.slug });
  }
  for (const r of filtered) {
    const n = neighMap.get(r.neighborhoodId);
    if (n) n.reports.push(r);
  }

  const neighStats: NeighborhoodStat[] = Array.from(neighMap.entries())
    .map(([id, n]) => {
      const rents = n.reports.map(r => r.rentAmount);
      const sqms = n.reports.filter(r => r.netSqm > 0).map(r => Math.round(r.rentAmount / r.netSqm));
      return {
        id,
        name: n.name,
        slug: n.slug,
        count: rents.length,
        medianRent: calcMedian(rents),
        avgRent: calcAvg(rents),
        minRent: rents.length ? Math.min(...rents) : 0,
        maxRent: rents.length ? Math.max(...rents) : 0,
        rentPerSqm: calcMedian(sqms),
        p25: calcPercentile(rents, 25),
        p75: calcPercentile(rents, 75),
      };
    })
    .sort((a, b) => {
      if (a.count === 0 && b.count === 0) return a.name.localeCompare(b.name, 'tr');
      if (a.count === 0) return 1;
      if (b.count === 0) return -1;
      return a.medianRent - b.medianRent;
    });

  // 6. Room-type breakdown
  const roomMap = new Map<string, number[]>();
  for (const r of filtered) {
    if (!roomMap.has(r.roomCount)) roomMap.set(r.roomCount, []);
    roomMap.get(r.roomCount)!.push(r.rentAmount);
  }
  const roomStats: RoomStat[] = ROOM_ORDER
    .map(room => ({ room, count: (roomMap.get(room) || []).length, medianRent: calcMedian(roomMap.get(room) || []) }))
    .filter(r => r.count > 0);
  const maxRoomMedian = Math.max(...roomStats.map(r => r.medianRent), 1);

  // 7. Sibling districts (for comparison)
  const siblingDistricts = await prisma.district.findMany({
    where: { cityId: dbCity.id },
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
    take: 20,
  });

  const siblingReportCounts = await Promise.all(
    siblingDistricts.map(async (sd) => {
      const reports = await prisma.rentReport.findMany({
        where: { districtId: sd.id, status: 'approved' },
        select: { rentAmount: true },
      });
      return {
        id: sd.id,
        name: sd.name,
        slug: sd.slug,
        count: reports.length,
        medianRent: calcMedian(reports.map(r => r.rentAmount)),
        isCurrent: sd.id === dbDistrict.id,
      } as DistrictCompare;
    })
  );

  // Sort by median, filter to those with data, show current + neighbors
  const comparisons = siblingReportCounts
    .filter(d => d.count > 0 || d.isCurrent)
    .sort((a, b) => a.medianRent - b.medianRent)
    .slice(0, 8);

  const maxCompMedian = Math.max(...comparisons.map(d => d.medianRent), 1);

  // Percentile rank of this district in city
  const cityRankedDistricts = siblingReportCounts.filter(d => d.count > 0 && !d.isCurrent).sort((a, b) => a.medianRent - b.medianRent);
  const cheaperCount = cityRankedDistricts.filter(d => d.medianRent < distMedian).length;
  const totalWithData = cityRankedDistricts.length;
  const cheaperPct = totalWithData > 0 ? Math.round((cheaperCount / totalWithData) * 100) : null;

  return (
    <div className="min-h-screen bg-[#F8F5EF]">

      {/* ── Hero ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6 py-10 max-w-6xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 flex-wrap">
            <Link href="/" className="hover:text-gray-700 flex items-center gap-1 transition-colors">
              <Home className="h-3 w-3" /> Ana Sayfa
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/kira-fiyatlari" className="hover:text-gray-700 transition-colors">Kira Analizi</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/${dbCity.slug}-kira-fiyatlari`} className="hover:text-gray-700 transition-colors">{dbCity.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-700 font-semibold">{dbDistrict.name}{roomCount ? ` (${roomCount})` : ''}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="space-y-4 flex-1">
              <div>
                <div className="section-label">İlçe Analizi</div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {dbCity.name} {dbDistrict.name} {roomCount ? `${roomCount} ` : ''}Kira Fiyatları
                </h1>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                {dbDistrict.name} ilçesinde <strong className="text-gray-700">{filtered.length}</strong> gerçek kira verisine dayalı
                mahalle bazlı piyasa analizi.
                {cheaperPct !== null && distMedian > 0 && (
                  <> Bu ilçe, {dbCity.name}'daki ilçelerin <strong className="text-gray-700">{cheaperPct}%'inden</strong> daha uygun fiyatlıdır.</>
                )}
              </p>
              {distMedian > 0 ? (
                <div className="inline-flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Medyan Kira</div>
                    <div className="text-2xl font-black text-emerald-700">{formatCurrency(distMedian)}</div>
                  </div>
                  {distP25 > 0 && distP75 > 0 && (
                    <div className="border-l border-emerald-200 pl-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Çeyrek Aralık</div>
                      <div className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(distP25)} – {formatCurrency(distP75)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="inline-flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Medyan Kira</div>
                    <div className="text-sm font-semibold text-gray-500">Veri girilmesi bekleniyor</div>
                  </div>
                </div>
              )}
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 md:min-w-[280px]">
              {[
                { label: 'Veri Sayısı', value: filtered.length > 0 ? filtered.length.toLocaleString('tr-TR') : 'Veri girilmesi bekleniyor', color: '#059669', bg: '#ECFDF5' },
                { label: 'm² Kira', value: distRentPerSqm > 0 ? `${distRentPerSqm.toLocaleString('tr-TR')} ₺` : 'Veri girilmesi bekleniyor', color: '#F97316', bg: '#FFF7ED' },
                { label: 'Ortalama', value: distAvg > 0 ? formatCurrency(distAvg) : 'Veri girilmesi bekleniyor', color: '#2563EB', bg: '#EFF6FF' },
                { label: 'Mahalle Sayısı', value: dbDistrict.neighborhoods.length.toLocaleString('tr-TR'), color: '#7C3AED', bg: '#F5F3FF' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{s.label}</div>
                  <div className={s.value === 'Veri girilmesi bekleniyor' ? "text-xs font-semibold text-gray-400" : "text-lg font-extrabold"} style={{ color: s.value === 'Veri girilmesi bekleniyor' ? undefined : s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-10 max-w-6xl space-y-10">
        {copy.warningText && (
          <div className="flex gap-3 p-5 rounded-2xl border border-amber-200 bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-left">
              <h4 className="text-sm font-bold text-amber-800">
                {filtered.length === 0 ? 'Veri Girilmesi Bekleniyor' : 'Sınırlı Temsil Gücü'}
              </h4>
              <p className="text-xs text-amber-700 leading-normal">
                {copy.warningText}
              </p>
            </div>
          </div>
        )}

        {/* ── Oda Tipi ── */}
        {roomStats.length > 0 && (
          <section>
            <div className="section-label mb-2">Oda Tipi Bazında</div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-5">{dbDistrict.name}'da oda tipine göre medyan kira</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="space-y-4">
                {roomStats.map(rs => (
                  <Link
                    key={rs.room}
                    href={`/${dbCity.slug}-${dbDistrict.slug}-${rs.room}-kira-fiyatlari`}
                    className="flex items-center gap-4 group/row hover:opacity-95 transition-all w-full"
                  >
                    <div className="w-16 shrink-0">
                      <span className="text-sm font-bold text-gray-700 group-hover/row:text-emerald-600 transition-colors">{rs.room}</span>
                    </div>
                    <div className="flex-1 relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full rounded-lg flex items-center px-3 transition-all duration-500"
                        style={{
                          width: `${Math.max((rs.medianRent / maxRoomMedian) * 100, 8)}%`,
                          background: 'linear-gradient(90deg, #059669, #10B981)',
                        }}
                      >
                        <span className="text-xs font-bold text-white whitespace-nowrap">
                          {formatCurrency(rs.medianRent)}
                        </span>
                      </div>
                    </div>
                    <div className="w-16 text-right shrink-0">
                      <span className="text-[10px] text-gray-400 font-medium group-hover/row:text-gray-600 transition-colors">{rs.count} kayıt</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Mahalle Tablosu ── */}
        <section>
          <div className="section-label mb-2">Mahalle Karşılaştırması</div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-5">
            {dbDistrict.name} Mahalle Kira Fiyatları & Sıralaması
          </h2>
          <NeighborhoodTable neighborhoods={neighStats} citySlug={dbCity.slug} districtSlug={dbDistrict.slug} />
        </section>

        {/* ── Şehir İçi Karşılaştırma ── */}
        {comparisons.length > 1 && (
          <section>
            <div className="section-label mb-2">Şehir İçi Konum</div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-5">
              {dbCity.name}'da ilçe karşılaştırması
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="space-y-3">
                {comparisons.map(d => (
                  <div key={d.id} className="flex items-center gap-4">
                    <div className={`w-32 shrink-0 text-sm font-semibold truncate ${d.isCurrent ? 'text-emerald-700' : 'text-gray-700'}`}>
                      {d.name}
                      {d.isCurrent && <span className="ml-1 text-[9px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">Bu ilçe</span>}
                    </div>
                    <div className="flex-1 relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                      {d.count > 0 ? (
                        <div
                          className="absolute left-0 top-0 h-full rounded-lg flex items-center px-3"
                          style={{
                            width: `${Math.max((d.medianRent / maxCompMedian) * 100, 5)}%`,
                            background: d.isCurrent
                              ? 'linear-gradient(90deg, #059669, #10B981)'
                              : 'linear-gradient(90deg, #6B7280, #9CA3AF)',
                          }}
                        >
                          <span className="text-xs font-bold text-white whitespace-nowrap">
                            {formatCurrency(d.medianRent)}
                          </span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-[10px] text-gray-300">Yeterli veri yok</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Diğer İlçeler Linkleri ── */}
        <section>
          <div className="section-label mb-2">Keşfet</div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-5">
            {dbCity.name}'daki diğer ilçeler
          </h2>
          <div className="flex flex-wrap gap-2">
            {siblingDistricts
              .filter(d => d.id !== dbDistrict.id)
              .map(d => (
                <Link
                  key={d.id}
                  href={`/${dbCity.slug}-${d.slug}-kira-fiyatlari`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200 rounded-xl px-4 py-2 transition-all"
                >
                  <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  {d.name}
                </Link>
              ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-gray-900 rounded-2xl p-8 text-center space-y-4">
          <div className="text-sm font-semibold text-emerald-400">{dbDistrict.name} için katkı sağla</div>
          <h3 className="text-xl font-extrabold text-white">
            Verilerle {dbDistrict.name} kira haritasını şekillendir
          </h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            {dbDistrict.name}'da ödediğin kirayı anonim olarak paylaşarak bölge analizini güçlendir.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/veri-gir?cityId=${dbCity.id}&districtId=${dbDistrict.id}`}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:-translate-y-0.5 animate-pulse-glow w-full sm:w-auto"
            >
              <PlusCircle className="h-4 w-4" />
              Kirayı Anonim Bildir
            </Link>
            <Link
              href={`/analiz?districtId=${dbDistrict.id}`}
              className="inline-flex items-center justify-center gap-2 text-gray-300 hover:text-white font-semibold px-6 py-3 rounded-xl text-sm border border-gray-700 hover:border-gray-500 transition-all w-full sm:w-auto"
            >
              <BarChart3 className="h-4 w-4" />
              Detaylı Analiz Aç
            </Link>
          </div>
        </section>

        {/* ── Methodology Box ── */}
        <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>KiraNeKadar Veri Metodolojisi</span>
            </div>
            <p className="text-sm text-emerald-850 leading-relaxed max-w-2xl">
              Bu sayfadaki analizler, kullanıcılarımızın anonim olarak paylaştığı gerçek kira bildirimlerinden derlenmiştir.
              Gelişmiş algoritmalarımız uç değerleri (outliers) eler ve her bildirim için bir <strong>Güven Skoru</strong> hesaplar.
              {dbDistrict.name} için hesaplanan genel veri güven seviyesi: <strong>{copy.confidenceText}</strong>.
            </p>
          </div>
          <Link
            href="/metodoloji"
            className="shrink-0 inline-flex items-center justify-center font-bold text-xs text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-200 px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
          >
            Metodolojiyi Keşfet
          </Link>
        </section>

        {/* ── SEO Text ── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
              {dbCity.name} {dbDistrict.name} Kiralık Konut Piyasası Rehberi
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed text-left">
              {copy.paragraph1}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-left">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">
                1. Bölgesel Kira Analizi
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {copy.paragraph2}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">
                2. Mahalleler Arası Fiyat Kıyaslamaları
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {dbDistrict.name} sınırları içindeki mahalleler arasında, yapılaşma tipi ve sosyal imkanlara bağlı olarak geniş bir fiyat yelpazesi mevcuttur. Metro, metrobüs veya ana arter yollara yürüme mesafesinde olan mahallelerde fiyatlar yukarı yönlü hareket ederken, daha iç kesimlerde kalan ve nispeten eski yapı stokuna sahip mahalleler daha ekonomik alternatifler sunar. Yukarıdaki sıralı mahalle fiyat tablomuz, bütçenize göre en uygun lokasyonları tespit etmenize olanak tanır.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">
                3. Oda Sayısına Göre Kiralama Trendleri
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {copy.paragraph3}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">
                4. {dbDistrict.name}'da Ev Tutarken Nelere Dikkat Edilmeli?
              </h3>
              <ul className="text-sm text-gray-500 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Medyan değerleri göz önünde bulundurarak ilan sitelerinde sunulan fiyat tekliflerini rasyonel biçimde müzakere edin.</li>
                <li>Aidat oranlarının aylık toplam ödemeniz içindeki payını hesaplamayı unutmayın.</li>
                <li>Ulaşım ağlarına (otobüs, minibüs, raylı sistemler) mesafeyi sorgulayın.</li>
                <li>Mevcut kira bilginizi anonim olarak paylaşarak {dbDistrict.name} konut veri tabanının doğruluğunu artırın.</li>
              </ul>
            </div>

            <div className="space-y-3 md:col-span-2">
              <h3 className="text-base font-bold text-gray-900">
                5. Veri Doğrulama & Metodolojik Yaklaşım
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {copy.paragraph4}
              </p>
            </div>
          </div>
        </section>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {datasetSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
          />
        )}
      </div>
    </div>
  );
}
