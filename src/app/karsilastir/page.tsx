'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/analytics-engine';
import { cn } from '@/lib/utils';
import { Scale, Trash2, MapPin, Database, Coins, Layers, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface City {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
}

interface Neighborhood {
  id: number;
  name: string;
}

interface SelectedItem {
  id: number;
  name: string;
  parentName: string;
}

export default function KarsilastirPage() {
  const [level, setLevel] = useState<'city' | 'district' | 'neighborhood'>('neighborhood');
  
  // Selection options
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  
  // Selection values
  const [selectedCityId, setSelectedCityId] = useState<number>(0);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number>(0);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<number>(0);
  
  // Loading flags
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  // Selected comparison items
  const [compareItems, setCompareItems] = useState<SelectedItem[]>([]);
  
  // Comparison data
  const [compareData, setCompareData] = useState<any[]>([]);
  const [loadingCompare, setLoadingCompare] = useState(false);

  // Load cities on mount
  useEffect(() => {
    async function loadCities() {
      try {
        const res = await fetch('/api/locations/cities');
        if (res.ok) {
          const citiesData = await res.json();
          setCities(citiesData);
        }
      } catch (err) {
        console.error('İller yüklenemedi:', err);
      }
    }
    loadCities();
  }, []);

  // Reset selection states when level changes
  useEffect(() => {
    setCompareItems([]);
    setCompareData([]);
    setSelectedCityId(0);
    setSelectedDistrictId(0);
    setSelectedNeighborhoodId(0);
    setDistricts([]);
    setNeighborhoods([]);
  }, [level]);

  // Load districts when city is selected
  const handleCitySelect = async (cityId: number) => {
    setSelectedCityId(cityId);
    setSelectedDistrictId(0);
    setSelectedNeighborhoodId(0);
    setDistricts([]);
    setNeighborhoods([]);

    if (!cityId || level === 'city') return;

    setLoadingDistricts(true);
    try {
      const res = await fetch(`/api/locations/districts?cityId=${cityId}`);
      if (res.ok) {
        const districtsData = await res.json();
        setDistricts(districtsData);
      }
    } catch (err) {
      console.error('İlçeler yüklenemedi:', err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Load neighborhoods when district is selected
  const handleDistrictSelect = async (districtId: number) => {
    setSelectedDistrictId(districtId);
    setSelectedNeighborhoodId(0);
    setNeighborhoods([]);

    if (!districtId || level === 'district') return;

    setLoadingNeighborhoods(true);
    try {
      const res = await fetch(`/api/locations/neighborhoods?districtId=${districtId}`);
      if (res.ok) {
        const neighsData = await res.json();
        setNeighborhoods(neighsData);
      }
    } catch (err) {
      console.error('Mahalleler yüklenemedi:', err);
    } finally {
      setLoadingNeighborhoods(false);
    }
  };

  // Add selected item to compare list
  const addItemToCompare = () => {
    let id = 0;
    let name = '';
    let parentName = '';

    if (level === 'city') {
      id = selectedCityId;
      const c = cities.find(item => item.id === id);
      name = c ? c.name : '';
      parentName = 'Türkiye';
    } else if (level === 'district') {
      id = selectedDistrictId;
      const d = districts.find(item => item.id === id);
      name = d ? d.name : '';
      const c = cities.find(item => item.id === selectedCityId);
      parentName = c ? c.name : '';
    } else {
      id = selectedNeighborhoodId;
      const n = neighborhoods.find(item => item.id === id);
      name = n ? n.name : '';
      const d = districts.find(item => item.id === selectedDistrictId);
      const c = cities.find(item => item.id === selectedCityId);
      parentName = d && c ? `${d.name}, ${c.name}` : '';
    }

    if (!id || !name) {
      toast.warning('Lütfen karşılaştırılacak bölgeyi seçin.');
      return;
    }

    if (compareItems.some(item => item.id === id)) {
      toast.warning('Bu bölge zaten listeye eklenmiş.');
      return;
    }

    if (compareItems.length >= 3) {
      toast.warning('En fazla 3 bölgeyi karşılaştırabilirsiniz.');
      return;
    }

    setCompareItems(prev => [...prev, { id, name, parentName }]);

    // Reset the specific select box so they can add another
    if (level === 'neighborhood') {
      setSelectedNeighborhoodId(0);
    } else if (level === 'district') {
      setSelectedDistrictId(0);
    } else {
      setSelectedCityId(0);
    }
  };

  // Remove item from compare list
  const removeItemFromCompare = (id: number) => {
    setCompareItems(prev => prev.filter(item => item.id !== id));
  };

  // Clear all items in compare list
  const clearCompare = () => {
    setCompareItems([]);
    setCompareData([]);
  };

  // Fetch comparison data when items list or level changes
  useEffect(() => {
    async function fetchCompareData() {
      if (compareItems.length === 0) {
        setCompareData([]);
        return;
      }

      setLoadingCompare(true);
      try {
        const ids = compareItems.map(item => item.id).join(',');
        const res = await fetch(`/api/analytics/compare?level=${level}&ids=${ids}`);
        if (res.ok) {
          const result = await res.json();
          setCompareData(result);
        }
      } catch (err) {
        console.error('Karşılaştırma verileri yüklenemedi:', err);
        toast.error('Karşılaştırma verileri yüklenirken hata oluştu.');
      } finally {
        setLoadingCompare(false);
      }
    }
    fetchCompareData();
  }, [compareItems, level]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/20 py-12">
      <div className="container mx-auto px-4 max-w-6xl space-y-8 animate-fade-in text-left">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="section-label">Karşılaştırma</div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl flex items-center gap-2">
              <Scale className="h-8 w-8 text-emerald-600 shrink-0" />
              Kira Karşılaştırma Ekranı
            </h1>
            <p className="text-sm text-gray-500">
              İl, ilçe veya mahalle bazında 3 farklı bölgeyi yan yana ekleyerek kira fiyatlarını ve veri yoğunluklarını kıyaslayın.
            </p>
          </div>
          {compareItems.length > 0 && (
            <Button
              onClick={clearCompare}
              variant="outline"
              size="sm"
              className="w-fit gap-1.5 self-start md:self-center bg-white border-gray-200 text-gray-600 hover:text-rose-600 hover:border-rose-200 transition-all rounded-xl shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              Tümünü Temizle
            </Button>
          )}
        </div>

        {/* Level Switcher */}
        <Tabs value={level} onValueChange={(val) => setLevel(val as any)} className="w-full max-w-md mx-auto">
          <TabsList className="grid grid-cols-3 w-full h-11 bg-gray-100 dark:bg-zinc-900/60 p-1 rounded-xl">
            <TabsTrigger value="city" className="text-xs rounded-lg font-semibold">İl Karşılaştır</TabsTrigger>
            <TabsTrigger value="district" className="text-xs rounded-lg font-semibold">İlçe Karşılaştır</TabsTrigger>
            <TabsTrigger value="neighborhood" className="text-xs rounded-lg font-semibold">Mahalle Karşılaştır</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Selector Input Panel (Single Row Layout) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Bölge Seç ve Ekle</h3>
              <p className="text-xs text-gray-400">Karşılaştırılacak bölgeyi seçip listeye ekleyin</p>
            </div>
          </div>

          <div className={cn(
            "grid gap-4 items-end",
            level === 'city' ? "grid-cols-1 sm:grid-cols-[1fr_auto]" :
            level === 'district' ? "grid-cols-1 sm:grid-cols-[1fr_1fr_auto]" :
            "grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto]"
          )}>
            {/* City Dropdown */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="compare-city" className="text-xs font-semibold text-gray-600">İl</Label>
              <Select
                value={selectedCityId ? String(selectedCityId) : undefined}
                onValueChange={(val) => handleCitySelect(Number(val))}
              >
                <SelectTrigger id="compare-city" className="bg-gray-50 border-gray-200 text-xs rounded-xl h-11">
                  <SelectValue placeholder="İl seçin">
                    {cities.find(c => c.id === selectedCityId)?.name || "İl seçin"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-100 shadow-lg rounded-xl">
                  {cities.map(c => (
                    <SelectItem key={c.id} value={String(c.id)} className="text-xs">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District Dropdown */}
            {level !== 'city' && (
              <div className="space-y-1.5 text-left">
                <Label htmlFor="compare-district" className="text-xs font-semibold text-gray-600">İlçe</Label>
                <Select
                  disabled={!selectedCityId || loadingDistricts}
                  value={selectedDistrictId ? String(selectedDistrictId) : undefined}
                  onValueChange={(val) => handleDistrictSelect(Number(val))}
                >
                  <SelectTrigger id="compare-district" className="bg-gray-50 border-gray-200 text-xs rounded-xl h-11">
                    <SelectValue placeholder={selectedCityId ? "İlçe seçin" : "Önce il seçin"}>
                      {districts.find(d => d.id === selectedDistrictId)?.name || (selectedCityId ? "İlçe seçin" : "Önce il seçin")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-100 shadow-lg rounded-xl">
                    {districts.map(d => (
                      <SelectItem key={d.id} value={String(d.id)} className="text-xs">{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Neighborhood Dropdown */}
            {level === 'neighborhood' && (
              <div className="space-y-1.5 text-left">
                <Label htmlFor="compare-neigh" className="text-xs font-semibold text-gray-600">Mahalle</Label>
                <Select
                  disabled={!selectedDistrictId || loadingNeighborhoods}
                  value={selectedNeighborhoodId ? String(selectedNeighborhoodId) : undefined}
                  onValueChange={(val) => setSelectedNeighborhoodId(Number(val))}
                >
                  <SelectTrigger id="compare-neigh" className="bg-gray-50 border-gray-200 text-xs rounded-xl h-11">
                    <SelectValue placeholder={selectedDistrictId ? "Mahalle seçin" : "Önce ilçe seçin"}>
                      {neighborhoods.find(n => n.id === selectedNeighborhoodId)?.name || (selectedDistrictId ? "Mahalle seçin" : "Önce ilçe seçin")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-100 shadow-lg rounded-xl">
                    {neighborhoods.map(n => (
                      <SelectItem key={n.id} value={String(n.id)} className="text-xs">{n.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Ekle Button */}
            <Button
              onClick={addItemToCompare}
              disabled={
                level === 'city' ? !selectedCityId :
                level === 'district' ? !selectedDistrictId :
                !selectedNeighborhoodId
              }
              className="h-11 px-6 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all"
            >
              Ekle +
            </Button>
          </div>

          {/* Compare Tags/Chips */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Karşılaştırılacak Bölgeler ({compareItems.length}/3)
            </div>
            <div className="flex flex-wrap gap-2 min-h-[44px] items-center">
              {compareItems.length > 0 ? (
                compareItems.map(item => (
                  <div
                    key={item.id}
                    className="inline-flex items-center gap-2 bg-emerald-50/50 border border-emerald-100 hover:border-emerald-200 rounded-xl px-3.5 py-2.5 shadow-sm text-xs font-bold text-emerald-800 transition-all animate-scale-in"
                  >
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <span>{item.name}</span>
                      {item.parentName && item.parentName !== 'Türkiye' && (
                        <span className="text-[10px] font-normal text-emerald-600 block leading-tight">{item.parentName}</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeItemFromCompare(item.id)}
                      className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-emerald-100 text-emerald-600 hover:text-emerald-800 transition-colors ml-1 shrink-0"
                    >
                      &times;
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">Karşılaştırmak istediğiniz bölgeleri yukarıdan seçip ekleyin.</p>
              )}
            </div>
          </div>
        </div>

        {/* Side by Side Stats Results Table */}
        <Card className="border-border/50 shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-base font-bold flex items-center gap-1.5 text-gray-900">
              <Scale className="h-4.5 w-4.5 text-emerald-600" />
              Karşılaştırma Sonuçları
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/30 border-b border-gray-100">
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase text-left w-1/4">Özellik</th>
                    {[0, 1, 2].map((idx) => {
                      const item = compareItems[idx];
                      return (
                        <th key={idx} className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase text-center w-1/4">
                          {item ? (
                            <div>
                              <div className="font-extrabold text-gray-900 text-sm">{item.name}</div>
                              {item.parentName && item.parentName !== 'Türkiye' && (
                                <div className="text-[10px] text-gray-400 font-semibold normal-case mt-0.5">{item.parentName}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">Bölge {idx + 1}</span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {/* Bölge Adı */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-bold text-gray-600 text-xs uppercase tracking-wider">
                      {level === 'city' ? 'İl' : level === 'district' ? 'İlçe' : 'Mahalle'}
                    </td>
                    {[0, 1, 2].map((idx) => {
                      const item = compareItems[idx];
                      const data = compareData.find(d => d.id === item?.id);
                      return (
                        <td key={idx} className="py-4 px-6 text-center font-bold text-gray-900">
                          {loadingCompare ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto text-emerald-600" />
                          ) : data ? (
                            <div>
                              <div>{data.name}</div>
                              {data.parentName && data.parentName !== 'Türkiye' && (
                                <div className="text-[10px] text-gray-400 font-normal mt-0.5">{data.parentName}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs font-normal">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Kayıt Adedi */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-semibold text-gray-500">Kayıt Adedi</td>
                    {[0, 1, 2].map((idx) => {
                      const item = compareItems[idx];
                      const data = compareData.find(d => d.id === item?.id);
                      return (
                        <td key={idx} className="py-4 px-6 text-center text-sm font-semibold">
                          {loadingCompare ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto text-emerald-600" />
                          ) : data ? (
                            <div className="flex items-center justify-center gap-1 text-blue-600">
                              <Database className="h-3.5 w-3.5" />
                              <span>{data.count} Kayıt</span>
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Medyan Kira */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-semibold text-gray-500">Medyan Kira</td>
                    {[0, 1, 2].map((idx) => {
                      const item = compareItems[idx];
                      const data = compareData.find(d => d.id === item?.id);
                      return (
                        <td key={idx} className="py-4 px-6 text-center text-sm font-bold text-emerald-700">
                          {loadingCompare ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto text-emerald-600" />
                          ) : data ? (
                            <div className="flex items-center justify-center gap-1">
                              <Coins className="h-3.5 w-3.5 text-emerald-600" />
                              <span>{formatCurrency(data.medianRent)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Ortalama Kira */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-semibold text-gray-500">Ortalama Kira</td>
                    {[0, 1, 2].map((idx) => {
                      const item = compareItems[idx];
                      const data = compareData.find(d => d.id === item?.id);
                      return (
                        <td key={idx} className="py-4 px-6 text-center text-sm font-semibold text-gray-800">
                          {loadingCompare ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto text-emerald-600" />
                          ) : data ? (
                            formatCurrency(data.averageRent)
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Metrekare Kira */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-semibold text-gray-500">m² Başına Kira (Medyan)</td>
                    {[0, 1, 2].map((idx) => {
                      const item = compareItems[idx];
                      const data = compareData.find(d => d.id === item?.id);
                      return (
                        <td key={idx} className="py-4 px-6 text-center text-sm font-semibold text-gray-800">
                          {loadingCompare ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto text-emerald-600" />
                          ) : data ? (
                            <div className="flex items-center justify-center gap-1">
                              <Layers className="h-3.5 w-3.5 text-amber-500" />
                              <span>{formatCurrency(data.rentPerSqm)} / m²</span>
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* En Yaygın Oda */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-semibold text-gray-500">En Yaygın Oda Sayısı</td>
                    {[0, 1, 2].map((idx) => {
                      const item = compareItems[idx];
                      const data = compareData.find(d => d.id === item?.id);
                      return (
                        <td key={idx} className="py-4 px-6 text-center text-sm font-semibold text-gray-800">
                          {loadingCompare ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto text-emerald-600" />
                          ) : data ? (
                            data.mostCommonRoom
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Güven Skoru */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-semibold text-gray-500">Veri Güven Skoru</td>
                    {[0, 1, 2].map((idx) => {
                      const item = compareItems[idx];
                      const data = compareData.find(d => d.id === item?.id);
                      return (
                        <td key={idx} className="py-4 px-6 text-center text-sm font-bold text-gray-800">
                          {loadingCompare ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto text-emerald-600" />
                          ) : data ? (
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-1 text-teal-600">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>%{data.confidenceScore}</span>
                              </div>
                              {!data.hasEnoughData && (
                                <div className="flex items-center gap-0.5 text-[8px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md mt-1 border border-amber-200">
                                  <AlertTriangle className="h-2 w-2 shrink-0" /> Kısıtlı Veri
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
              {compareItems.length === 0 && (
                <div className="text-center py-16 text-gray-400 font-semibold text-xs bg-slate-50/10">
                  Yukarıdaki bölge seçicilerden karşılaştırmak istediğiniz illeri, ilçeleri veya mahalleleri ekleyin.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
