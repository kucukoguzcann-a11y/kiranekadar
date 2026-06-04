import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { formatCurrency, calculateSummary, calculateTrend } from '@/lib/analytics-engine';
import { ChevronRight, Home, Database, Coins, Layers, ShieldCheck, FileText, AlertTriangle } from 'lucide-react';
import { getProgrammaticCopy } from '@/lib/programmatic-copy';

import LoginWall from '@/components/layout/login-wall';
import MetricCard from '@/components/analytics/metric-card';
import RentTrendChart from '@/components/analytics/rent-trend-chart';
import RoomDistributionChart from '@/components/analytics/room-distribution-chart';
import BuildingAgeChart from '@/components/analytics/building-age-chart';
import SqmPriceChart from '@/components/analytics/sqm-price-chart';
import DataTable from '@/components/analytics/data-table';

export default async function NeighborhoodView({ city, district, neighborhood, roomCount }: { city: string; district: string; neighborhood: string; roomCount?: string }) {
  // 1. Fetch location records
  const dbCity = await prisma.city.findUnique({ where: { slug: city } });
  if (!dbCity) notFound();

  const dbDistrict = await prisma.district.findFirst({
    where: { cityId: dbCity.id, slug: district },
  });
  if (!dbDistrict) notFound();

  const dbNeigh = await prisma.neighborhood.findFirst({
    where: { districtId: dbDistrict.id, slug: neighborhood },
  });
  if (!dbNeigh) notFound();

  // 2. Auth Check
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('kira-auth');
  const isLoggedIn = !!authCookie?.value;

  // 3. Fetch approved reports for calculations
  const reports = await prisma.rentReport.findMany({
    where: { neighborhoodId: dbNeigh.id, status: 'approved', roomCount: roomCount || undefined },
    select: {
      rentAmount: true,
      netSqm: true,
      duesAmount: true,
      trustScore: true,
      createdAt: true,
      roomCount: true,
      buildingAgeRange: true,
      propertyType: true,
      floorType: true,
      rentType: true,
      id: true,
      city: { select: { name: true } },
      district: { select: { name: true } },
      neighborhood: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const reportCount = reports.length;
  
  // Calculate summary and time trends
  const mappedData = reports.map(r => ({
    rentAmount: r.rentAmount,
    netSqm: r.netSqm,
    duesAmount: r.duesAmount,
    trustScore: r.trustScore,
    createdAt: r.createdAt,
    roomCount: r.roomCount,
    buildingAgeRange: r.buildingAgeRange,
    propertyType: r.propertyType,
  }));

  const summary = calculateSummary(mappedData, 'neighborhood');
  const trends = calculateTrend(mappedData, 12);

  const formattedLastUpdate = summary.lastReportDate
    ? new Date(summary.lastReportDate).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
    : 'Yok';

  const copy = getProgrammaticCopy('neighborhood', dbNeigh.name, reports.length, summary.medianRent, summary.rentPerSqmMedian, dbDistrict.name);
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
        "name": dbDistrict.name,
        "item": `https://kiranekadar.com.tr/${dbCity.slug}-${dbDistrict.slug}-kira-fiyatlari`
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": roomCount ? `${dbNeigh.name} (${roomCount})` : dbNeigh.name,
        "item": roomCount
          ? `https://kiranekadar.com.tr/${dbCity.slug}-${dbDistrict.slug}-${dbNeigh.slug}-${roomCount}-kira-fiyatlari`
          : `https://kiranekadar.com.tr/${dbCity.slug}-${dbDistrict.slug}-${dbNeigh.slug}-kira-fiyatlari`
      }
    ]
  };

  const datasetSchema = reports.length >= 5 ? {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": roomCount
      ? `${dbCity.name} ${dbDistrict.name} ${dbNeigh.name} ${roomCount} Kira Fiyatları Veri Seti`
      : `${dbCity.name} ${dbDistrict.name} ${dbNeigh.name} Kira Fiyatları Veri Seti`,
    "description": roomCount
      ? `${dbCity.name} ili ${dbDistrict.name} ilçesi ${dbNeigh.name} mahallesi genelinde ${roomCount} oda tipi için paylaşılan gerçek kira bedellerini içeren veri seti.`
      : `${dbCity.name} ili ${dbDistrict.name} ilçesi ${dbNeigh.name} mahallesi genelinde anonim kullanıcılar tarafından bildirilen gerçek kira bedellerini içeren veri seti.`,
    "url": roomCount
      ? `https://kiranekadar.com.tr/${dbCity.slug}-${dbDistrict.slug}-${dbNeigh.slug}-${roomCount}-kira-fiyatlari`
      : `https://kiranekadar.com.tr/${dbCity.slug}-${dbDistrict.slug}-${dbNeigh.slug}-kira-fiyatlari`,
    "creator": {
      "@type": "Organization",
      "name": "KiraNeKadar"
    }
  } : null;

  // Component to render details dashboard
  const DashboardDetails = () => (
    <div className="space-y-8 mt-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Kayıt Sayısı"
          value={summary.count}
          description="Mahallede paylaşılan onaylı kira veri sayısı"
          icon={Database}
          accentColor="blue-500"
        />
        <MetricCard
          title="Medyan Kira"
          value={formatCurrency(summary.medianRent)}
          description="Fiyatların tam ortasındaki değer (en gerçekçi)"
          icon={Coins}
          accentColor="emerald-500"
        />
        <MetricCard
          title="Ortalama Kira"
          value={formatCurrency(summary.averageRent)}
          description="Uç değerler kırpılarak hesaplanan ortalama"
          icon={Coins}
          accentColor="indigo-500"
        />
        <MetricCard
          title="m² Başına Kira"
          value={formatCurrency(summary.rentPerSqmMedian)}
          description="Metrekare başına aylık medyan kira bedeli"
          icon={Layers}
          accentColor="amber-500"
        />
        <MetricCard
          title="Medyan Aidat"
          value={summary.medianDues ? formatCurrency(summary.medianDues) : '-'}
          description="Bölgedeki medyan apartman/site aidatı"
          icon={Coins}
          accentColor="rose-500"
        />
        <MetricCard
          title="Güven Skoru"
          value={`%${summary.confidenceScore}`}
          description="Verilerin kaynak, yaş ve doğruluk puanı"
          icon={ShieldCheck}
          accentColor="teal-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <RentTrendChart data={trends} />
        </div>
        <div className="col-span-1">
          <RoomDistributionChart reports={reports} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BuildingAgeChart reports={reports} />
        <SqmPriceChart reports={reports} />
      </div>

      {/* Raw Data List */}
      <div className="space-y-3">
        <div className="flex flex-col space-y-1 text-left">
          <h3 className="text-lg font-bold text-foreground">Kira Kayıtları Listesi</h3>
          <p className="text-xs text-muted-foreground">
            {dbNeigh.name} mahallesinde paylaşılan en son gerçek kira kayıtları (tam adresler gizlidir)
          </p>
        </div>
        <DataTable reports={reports as any} />
      </div>
    </div>
  );

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
            <Link href={`/${dbCity.slug}-kira-fiyatlari`} className="hover:text-gray-700 transition-colors">
              {dbCity.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/${dbCity.slug}-${dbDistrict.slug}-kira-fiyatlari`} className="hover:text-gray-700 transition-colors">
              {dbDistrict.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-700 font-semibold">{dbNeigh.name}{roomCount ? ` (${roomCount})` : ''}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="space-y-4 flex-1">
              <div>
                <div className="section-label">Mahalle Analizi</div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {dbNeigh.name} Mahallesi {roomCount ? `${roomCount} ` : ''}Kira Analizi
                </h1>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                {dbCity.name} / {dbDistrict.name} / {dbNeigh.name} Mahallesi genelinde gerçek kullanıcı verileriyle oluşturulmuş kira bedelleri ve piyasa istatistikleri.
              </p>
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
                {reportCount === 0 ? 'Veri Girilmesi Bekleniyor' : 'Sınırlı Temsil Gücü'}
              </h4>
              <p className="text-xs text-amber-700 leading-normal">
                {copy.warningText}
              </p>
            </div>
          </div>
        )}

        {/* Dashboard View */}
        {reportCount > 0 ? (
          isLoggedIn ? (
            <DashboardDetails />
          ) : (
            <LoginWall dataCount={reportCount} lastUpdate={formattedLastUpdate}>
              <DashboardDetails />
            </LoginWall>
          )
        ) : (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl max-w-2xl mx-auto space-y-4 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Veri Girilmesi Bekleniyor</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto px-4">
              {dbNeigh.name} mahallesinde henüz onaylı bir kira verisi bulunmamaktadır. Veri girilmesi bekleniyor... Çevrede oturan tanıdıklarınızdan veri girmelerini isteyebilir veya ilk veriyi siz ekleyebilirsiniz!
            </p>
            <div className="pt-2">
              <Link
                href={`/veri-gir?cityId=${dbCity.id}&districtId=${dbDistrict.id}&neighborhoodId=${dbNeigh.id}`}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
              >
                İlk Veriyi Sen Paylaş
              </Link>
            </div>
          </div>
        )}

        {/* ── Methodology Box ── */}
        <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>KiraNeKadar Veri Metodolojisi</span>
            </div>
            <p className="text-sm text-emerald-855 leading-relaxed max-w-2xl">
              Bu sayfadaki analizler, kullanıcılarımızın anonim olarak paylaştığı gerçek kira bildirimlerinden derlenmiştir.
              Gelişmiş algoritmalarımız uç değerleri (outliers) eler ve her bildirim için bir <strong>Güven Skoru</strong> hesaplar.
              {dbNeigh.name} Mahallesi için hesaplanan genel veri güven seviyesi: <strong>{copy.confidenceText}</strong>.
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
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3 text-left">
              {dbCity.name} {dbDistrict.name} {dbNeigh.name} Mahallesi Kira Piyasası Rehberi
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed text-left">
              {copy.paragraph1}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-left">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">
                1. Mahalle Kira Analizi
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {copy.paragraph2}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">
                2. Daire Tipi ve metrekare Analizleri
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {copy.paragraph3}
              </p>
            </div>

            <div className="space-y-3 md:col-span-2">
              <h3 className="text-base font-bold text-gray-900">
                3. Veri Güvenilirliği & Metodoloji Detayları
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
