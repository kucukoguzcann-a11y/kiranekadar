import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  accentColor?: string;
  className?: string;
}

const colorMap: Record<string, { topBar: string; iconBg: string; iconText: string }> = {
  'blue-500': {
    topBar: '#2563EB',
    iconBg: '#EFF6FF',
    iconText: '#2563EB',
  },
  'emerald-500': {
    topBar: '#059669',
    iconBg: '#ECFDF5',
    iconText: '#059669',
  },
  'indigo-500': {
    topBar: '#4F46E5',
    iconBg: '#EEF2FF',
    iconText: '#4F46E5',
  },
  'amber-500': {
    topBar: '#D97706',
    iconBg: '#FFFBEB',
    iconText: '#D97706',
  },
  'rose-500': {
    topBar: '#F43F5E',
    iconBg: '#FFF1F2',
    iconText: '#F43F5E',
  },
  'teal-500': {
    topBar: '#0D9488',
    iconBg: '#F0FDFA',
    iconText: '#0D9488',
  },
  'accent': {
    topBar: '#059669',
    iconBg: '#ECFDF5',
    iconText: '#059669',
  },
};

export default function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  accentColor = 'accent',
  className,
}: MetricCardProps) {
  const styles = colorMap[accentColor] || colorMap['accent'];

  return (
    <div className={cn(
      "bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden relative group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
      className
    )}>
      {/* Colored top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
        style={{ background: styles.topBar }}
      />

      <div className="p-4 pt-5 sm:p-5 sm:pt-6">
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
          <span className="min-w-0 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {title}
          </span>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: styles.iconBg }}
          >
            <Icon className="h-4 w-4" style={{ color: styles.iconText }} />
          </div>
        </div>

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="min-w-0 break-words text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                trend.type === 'positive'
                  ? "bg-emerald-50 text-emerald-700"
                  : trend.type === 'negative'
                  ? "bg-red-50 text-red-600"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-2 text-[11px] text-gray-400 leading-normal">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
