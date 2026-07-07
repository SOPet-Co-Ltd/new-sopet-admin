import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The browser inspector/automation crawls the React tree on every mousemove,
  // enumerating Next's `params`/`searchParams` Promise props and tripping the
  // dev-only sync-dynamic-apis warning. Those are console.error-level, so the
  // default 'error' forwarding floods the terminal. Turn forwarding off.
  logging: {
    browserToTerminal: false,
  },
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
