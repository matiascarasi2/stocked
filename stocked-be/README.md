# stocked-be

Turborepo backend for [stocked](../README.md).

## Workspace

| Package | Path | Description |
| --- | --- | --- |
| `@stocked/gateway` | `apps/stocked-gateway` | Express API — controllers, services, repositories |
| `@stocked/alerts-worker` | `apps/stocked-alerts-worker` | Finnhub WebSocket trades, alert matching, FCM push |
| `@stocked/alerts-worker-client` | `packages/stocked-alerts-worker-client` | Internal HTTP client (gateway → worker) |
| `@stocked/schema` | `packages/stocked-schema` | Prisma schema, migrations, and database client |

## Prerequisites

- Node.js 18+
- pnpm 9
- PostgreSQL (for local development)

## Setup

```sh
cd stocked-be
pnpm install

# Database (schema package)
cp packages/stocked-schema/.env.example packages/stocked-schema/.env
pnpm --filter @stocked/schema db:migrate

# API gateway
cp apps/stocked-gateway/.env.example apps/stocked-gateway/.env

# Alerts worker
cp apps/stocked-alerts-worker/.env.example apps/stocked-alerts-worker/.env
```

Set `DATABASE_URL` in `packages/stocked-schema/.env`. Set `FINNHUB_API_KEY` and `FMP_API_KEY` in `apps/stocked-gateway/.env`. Set the same `ALERTS_WORKER_INTERNAL_SECRET` in gateway and worker `.env` files (see [alerts worker README](apps/stocked-alerts-worker/README.md) for Firebase setup).

## Market data providers

The gateway uses **Finnhub** and **FMP** together—not interchangeably:

- **Finnhub (free):** US symbol search, symbol directory, real-time quotes (`/quote`), and WebSocket trades for the alerts worker.
- **FMP (free Basic):** Daily OHLCV history for stock charts via `GET /stocks/:symbol/chart`. Finnhub’s candle endpoint requires a paid market-data subscription, so charts are sourced from FMP instead.

Both keys are required in `apps/stocked-gateway/.env`. See [gateway README](apps/stocked-gateway/README.md) for the chart endpoint and caching notes.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm build` | Build all packages (`@stocked/schema` generates Prisma client, then compiles) |
| `pnpm dev` | Run all `dev` tasks (persistent) |
| `pnpm dev:gateway` | Run gateway only (builds schema dependency first) |
| `pnpm dev:worker` | Run alerts worker only |
| `pnpm dev:backend` | Run gateway and alerts worker together |
| `pnpm check-types` | Typecheck all packages |

## Develop locally

```sh
pnpm dev:backend
```

Gateway: `curl http://localhost:3000/health`  
Worker: `curl http://localhost:3001/health`

Expected when Postgres is reachable:

```json
{ "status": "ok", "database": "connected" }
```

Run a single app with `pnpm dev:gateway` or `pnpm dev:worker`.

## Module layout

Each domain module under `apps/stocked-gateway/src/modules/<name>/` follows:

- `*.routes.ts` — Express router
- `*.controller.ts` — HTTP handlers
- `*.service.ts` — business logic
- `*.repository.ts` — data access via `@stocked/schema` `prisma`
