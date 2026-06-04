import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  let xml = '';

  const getFormattedDate = (date: Date | null | undefined) => {
    if (!date) return new Date().toISOString().split('T')[0];
    return new Date(date).toISOString().split('T')[0];
  };

  // Common wrapper function to format urls
  const buildUrlset = (urls: { loc: string; lastmod: string; changefreq?: string; priority?: string }[]) => {
    const urlElements = urls
      .map(
        (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq || 'weekly'}</changefreq>
    <priority>${u.priority || '0.6'}</priority>
  </url>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
  };

  try {
    if (name === 'static.xml') {
      const latestReport = await prisma.rentReport.findFirst({
        where: { status: 'approved' },
        orderBy: { approvedAt: 'desc' },
      });
      const lastmodDate = latestReport?.approvedAt || latestReport?.updatedAt || new Date();
      const lastmodStr = getFormattedDate(lastmodDate);

      const staticUrls = [
        { loc: 'https://kiranekadar.com.tr', lastmod: lastmodStr, changefreq: 'daily', priority: '1.0' },
        { loc: 'https://kiranekadar.com.tr/kira-fiyatlari', lastmod: lastmodStr, changefreq: 'daily', priority: '0.9' },
        { loc: 'https://kiranekadar.com.tr/metodoloji', lastmod: lastmodStr, changefreq: 'monthly', priority: '0.7' },
        { loc: 'https://kiranekadar.com.tr/kira-haritasi', lastmod: lastmodStr, changefreq: 'weekly', priority: '0.8' },
        { loc: 'https://kiranekadar.com.tr/kira-karsilastirma', lastmod: lastmodStr, changefreq: 'weekly', priority: '0.8' },
        { loc: 'https://kiranekadar.com.tr/kira-analizi', lastmod: lastmodStr, changefreq: 'weekly', priority: '0.8' },
      ];

      xml = buildUrlset(staticUrls);

    } else if (name === 'city.xml') {
      const activeCities = await prisma.city.findMany({
        where: {
          rentReports: {
            some: { status: 'approved' },
          },
        },
        include: {
          rentReports: {
            where: { status: 'approved' },
            orderBy: { approvedAt: 'desc' },
            take: 1,
          },
        },
      });

      const urls = activeCities.map((city) => {
        const report = city.rentReports[0];
        const lastmod = report ? (report.approvedAt || report.updatedAt) : new Date();
        return {
          loc: `https://kiranekadar.com.tr/${city.slug}-kira-fiyatlari`,
          lastmod: getFormattedDate(lastmod),
          changefreq: 'daily',
          priority: '0.8',
        };
      });

      xml = buildUrlset(urls);

    } else if (name === 'district.xml') {
      const activeDistricts = await prisma.district.findMany({
        where: {
          rentReports: {
            some: { status: 'approved' },
          },
        },
        include: {
          city: true,
          rentReports: {
            where: { status: 'approved' },
            orderBy: { approvedAt: 'desc' },
            take: 1,
          },
        },
      });

      const urls = activeDistricts.map((district) => {
        const report = district.rentReports[0];
        const lastmod = report ? (report.approvedAt || report.updatedAt) : new Date();
        return {
          loc: `https://kiranekadar.com.tr/${district.city.slug}-${district.slug}-kira-fiyatlari`,
          lastmod: getFormattedDate(lastmod),
          changefreq: 'daily',
          priority: '0.7',
        };
      });

      xml = buildUrlset(urls);

    } else if (name === 'neighborhood.xml') {
      const activeNeighborhoods = await prisma.neighborhood.findMany({
        where: {
          rentReports: {
            some: { status: 'approved' },
          },
        },
        include: {
          city: true,
          district: true,
          rentReports: {
            where: { status: 'approved' },
            orderBy: { approvedAt: 'desc' },
            take: 1,
          },
        },
      });

      const urls = activeNeighborhoods.map((neigh) => {
        const report = neigh.rentReports[0];
        const lastmod = report ? (report.approvedAt || report.updatedAt) : new Date();
        return {
          loc: `https://kiranekadar.com.tr/${neigh.city.slug}-${neigh.district.slug}-${neigh.slug}-kira-fiyatlari`,
          lastmod: getFormattedDate(lastmod),
          changefreq: 'weekly',
          priority: '0.6',
        };
      });

      xml = buildUrlset(urls);

    } else if (name === 'blog.xml') {
      xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    } else {
      return new NextResponse('Not Found', { status: 404 });
    }

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
      },
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
