import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateTrend } from '@/lib/analytics-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('cityId') ? parseInt(searchParams.get('cityId')!) : undefined;
    const districtId = searchParams.get('districtId') ? parseInt(searchParams.get('districtId')!) : undefined;
    const neighborhoodId = searchParams.get('neighborhoodId') ? parseInt(searchParams.get('neighborhoodId')!) : undefined;
    const months = searchParams.get('months') ? parseInt(searchParams.get('months')!) : 12;

    const where: any = {
      status: 'approved',
    };

    if (cityId) where.cityId = cityId;
    if (districtId) where.districtId = districtId;
    if (neighborhoodId) where.neighborhoodId = neighborhoodId;

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

    const trend = calculateTrend(mappedData, months);

    return NextResponse.json(trend);

  } catch (error) {
    console.error('Analytics trends error:', error);
    return NextResponse.json({ error: 'Trend verileri yüklenemedi' }, { status: 500 });
  }
}
