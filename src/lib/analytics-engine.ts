import { MIN_DATA_THRESHOLDS } from './constants';

export interface RentDataPoint {
  rentAmount: number;
  netSqm: number;
  duesAmount: number | null;
  trustScore: number;
  createdAt: Date;
  roomCount: string;
  buildingAgeRange: string;
  propertyType: string;
}

export interface AnalyticsSummary {
  count: number;
  averageRent: number;
  medianRent: number;
  minRent: number;
  maxRent: number;
  percentile25: number;
  percentile75: number;
  rentPerSqmAverage: number;
  rentPerSqmMedian: number;
  averageDues: number;
  medianDues: number;
  confidenceScore: number;
  lastReportDate: Date | null;
  hasEnoughData: boolean;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return Math.round(sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function calculateSummary(
  data: RentDataPoint[],
  level: 'neighborhood' | 'district' | 'city' = 'neighborhood'
): AnalyticsSummary {
  const threshold = MIN_DATA_THRESHOLDS[level];
  const hasEnoughData = data.length >= threshold;

  if (data.length === 0) {
    return {
      count: 0, averageRent: 0, medianRent: 0, minRent: 0, maxRent: 0,
      percentile25: 0, percentile75: 0, rentPerSqmAverage: 0, rentPerSqmMedian: 0,
      averageDues: 0, medianDues: 0, confidenceScore: 0, lastReportDate: null,
      hasEnoughData: false,
    };
  }

  // Weight data by trust score (filter out very low trust)
  const filtered = data.filter(d => d.trustScore >= 40);
  const rents = filtered.map(d => d.rentAmount);
  const sqmPrices = filtered.map(d => Math.round(d.rentAmount / d.netSqm));
  const dues = filtered.filter(d => d.duesAmount !== null).map(d => d.duesAmount!);

  // Winsorize: remove top/bottom 5% if enough data
  let processedRents = rents;
  if (rents.length >= 20) {
    const sorted = [...rents].sort((a, b) => a - b);
    const trimCount = Math.floor(sorted.length * 0.05);
    processedRents = sorted.slice(trimCount, sorted.length - trimCount);
  }

  const avgTrust = average(filtered.map(d => d.trustScore));
  const dataRecency = filtered.length > 0
    ? Math.max(...filtered.map(d => d.createdAt.getTime()))
    : 0;

  return {
    count: data.length,
    averageRent: average(processedRents),
    medianRent: median(processedRents),
    minRent: Math.min(...processedRents),
    maxRent: Math.max(...processedRents),
    percentile25: percentile(processedRents, 25),
    percentile75: percentile(processedRents, 75),
    rentPerSqmAverage: average(sqmPrices),
    rentPerSqmMedian: median(sqmPrices),
    averageDues: average(dues),
    medianDues: median(dues),
    confidenceScore: Math.round(avgTrust * (hasEnoughData ? 1 : 0.6)),
    lastReportDate: dataRecency ? new Date(dataRecency) : null,
    hasEnoughData,
  };
}

export function calculateTrend(
  data: RentDataPoint[],
  months: number = 12
): { month: string; medianRent: number; count: number; rentPerSqm: number }[] {
  const now = new Date();
  const result: { month: string; medianRent: number; count: number; rentPerSqm: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthLabel = monthDate.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });

    const monthData = data.filter(d => {
      const created = new Date(d.createdAt);
      return created >= monthDate && created <= monthEnd;
    });

    const rents = monthData.map(d => d.rentAmount);
    const sqmPrices = monthData.map(d => Math.round(d.rentAmount / d.netSqm));

    result.push({
      month: monthLabel,
      medianRent: median(rents),
      count: monthData.length,
      rentPerSqm: median(sqmPrices),
    });
  }

  return result;
}

export function findSimilarProperties(
  target: { neighborhoodId: number; districtId: number; roomCount: string; netSqm: number; buildingAgeRange: string; isFurnished: boolean; isInSite: boolean },
  data: (RentDataPoint & { neighborhoodId: number; districtId: number; isFurnished: boolean; isInSite: boolean })[]
): RentDataPoint[] {
  const sqmRange = target.netSqm * 0.2;

  return data.filter(d => {
    const sameRoom = d.roomCount === target.roomCount;
    const sqmMatch = Math.abs(d.netSqm - target.netSqm) <= sqmRange;
    const sameNeighborhood = d.neighborhoodId === target.neighborhoodId;
    const sameDistrict = d.districtId === target.districtId;

    return sameRoom && sqmMatch && (sameNeighborhood || sameDistrict);
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('tr-TR').format(num);
}
