'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PROPERTY_TYPES, ROOM_COUNTS, BUILDING_AGES } from '@/lib/constants';
import { formatCurrency } from '@/lib/analytics-engine';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  RefreshCw,
  Database,
  Coins,
  Percent,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';

import LocationSelector from '@/components/forms/location-selector';
import MetricCard from '@/components/analytics/metric-card';
import RentTrendChart from '@/components/analytics/rent-trend-chart';
import RoomDistributionChart from '@/components/analytics/room-distribution-chart';
import BuildingAgeChart from '@/components/analytics/building-age-chart';
import SqmPriceChart from '@/components/analytics/sqm-price-chart';
import DataTable from '@/components/analytics/data-table';
import { pushDataLayerEvent, sanitizeAnalyticsValue } from '@/lib/data-layer';

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="h-4 w-28 rounded bg-gray-200" />
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full rounded bg-gray-100" />
          <div className="h-3 w-5/6 rounded bg-gray-100" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="mt-4 h-7 w-24 rounded bg-gray-100" />
            <div className="mt-3 h-3 w-16 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="min-h-[320px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2" />
        <div className="min-h-[320px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="min-h-[280px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" />
        <div className="min-h-[280px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" />
      </div>

      <div className="min-h-[420px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" />
    </div>
  );
}

