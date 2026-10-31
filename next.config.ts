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

function isLocalApiHost(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/** Convert an API origin or GraphQL HTTP URL into `ws(s)://host/graphql`. */
function toGraphqlWsUrl(originOrUrl: string): string | null {
  try {
    const url = new URL(originOrUrl);
    if (url.protocol === 'https:' || url.protocol === 'wss:') {
      url.protocol = 'wss:';
    } else {
      url.protocol = 'ws:';
    }
    url.pathname = '/graphql';
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function toWsConnectSrc(wsUrl: string): string | null {
  try {
    const url = new URL(wsUrl);
    url.pathname = '';
    url.search = '';
    url.hash = '';
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Prefer public NEXT_PUBLIC_* hosts; fall back to GRAPHQL_SSR_URL (Vercel server env).
 * Local hosts are skipped so a missing public var does not bake localhost into the bundle.
 */
function resolveGraphqlWsUrlForBuild(): string | null {
  const explicit = process.env.NEXT_PUBLIC_GRAPHQL_WS_URL?.trim();
  if (explicit && !isLocalApiHost(explicit)) {
    return explicit;
  }

  for (const candidate of [
    process.env.NEXT_PUBLIC_GRAPHQL_BACKEND_ORIGIN,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.GRAPHQL_SSR_URL,
  ]) {
    const value = candidate?.trim();
    if (!value || isLocalApiHost(value)) {
      continue;
    }
    const wsUrl = toGraphqlWsUrl(value);
    if (wsUrl) {
      return wsUrl;
    }
  }

  return null;
}

const derivedWsUrl = resolveGraphqlWsUrlForBuild();
const wsConnectSrc = derivedWsUrl ? toWsConnectSrc(derivedWsUrl) : null;
const connectSrc = ["'self'", ...(wsConnectSrc ? [wsConnectSrc] : [])].join(' ');

const productionCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  // Monaco AMD workers (same-origin /monaco/vs + blob: bootstrap)
  "worker-src 'self' blob:",
  `connect-src ${connectSrc}`,
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  // GRAPHQL_SSR_URL is server-only; expose a derived wss URL so the browser
  // subscription client does not fall back to localhost on Vercel.
  env: {
    ...(process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || !derivedWsUrl
      ? {}
      : { NEXT_PUBLIC_GRAPHQL_WS_URL: derivedWsUrl }),
  },
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
