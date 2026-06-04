interface TrustScoreInput {
  isLoggedIn: boolean;
  emailVerified: boolean;
  dataSourceConfidence: string;
  allFieldsFilled: boolean;
  rentAmount: number;
  medianRentForArea: number | null;
  previousApprovedReports: number;
  ipReportCount: number;
  timeBetweenReports: number | null; // seconds
  missingFieldCount: number;
}

export function calculateTrustScore(input: TrustScoreInput): number {
  let score = 50;

  // Positive factors
  if (input.isLoggedIn) score += 10;
  if (input.emailVerified) score += 10;
  if (input.dataSourceConfidence === 'self') score += 20;
  else if (input.dataSourceConfidence === 'close_contact') score += 10;
  else if (input.dataSourceConfidence === 'realtor') score += 5;
  if (input.allFieldsFilled) score += 10;
  if (input.medianRentForArea && Math.abs(input.rentAmount - input.medianRentForArea) / input.medianRentForArea < 0.3) score += 5;
  if (input.previousApprovedReports > 0) score += 5;

  // Negative factors
  if (!input.isLoggedIn) score -= 10;
  if (input.dataSourceConfidence === 'estimate') score -= 20;
  if (input.dataSourceConfidence === 'listing') score -= 15;
  if (input.medianRentForArea && Math.abs(input.rentAmount - input.medianRentForArea) / input.medianRentForArea > 2) score -= 20;
  if (input.ipReportCount > 5) score -= 30;
  if (input.timeBetweenReports !== null && input.timeBetweenReports < 60) score -= 30;
  if (input.missingFieldCount > 3) score -= 10;

  return Math.max(0, Math.min(100, score));
}

export function getTrustLevel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Yüksek Güven', color: 'green' };
  if (score >= 60) return { label: 'Orta Güven', color: 'blue' };
  if (score >= 40) return { label: 'Düşük Güven', color: 'orange' };
  return { label: 'Moderasyon Gerekli', color: 'red' };
}
