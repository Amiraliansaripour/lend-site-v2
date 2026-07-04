import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lendapi.persiansys.ir',
        pathname: '/uploads/**',
      },
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
