import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // MinIO (OrbStack) resolves to a private IP in local dev; Next 16's image
    // optimizer blocks private IPs by default ("url parameter is not allowed").
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'minio.sopet-backend.orb.local',
        port: '9000',
        pathname: '/sopet-ecommerce-files/**',
      },
    ],
  },
};

export default nextConfig;
