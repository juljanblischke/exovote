import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

const nextConfig = {
  output: 'standalone' as const,
  async rewrites() {
    const backendUrl = process.env.INTERNAL_API_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/hubs/:path*',
        destination: `${backendUrl}/hubs/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
