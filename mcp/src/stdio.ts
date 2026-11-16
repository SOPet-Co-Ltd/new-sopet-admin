#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createSopetMcpServer } from './server.js';

async function main(): Promise<void> {
  const { server } = await createSopetMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('sopet-admin-mcp stdio failed:', error);
  process.exit(1);
});
