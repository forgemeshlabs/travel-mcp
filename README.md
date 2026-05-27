# Travel Assistant MCP

Public MCP server for travel search workflows. It gives agents a small set of tools for airport lookup, route comparison, travel timing guidance, and external booking links.

## Features

- Search workflow responses using generic travel search providers
- Airport metadata lookup by IATA code
- Basic route comparison for provider integrations
- External booking links for booking partners
- Commission-eligible links disclosed in tool output

## Install

```bash
npm install -g @forgemeshlabs/travel-assistant-mcp
```

## Run

```bash
pnpm start
```

## MCP Client Example

```json
{
  "mcpServers": {
    "travel-assistant": {
      "command": "travel-assistant-mcp"
    }
  }
}
```

## Tools

- `search_travel_options`
- `get_airport_info`
- `compare_routes`
- `build_booking_link`
- `explain_travel_timing`

## Public Data Boundary

This package uses generic language for provider integrations. Tool responses may include external booking links and commission-eligible links. Booking completion happens with booking partners outside this MCP server.
