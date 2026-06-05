import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/analytics-engine';
import DistrictTable from '@/components/analytics/district-table';
import { getProgrammaticCopy } from '@/lib/programmatic-copy';
import {
  Home, ChevronRight, BarChart3, PlusCircle, ArrowRight, AlertTriangle, ShieldCheck
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DistrictStat {
  id: number;
  name: string;
  slug: string;
  count: number;
  medianRent: number;
  avgRent: number;
  minRent: number;
  maxRent: number;
  rentPerSqm: number;
}

interface NeighborhoodStat {
  id: number;
  name: string;
  slug: string;
  districtName: string;
  districtSlug: string;
  count: number;
  medianRent: number;
}

interface RoomStat {
  room: string;
  count: number;
  medianRent: number;
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

const ROOM_ORDER = ['1+0', '1+1', '2+1', '3+1', '4+1', '5+1'];

// ─── Page Component ──────────────────────────────────────────────────────────

export default async function CityView({ city, roomCount }: { city: string; roomCount?: string }) {
  // 1. Fetch city with districts and neighborhoods
  const dbCity = await prisma.city.findUnique({
    where: { slug: city },
    include: {
      districts: {
        orderBy: { name: 'asc' },
        include: {
          neighborhoods: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  if (!dbCity) notFound();

  // 2. Fetch all approved reports for city
  const allReports = await prisma.rentReport.findMany({
    where: { cityId: dbCity.id, status: 'approved', roomCount: roomCount || undefined },
    select: {
      rentAmount: true,
      netSqm: true,
      districtId: true,
      neighborhoodId: true,
      roomCount: true,
      trustScore: true,
      district: { select: { name: true, slug: true } },
      neighborhood: { select: { name: true, slug: true } },
    },
  });

  const filtered = allReports.filter(r => r.trustScore >= 40);

  // 3. City-level stats
  const cityRents = filtered.map(r => r.rentAmount);
  const cityMedian = calcMedian(cityRents);
  const cityAvg = calcAvg(cityRents);
  const sqmPrices = filtered.filter(r => r.netSqm > 0).map(r => Math.round(r.rentAmount / r.netSqm));
  const cityRentPerSqm = calcMedian(sqmPrices);

  const copy = getProgrammaticCopy('city', dbCity.name, filtered.length, cityMedian, cityRentPerSqm);
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
        "name": roomCount ? `${dbCity.name} (${roomCount})` : dbCity.name,
        "item": roomCount
          ? `https://kiranekadar.com.tr/${dbCity.slug}-${roomCount}-kira-fiyatlari`
          : `https://kiranekadar.com.tr/${dbCity.slug}-kira-fiyatlari`
      }
    ]
  };

  const datasetSchema = filtered.length >= 5 ? {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${dbCity.name} Kira Fiyatları Veri Seti`,
    "description": `${dbCity.name} genelinde anonim kullanıcılar tarafından bildirilen gerçek kira bedellerini içeren veri seti.`,
    "url": `https://kiranekadar.com.tr/${dbCity.slug}-kira-fiyatlari`,
    "creator": {
      "@type": "Organization",
      "name": "KiraNeKadar"
    }
  } : null;

  // 4. Per-district stats
  const districtMap = new Map<number, { reports: typeof filtered; name: string; slug: string }>();
  for (const d of dbCity.districts) {
    districtMap.set(d.id, { reports: [], name: d.name, slug: d.slug });
  }
  for (const r of filtered) {
    const d = districtMap.get(r.districtId);
    if (d) d.reports.push(r);
  }

  const districtStats: DistrictStat[] = Array.from(districtMap.entries())
    .map(([id, d]) => {
      const rents = d.reports.map(r => r.rentAmount);
      const sqms = d.reports.filter(r => r.netSqm > 0).map(r => Math.round(r.rentAmount / r.netSqm));
      return {
        id,
        name: d.name,
        slug: d.slug,
        count: rents.length,
        medianRent: calcMedian(rents),
        avgRent: calcAvg(rents),
        minRent: rents.length ? Math.min(...rents) : 0,
        maxRent: rents.length ? Math.max(...rents) : 0,
        rentPerSqm: calcMedian(sqms),
      };
    })
    .sort((a, b) => {
      // Districts with data come first, sorted by median
      if (a.count === 0 && b.count === 0) return a.name.localeCompare(b.name, 'tr');
      if (a.count === 0) return 1;
      if (b.count === 0) return -1;
      return a.medianRent - b.medianRent;
    });

  // 5. Per-neighborhood stats (need at least 2 reports)
  const neighMap = new Map<number, { reports: typeof filtered; name: string; slug: string; districtName: string; districtSlug: string }>();
  for (const d of dbCity.districts) {
    for (const n of d.neighborhoods) {
      neighMap.set(n.id, { reports: [], name: n.name, slug: n.slug, districtName: d.name, districtSlug: d.slug });
    }
  }
  for (const r of filtered) {
    const n = neighMap.get(r.neighborhoodId);
    if (n) n.reports.push(r);
  }

  const neighStats: NeighborhoodStat[] = Array.from(neighMap.entries())
    .map(([id, n]) => ({
      id,
      name: n.name,
      slug: n.slug,
      districtName: n.districtName,
      districtSlug: n.districtSlug,
      count: n.reports.length,
      medianRent: calcMedian(n.reports.map(r => r.rentAmount)),
    }))
    .filter(n => n.count >= 2);

  const cheapestNeighs = [...neighStats].sort((a, b) => a.medianRent - b.medianRent).slice(0, 6);
  const priceyNeighs = [...neighStats].sort((a, b) => b.medianRent - a.medianRent).slice(0, 6);

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

  return (
    <div className="min-h-screen bg-[#F8F5EF]">

      {/* ── Hero ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6 py-10 max-w-6xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 select-none flex-wrap">
            <Link href="/" className="hover:text-gray-700 flex items-center gap-1 transition-colors">
              <Home className="h-3 w-3" /> Ana Sayfa
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/kira-fiyatlari" className="hover:text-gray-700 transition-colors">Kira Analizi</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-700 font-semibold">{dbCity.name}{roomCount ? ` (${roomCount})` : ''}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white text-sm font-extrabold shadow-sm shrink-0">
                  {dbCity.plateCode}
                </span>
                <div>
                  <div className="section-label">İl Analizi</div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                    {dbCity.name} {roomCount ? `${roomCount} ` : ''}Kira Fiyatları
                  </h1>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                {dbCity.name} genelinde <strong className="text-gray-700">{filtered.length}</strong> gerçek kullanıcı verisine dayalı kira piyasası analizi.
                İlan fiyatlarını değil, gerçekte ödenen kiraları gösteriyoruz.
              </p>
            </div>

            {/* Key stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:min-w-[320px]">
              {[
                { label: 'Medyan Kira', value: cityMedian > 0 ? formatCurrency(cityMedian) : 'Veri girilmesi bekleniyor', color: '#059669', bg: '#ECFDF5' },
                { label: 'Ortalama Kira', value: cityAvg > 0 ? formatCurrency(cityAvg) : 'Veri girilmesi bekleniyor', color: '#2563EB', bg: '#EFF6FF' },
                { label: 'm² Kira', value: cityRentPerSqm > 0 ? `${cityRentPerSqm.toLocaleString('tr-TR')} ₺` : 'Veri girilmesi bekleniyor', color: '#F97316', bg: '#FFF7ED' },
                { label: 'Veri Sayısı', value: filtered.length > 0 ? filtered.length.toLocaleString('tr-TR') : 'Veri girilmesi bekleniyor', color: '#7C3AED', bg: '#F5F3FF' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{stat.label}</div>
                  <div className={stat.value === 'Veri girilmesi bekleniyor' ? "text-xs font-semibold text-gray-400" : "text-xl font-extrabold"} style={{ color: stat.value === 'Veri girilmesi bekleniyor' ? undefined : stat.color }}>
                    {stat.value}
                  </div>
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

        {/* ── Oda Tipi Kırılımı ── */}
        {roomStats.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <div className="section-label">Oda Tipi Bazında</div>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-5">Oda tipine göre medyan kira</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="space-y-4">
                {roomStats.map(rs => (
                  <Link
                    key={rs.room}
                    href={`/${dbCity.slug}-${rs.room}-kira-fiyatlari`}
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

        {/* ── İlçe Fiyat Tablosu ── */}
        <section>
          <div className="section-label mb-2">İlçe Karşılaştırması</div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-5">
            {dbCity.name} İlçe Kira Fiyatları & Sıralaması
          </h2>
          <DistrictTable districts={districtStats} citySlug={dbCity.slug} />
        </section>

        {/* ── En Ucuz & En Pahalı Mahalleler ── */}
        {neighStats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* En Ucuz */}
            <section>
              <div className="section-label mb-2">En Uygun Fiyatlı</div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-5">En ucuz 6 mahalle</h2>
              <div className="space-y-3">
                {cheapestNeighs.map((n, idx) => (
                  <Link
                    key={n.id}
                    href={`/${dbCity.slug}-${n.districtSlug}-${n.slug}-kira-fiyatlari`}
                    className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        idx === 0 ? 'bg-emerald-600 text-white' :
                        idx === 1 ? 'bg-emerald-100 text-emerald-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>{idx + 1}</span>
                      <div>
                        <div className="font-semibold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors">{n.name}</div>
                        <div className="text-[10px] text-gray-400">{n.districtName} · {n.count} kayıt</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-emerald-600 text-sm">{formatCurrency(n.medianRent)}</div>
                      <div className="text-[10px] text-gray-400">medyan/ay</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* En Pahalı */}
            <section>
              <div className="section-label mb-2">En Yüksek Fiyatlı</div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-5">En pahalı 6 mahalle</h2>
              <div className="space-y-3">
                {priceyNeighs.map((n, idx) => (
                  <Link
                    key={n.id}
                    href={`/${dbCity.slug}-${n.districtSlug}-${n.slug}-kira-fiyatlari`}
                    className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm hover:border-orange-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        idx === 0 ? 'bg-orange-500 text-white' :
                        idx === 1 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>{idx + 1}</span>
                      <div>
                        <div className="font-semibold text-sm text-gray-900 group-hover:text-orange-700 transition-colors">{n.name}</div>
                        <div className="text-[10px] text-gray-400">{n.districtName} · {n.count} kayıt</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-orange-600 text-sm">{formatCurrency(n.medianRent)}</div>
                      <div className="text-[10px] text-gray-400">medyan/ay</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── CTA ── */}
        <section className="bg-gray-900 rounded-2xl p-8 text-center space-y-4">
          <div className="text-sm font-semibold text-emerald-400">{dbCity.name} için kira bilgini paylaş</div>
          <h3 className="text-xl font-extrabold text-white">
            Bu verileri birlikte güçlendiriyoruz
          </h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            {dbCity.name} için anonim olarak girdiğin kira bilgisi, şehirdeki tüm kiracılara yardımcı olur.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/veri-gir?cityId=${dbCity.id}`}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/30 w-full sm:w-auto"
            >
              <PlusCircle className="h-4 w-4" />
              Kirayı Anonim Bildir
            </Link>
            <Link
              href="/analiz"
              className="inline-flex items-center justify-center gap-2 text-gray-300 hover:text-white font-semibold px-6 py-3 rounded-xl text-sm border border-gray-700 hover:border-gray-500 transition-all w-full sm:w-auto"
            >
              <BarChart3 className="h-4 w-4" />
              Detaylı Analiz
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
              {dbCity.name} için hesaplanan genel veri güven seviyesi: <strong>{copy.confidenceText}</strong>.
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
              {dbCity.name} Kira Fiyatları ve Detaylı Konut Piyasası Analizi
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed text-left">
              {copy.paragraph1}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-left">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">
                1. Bölgesel Kira Seviyeleri & Karşılaştırmalar
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {copy.paragraph2}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">
                2. Konut ve Oda Tipi Dağılımları
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {copy.paragraph3}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">
                3. Kiracılara ve Ev Arayanlara Altın Öneriler
              </h3>
              <ul className="text-sm text-gray-500 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>İlan sitelerindeki nominal fiyatlar yerine KiraNeKadar üzerindeki fiili kontrat bedellerini referans alın.</li>
                <li>Seçeceğiniz mahallenin toplu taşıma entegrasyonunu ve sosyal imkanlarını birim m² fiyatıyla kıyaslayın.</li>
                <li>Kira sözleşmenizi imzalamadan önce binanın yaşını, yalıtım durumunu ve aidat yükümlülüklerini mutlaka sorgulayın.</li>
                <li>Ödediğiniz kirayı sisteme anonim bildirerek {dbCity.name} veri şeffaflığına katkıda bulunun.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">
                4. Analiz ve Güven Açıklaması
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
