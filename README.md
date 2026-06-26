DO NOT USE THIS REPO!
READ TRAVEL-REPO-MAP.md ASAP

# Travel Assistant MCP

No-key travel assistant for Claude Desktop, Codex-style agent workflows, Hermes, and other MCP clients. It helps agents look up airports, compare routes, explain travel timing, and build external booking links without requiring a travel API account.

## Features

- Look up airport metadata by IATA code
- Compare alternate origin and destination airport routes
- Explain booking windows, airport arrival timing, layovers, and seasonal travel factors
- Build external booking links for selected routes
- Run locally with no API key or account setup
- Disclose commission-eligible links in tool output

## Install

```bash
npm install -g @forgemeshlabs/travel-assistant-mcp
```

## Claude Desktop

Add this to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "travel-assistant": {
      "command": "npx",
      "args": ["-y", "@forgemeshlabs/travel-assistant-mcp"]
    }
  }
}
```

Restart Claude Desktop after saving the config, then ask Claude to plan or compare travel routes.

Codex, Hermes, and other MCP-capable agent runtimes can use the same server command:

```bash
npx -y @forgemeshlabs/travel-assistant-mcp
```

## Local Run

```bash
npm run build
node dist/index.js
```

## Tools

- `search_travel_options`
- `get_airport_info`
- `compare_routes`
- `build_booking_link`
- `explain_travel_timing`

## Public Data Boundary

This package uses generic language for provider integrations. Tool responses may include external booking links and commission-eligible links. Booking completion happens with booking partners outside this MCP server.
