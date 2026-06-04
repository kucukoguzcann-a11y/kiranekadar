import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateSummary } from '@/lib/analytics-engine';

export async function GET() {
  try {
    const neighborhoods = await prisma.neighborhood.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        rentReports: {
          some: { status: 'approved' },
        },
      },
      include: {
        city: { select: { name: true, slug: true } },
        district: { select: { name: true, slug: true } },
        rentReports: {
          where: { status: 'approved' },
          select: { rentAmount: true, netSqm: true, duesAmount: true, trustScore: true, createdAt: true },
        },
      },
    });

    const result = neighborhoods.map(n => {
      const mappedData = n.rentReports.map(r => ({
        rentAmount: r.rentAmount,
        netSqm: r.netSqm,
        duesAmount: r.duesAmount,
        trustScore: r.trustScore,
        createdAt: r.createdAt,
        roomCount: '',
        buildingAgeRange: '',
        propertyType: '',
      }));
      const summary = calculateSummary(mappedData, 'neighborhood');

      return {
        id: n.id,
        name: n.name,
        latitude: n.latitude,
        longitude: n.longitude,
        cityName: n.city.name,
        citySlug: n.city.slug,
        districtName: n.district.name,
        districtSlug: n.district.slug,
        neighborhoodSlug: n.slug,
        medianRent: summary.medianRent,
        averageRent: summary.averageRent,
        rentPerSqm: summary.rentPerSqmMedian,
        count: summary.count,
        confidenceScore: summary.confidenceScore,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Map location data error:', error);
    return NextResponse.json({ error: 'Harita konum verileri yüklenemedi' }, { status: 500 });
  }
}
