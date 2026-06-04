import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/kira',
        destination: '/kira-fiyatlari',
        permanent: true,
      },
      {
        source: '/kira/:city',
        destination: '/:city-kira-fiyatlari',
        permanent: true,
      },
      {
        source: '/kira/:city/:district',
        destination: '/:city-:district-kira-fiyatlari',
        permanent: true,
      },
      {
        source: '/kira/:city/:district/:neighborhood',
        destination: '/:city-:district-:neighborhood-kira-fiyatlari',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
