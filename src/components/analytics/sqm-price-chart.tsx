'use client';

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '@/lib/analytics-engine';
import { Maximize } from 'lucide-react';

interface ReportItem {
  netSqm: number;
  rentAmount: number;
  roomCount: string;
}

interface SqmPriceChartProps {
  reports: ReportItem[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-gray-500 mb-1.5">{data?.room}</p>
      <div className="space-y-1">
        <p className="text-gray-700"><span className="text-gray-400">Büyüklük:</span> <strong>{data?.sqm} m²</strong></p>
        <p className="text-gray-700"><span className="text-gray-400">Kira:</span> <strong className="text-emerald-600">{formatCurrency(data?.rent)}</strong></p>
      </div>
    </div>
  );
}

export default function SqmPriceChart({ reports }: SqmPriceChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-[320px] flex items-center justify-center">
        <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const data = reports.map((r) => ({
    sqm: r.netSqm,
    rent: r.rentAmount,
    room: r.roomCount,
  }));

  const finalData = data.length > 0 ? data : [
    { sqm: 50, rent: 12000, room: '1+1' },
    { sqm: 75, rent: 16000, room: '1+1' },
    { sqm: 90, rent: 19000, room: '2+1' },
    { sqm: 110, rent: 24000, room: '2+1' },
    { sqm: 130, rent: 28000, room: '3+1' },
    { sqm: 155, rent: 35000, room: '3+1' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-purple-50 rounded-lg flex items-center justify-center">
            <Maximize className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Metrekare / Kira İlişkisi</h3>
        </div>
        <p className="text-xs text-gray-400 mt-1 ml-9">Daire büyüklüğü ile kira arasındaki dağılım</p>
      </div>

      <div className="h-[252px] pt-4 pr-4 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 15, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              type="number"
              dataKey="sqm"
              name="Metrekare"
              unit=" m²"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 500 }}
            />
            <YAxis
              type="number"
              dataKey="rent"
              name="Kira"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 500 }}
              tickFormatter={(val) => `${(val / 1000).toFixed(0)}K`}
              width={34}
            />
            <ZAxis type="category" dataKey="room" name="Oda" />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#E5E7EB' }} />
            <Scatter
              name="Konutlar"
              data={finalData}
              fill="#059669"
              fillOpacity={0.7}
              shape="circle"
              line={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
