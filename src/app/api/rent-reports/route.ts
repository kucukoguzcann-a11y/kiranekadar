import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { fullRentReportSchema } from '@/validators/rent-report';
import { calculateTrustScore } from '@/lib/trust-score';
import { checkRentOutliers, shouldAutoFlag } from '@/lib/outlier-detection';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 1. Zod Validation
    const parsed = fullRentReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Geçersiz veri formu', details: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;

    // 2. Auth Session Check (via mock cookie)
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('kira-auth');
    let userId: string | null = null;
    let isLoggedIn = false;
    let emailVerified = false;
    let previousApprovedReports = 0;
    
    if (authCookie?.value) {
      try {
        const userObj = JSON.parse(authCookie.value);
        isLoggedIn = true;
        emailVerified = true; // Assume verified for demo users
        
        // Find user by email in database
        const dbUser = await prisma.user.findUnique({
          where: { email: userObj.email },
        });
        
        if (dbUser) {
          userId = dbUser.id;
          
          // Get previous approved reports count
          previousApprovedReports = await prisma.rentReport.count({
            where: { userId: dbUser.id, status: 'approved' },
          });
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
    }

    // 3. Get IP & Client Metadata (mocked/extracted)
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipHash = ip; // In production, hash it: crypto.createHash('sha256').update(ip).digest('hex')

    // 4. Rate Limiting Check / IP report checks
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentReportsCount = await prisma.rentReport.count({
      where: {
        ipHash,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentReportsCount >= 5) {
      return NextResponse.json({ error: 'Çok fazla veri girişi yapıldı. Lütfen daha sonra tekrar deneyin.' }, { status: 429 });
    }

    // Time between reports check (seconds)
    const lastReport = await prisma.rentReport.findFirst({
      where: { ipHash },
      orderBy: { createdAt: 'desc' },
    });

    let timeBetweenReports: number | null = null;
    if (lastReport) {
      timeBetweenReports = Math.round((Date.now() - lastReport.createdAt.getTime()) / 1000);
    }

    // 5. Get Median Rent for the neighborhood/district to run trust & outlier checks
    const similarReports = await prisma.rentReport.findMany({
      where: {
        cityId: data.cityId,
        districtId: data.districtId,
        neighborhoodId: data.neighborhoodId,
        propertyType: data.propertyType,
        roomCount: data.roomCount,
        status: 'approved',
      },
      select: { rentAmount: true },
    });

    let medianRentForArea: number | null = null;
    if (similarReports.length >= 3) {
      const rents = similarReports.map(r => r.rentAmount).sort((a, b) => a - b);
      medianRentForArea = rents[Math.floor(rents.length / 2)];
    }

    // 6. Calculate Trust Score
    const allFieldsFilled = !!(data.grossSqm && data.floorNumber && data.totalFloors && data.isPostEarthquake !== null);
    const missingFieldCount = [
      data.grossSqm,
      data.floorNumber,
      data.totalFloors,
      data.isPostEarthquake,
    ].filter(v => v === null || v === undefined).length;

    const trustScore = calculateTrustScore({
      isLoggedIn,
      emailVerified,
      dataSourceConfidence: data.dataSourceConfidence,
      allFieldsFilled,
      rentAmount: data.rentAmount,
      medianRentForArea,
      previousApprovedReports,
      ipReportCount: recentReportsCount,
      timeBetweenReports,
      missingFieldCount,
    });

    // 7. Outlier Detection
    const outlierResult = checkRentOutliers({
      rentAmount: data.rentAmount,
      duesAmount: data.duesAmount,
      netSqm: data.netSqm,
      grossSqm: data.grossSqm,
      medianRentForArea,
    });

    // Determine status
    let status = 'pending';
    let rejectedReason = null;

    if (shouldAutoFlag(outlierResult)) {
      status = 'flagged';
      rejectedReason = `Uç değer algılandı: ${outlierResult.flags.join(', ')}`;
    } else if (trustScore >= 65) {
      status = 'approved'; // High trust scores auto-approve if no outliers
    }

    // 8. Create database record
    const report = await prisma.rentReport.create({
      data: {
        userId,
        sessionId: `session_${Math.random().toString(36).substring(7)}`,
        cityId: data.cityId,
        districtId: data.districtId,
        neighborhoodId: data.neighborhoodId,
        propertyType: data.propertyType,
        roomCount: data.roomCount,
        netSqm: data.netSqm,
        grossSqm: data.grossSqm,
        buildingAgeRange: data.buildingAgeRange,
        floorType: data.floorType,
        floorNumber: data.floorNumber,
        totalFloors: data.totalFloors,
        hasElevator: data.hasElevator,
        hasParking: data.hasParking,
        isFurnished: data.isFurnished,
        isInSite: data.isInSite,
        hasBalcony: data.hasBalcony,
        heatingType: data.heatingType,
        hasSecurity: data.hasSecurity,
        hasSocialFacility: data.hasSocialFacility,
        isPostEarthquake: data.isPostEarthquake,
        rentAmount: data.rentAmount,
        duesAmount: data.duesAmount,
        depositAmount: data.depositAmount,
        currency: data.currency,
        rentType: data.rentType,
        contractStartMonth: data.contractStartMonth,
        contractStartYear: data.contractStartYear,
        dataSourceConfidence: data.dataSourceConfidence,
        trustScore,
        status,
        ipHash,
        userAgentHash: userAgent,
        rejectedReason,
        approvedAt: status === 'approved' ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      reportId: report.id,
      status: report.status,
      trustScore: report.trustScore,
      isOutlier: outlierResult.isOutlier,
      outlierFlags: outlierResult.flags,
    });

  } catch (error) {
    console.error('Kira verisi kaydetme hatası:', error);
    return NextResponse.json({ error: 'Kira verisi kaydedilirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}

// GET: Fetch current user's submitted reports
export async function GET() {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('kira-auth');
    
    if (!authCookie?.value) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const userObj = JSON.parse(authCookie.value);
    const dbUser = await prisma.user.findUnique({
      where: { email: userObj.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const reports = await prisma.rentReport.findMany({
      where: { userId: dbUser.id },
      include: {
        city: { select: { name: true } },
        district: { select: { name: true } },
        neighborhood: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ error: 'Kira verileri listelenemedi' }, { status: 500 });
  }
}
