import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

const graphqlBackendOrigin =
  process.env.GRAPHQL_SSR_URL?.replace(/\/graphql\/?$/, '') ?? 'http://localhost:3002';

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
    // Cloudflare R2 public buckets (pub-<hash>.r2.dev)
    {
      protocol: 'https',
      hostname: '**.r2.dev',
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

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/graphql',
        destination: `${graphqlBackendOrigin}/graphql`,
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
