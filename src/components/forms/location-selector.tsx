'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin } from 'lucide-react';

interface City {
  id: number;
  name: string;
  plateCode: string;
}

interface District {
  id: number;
  name: string;
}

interface Neighborhood {
  id: number;
  name: string;
}

interface LocationSelectorProps {
  cityId?: number;
  districtId?: number;
  neighborhoodId?: number;
  onCityChange: (id: number) => void;
  onDistrictChange: (id: number) => void;
  onNeighborhoodChange: (id: number) => void;
  errors?: {
    cityId?: string;
    districtId?: string;
    neighborhoodId?: string;
  };
  className?: string;
  onCityResolved?: (city: City | null) => void;
  onDistrictResolved?: (district: District | null) => void;
  onNeighborhoodResolved?: (neighborhood: Neighborhood | null) => void;
}

export default function LocationSelector({
  cityId,
  districtId,
  neighborhoodId,
  onCityChange,
  onDistrictChange,
  onNeighborhoodChange,
  errors,
  className = "grid grid-cols-1 md:grid-cols-3 gap-6",
  onCityResolved,
  onDistrictResolved,
  onNeighborhoodResolved,
}: LocationSelectorProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);

  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  // Load cities on mount
  useEffect(() => {
    async function fetchCities() {
      setLoadingCities(true);
      try {
        const res = await fetch('/api/locations/cities');
        if (res.ok) {
          const data = await res.json();
          setCities(data);
        }
      } catch (err) {
        console.error('İller yüklenemedi:', err);
      } finally {
        setLoadingCities(false);
      }
    }
    fetchCities();
  }, []);

  // Load districts when cityId changes
  useEffect(() => {
    if (!cityId) {
      setDistricts([]);
      setNeighborhoods([]);
      return;
    }

    async function fetchDistricts() {
      setLoadingDistricts(true);
      try {
        const res = await fetch(`/api/locations/districts?cityId=${cityId}`);
        if (res.ok) {
          const data = await res.json();
          setDistricts(data);
        }
      } catch (err) {
        console.error('İlçeler yüklenemedi:', err);
      } finally {
        setLoadingDistricts(false);
      }
    }
    fetchDistricts();
  }, [cityId]);

  // Load neighborhoods when districtId changes
  useEffect(() => {
    if (!districtId) {
      setNeighborhoods([]);
      return;
    }

    async function fetchNeighborhoods() {
      setLoadingNeighborhoods(true);
      try {
        const res = await fetch(`/api/locations/neighborhoods?districtId=${districtId}`);
        if (res.ok) {
          const data = await res.json();
          setNeighborhoods(data);
        }
      } catch (err) {
        console.error('Mahalleler yüklenemedi:', err);
      } finally {
        setLoadingNeighborhoods(false);
      }
    }
    fetchNeighborhoods();
  }, [districtId]);

  useEffect(() => {
    onCityResolved?.(cities.find((city) => city.id === cityId) || null);
  }, [cities, cityId, onCityResolved]);

  useEffect(() => {
    onDistrictResolved?.(districts.find((district) => district.id === districtId) || null);
  }, [districts, districtId, onDistrictResolved]);

  useEffect(() => {
    onNeighborhoodResolved?.(neighborhoods.find((neighborhood) => neighborhood.id === neighborhoodId) || null);
  }, [neighborhoods, neighborhoodId, onNeighborhoodResolved]);

  return (
    <div className={className}>
      {/* City Select */}
      <div className="space-y-2">
        <Label htmlFor="city" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <MapPin className="h-4 w-4 text-accent" />
          İl
        </Label>
        <Select
          disabled={loadingCities}
          value={cityId ? String(cityId) : undefined}
          onValueChange={(val) => onCityChange(Number(val))}
        >
          <SelectTrigger id="city" className="bg-white border-gray-200 hover:border-emerald-400 focus:border-emerald-500 h-10 text-sm rounded-xl">
            {loadingCities ? (
              <span className="flex items-center gap-2 text-gray-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Yüklenıyor...
              </span>
            ) : (
              <SelectValue placeholder="İl seçin">
                {cities.find(c => c.id === cityId)?.name || undefined}
              </SelectValue>
            )}
          </SelectTrigger>
          <SelectContent className="max-h-[300px] bg-white border border-gray-100 shadow-lg rounded-xl">
            {cities.map((city) => (
              <SelectItem key={city.id} value={String(city.id)} className="text-sm">
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.cityId && <p className="text-xs text-red-600 mt-1 font-medium">{errors.cityId}</p>}
      </div>

      {/* District Select */}
      <div className="space-y-2">
        <Label htmlFor="district" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <MapPin className="h-4 w-4 text-accent/80" />
          İlçe
        </Label>
        <Select
          disabled={!cityId || loadingDistricts}
          value={districtId ? String(districtId) : undefined}
          onValueChange={(val) => onDistrictChange(Number(val))}
        >
          <SelectTrigger id="district" className="bg-white border-gray-200 hover:border-emerald-400 focus:border-emerald-500 h-10 text-sm rounded-xl disabled:opacity-50">
            {loadingDistricts ? (
              <span className="flex items-center gap-2 text-gray-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Yüklenıyor...
              </span>
            ) : (
              <SelectValue placeholder={cityId ? 'İlçe seçin' : 'Önce il seçin'}>
                {districts.find(d => d.id === districtId)?.name || undefined}
              </SelectValue>
            )}
          </SelectTrigger>
          <SelectContent className="max-h-[300px] bg-white border border-gray-100 shadow-lg rounded-xl">
            {districts.map((dist) => (
              <SelectItem key={dist.id} value={String(dist.id)} className="text-sm">
                {dist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.districtId && <p className="text-xs text-red-600 mt-1 font-medium">{errors.districtId}</p>}
      </div>

      {/* Neighborhood Select */}
      <div className="space-y-2">
        <Label htmlFor="neighborhood" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <MapPin className="h-4 w-4 text-accent/60" />
          Mahalle
        </Label>
        <Select
          disabled={!districtId || loadingNeighborhoods}
          value={neighborhoodId ? String(neighborhoodId) : undefined}
          onValueChange={(val) => onNeighborhoodChange(Number(val))}
        >
          <SelectTrigger id="neighborhood" className="bg-white border-gray-200 hover:border-emerald-400 focus:border-emerald-500 h-10 text-sm rounded-xl disabled:opacity-50">
            {loadingNeighborhoods ? (
              <span className="flex items-center gap-2 text-gray-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Yüklenıyor...
              </span>
            ) : (
              <SelectValue placeholder={districtId ? 'Mahalle seçin' : 'Önce ilçe seçin'}>
                {neighborhoods.find(n => n.id === neighborhoodId)?.name || undefined}
              </SelectValue>
            )}
          </SelectTrigger>
          <SelectContent className="max-h-[300px] bg-white border border-gray-100 shadow-lg rounded-xl">
            {neighborhoods.map((neigh) => (
              <SelectItem key={neigh.id} value={String(neigh.id)} className="text-sm">
                {neigh.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.neighborhoodId && <p className="text-xs text-red-600 mt-1 font-medium">{errors.neighborhoodId}</p>}
      </div>
    </div>
  );
}
