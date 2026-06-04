export interface OutlierCheckResult {
  isOutlier: boolean;
  flags: string[];
  severity: 'low' | 'medium' | 'high';
}

export function checkRentOutliers(data: {
  rentAmount: number;
  duesAmount?: number | null;
  netSqm: number;
  grossSqm?: number | null;
  medianRentForArea?: number | null;
}): OutlierCheckResult {
  const flags: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'low';

  // Rent amount checks
  if (data.rentAmount < 1000) {
    flags.push('Kira 1.000 TL altında');
    severity = 'high';
  }
  if (data.rentAmount > 500000) {
    flags.push('Kira 500.000 TL üstünde');
    severity = 'high';
  }

  // Sqm checks
  if (data.netSqm < 20) {
    flags.push('Net m² 20 altında');
    severity = severity === 'high' ? 'high' : 'medium';
  }
  if (data.netSqm > 600) {
    flags.push('Net m² 600 üstünde');
    severity = severity === 'high' ? 'high' : 'medium';
  }

  // Dues vs rent check
  if (data.duesAmount && data.duesAmount > data.rentAmount) {
    flags.push('Aidat kiradan yüksek');
    severity = severity === 'high' ? 'high' : 'medium';
  }

  // Median deviation check
  if (data.medianRentForArea) {
    const ratio = data.rentAmount / data.medianRentForArea;
    if (ratio > 3) {
      flags.push('Bölge medyanının 3 katından yüksek');
      severity = 'high';
    }
    if (ratio < 1 / 3) {
      flags.push('Bölge medyanının 3 katından düşük');
      severity = 'high';
    }
  }

  // Gross vs net sqm check
  if (data.grossSqm && data.netSqm > data.grossSqm) {
    flags.push('Net m² brüt m²den büyük');
    severity = severity === 'high' ? 'high' : 'medium';
  }

  return {
    isOutlier: flags.length > 0,
    flags,
    severity,
  };
}

export function shouldAutoFlag(result: OutlierCheckResult): boolean {
  return result.severity === 'high' || result.flags.length >= 2;
}
