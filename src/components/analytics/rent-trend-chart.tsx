'use client';

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '@/lib/analytics-engine';
import { TrendingUp } from 'lucide-react';

interface TrendData {
  month: string;
  medianRent: number;
  count: number;
  rentPerSqm: number;
}

interface RentTrendChartProps {
  data: TrendData[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-gray-500 mb-1.5">Dönem: {label}</p>
      <p className="font-bold text-gray-900 text-sm">{val ? formatCurrency(Number(val)) : '—'}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">Medyan Kira</p>
    </div>
  );
}

export default function RentTrendChart({ data }: RentTrendChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-[350px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  const processedData = data.map((d) => ({
    ...d,
    displayRent: d.count > 0 ? d.medianRent : null,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Kira Değişim Trendi</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1 ml-9">Son 12 ayda bölgedeki medyan kira gelişimi</p>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
          Medyan
        </span>
      </div>

      <div className="h-[280px] pt-4 pr-4 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRentNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 500 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 500 }}
              tickFormatter={(val) => `${(val / 1000).toFixed(0)}K`}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="displayRent"
              stroke="#059669"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRentNew)"
              connectNulls={true}
              dot={false}
              activeDot={{ r: 4, fill: '#059669', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
