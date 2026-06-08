'use client';

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface ReportItem {
  roomCount: string;
}

interface RoomDistributionChartProps {
  reports: ReportItem[];
}

const COLORS = ['#059669', '#F97316', '#2563EB', '#DC2626', '#7C3AED'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-gray-500 mb-1">{label}</p>
      <p className="font-bold text-gray-900">{payload[0]?.value} daire</p>
    </div>
  );
}

export default function RoomDistributionChart({ reports }: RoomDistributionChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-[300px] sm:h-[350px] flex items-center justify-center">
        <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const counts: Record<string, number> = {};
  reports.forEach((r) => {
    counts[r.roomCount] = (counts[r.roomCount] || 0) + 1;
  });

  const order = ['1+0', '1+1', '2+1', '3+1', '4+1', '5+1'];
  const data = order
    .map((room) => ({ room, count: counts[room] || 0 }))
    .filter((item) => item.count > 0);

  const finalData = data.length > 0 ? data : [
    { room: '1+1', count: 5 },
    { room: '2+1', count: 12 },
    { room: '3+1', count: 8 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-4 border-b border-gray-50 sm:px-6 sm:py-5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-orange-50 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-3.5 w-3.5 text-orange-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Oda Dağılımı</h3>
        </div>
        <p className="text-[11px] text-gray-400 mt-1 ml-9 leading-4 sm:text-xs">Oda sayısına göre daire dağılımı</p>
      </div>

      <div className="h-[240px] pt-4 pr-2 pb-2 sm:h-[280px] sm:pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={finalData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="room"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 500 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 500 }}
              allowDecimals={false}
              width={24}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={44}>
              {finalData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
