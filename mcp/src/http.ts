#!/usr/bin/env node
import type { NextFunction, Request, Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { createSopetMcpRuntime } from './server.js';
import { loadConfig, mcpEndpointUrl } from './config.js';
import { bearerMatches } from './http-auth.js';

async function main(): Promise<void> {
  const config = loadConfig({ requireHttpAuth: true });
  const runtime = await createSopetMcpRuntime({ config, requireHttpAuth: true });
  const endpoint = mcpEndpointUrl(config);

  const app = createMcpExpressApp({
    host: config.httpHost,
    allowedHosts:
      config.httpHost === '0.0.0.0' || config.httpHost === '::' ? config.allowedHosts : undefined,
  });

  // Behind TLS terminators (Railway, Fly, ALB, nginx).
  app.set('trust proxy', 1);

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', req.header('origin') ?? '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Authorization, Content-Type, Accept, Mcp-Session-Id',
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'sopet-admin-mcp',
      version: '0.1.0',
      transport: 'streamable-http',
      mcpUrl: endpoint,
      healthUrl: config.publicUrl ? `${config.publicUrl}/health` : '/health',
      auth: 'Authorization: Bearer <MCP_HTTP_TOKEN>',
    });
  });

  app.use('/mcp', (req: Request, res: Response, next: NextFunction) => {
    if (!bearerMatches(req.header('authorization') ?? undefined, config.httpToken!)) {
      res.status(401).json({
        jsonrpc: '2.0',
        error: { code: -32001, message: 'Unauthorized' },
        id: null,
      });
      return;
    }
    next();
  });

  app.post('/mcp', async (req: Request, res: Response) => {
    const server = runtime.createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on('close', () => {
        void transport.close();
        void server.close();
      });
    } catch (error) {
      console.error('MCP HTTP error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
  });

  app.get('/mcp', (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed. Use POST Streamable HTTP to this URL.' },
      id: null,
    });
  });

  app.delete('/mcp', (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed' },
      id: null,
    });
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      mcpUrl: endpoint,
      admin: runtime.sessions.has('admin'),
      vendor: runtime.sessions.has('vendor'),
    });
  });

  app.listen(config.httpPort, config.httpHost, () => {
    console.error(`sopet-admin-mcp HTTP listening on ${config.httpHost}:${config.httpPort}`);
    console.error(`Public MCP URL: ${endpoint}`);
  });
}

main().catch((error) => {
  console.error('sopet-admin-mcp http failed:', error);
  process.exit(1);
});
