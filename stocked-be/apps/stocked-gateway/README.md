# @stocked/gateway

Express API gateway for stocked. All HTTP modules (auth, alerts, etc.) live here using a controllers → services → repositories layout.

## Setup

```sh
# From stocked-be root
pnpm install
cp apps/stocked-gateway/.env.example apps/stocked-gateway/.env
# Set FINNHUB_API_KEY and FMP_API_KEY in apps/stocked-gateway/.env

# Database URL and migrations (schema package only)
cp packages/stocked-schema/.env.example packages/stocked-schema/.env
# Edit packages/stocked-schema/.env with your DATABASE_URL
pnpm --filter @stocked/schema db:migrate
```

## Run

```sh
# From stocked-be root
pnpm dev:gateway
```

Or from this directory:

```sh
pnpm dev
```

## Health check

```sh
curl http://localhost:3000/health
```

Returns `503` if the database is unreachable.

## Market data: why two providers?

| Data | Provider | Endpoints (examples) |
| --- | --- | --- |
| Search, US symbols, quotes | Finnhub | `/stocks?q=…`, `/stocks/:symbol`, `/stocks/popular`, `/stocks/watched` |
| Price alerts | Alerts worker | WebSocket trades + FCM (see [alerts worker README](../stocked-alerts-worker/README.md)) |
| Chart history (daily OHLCV) | FMP | `/stocks/:symbol/chart` |

**Finnhub** is a good fit for symbol discovery and snapshot quotes on the free plan. Its **`/stock/candle` API is not available on the free tier**—requests return “You don't have access to this resource” ([Finnhub #546](https://github.com/finnhubio/Finnhub-API/issues/546)); paid market-data plans start around $50/month.

**FMP** (free Basic) exposes daily end-of-day open/high/low/close/volume, which is enough for line charts. We still validate the symbol against Finnhub’s US list before calling FMP so chart and search behavior stay consistent.

Clients never see either API key; only this gateway calls Finnhub and FMP.

**Quote caching:** Finnhub `/quote` responses are cached in memory for 60 seconds per symbol so home-screen refreshes (`/stocks/popular`, `/stocks/watched`) stay within the free-tier rate limit.

## Stocks chart (FMP)

`GET /stocks/:symbol/chart?range=1M|3M|6M|1Y` — authenticated. Returns daily OHLCV points from [FMP historical EOD](https://site.financialmodelingprep.com/developer/docs/stable/historical-price-eod-full). Responses are cached in memory for 1 hour per symbol/range to stay within FMP’s free-tier quota (250 requests/day). Display/redistribution in a published app may require an FMP license.

```sh
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/stocks/AAPL/chart?range=1Y"
```

## Alerts

All `/alerts` routes require `Authorization: Bearer <access_token>`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/alerts` | List alerts for the current user (active only by default). Pass `?includeInactive=true` to include soft-deleted rows. |
| `GET` | `/alerts/:id` | Get one alert by UUID. |
| `POST` | `/alerts` | Create an alert. Body: `{ "stockSymbol": "AAPL", "minPrice": 150, "maxPrice": null }`. At least one price bound is required. |
| `PATCH` | `/alerts/:id` | Update `minPrice`, `maxPrice`, and/or `isActive`. Symbol is not editable. |
| `DELETE` | `/alerts/:id` | Soft delete (`isActive: false`). Returns the updated alert. |

```sh
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/alerts

curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"stockSymbol":"AAPL","minPrice":150}' http://localhost:3000/alerts

curl -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"maxPrice":200}' http://localhost:3000/alerts/$ALERT_ID

curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/alerts/$ALERT_ID
```

## Adding a module

Create `src/modules/<name>/` with:

1. `<name>.repository.ts` — Prisma queries via `import { prisma } from "@stocked/schema"`
2. `<name>.service.ts` — business rules
3. `<name>.controller.ts` — request/response mapping
4. `<name>.routes.ts` — Express `Router`

Register routes in `src/app.ts`.
