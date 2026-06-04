import { NextResponse } from 'next/server';

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://kiranekadar.com.tr/sitemaps/static.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://kiranekadar.com.tr/sitemaps/city.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://kiranekadar.com.tr/sitemaps/district.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://kiranekadar.com.tr/sitemaps/neighborhood.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://kiranekadar.com.tr/sitemaps/blog.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
    },
  });
}
