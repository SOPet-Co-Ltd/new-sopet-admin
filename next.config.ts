import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

function cdnRemotePattern(cdnUrl: string): RemotePattern | null {
  try {
    const parsed = new URL(cdnUrl);
    const protocol = parsed.protocol.replace(':', '');
    if (protocol !== 'http' && protocol !== 'https') {
      return null;
    }

    return {
      protocol,
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
      pathname: '/**',
    };
  } catch {
    return null;
  }
}

function imageRemotePatterns(): RemotePattern[] {
  const patterns: RemotePattern[] = [
    {
      protocol: 'http',
      hostname: 'minio.sopet-backend.orb.local',
      port: '9000',
      pathname: '/sopet-ecommerce-files/**',
    },
    // Cloudflare R2 — UAT public bucket + any pub-*.r2.dev
    {
      protocol: 'https',
      hostname: '**.r2.dev',
      pathname: '/**',
    },
    // Production custom domain for R2
    {
      protocol: 'https',
      hostname: 'cdn.sopet.org',
      pathname: '/**',
    },
  ];

  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL ?? process.env.CDN_URL;
  if (cdnUrl) {
    const pattern = cdnRemotePattern(cdnUrl);
    if (pattern) {
      patterns.push(pattern);
    }
  }

  return patterns;
}

const isLocalDev = process.env.NODE_ENV === 'development';

const productionCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Skip CSP locally so MinIO/http assets and HMR are unrestricted.
          ...(isLocalDev ? [] : [{ key: 'Content-Security-Policy', value: productionCsp }]),
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
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
    remotePatterns: imageRemotePatterns(),
  },
};

export default nextConfig;
