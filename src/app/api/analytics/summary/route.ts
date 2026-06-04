import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateSummary } from '@/lib/analytics-engine';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Check if user is logged in
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('kira-auth');
    const isLoggedIn = !!authCookie?.value;

    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const cityId = searchParams.get('cityId') ? parseInt(searchParams.get('cityId')!) : undefined;
    const districtId = searchParams.get('districtId') ? parseInt(searchParams.get('districtId')!) : undefined;
    const neighborhoodId = searchParams.get('neighborhoodId') ? parseInt(searchParams.get('neighborhoodId')!) : undefined;
    const propertyType = searchParams.get('propertyType') || undefined;
    const roomCount = searchParams.get('roomCount') || undefined;
    const rentType = searchParams.get('rentType') || undefined;
    
    const minSqm = searchParams.get('minSqm') ? parseInt(searchParams.get('minSqm')!) : undefined;
    const maxSqm = searchParams.get('maxSqm') ? parseInt(searchParams.get('maxSqm')!) : undefined;
    const buildingAge = searchParams.get('buildingAge') || undefined;
    
    const isFurnished = searchParams.get('isFurnished') === 'true' ? true : searchParams.get('isFurnished') === 'false' ? false : undefined;
    const isInSite = searchParams.get('isInSite') === 'true' ? true : searchParams.get('isInSite') === 'false' ? false : undefined;
    const hasElevator = searchParams.get('hasElevator') === 'true' ? true : searchParams.get('hasElevator') === 'false' ? false : undefined;
    const dateRange = searchParams.get('dateRange') || '6m';

    // Calculate start date
    const now = new Date();
    let startDate = new Date();
    if (dateRange === '1m') startDate.setMonth(now.getMonth() - 1);
    else if (dateRange === '3m') startDate.setMonth(now.getMonth() - 3);
    else if (dateRange === '12m') startDate.setMonth(now.getMonth() - 12);
    else startDate.setMonth(now.getMonth() - 6); // default 6m

    // Build Prisma query condition
    const where: any = {
      status: 'approved',
      createdAt: { gte: startDate },
    };

    if (cityId) where.cityId = cityId;
    if (districtId) where.districtId = districtId;
    if (neighborhoodId) where.neighborhoodId = neighborhoodId;
    if (propertyType) where.propertyType = propertyType;
    if (roomCount) where.roomCount = roomCount;
    if (rentType) where.rentType = rentType;
    if (buildingAge) where.buildingAgeRange = buildingAge;
    
    if (isFurnished !== undefined) where.isFurnished = isFurnished;
    if (isInSite !== undefined) where.isInSite = isInSite;
    if (hasElevator !== undefined) where.hasElevator = hasElevator;

    if (minSqm || maxSqm) {
      where.netSqm = {};
      if (minSqm) where.netSqm.gte = minSqm;
      if (maxSqm) where.netSqm.lte = maxSqm;
    }

    // Fetch matching reports
    const reports = await prisma.rentReport.findMany({
      where,
      select: {
        rentAmount: true,
        netSqm: true,
        duesAmount: true,
        trustScore: true,
        createdAt: true,
        roomCount: true,
        buildingAgeRange: true,
        propertyType: true,
      },
    });

    // Map to RentDataPoint type
    const mappedData = reports.map(r => ({
      rentAmount: r.rentAmount,
      netSqm: r.netSqm,
      duesAmount: r.duesAmount,
      trustScore: r.trustScore,
      createdAt: r.createdAt,
      roomCount: r.roomCount,
      buildingAgeRange: r.buildingAgeRange,
      propertyType: r.propertyType,
    }));

    const level = neighborhoodId ? 'neighborhood' : districtId ? 'district' : 'city';
    const summary = calculateSummary(mappedData, level);

    // Fetch reports detail (only if logged in, otherwise limit/anonymize)
    let reportsList: any[] = [];
    if (isLoggedIn) {
      reportsList = await prisma.rentReport.findMany({
        where,
        select: {
          id: true,
          propertyType: true,
          roomCount: true,
          netSqm: true,
          buildingAgeRange: true,
          floorType: true,
          rentAmount: true,
          duesAmount: true,
          rentType: true,
          trustScore: true,
          createdAt: true,
          city: { select: { name: true } },
          district: { select: { name: true } },
          neighborhood: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50, // limit to latest 50
      });
    }

    return NextResponse.json({
      summary,
      reports: reportsList,
      isLoggedIn,
    });

  } catch (error) {
    console.error('Analytics summary error:', error);
    return NextResponse.json({ error: 'Analiz özet verileri yüklenemedi' }, { status: 500 });
  }
}
