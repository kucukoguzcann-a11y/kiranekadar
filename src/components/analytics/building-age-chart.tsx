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
import { Calendar } from 'lucide-react';

interface ReportItem {
  buildingAgeRange: string;
}

interface BuildingAgeChartProps {
  reports: ReportItem[];
}

const COLORS = ['#059669', '#10B981', '#2563EB', '#3B82F6', '#F97316', '#FB923C', '#DC2626'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-gray-500 mb-1">{label}</p>
      <p className="font-bold text-gray-900">{payload[0]?.value} daire</p>
    </div>
  );
}

export default function BuildingAgeChart({ reports }: BuildingAgeChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-[300px] sm:h-[320px] flex items-center justify-center">
        <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const counts: Record<string, number> = {};
  reports.forEach((r) => {
    counts[r.buildingAgeRange] = (counts[r.buildingAgeRange] || 0) + 1;
  });

  const ageLabels: Record<string, string> = {
    '0': 'Sıfır',
    '1-5': '1-5 Yıl',
    '6-10': '6-10 Yıl',
    '11-15': '11-15 Yıl',
    '16-20': '16-20 Yıl',
    '21-30': '21-30 Yıl',
    '30+': '30+ Yıl',
  };

  const order = ['0', '1-5', '6-10', '11-15', '16-20', '21-30', '30+'];
  const data = order
    .map((age) => ({ age: ageLabels[age] || age, count: counts[age] || 0 }))
    .filter((item) => item.count > 0);

  const finalData = data.length > 0 ? data : [
    { age: 'Sıfır', count: 3 },
    { age: '1-5 Yıl', count: 8 },
    { age: '6-10 Yıl', count: 6 },
    { age: '30+ Yıl', count: 4 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-4 border-b border-gray-50 sm:px-6 sm:py-5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-blue-50 rounded-lg flex items-center justify-center">
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Bina Yaşı Dağılımı</h3>
        </div>
        <p className="text-[11px] text-gray-400 mt-1 ml-9 leading-4 sm:text-xs">Konutların bina yaşı gruplarına göre sayısı</p>
      </div>

      <div className="h-[240px] pt-4 pr-2 pb-2 sm:h-[252px] sm:pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={finalData} layout="vertical" margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 500 }}
              allowDecimals={false}
            />
            <YAxis
              dataKey="age"
              type="category"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 500 }}
              width={64}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[0, 5, 5, 0]} maxBarSize={22}>
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
