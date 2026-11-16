import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolContext } from '../graphql/client.js';
import { adminStoreTools } from './admin/stores.js';
import { adminTaxonomyTools } from './admin/taxonomy.js';
import { adminOrdersCustomersTools } from './admin/orders-customers.js';
import { adminPlatformTools } from './admin/platform.js';
import { adminMoreTools } from './admin/more.js';
import { storeProductTools } from './store/products.js';
import { storeOpsTools } from './store/ops.js';
import { vendorOnlyTools } from './vendor/only.js';
import { errorResult, jsonResult, type SopetToolDefinition } from './types.js';

export function allTools(): SopetToolDefinition[] {
  return [
    ...adminStoreTools,
    ...adminTaxonomyTools,
    ...adminOrdersCustomersTools,
    ...adminPlatformTools,
    ...adminMoreTools,
    ...storeProductTools,
    ...storeOpsTools,
    ...vendorOnlyTools,
  ];
}

export function registerTools(server: McpServer, ctx: ToolContext): void {
  for (const tool of allTools()) {
    if (tool.role === 'admin' && !ctx.sessions.has('admin')) {
      continue;
    }
    if (tool.role === 'vendor' && !ctx.sessions.has('vendor')) {
      continue;
    }
    if (tool.role === 'store' && !ctx.sessions.has('admin') && !ctx.sessions.has('vendor')) {
      continue;
    }

    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (args) => {
        try {
          const result = await tool.execute(args as Record<string, unknown>, ctx);
          return jsonResult(result);
        } catch (error) {
          return errorResult(error);
        }
      },
    );
  }
}

export function listToolNames(): string[] {
  return allTools().map((t) => t.name);
}
