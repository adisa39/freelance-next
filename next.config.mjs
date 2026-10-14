/** @type {import('next').NextConfig} */
export default {
  serverExternalPackages: ['mongoose'],
  async rewrites() {
    return [
      { source: '/api/client', destination: '/api/buyer' },
      { source: '/api/client/:path*', destination: '/api/buyer/:path*' },
      { source: '/client', destination: '/buyer' },
      { source: '/client/:path*', destination: '/buyer/:path*' },
    ];
  },
};
