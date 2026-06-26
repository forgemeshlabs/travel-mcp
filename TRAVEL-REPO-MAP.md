# Travel Repo Map

Last updated: 2026-05-27

## Rule

Do not delete or reorganize Travel-related paths yet.

The desired x402 project shape is:

```text
~/repos/<project>.git
  bare/private git remote

~/dev/<project>
  active working repo
```

Travel currently has an extra public-clean repo because the MCP package needed a sanitized public release with no private history.

## Canonical Paths

```text
/home/ubuntu/repos/travel.git
  -> private bare git remote for the Travel product
  -> origin for /home/ubuntu/dev/x402-fare-intelligence
  -> keep until a replacement private remote exists
```

```text
/home/ubuntu/dev/x402-fare-intelligence
  -> private active Travel product repo
  -> contains live website/server/API code and private/internal material
```

```text
/home/ubuntu/dev/x402-fare-intelligence/x402
  -> live Travel web/API server source
  -> serves website + free API + paid x402 API
```

```text
/home/ubuntu/dev/x402-fare-intelligence/x402/dist/index.js
  -> built server file actually run by PM2
```

```text
pm2:x402-fare-intelligence
  -> live PM2 process for travel.forgemesh.io
```

```text
/home/ubuntu/dev/x402-fare-intelligence/x402/.env.production
  -> live server secrets/config
  -> includes provider token and marker
```

```text
/home/ubuntu/.cloudflared/config.yml
  -> maps travel.forgemesh.io to localhost:3404
```

```text
/home/ubuntu/dev/x402-fare-intelligence/packages/travel-assistant-mcp
  -> old/private MCP package copy inside the private product repo
  -> keep for now
  -> probably retire later after confirming nothing references it
```

```text
/home/ubuntu/repos/travel-public-clean
  -> clean public MCP repo and npm publish source
  -> intentionally has no private history
  -> canonical public MCP package source
```

```text
https://github.com/forgemeshlabs/travel-mcp
  -> public GitHub MCP repo
  -> remote copy of /home/ubuntu/repos/travel-public-clean
```

```text
@forgemeshlabs/travel-assistant-mcp
  -> public npm package
  -> published from /home/ubuntu/repos/travel-public-clean
```

```text
travel-assistant-mcp
  -> CLI command installed by the npm package
```

## Public Endpoints

```text
https://travel.forgemesh.io/
  -> website
```

```text
https://travel.forgemesh.io/api/free/flight-search
  -> free flight-search API
```

```text
https://travel.forgemesh.io/api/fare-intelligence
  -> paid x402 fare-intelligence API
```

```text
https://travel.forgemesh.io/.well-known/x402.json
  -> x402 discovery manifest
```

```text
https://travel.forgemesh.io/openapi.json
  -> OpenAPI spec
```

## Source Of Truth

```text
Live website/API/x402 changes:
  /home/ubuntu/dev/x402-fare-intelligence/x402
```

```text
Public MCP/npm/GitHub package changes:
  /home/ubuntu/repos/travel-public-clean
```

```text
Private monorepo/reference changes:
  /home/ubuntu/dev/x402-fare-intelligence
```

## Full Related Path Inventory

These are paths found during the audit. This is not a delete list.

### Keep / Runtime

```text
/home/ubuntu/.cloudflared/config.yml
  -> Cloudflare tunnel routing
```

```text
/home/ubuntu/.pm2/logs/x402-fare-err.log
/home/ubuntu/.pm2/logs/x402-fare-out.log
  -> live Travel server logs
```

```text
/home/ubuntu/.pm2/pids/x402-fare-intelligence-17.pid
  -> PM2 runtime pid file
```

```text
/home/ubuntu/.pm2/logs/forgemesh-web-error.log
/home/ubuntu/.pm2/logs/forgemesh-web-out.log
/home/ubuntu/.pm2/pids/forgemesh-web-8.pid
/home/ubuntu/.pm2/pids/forgemesh-web-9.pid
  -> separate Forgemesh web runtime logs/pids
```

### Keep / Ops Memory

```text
/home/ubuntu/cc-share/TRAVEL-REPO-MAP.md
  -> this map
```

```text
/home/ubuntu/cc-share/handoff_docs/HANDOFF-2026-05-25-travel-forgemesh.md
  -> Travel deployment handoff
```

```text
/home/ubuntu/cc-share/handoff_docs/SESSION-HANDOFF-2026-05-24-x402-fare-intelligence.md
  -> Travel build/session handoff
```

```text
/home/ubuntu/cc-share/x402/X402-REORG.md
/home/ubuntu/cc-share/x402/X402-PRODUCT-BOUNDARY-MODEL
/home/ubuntu/cc-share/x402/travel-map.png
  -> x402 organization notes / product map
```

```text
/home/ubuntu/cc-share/FORGEMESH-LAUNCH-THREAD.md
/home/ubuntu/cc-share/handoff_docs/HANDOFF-2026-05-21-forgemesh-ops.md
  -> Forgemesh ops/launch notes
```

### Keep / Separate Projects

```text
/home/ubuntu/dev/forgemesh
  -> separate Forgemesh site/project
```

```text
/home/ubuntu/repos/coinopai-hub
  -> separate public hub that links to travel.forgemesh.io
```

```text
/home/ubuntu/dev/etsy/trends/travel
  -> Etsy trend data, unrelated to Travel MCP/server
```

### Probably Cache / Not Source

```text
/home/ubuntu/.cache/claude-cli-nodejs/-home-ubuntu-dev-forgemesh
/home/ubuntu/.cache/claude-cli-nodejs/-home-ubuntu-dev-forgemesh-imagegen
/home/ubuntu/.cache/claude-cli-nodejs/-home-ubuntu-dev-forgemesh-site
  -> Claude/tool cache paths
```

```text
/home/ubuntu/.claude/projects/-home-ubuntu-dev-forgemesh
/home/ubuntu/.claude/projects/-home-ubuntu-dev-forgemesh-imagegen
/home/ubuntu/.claude/projects/-home-ubuntu-dev-forgemesh-site
  -> Claude project memory/cache paths
```

### Archive / Confirm Before Touching

```text
/home/ubuntu/dev/archive/forgemesh-imagegen
  -> archive copy, not part of Travel
```

### Private Sensitive Travel Docs

These live inside the private active repo. Keep private.

```text
/home/ubuntu/dev/x402-fare-intelligence/.private/TRAVEL-MCP-PIVOT.md
/home/ubuntu/dev/x402-fare-intelligence/.private/TRAVEL-PRICE-WATCH-ROADMAP.md
/home/ubuntu/dev/x402-fare-intelligence/.private/TRAVEL_API_LANDSCAPE.md
/home/ubuntu/dev/x402-fare-intelligence/.private/X402_TRAVEL_COMMERCE.md
```

## Safety Notes

- Do not publish from `/home/ubuntu/dev/x402-fare-intelligence`.
- Publish npm only from `/home/ubuntu/repos/travel-public-clean`.
- Keep `/home/ubuntu/repos/travel.git` until the private product has a confirmed replacement private remote.
- Do not delete `.env.production`.
- Do not print provider tokens or marker values in chat/logs.
- Do not delete anything from this map without a deliberate migration plan.
