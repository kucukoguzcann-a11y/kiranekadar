export interface AnalyticsSummaryResponse {
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
  lastReportDate: string | null;
  hasEnoughData: boolean;
}

export interface TrendDataPoint {
  month: string;
  medianRent: number;
  count: number;
  rentPerSqm: number;
}

export interface ComparisonData {
  neighborhoodId: number;
  neighborhoodName: string;
  districtName: string;
  averageRent: number;
  medianRent: number;
  rentPerSqm: number;
  count: number;
  change6m: number | null;
  mostCommonRoom: string;
  confidenceScore: number;
}

export interface SimilarPropertyResult {
  minRent: number;
  maxRent: number;
  medianRent: number;
  count: number;
  properties: {
    roomCount: string;
    netSqm: number;
    rentAmount: number;
    buildingAgeRange: string;
    trustScore: number;
  }[];
}
