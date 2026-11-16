export type McpConfig = {
  graphqlUrl: string;
  adminEmail?: string;
  adminPassword?: string;
  vendorEmail?: string;
  vendorPassword?: string;
  vendorStoreId?: string;
  httpHost: string;
  httpPort: number;
  httpToken?: string;
  /** Public HTTPS origin clients use, e.g. https://mcp-admin.sopet.org */
  publicUrl?: string;
  /** Host header allowlist when binding 0.0.0.0 (DNS rebinding protection). */
  allowedHosts: string[];
};

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function requiredForHttp(name: string, value: string | undefined): void {
  if (!value) {
    throw new Error(`${name} is required for HTTP transport`);
  }
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function hostFromPublicUrl(publicUrl: string): string | undefined {
  try {
    return new URL(publicUrl).hostname;
  } catch {
    throw new Error(
      'MCP_PUBLIC_URL must be a valid absolute URL (e.g. https://mcp-admin.example.com)',
    );
  }
}

function parseAllowedHosts(publicUrl?: string): string[] {
  const raw = optional('MCP_ALLOWED_HOSTS');
  const fromEnv = raw
    ? raw
        .split(',')
        .map((h) => h.trim())
        .filter(Boolean)
    : [];
  const fromPublic = publicUrl ? hostFromPublicUrl(publicUrl) : undefined;
  const hosts = new Set<string>([
    ...fromEnv,
    ...(fromPublic ? [fromPublic] : []),
    'localhost',
    '127.0.0.1',
  ]);
  return Array.from(hosts);
}

export function loadConfig(options?: { requireHttpAuth?: boolean }): McpConfig {
  const graphqlUrl = optional('SOPET_GRAPHQL_URL') ?? 'http://localhost:3002/graphql';
  const adminEmail = optional('SOPET_ADMIN_EMAIL');
  const adminPassword = optional('SOPET_ADMIN_PASSWORD');
  const vendorEmail = optional('SOPET_VENDOR_EMAIL');
  const vendorPassword = optional('SOPET_VENDOR_PASSWORD');
  const vendorStoreId = optional('SOPET_VENDOR_STORE_ID');
  const publicUrlRaw = optional('MCP_PUBLIC_URL');
  const publicUrl = publicUrlRaw ? stripTrailingSlash(publicUrlRaw) : undefined;
  if (publicUrl) {
    hostFromPublicUrl(publicUrl);
  }

  const isRemote =
    Boolean(publicUrl) ||
    process.env.NODE_ENV === 'production' ||
    optional('MCP_HTTP_HOST') === '0.0.0.0';
  const httpHost = optional('MCP_HTTP_HOST') ?? (isRemote ? '0.0.0.0' : '127.0.0.1');
  const httpPort = Number(optional('MCP_HTTP_PORT') ?? '3101');
  const httpToken = optional('MCP_HTTP_TOKEN');
  const allowedHosts = parseAllowedHosts(publicUrl);

  if (!adminEmail && !vendorEmail) {
    throw new Error('Set SOPET_ADMIN_EMAIL/PASSWORD and/or SOPET_VENDOR_EMAIL/PASSWORD');
  }
  if (adminEmail && !adminPassword) {
    throw new Error('SOPET_ADMIN_PASSWORD is required when SOPET_ADMIN_EMAIL is set');
  }
  if (vendorEmail && !vendorPassword) {
    throw new Error('SOPET_VENDOR_PASSWORD is required when SOPET_VENDOR_EMAIL is set');
  }
  if (options?.requireHttpAuth) {
    requiredForHttp('MCP_HTTP_TOKEN', httpToken);
    if (httpHost === '0.0.0.0' || httpHost === '::') {
      if (!publicUrl && allowedHosts.length === 0) {
        throw new Error('Set MCP_PUBLIC_URL or MCP_ALLOWED_HOSTS when binding 0.0.0.0');
      }
    }
  }
  if (!Number.isFinite(httpPort) || httpPort < 1) {
    throw new Error('MCP_HTTP_PORT must be a positive number');
  }

  return {
    graphqlUrl,
    adminEmail,
    adminPassword,
    vendorEmail,
    vendorPassword,
    vendorStoreId,
    httpHost,
    httpPort,
    httpToken,
    publicUrl,
    allowedHosts,
  };
}

export function mcpEndpointUrl(config: McpConfig): string {
  if (config.publicUrl) {
    return `${config.publicUrl}/mcp`;
  }
  const host = config.httpHost === '0.0.0.0' ? '127.0.0.1' : config.httpHost;
  return `http://${host}:${config.httpPort}/mcp`;
}
