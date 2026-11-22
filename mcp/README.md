# SOPET Admin MCP

MCP tools so AI agents can run SOPET platform-admin and store operations through GraphQL.

## Online URL (same host as the API — no new subdomain)

HTTP MCP is served by **sopet-backend** on the existing API host:

| URL                            | Purpose                      |
| ------------------------------ | ---------------------------- |
| `https://<API_HOST>/mcp`       | MCP endpoint (POST + bearer) |
| `https://<API_HOST>/mcp` (GET) | Discovery JSON (`mcpUrl`)    |

Example: if GraphQL is `https://api.sopet.org/graphql`, MCP is `https://api.sopet.org/mcp`.

Enable on the backend with:

```bash
MCP_HTTP_TOKEN=<long-random-secret>
MCP_ADMIN_EMAIL=admin@sopet.org
MCP_ADMIN_PASSWORD=...
# API_URL already set to your public API origin
```

### Cursor / cloud agents

```json
{
  "mcpServers": {
    "sopet-admin": {
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer <MCP_HTTP_TOKEN>"
      }
    }
  }
}
```

## Local stdio (this package)

For Cursor on your machine against a local backend:

```bash
cd mcp
cp .env.example .env
yarn install
yarn mcp:stdio
```

```json
{
  "mcpServers": {
    "sopet-admin": {
      "command": "yarn",
      "args": ["--cwd", "/ABS/PATH/sopet-admin/mcp", "mcp:stdio"],
      "env": {
        "SOPET_GRAPHQL_URL": "http://localhost:3002/graphql",
        "SOPET_ADMIN_EMAIL": "admin@sopet.org",
        "SOPET_ADMIN_PASSWORD": "..."
      }
    }
  }
}
```

Optional local-only HTTP (not for production deploy):

```bash
yarn mcp:http   # 127.0.0.1:3101 — prefer backend /mcp for shared/online use
```

## What it can do

- **Admin**: platform tools + any store’s products/orders/settings when `storeId` is passed
- **Vendor** (optional): tools locked to `SOPET_VENDOR_STORE_ID`

Shopper cart / checkout / payment capture are out of scope.

## Product import

Importer sequence, working/broken tool table, and KKC policy checklist:

→ **[sopet-backend/src/modules/mcp/IMPORT.md](../../sopet-backend/src/modules/mcp/IMPORT.md)** (online UAT MCP is the source of truth; keep this package’s tool selections in sync).

## Security

- Passwords only via env at process start — never tool arguments
- Online: `Authorization: Bearer <MCP_HTTP_TOKEN>` required on `/mcp`
- Prefer a dedicated admin user; rotate the bearer token
