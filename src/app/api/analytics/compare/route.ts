import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateSummary } from '@/lib/analytics-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = (searchParams.get('level') as 'city' | 'district' | 'neighborhood') || 'neighborhood';
    
    // Support both 'ids' and old 'neighborhoodIds' for backward compatibility
    const idsStr = searchParams.get('ids') || searchParams.get('neighborhoodIds');

    if (!idsStr) {
      return NextResponse.json({ error: 'ids parametresi gereklidir' }, { status: 400 });
    }

    const ids = idsStr.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Geçersiz ids' }, { status: 400 });
    }

    const comparisonData = await Promise.all(
      ids.map(async (id) => {
        let name = '';
        let parentName = '';
        const where: any = { status: 'approved' };

        if (level === 'city') {
          const city = await prisma.city.findUnique({
            where: { id },
          });
          if (!city) return null;
          name = city.name;
          parentName = 'Türkiye';
          where.cityId = id;
        } else if (level === 'district') {
          const district = await prisma.district.findUnique({
            where: { id },
            include: { city: true },
          });
          if (!district) return null;
          name = district.name;
          parentName = district.city.name;
          where.districtId = id;
        } else {
          const neighborhood = await prisma.neighborhood.findUnique({
            where: { id },
            include: { district: true, city: true },
          });
          if (!neighborhood) return null;
          name = neighborhood.name;
          parentName = `${neighborhood.district.name}, ${neighborhood.city.name}`;
          where.neighborhoodId = id;
        }

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

        const summary = calculateSummary(mappedData, level);

        // Find most common room count
        const roomCounts = reports.map(r => r.roomCount);
        const modeRoomCount = roomCounts.length > 0 
          ? roomCounts.reduce((a, b, i, arr) => arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b)
          : '—';

        return {
          id,
          name,
          parentName,
          averageRent: summary.averageRent,
          medianRent: summary.medianRent,
          rentPerSqm: summary.rentPerSqmMedian,
          count: summary.count,
          mostCommonRoom: modeRoomCount,
          confidenceScore: summary.confidenceScore,
          hasEnoughData: summary.hasEnoughData,
        };
      })
    );

    const filteredResult = comparisonData.filter(Boolean);

    return NextResponse.json(filteredResult);

  } catch (error) {
    console.error('Analytics compare error:', error);
    return NextResponse.json({ error: 'Karşılaştırma verileri yüklenemedi' }, { status: 500 });
  }
}
