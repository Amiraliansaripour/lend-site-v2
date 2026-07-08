import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
<<<<<<< HEAD

const nextConfig: NextConfig = {
  output: 'standalone',
=======
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
  fallbacks: {
    document: '/offline',
  },
});

const nextConfig: NextConfig = {
>>>>>>> a47b58a (pwa)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lendapi.persiansys.ir',
        pathname: '/uploads/**',
      },
<<<<<<< HEAD
      {
        protocol: 'https',
        hostname: 'lendapitest.persiansys.ir',
        pathname: '/uploads/**',
      },
    ],
  },
};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
=======
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withPWA(withNextIntl(nextConfig));
>>>>>>> a47b58a (pwa)
