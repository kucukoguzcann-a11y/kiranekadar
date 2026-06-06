import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
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
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'PerplexityBot',
          'ClaudeBot',
          'Claude-SearchBot',
          'Google-Extended',
          'CCBot',
          'Amazonbot',
          'Bytespider',
        ],
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
        ],
      },
    ],
    sitemap: 'https://kiranekadar.com.tr/sitemap.xml',
  };
}
