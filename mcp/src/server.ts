import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadConfig, type McpConfig } from './config.js';
import { SessionStore } from './auth/session.js';
import { createToolContext, SopetGraphqlClient } from './graphql/client.js';
import { registerTools } from './tools/registry.js';

export type SopetMcpRuntime = {
  config: McpConfig;
  sessions: SessionStore;
  gql: SopetGraphqlClient;
  createServer: () => McpServer;
};

export async function createSopetMcpRuntime(options?: {
  config?: McpConfig;
  requireHttpAuth?: boolean;
  skipBootstrap?: boolean;
}): Promise<SopetMcpRuntime> {
  const config = options?.config ?? loadConfig({ requireHttpAuth: options?.requireHttpAuth });
  const sessions = new SessionStore();
  const gql = new SopetGraphqlClient(config, sessions);

  if (!options?.skipBootstrap) {
    await gql.bootstrap();
  }

  const createServer = (): McpServer => {
    const server = new McpServer({
      name: 'sopet-admin-mcp',
      version: '0.1.0',
    });
    registerTools(server, createToolContext(config, sessions, gql));
    return server;
  };

  return { config, sessions, gql, createServer };
}

/** Back-compat helper for stdio: one long-lived server. */
export async function createSopetMcpServer(options?: {
  config?: McpConfig;
  requireHttpAuth?: boolean;
  skipBootstrap?: boolean;
}): Promise<{
  server: McpServer;
  config: McpConfig;
  sessions: SessionStore;
  gql: SopetGraphqlClient;
}> {
  const runtime = await createSopetMcpRuntime(options);
  return {
    server: runtime.createServer(),
    config: runtime.config,
    sessions: runtime.sessions,
    gql: runtime.gql,
  };
}
