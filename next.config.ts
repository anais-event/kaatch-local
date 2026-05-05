import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
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
