import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Auth Guard
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('kira-auth');
    let user = null;
    
    if (authCookie?.value) {
      user = JSON.parse(authCookie.value);
    }
    
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 403 });
    }

    // 2. Fetch stats
    const [
      totalReports,
      pendingReports,
      approvedReports,
      rejectedReports,
      flaggedReports,
      totalUsers,
    ] = await Promise.all([
      prisma.rentReport.count(),
      prisma.rentReport.count({ where: { status: 'pending' } }),
      prisma.rentReport.count({ where: { status: 'approved' } }),
      prisma.rentReport.count({ where: { status: 'rejected' } }),
      prisma.rentReport.count({ where: { status: 'flagged' } }),
      prisma.user.count(),
    ]);

    // Average trust score of approved reports
    const approvedList = await prisma.rentReport.findMany({
      where: { status: 'approved' },
      select: { trustScore: true },
    });

    const averageTrustScore = approvedList.length > 0
      ? Math.round(approvedList.reduce((acc, curr) => acc + curr.trustScore, 0) / approvedList.length)
      : 50;

    // Top cities
    const citiesWithCount = await prisma.city.findMany({
      select: {
        name: true,
        _count: {
          select: { rentReports: true },
        },
      },
      orderBy: {
        rentReports: { _count: 'desc' },
      },
      take: 5,
    });

    return NextResponse.json({
      totalReports,
      pendingReports,
      approvedReports,
      rejectedReports,
      flaggedReports,
      totalUsers,
      averageTrustScore,
      topCities: citiesWithCount.map(c => ({ name: c.name, count: c._count.rentReports })),
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'İstatistikler yüklenemedi' }, { status: 500 });
  }
}
