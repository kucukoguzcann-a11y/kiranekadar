'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/analytics-engine';
import { Shield, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportItem {
  id: string;
  propertyType: string;
  roomCount: string;
  netSqm: number;
  buildingAgeRange: string;
  floorType: string;
  rentAmount: number;
  duesAmount: number | null;
  rentType: string;
  trustScore: number;
  createdAt: string | Date;
  city: { name: string };
  district: { name: string };
  neighborhood: { name: string };
}

interface DataTableProps {
  reports: ReportItem[];
}

export default function DataTable({ reports }: DataTableProps) {
  const getTrustBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 60) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (score >= 40) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const getRentTypeBadge = (type: string) => {
    switch (type) {
      case 'actual_paid':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-[10px]">Ödenen Kira</Badge>;
      case 'new_contract':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-[10px]">Yeni Kontrat</Badge>;
      case 'old_contract':
        return <Badge variant="outline" className="text-gray-500 border-gray-300 text-[10px]">Eski Kontrat</Badge>;
      case 'asking_price':
        return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">İlan Fiyatı</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Diğer</Badge>;
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      daire: 'Daire',
      rezidans: 'Rezidans',
      mustakil: 'Müstakil Ev',
      villa: 'Villa',
      studyo: 'Stüdyo',
      apart: 'Apart',
    };
    return labels[type] || type;
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-white">
        <p className="text-sm text-gray-400 font-medium">Bölgede eşleşen onaylı veri bulunamadı.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {reports.map((report) => (
          <article key={report.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="truncate text-sm font-extrabold text-gray-900">
                  {report.neighborhood.name}
                </h4>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {report.district.name}, {report.city.name}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-base font-black text-gray-900">{formatCurrency(report.rentAmount)}</div>
                <div className="mt-0.5 text-[10px] text-gray-400">Aylık kira</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-gray-50 px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Konut</div>
                <div className="mt-1 font-semibold text-gray-800">
                  {getPropertyTypeLabel(report.propertyType)} · {report.roomCount}
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Alan</div>
                <div className="mt-1 font-semibold text-gray-800">
                  {report.netSqm} m² · {report.buildingAgeRange}
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Aidat</div>
                <div className="mt-1 font-semibold text-gray-800">
                  {report.duesAmount ? `${formatNumber(report.duesAmount)} ₺` : '—'}
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Güven</div>
                <Badge
                  variant="outline"
                  className={cn("mt-1 text-[10px] font-bold px-2 py-0.5 inline-flex items-center gap-1", getTrustBadgeColor(report.trustScore))}
                >
                  <Shield className="h-3 w-3" />
                  %{report.trustScore}
                </Badge>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              {getRentTypeBadge(report.rentType)}
              <span className="text-[11px] text-gray-400">
                {new Date(report.createdAt).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden w-full overflow-hidden border border-gray-100 rounded-2xl bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-gray-100">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Konum</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Konut Detayları</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Kira Durumu</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Aylık Kira</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Aidat</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Güven Skoru</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Kayıt Tarihi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id} className="hover:bg-gray-50 transition-colors border-gray-100">
                {/* Location */}
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs text-gray-900">
                      {report.neighborhood.name}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      {report.district.name}, {report.city.name}
                    </span>
                  </div>
                </TableCell>

                {/* Property specs */}
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-900">
                        {getPropertyTypeLabel(report.propertyType)}
                      </span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs font-medium text-gray-700">
                        {report.roomCount}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {report.netSqm} m² · {report.buildingAgeRange} Yaş · {report.floorType}
                    </span>
                  </div>
                </TableCell>

                {/* Rent Type */}
                <TableCell>{getRentTypeBadge(report.rentType)}</TableCell>

                {/* Rent */}
                <TableCell className="font-extrabold text-gray-900 text-sm">
                  {formatCurrency(report.rentAmount)}
                </TableCell>

                {/* Dues */}
                <TableCell className="text-xs text-gray-400">
                  {report.duesAmount ? `${formatNumber(report.duesAmount)} ₺` : '—'}
                </TableCell>

                {/* Trust Score */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] font-bold px-2 py-0.5 flex items-center gap-1", getTrustBadgeColor(report.trustScore))}
                    >
                      <Shield className="h-3 w-3" />
                      %{report.trustScore}
                    </Badge>
                  </div>
                </TableCell>

                {/* Date */}
                <TableCell className="text-right text-xs text-gray-400">
                  {new Date(report.createdAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>
    </>
  );
}