export default function AnalizPage() {
  // Location Filters
  const [cityId, setCityId] = useState<number>(34); // Default to Istanbul
  const [districtId, setDistrictId] = useState<number>(0);
  const [neighborhoodId, setNeighborhoodId] = useState<number>(0);

  // Property Filters
  const [propertyType, setPropertyType] = useState<string>('all');
  const [roomCount, setRoomCount] = useState<string>('all');
  const [minSqm, setMinSqm] = useState<string>('');
  const [maxSqm, setMaxSqm] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('6m');
  const [buildingAge, setBuildingAge] = useState<string>('all');
  const [isFurnished, setIsFurnished] = useState<string>('all');
  const [isInSite, setIsInSite] = useState<string>('all');
  const [hasElevator, setHasElevator] = useState<string>('all');

  // State
  const [loading, setLoading] = useState(false);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [cityName, setCityName] = useState<string>('');
  const [districtName, setDistrictName] = useState<string>('');
  const [neighborhoodName, setNeighborhoodName] = useState<string>('');
  const hasMountedFiltersRef = useRef(false);
  const lastReportViewKeyRef = useRef('');
  const lastFailureKeyRef = useRef('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const cId = urlParams.get('cityId');
      const dId = urlParams.get('districtId');
      const nId = urlParams.get('neighborhoodId');
      if (cId) setCityId(Number(cId));
      if (dId) setDistrictId(Number(dId));
      if (nId) setNeighborhoodId(Number(nId));
    }
  }, []);

  async function fetchSummaryData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cityId) params.append('cityId', String(cityId));
      if (districtId) params.append('districtId', String(districtId));
      if (neighborhoodId) params.append('neighborhoodId', String(neighborhoodId));
      if (propertyType && propertyType !== 'all') params.append('propertyType', propertyType);
      if (roomCount && roomCount !== 'all') params.append('roomCount', roomCount);
      if (minSqm) params.append('minSqm', minSqm);
      if (maxSqm) params.append('maxSqm', maxSqm);
      params.append('dateRange', dateRange);
      if (buildingAge && buildingAge !== 'all') params.append('buildingAge', buildingAge);
      if (isFurnished !== 'all') params.append('isFurnished', isFurnished);
      if (isInSite !== 'all') params.append('isInSite', isInSite);
      if (hasElevator !== 'all') params.append('hasElevator', hasElevator);

      const res = await fetch(`/api/analytics/summary?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Analiz verileri yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTrendData() {
    setLoadingTrends(true);
    try {
      const params = new URLSearchParams();
      if (cityId) params.append('cityId', String(cityId));
      if (districtId) params.append('districtId', String(districtId));
      if (neighborhoodId) params.append('neighborhoodId', String(neighborhoodId));
      params.append('months', '12');

      const res = await fetch(`/api/analytics/trends?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTrends(data);
      }
    } catch (err) {
      console.error('Trend verileri yüklenemedi:', err);
    } finally {
      setLoadingTrends(false);
    }
  }

  useEffect(() => {
    fetchSummaryData();
  }, [
    cityId,
    districtId,
    neighborhoodId,
    propertyType,
    roomCount,
    minSqm,
    maxSqm,
    dateRange,
    buildingAge,
    isFurnished,
    isInSite,
    hasElevator
  ]);

  useEffect(() => {
    fetchTrendData();
  }, [cityId, districtId, neighborhoodId]);

  useEffect(() => {
    if (!hasMountedFiltersRef.current) {
      hasMountedFiltersRef.current = true;
      return;
    }

    const trackedFilters = [
      ['room_count', roomCount],
      ['property_type', propertyType],
      ['date_range', dateRange],
      ['building_age', buildingAge],
    ] as const;

    trackedFilters.forEach(([filterType, filterValue]) => {
      pushDataLayerEvent({
        event: 'filter_usage',
        filter_type: filterType,
        filter_value: sanitizeAnalyticsValue(filterValue, `all_${filterType}s`),
      });
    });
  }, [propertyType, roomCount, dateRange, buildingAge]);

  useEffect(() => {
    if (!summary || loading || summary.hasEnoughData) return;

    const failureKey = [
      cityId,
      districtId,
      neighborhoodId,
      propertyType,
      roomCount,
      dateRange,
      buildingAge,
      summary.count,
    ].join(':');

    if (lastFailureKeyRef.current === failureKey) return;
    lastFailureKeyRef.current = failureKey;

    pushDataLayerEvent({
      event: 'calculation_failed',
      error_type: 'insufficient_data',
      requested_location:
        [cityName, districtName, neighborhoodName].filter(Boolean).join('/') ||
        sanitizeAnalyticsValue(cityId, 'all_cities'),
      requested_filters: [
        sanitizeAnalyticsValue(roomCount, 'all_room_counts'),
        sanitizeAnalyticsValue(propertyType, 'all_property_types'),
      ].join('/'),
    });
  }, [
    summary,
    loading,
    cityName,
    districtName,
    neighborhoodName,
    cityId,
    districtId,
    neighborhoodId,
    roomCount,
    propertyType,
    dateRange,
    buildingAge,
  ]);

  useEffect(() => {
    if (!summary || loading || summary.count === 0) return;

    const reportKey = [
      cityId,
      districtId,
      neighborhoodId,
      propertyType,
      roomCount,
      dateRange,
      summary.count,
    ].join(':');

    if (lastReportViewKeyRef.current === reportKey) return;
    lastReportViewKeyRef.current = reportKey;

    pushDataLayerEvent({
      event: 'view_calculation_report',
      location_city: sanitizeAnalyticsValue(cityName || cityId, 'all_cities'),
      location_district: sanitizeAnalyticsValue(districtName || districtId, 'all_districts'),
      property_type: sanitizeAnalyticsValue(propertyType, 'all_property_types'),
      result_count: summary.count,
    });
  }, [summary, loading, cityId, districtId, neighborhoodId, propertyType, roomCount, dateRange, cityName, districtName]);

  return (
    <div className="min-h-screen bg-[#F8F5EF] py-4 sm:py-6 md:py-8">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-6">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="section-label">Dashboard</div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Kira Analiz Paneli
            </h1>
            <p className="text-xs leading-5 text-gray-500 sm:text-sm">
              Seçilen bölgeye ait gerçek hayatta ödenen kira fiyatlarının detaylı analizi.
            </p>
          </div>
          <Button
            onClick={() => {
              fetchSummaryData();
              fetchTrendData();
            }}
            variant="outline"
            size="sm"
            disabled={loading}
            className="w-full gap-1.5 self-start bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm rounded-xl sm:w-fit md:self-center"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Yenile
          </Button>
        </div>

        {/* ─── Filters ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">

          {/* Location Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Search className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Bölge Seçimi</h3>
                <p className="text-xs text-gray-400">İl, ilçe ve mahalle seçin</p>
              </div>
            </div>
            <LocationSelector
              className="flex flex-col gap-3 sm:gap-4"
              cityId={cityId}
              districtId={districtId}
              neighborhoodId={neighborhoodId}
              onCityChange={(id) => {
                setCityId(id);
                setDistrictId(0);
                setNeighborhoodId(0);
              }}
              onDistrictChange={(id) => {
                setDistrictId(id);
                setNeighborhoodId(0);
              }}
              onNeighborhoodChange={(id) => {
                setNeighborhoodId(id);
              }}
              onCityResolved={(city) => {
                setCityName(city?.name || '');
              }}
              onDistrictResolved={(district) => {
                setDistrictName(district?.name || '');
              }}
              onNeighborhoodResolved={(neighborhood) => {
                setNeighborhoodName(neighborhood?.name || '');
              }}
            />
          </div>

          {/* Property Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <SlidersHorizontal className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Filtreler</h3>
                <p className="text-xs text-gray-400">Daire özellikleri ve zaman aralığı</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
              {/* Property Type */}
              <div className="space-y-1.5">
                <Label htmlFor="propType" className="text-xs font-semibold text-gray-600">Konut Tipi</Label>
                <Select value={propertyType} onValueChange={(val) => setPropertyType(val || 'all')}>
                  <SelectTrigger id="propType" className="bg-gray-50 border-gray-200 text-xs rounded-xl h-10">
                    <SelectValue placeholder="Hepsi">
                      {propertyType === 'all' ? 'Hepsi' : (PROPERTY_TYPES.find(t => t.value === propertyType)?.label || 'Hepsi')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-100 shadow-lg rounded-xl">
                    <SelectItem value="all" className="text-xs">Hepsi</SelectItem>
                    {PROPERTY_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Room Count */}
              <div className="space-y-1.5">
                <Label htmlFor="rooms" className="text-xs font-semibold text-gray-600">Oda Sayısı</Label>
                <Select value={roomCount} onValueChange={(val) => setRoomCount(val || 'all')}>
                  <SelectTrigger id="rooms" className="bg-gray-50 border-gray-200 text-xs rounded-xl h-10">
                    <SelectValue placeholder="Hepsi">
                      {roomCount === 'all' ? 'Hepsi' : (ROOM_COUNTS.find(r => r.value === roomCount)?.label || 'Hepsi')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-100 shadow-lg rounded-xl">
                    <SelectItem value="all" className="text-xs">Hepsi</SelectItem>
                    {ROOM_COUNTS.map(r => (
                      <SelectItem key={r.value} value={r.value} className="text-xs">{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sqm Range */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Metrekare (m²)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minSqm}
                    onChange={(e) => setMinSqm(e.target.value)}
                    className="w-full text-xs bg-gray-50 border-gray-200 rounded-xl h-10"
                  />
                  <span className="text-gray-300 font-medium">–</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxSqm}
                    onChange={(e) => setMaxSqm(e.target.value)}
                    className="w-full text-xs bg-gray-50 border-gray-200 rounded-xl h-10"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Zaman Aralığı</Label>
                <Tabs value={dateRange} onValueChange={setDateRange} className="w-full">
                  <TabsList className="grid grid-cols-4 w-full h-10 bg-gray-100 p-1 rounded-xl">
                    <TabsTrigger value="1m" className="text-[10px] rounded-lg font-semibold">1A</TabsTrigger>
                    <TabsTrigger value="3m" className="text-[10px] rounded-lg font-semibold">3A</TabsTrigger>
                    <TabsTrigger value="6m" className="text-[10px] rounded-lg font-semibold">6A</TabsTrigger>
                    <TabsTrigger value="12m" className="text-[10px] rounded-lg font-semibold">12A</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Building Age */}
              <div className="space-y-1.5">
                <Label htmlFor="buildingAge" className="text-xs font-semibold text-gray-600">Bina Yaşı</Label>
                <Select value={buildingAge} onValueChange={(val) => setBuildingAge(val || 'all')}>
                  <SelectTrigger id="buildingAge" className="bg-gray-50 border-gray-200 text-xs rounded-xl h-10">
                    <SelectValue placeholder="Hepsi">
                      {buildingAge === 'all' ? 'Hepsi' : (BUILDING_AGES.find(b => b.value === buildingAge)?.label || 'Hepsi')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-100 shadow-lg rounded-xl">
                    <SelectItem value="all" className="text-xs">Hepsi</SelectItem>
                    {BUILDING_AGES.map(b => (
                      <SelectItem key={b.value} value={b.value} className="text-xs">{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Furnished */}
              <div className="space-y-1.5">
                <Label htmlFor="isFurnished" className="text-xs font-semibold text-gray-600">Eşya Durumu</Label>
                <Select value={isFurnished} onValueChange={(val) => setIsFurnished(val || 'all')}>
                  <SelectTrigger id="isFurnished" className="bg-gray-50 border-gray-200 text-xs rounded-xl h-10">
                    <SelectValue placeholder="Hepsi">
                      {isFurnished === 'all' ? 'Hepsi' : isFurnished === 'true' ? 'Eşyalı' : 'Eşyasız'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-100 shadow-lg rounded-xl">
                    <SelectItem value="all" className="text-xs">Hepsi</SelectItem>
                    <SelectItem value="true" className="text-xs">Eşyalı</SelectItem>
                    <SelectItem value="false" className="text-xs">Eşyasız</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* In Site */}
              <div className="space-y-1.5">
                <Label htmlFor="isInSite" className="text-xs font-semibold text-gray-600">Site Durumu</Label>
                <Select value={isInSite} onValueChange={(val) => setIsInSite(val || 'all')}>
                  <SelectTrigger id="isInSite" className="bg-gray-50 border-gray-200 text-xs rounded-xl h-10">
                    <SelectValue placeholder="Hepsi">
                      {isInSite === 'all' ? 'Hepsi' : isInSite === 'true' ? 'Site İçinde' : 'Sitede Değil'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-100 shadow-lg rounded-xl">
                    <SelectItem value="all" className="text-xs">Hepsi</SelectItem>
                    <SelectItem value="true" className="text-xs">Site İçinde</SelectItem>
                    <SelectItem value="false" className="text-xs">Sitede Değil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Has Elevator */}
              <div className="space-y-1.5">
                <Label htmlFor="hasElevator" className="text-xs font-semibold text-gray-600">Asansör</Label>
                <Select value={hasElevator} onValueChange={(val) => setHasElevator(val || 'all')}>
                  <SelectTrigger id="hasElevator" className="bg-gray-50 border-gray-200 text-xs rounded-xl h-10">
                    <SelectValue placeholder="Hepsi">
                      {hasElevator === 'all' ? 'Hepsi' : hasElevator === 'true' ? 'Asansörlü' : 'Asansörsüz'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-100 shadow-lg rounded-xl">
                    <SelectItem value="all" className="text-xs">Hepsi</SelectItem>
                    <SelectItem value="true" className="text-xs">Asansörlü</SelectItem>
                    <SelectItem value="false" className="text-xs">Asansörsüz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Warning Banner ───────────────────────────────────────────── */}
        {summary && !summary.hasEnoughData && (
          <div className="flex gap-3 p-5 rounded-2xl border border-amber-200 bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-800">Kısıtlı Veri Uyarısı</h4>
              <p className="text-xs text-amber-700 leading-normal">
                Seçtiğiniz mahallede yeterli veri (en az 5 kayıt) henüz bulunmamaktadır. Gösterilen değerler referans niteliğindedir.
              </p>
            </div>
          </div>
        )}

        {/* ─── Loading State ────────────────────────────────────────────── */}
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-xs font-medium text-emerald-800">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analiz verileri yükleniyor...</span>
            </div>
            <AnalyticsSkeleton />
          </div>
        )}

        {/* ─── Data Panel ───────────────────────────────────────────────── */}
        {summary && !loading && (
          summary.count === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl max-w-2xl mx-auto space-y-4 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <Database className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Veri Girilmesi Bekleniyor</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto px-4">
                Seçtiğiniz filtreler veya bölge için henüz doğrulanmış bir kira verisi bulunmamaktadır. Veri girilmesi bekleniyor...
              </p>
              <div className="pt-2">
                <Button onClick={() => window.dispatchEvent(new CustomEvent('open-kira-bildir-modal'))} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-11 px-6 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  Kirayı Anonim Bildir
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">

            <aside data-ai-snippet="true" className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 sm:p-5">
              <h2 className="text-sm font-bold text-emerald-900">Hizli Ozet</h2>
              <div className="mt-2 whitespace-pre-wrap text-[11px] leading-6 text-emerald-950 sm:text-xs">
                {`# Kira Ozeti
- Bolge: ${districtName ? `${districtName}, ${cityName}` : cityName || 'Secilen bolge'}
- Medyan kira: ${formatCurrency(summary.medianRent)}
- Ortalama kira: ${formatCurrency(summary.averageRent)}
- m² kira: ${formatCurrency(summary.rentPerSqmMedian)}
- Kayit sayisi: ${summary.count}
- Para birimi: TRY
- Guven skoru: %${summary.confidenceScore}`}
              </div>
            </aside>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
              <MetricCard
                title="Kayıt Sayısı"
                value={summary.count}
                description="Onaylı kira verisi"
                icon={Database}
                accentColor="blue-500"
              />
              <MetricCard
                title="Medyan Kira"
                value={formatCurrency(summary.medianRent)}
                description="En gerçekçi değer"
                icon={Coins}
                accentColor="emerald-500"
              />
              <MetricCard
                title="Ortalama Kira"
                value={formatCurrency(summary.averageRent)}
                description="Kırpılmış ortalama"
                icon={Coins}
                accentColor="indigo-500"
              />
              <MetricCard
                title="m² Kira"
                value={formatCurrency(summary.rentPerSqmMedian)}
                description="Medyan m² fiyatı"
                icon={Layers}
                accentColor="amber-500"
              />
              <MetricCard
                title="Medyan Aidat"
                value={summary.medianDues ? formatCurrency(summary.medianDues) : '—'}
                description="Aylık aidat medyanı"
                icon={Coins}
                accentColor="rose-500"
              />
              <MetricCard
                title="Güven Skoru"
                value={`%${summary.confidenceScore}`}
                description="Veri kalite puanı"
                icon={ShieldCheck}
                accentColor="teal-500"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              <div className="min-w-0 lg:col-span-2">
                <RentTrendChart data={trends} />
              </div>
              <div className="min-w-0">
                <RoomDistributionChart reports={reports} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5">
              <BuildingAgeChart reports={reports} />
              <SqmPriceChart reports={reports} />
            </div>

            {/* Data Table */}
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Kira Kayıtları</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Seçilen filtrelere uyan kira kayıtları (adresler anonimleştirilmiştir)
                </p>
              </div>
              <DataTable reports={reports} />
            </div>

          </div>
        )
      )}
      </div>
    </div>
  );
}
