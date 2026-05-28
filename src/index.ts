#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getAirport } from "./airports.js";
import { buildExternalBookingLink } from "./links.js";
import { getTravelTimingAdvice, isInternationalRoute } from "./timing.js";

const RESPONSE_BASE = {
  source: "travel-assistant-mcp",
  provider_language: "travel search providers",
  integration_language: "provider integrations",
  booking_language: "booking partners",
} as const;

function textResponse(payload: unknown, isError = false) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload) }],
    isError,
  };
}

const server = new Server(
  { name: "travel-assistant-mcp", version: "0.1.1" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_travel_options",
      description:
        "Search for travel options between two airports. Returns route metadata, trip type classification, and external booking links. Use this as the primary entry point when a user wants to find flights or plan a trip. Read-only, no authentication required, no rate limits. Responses may include commission-eligible booking partner links (disclosed in output).",
      inputSchema: {
        type: "object",
        properties: {
          origin: { type: "string", description: "Origin airport IATA code (e.g. 'LAX', 'JFK'). Case-insensitive." },
          destination: { type: "string", description: "Destination airport IATA code (e.g. 'LHR', 'NRT'). Case-insensitive." },
          departure_date: { type: "string", description: "Departure date in YYYY-MM-DD format. Optional — omit for flexible date searches." },
          return_date: { type: "string", description: "Return date in YYYY-MM-DD format. Omit for one-way trips." },
          currency: { type: "string", description: "ISO 4217 currency code (default: USD). Used in booking link parameters." },
        },
        required: ["origin", "destination"],
      },
    },
    {
      name: "get_airport_info",
      description: "Look up metadata for a single airport by IATA code. Returns airport name, city, country, and timezone. Use this when you need to validate an airport code, resolve an airport name, or check timezone/country before comparing routes. Read-only, no authentication required, no rate limits. Use compare_routes instead when evaluating multiple origin-destination pairs.",
      inputSchema: {
        type: "object",
        properties: {
          code: { type: "string", description: "Three-letter IATA airport code (e.g. 'SFO'). Case-insensitive." },
        },
        required: ["code"],
      },
    },
    {
      name: "compare_routes",
      description: "Compare multiple origin-destination airport pairs side by side. Returns route type (domestic/international) and booking links for each pair. Use this when a user is deciding between alternative routes or airports — e.g. 'Should I fly LAX-LHR or SFO-LHR?'. Read-only, no authentication required, no rate limits. Use search_travel_options instead for a single route with dates. Responses may include commission-eligible booking partner links (disclosed in output).",
      inputSchema: {
        type: "object",
        properties: {
          routes: {
            type: "array",
            description: "Array of route pairs to compare. Minimum 1, typically 2-5.",
            items: {
              type: "object",
              properties: {
                origin: { type: "string", description: "Origin IATA code" },
                destination: { type: "string", description: "Destination IATA code" },
              },
              required: ["origin", "destination"],
            },
          },
        },
        required: ["routes"],
      },
    },
    {
      name: "build_booking_link",
      description: "Generate an external booking partner URL for a specific route and dates. Use this when you already have route details and need a clickable booking link — e.g. after comparing routes or confirming a travel plan. Read-only, no authentication required, no rate limits. The returned link may be commission-eligible (disclosed in output). Use search_travel_options instead if you need full search results, not just a link.",
      inputSchema: {
        type: "object",
        properties: {
          origin: { type: "string", description: "Origin IATA code (e.g. 'IAH'). Case-insensitive." },
          destination: { type: "string", description: "Destination IATA code (e.g. 'CDG'). Case-insensitive." },
          departure_date: { type: "string", description: "Departure date in YYYY-MM-DD format. Optional." },
          return_date: { type: "string", description: "Return date in YYYY-MM-DD format. Optional — omit for one-way." },
          currency: { type: "string", description: "ISO 4217 currency code (default: USD)." },
        },
        required: [],
      },
    },
    {
      name: "explain_travel_timing",
      description: "Get general timing and logistics guidance for domestic or international travel. Returns advice on booking windows, check-in timing, layover planning, and seasonal considerations. Use this when a user asks 'when should I book?' or 'how early should I arrive?'. Read-only, no authentication required, no rate limits. Use search_travel_options instead if the user wants to search for specific flights.",
      inputSchema: {
        type: "object",
        properties: {
          origin: { type: "string", description: "Origin IATA code. Optional — used to determine if route is international." },
          destination: { type: "string", description: "Destination IATA code. Optional — used to determine if route is international." },
        },
        required: [],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  switch (name) {
    case "search_travel_options": {
      const origin = String(args.origin ?? "").toUpperCase();
      const destination = String(args.destination ?? "").toUpperCase();
      const departureDate = args.departure_date ? String(args.departure_date) : undefined;
      const returnDate = args.return_date ? String(args.return_date) : undefined;
      const currency = args.currency ? String(args.currency).toUpperCase() : "USD";

      if (!origin || !destination) {
        return textResponse({ ok: false, error: "origin and destination are required" }, true);
      }

      return textResponse({
        ok: true,
        ...RESPONSE_BASE,
        results: {
          route: { origin, destination },
          trip_type: returnDate ? "round_trip" : "one_way",
          departure_date: departureDate ?? null,
          return_date: returnDate ?? null,
          currency,
          provider_integrations: "travel search providers",
          booking_partners: "external booking links",
          link_disclosure: "Results can include commission-eligible links.",
          external_booking_link: buildExternalBookingLink({
            origin,
            destination,
            departure_date: departureDate,
            return_date: returnDate,
            currency,
          }),
        },
      });
    }

    case "get_airport_info": {
      const code = String(args.code ?? "").toUpperCase();
      if (!code) return textResponse({ ok: false, error: "code is required" }, true);
      const airport = getAirport(code);
      if (!airport) return textResponse({ ok: false, ...RESPONSE_BASE, results: null, error: `Airport ${code} not found` }, true);
      return textResponse({ ok: true, ...RESPONSE_BASE, results: airport });
    }

    case "compare_routes": {
      const routes = Array.isArray(args.routes) ? args.routes : [];
      if (routes.length === 0) return textResponse({ ok: false, error: "routes array is required" }, true);

      const comparisons = routes.map((route: Record<string, unknown>) => {
        const origin = String(route.origin ?? "").toUpperCase();
        const destination = String(route.destination ?? "").toUpperCase();
        return {
          route: `${origin}-${destination}`,
          origin,
          destination,
          route_type: isInternationalRoute(origin, destination) ? "international" : "domestic",
          external_booking_link: buildExternalBookingLink({ origin, destination }),
        };
      });

      return textResponse({
        ok: true,
        ...RESPONSE_BASE,
        results: {
          comparisons,
          link_disclosure: "Comparison results can include commission-eligible links from booking partners.",
        },
      });
    }

    case "build_booking_link": {
      const origin = args.origin ? String(args.origin).toUpperCase() : undefined;
      const destination = args.destination ? String(args.destination).toUpperCase() : undefined;
      const departureDate = args.departure_date ? String(args.departure_date) : undefined;
      const returnDate = args.return_date ? String(args.return_date) : undefined;
      const currency = args.currency ? String(args.currency).toUpperCase() : "USD";

      return textResponse({
        ok: true,
        ...RESPONSE_BASE,
        results: {
          external_booking_link: buildExternalBookingLink({
            origin,
            destination,
            departure_date: departureDate,
            return_date: returnDate,
            currency,
          }),
          link_disclosure: "This may be a commission-eligible link from booking partners.",
        },
      });
    }

    case "explain_travel_timing": {
      const origin = args.origin ? String(args.origin).toUpperCase() : "";
      const destination = args.destination ? String(args.destination).toUpperCase() : "";
      const routeType = isInternationalRoute(origin, destination);
      return textResponse({
        ok: true,
        ...RESPONSE_BASE,
        results: {
          route: origin && destination ? { origin, destination } : null,
          timing_advice: getTravelTimingAdvice(routeType),
        },
      });
    }

    default:
      return textResponse({ ok: false, error: `Unknown tool: ${name}` }, true);
  }
});

const transport = new StdioServerTransport();
void server.connect(transport);
