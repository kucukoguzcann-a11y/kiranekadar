'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/analytics-engine';

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

interface NeighborhoodTableProps {
  neighborhoods: NeighborhoodStat[];
  citySlug: string;
  districtSlug: string;
}

type SortField = 'name' | 'count' | 'minRent' | 'medianRent' | 'rentPerSqm';
type SortDirection = 'asc' | 'desc';

export default function NeighborhoodTable({ neighborhoods, citySlug, districtSlug }: NeighborhoodTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('medianRent');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Handle header click sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc'); // A-Z first, high-to-low for numbers first
    }
  };

  // Maps legacy SortOption select values for mobile view to field/direction
  const handleMobileSelectSort = (val: string) => {
    switch (val) {
      case 'price-asc':
        setSortField('medianRent');
        setSortDirection('asc');
        break;
      case 'price-desc':
        setSortField('medianRent');
        setSortDirection('desc');
        break;
      case 'count-desc':
        setSortField('count');
        setSortDirection('desc');
        break;
      case 'name-asc':
        setSortField('name');
        setSortDirection('asc');
        break;
    }
  };

  const currentSelectValue = useMemo(() => {
    if (sortField === 'medianRent') return sortDirection === 'asc' ? 'price-asc' : 'price-desc';
    if (sortField === 'count') return 'count-desc';
    if (sortField === 'name') return 'name-asc';
    return 'price-asc';
  }, [sortField, sortDirection]);

  // Filter and sort neighborhoods
  const processedNeighborhoods = useMemo(() => {
    let result = [...neighborhoods];

    // 1. Search Filter
    if (search.trim()) {
      const query = search.toLocaleLowerCase('tr-TR');
      result = result.filter((n) => n.name.toLocaleLowerCase('tr-TR').includes(query));
    }

    // 2. Sort
    result.sort((a, b) => {
      // Keep neighborhoods with 0 data at the bottom unless sorting by name
      if (sortField !== 'name') {
        if (a.count === 0 && b.count === 0) return a.name.localeCompare(b.name, 'tr');
        if (a.count === 0) return 1;
        if (b.count === 0) return -1;
      }

      if (sortField === 'name') {
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name, 'tr')
          : b.name.localeCompare(a.name, 'tr');
      }

      const valA = a[sortField];
      const valB = b[sortField];

      return sortDirection === 'asc'
        ? valA - valB
        : valB - valA;
    });

    return result;
  }, [neighborhoods, search, sortField, sortDirection]);

  const headers = [
    { label: 'Mahalle', field: 'name' as const },
    { label: 'Veri Sayısı', field: 'count' as const },
    { label: 'Min Kira', field: 'minRent' as const },
    { label: 'Medyan Kira', field: 'medianRent' as const },
    { label: 'm² Fiyatı', field: 'rentPerSqm' as const },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Mobile Sort controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Mahalle ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>

        {/* Sort Select (Mobile only - hidden on desktop where headers are clickable) */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 md:hidden">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Sıralama:</span>
          <select
            value={currentSelectValue}
            onChange={(e) => handleMobileSelectSort(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm font-medium text-gray-700"
          >
            <option value="price-asc">En Ucuzdan Pahalıya</option>
            <option value="price-desc">En Pahalıdan Ucuza</option>
            <option value="count-desc">En Çok Veri Olan</option>
            <option value="name-asc">İsim (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header (Desktop) */}
        <div className="hidden md:grid grid-cols-[2.5fr_1fr_1.2fr_1.2fr_1.2fr_110px] gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50 items-center">
          {headers.map((h) => {
            const isActive = sortField === h.field;
            return (
              <button
                key={h.field}
                onClick={() => handleSort(h.field)}
                className={`flex items-center gap-1 text-[10px] uppercase tracking-widest transition-colors select-none group text-left outline-none cursor-pointer ${
                  isActive ? 'text-emerald-700 font-black' : 'text-gray-400 hover:text-gray-700 font-bold'
                }`}
              >
                {h.label}
                {isActive ? (
                  sortDirection === 'asc' ? (
                    <ChevronUp className="h-4 w-4 text-emerald-600 stroke-[3px] shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-emerald-600 stroke-[3px] shrink-0" />
                  )
                ) : (
                  <ArrowUpDown className="h-3.5 w-3.5 text-gray-300 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                )}
              </button>
            );
          })}
          <div /> {/* Spacer for link column */}
        </div>

        {processedNeighborhoods.length > 0 ? (
          processedNeighborhoods.map((n, idx) => (
            <div
              key={n.id}
              className="flex flex-col md:grid md:grid-cols-[2.5fr_1fr_1.2fr_1.2fr_1.2fr_110px] gap-2 md:gap-4 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors items-start md:items-center"
            >
              {/* Mobile Card Header / Rank + Name */}
              <div className="flex items-center justify-between w-full md:w-auto min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      n.count > 0
                        ? idx === 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : idx === 1
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-gray-100 text-gray-600'
                        : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {n.count > 0 ? idx + 1 : '—'}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-gray-900 truncate">{n.name}</div>
                    <div className="text-[10px] text-gray-400 md:hidden">
                      {n.count > 0 ? `${n.count} kira kaydı` : 'Veri girilmesi bekleniyor'}
                    </div>
                  </div>
                </div>

                {/* Mobile View Price */}
                <div className="md:hidden text-right">
                  {n.medianRent > 0 ? (
                    <div className="font-extrabold text-sm text-emerald-700">{formatCurrency(n.medianRent)}</div>
                  ) : (
                    <div className="text-gray-300 text-xs font-semibold">Veri yok</div>
                  )}
                </div>
              </div>

              {/* Veri Sayısı (Desktop) */}
              <div className="hidden md:block text-sm text-gray-600">
                {n.count > 0 ? n.count : <span className="text-gray-200">—</span>}
              </div>

              {/* Min Kira (Desktop) */}
              <div className="hidden md:block text-sm text-gray-600">
                {n.minRent > 0 ? formatCurrency(n.minRent) : <span className="text-gray-200">—</span>}
              </div>

              {/* Median Kira (Desktop) */}
              <div className="hidden md:block">
                {n.medianRent > 0 ? (
                  <span className="font-extrabold text-sm text-emerald-700">{formatCurrency(n.medianRent)}</span>
                ) : (
                  <span className="text-gray-400 text-xs font-normal">Veri girilmesi bekleniyor</span>
                )}
              </div>

              {/* m² Fiyatı (Desktop) */}
              <div className="hidden md:block text-sm text-gray-600">
                {n.rentPerSqm > 0 ? `${n.rentPerSqm.toLocaleString('tr-TR')} ₺` : <span className="text-gray-200">—</span>}
              </div>

              {/* Action Button */}
              <div className="w-full md:w-auto flex justify-end pt-2 md:pt-0 shrink-0">
                <Link
                  href={`/${citySlug}-${districtSlug}-${n.slug}-kira-fiyatlari`}
                  className="w-full md:w-auto justify-center flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  İncele <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-sm text-gray-400">Aramanıza uygun mahalle bulunamadı.</div>
        )}
      </div>
    </div>
  );
}
