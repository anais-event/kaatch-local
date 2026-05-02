import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  async rewrites() {
    return [
      {
        source: '/mariage/:path*',
        destination: '/wedding/:path*',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth',
        permanent: true,
      },
      {
        source: '/wedding/:path*',
        destination: '/mariage/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig;
