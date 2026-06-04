export interface CityWithCount {
  id: number;
  name: string;
  slug: string;
  plateCode: string;
  _count?: { rentReports: number };
}

export interface DistrictWithCount {
  id: number;
  cityId: number;
  name: string;
  slug: string;
  _count?: { rentReports: number };
}

export interface NeighborhoodWithCount {
  id: number;
  cityId: number;
  districtId: number;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  _count?: { rentReports: number };
}

export interface RentReportWithLocation {
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
  status: string;
  dataSourceConfidence: string;
  createdAt: Date;
  city: { name: string; slug: string };
  district: { name: string; slug: string };
  neighborhood: { name: string; slug: string };
}

export interface AdminDashboardStats {
  totalReports: number;
  todayReports: number;
  pendingReports: number;
  flaggedReports: number;
  approvedReports: number;
  rejectedReports: number;
  totalUsers: number;
  averageTrustScore: number;
  topCities: { name: string; count: number }[];
  topDistricts: { name: string; count: number }[];
}
