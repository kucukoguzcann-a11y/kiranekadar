'use client';

import { useState, useEffect } from 'react';
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

  return (
    <div className="min-h-screen bg-[#F8F5EF] py-8">
      <div className="container mx-auto px-4 md:px-6 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="section-label">Dashboard</div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Kira Analiz Paneli
            </h1>
            <p className="text-sm text-gray-500">
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
            className="w-fit gap-1.5 self-start md:self-center bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm rounded-xl"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Yenile
          </Button>
        </div>

        {/* ─── Filters ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Location Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Search className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Bölge Seçimi</h3>
                <p className="text-xs text-gray-400">İl, ilçe ve mahalle seçin</p>
              </div>
            </div>
            <LocationSelector
              className="flex flex-col gap-4"
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
            />
          </div>

          {/* Property Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <SlidersHorizontal className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Filtreler</h3>
                <p className="text-xs text-gray-400">Daire özellikleri ve zaman aralığı</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
          <div className="h-[200px] w-full flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
              <span className="text-xs text-gray-400 font-medium">Analiz verileri yükleniyor...</span>
            </div>
          </div>
        )}

        {/* ─── Data Panel ───────────────────────────────────────────────── */}
        {summary && !loading && (
          <div className="space-y-6 animate-fade-in">

            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="col-span-1 lg:col-span-2">
                <RentTrendChart data={trends} />
              </div>
              <div className="col-span-1">
                <RoomDistributionChart reports={reports} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
        )}
      </div>
    </div>
  );
}
