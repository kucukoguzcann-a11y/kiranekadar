import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/login',
        '/register',
        '/dashboard',
        '/account',
        '/profil',
        '/api/',
        '/auth/',
        '/*?sort=',
        '/*?filter=',
        '/*?redirect=',
      ],
    },
    sitemap: 'https://kiranekadar.com.tr/sitemap.xml',
  };
}
