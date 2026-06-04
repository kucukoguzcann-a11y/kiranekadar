import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalReports = await prisma.rentReport.count({
      where: { status: 'approved' },
    });

    const activeCitiesGroup = await prisma.rentReport.groupBy({
      by: ['cityId'],
      where: { status: 'approved' },
    });
    const activeCitiesCount = activeCitiesGroup.length;

    const activeNeighborhoodsGroup = await prisma.rentReport.groupBy({
      by: ['neighborhoodId'],
      where: { status: 'approved' },
    });
    const activeNeighborhoodsCount = activeNeighborhoodsGroup.length;

    let avgConfidence = 0;
    if (totalReports > 0) {
      const avgAggregate = await prisma.rentReport.aggregate({
        where: { status: 'approved' },
        _avg: {
          trustScore: true,
        },
      });
      avgConfidence = avgAggregate._avg.trustScore ? Math.round(avgAggregate._avg.trustScore) : 0;
    }

    const popularCitySlugs = ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'kocaeli'];
    const popularCitiesData = await Promise.all(
      popularCitySlugs.map(async (slug) => {
        const city = await prisma.city.findUnique({
          where: { slug },
          select: { id: true, name: true, slug: true },
        });
        if (!city) return { name: slug, slug, count: 0, avgRent: 0 };

        const reports = await prisma.rentReport.findMany({
          where: { cityId: city.id, status: 'approved' },
          select: { rentAmount: true },
        });

        const count = reports.length;
        let avgRent = 0;
        if (count > 0) {
          const totalRent = reports.reduce((sum, r) => sum + r.rentAmount, 0);
          avgRent = Math.round(totalRent / count);
        }

        return {
          name: city.name,
          slug: city.slug,
          count,
          avgRent,
        };
      })
    );

    // Fetch 3 latest approved reports for live feed
    const latestReports = await prisma.rentReport.findMany({
      where: { status: 'approved' },
      select: {
        id: true,
        roomCount: true,
        netSqm: true,
        rentAmount: true,
        createdAt: true,
        city: { select: { name: true } },
        district: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    return NextResponse.json({
      totalReports,
      activeCitiesCount,
      activeNeighborhoodsCount,
      avgConfidence,
      popularCities: popularCitiesData,
      latestReports,
    });
  } catch (error) {
    console.error('Global stats error:', error);
    return NextResponse.json({ error: 'İstatistikler yüklenemedi' }, { status: 500 });
  }
}
