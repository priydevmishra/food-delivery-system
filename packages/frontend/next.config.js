/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow requests to backend services during dev
  async rewrites() {
    return [
      { source: '/api/notifications/:path*', destination: 'http://localhost:3003/api/notifications/:path*' },
      { source: '/api/location/:path*',      destination: 'http://localhost:3004/api/location/:path*' },
      { source: '/api/delivery/:path*',      destination: 'http://localhost:3005/api/delivery/:path*' },
    ];
  },
};

module.exports = nextConfig;
