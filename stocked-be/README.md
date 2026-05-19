# stocked-be

Turborepo backend for [stocked](../README.md).

## Workspace

| Package | Path | Description |
| --- | --- | --- |
| `@stocked/gateway` | `apps/stocked-gateway` | Express API — controllers, services, repositories |
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
```

Set `DATABASE_URL` in `packages/stocked-schema/.env`. Set `FINNHUB_API_KEY` and `FMP_API_KEY` (and optionally `PORT`) in `apps/stocked-gateway/.env`.

## Market data providers

The gateway uses **Finnhub** and **FMP** together—not interchangeably:

- **Finnhub (free):** US symbol search, symbol directory, and real-time quotes. Used for discovery and (planned) alert price checks via `/quote`.
- **FMP (free Basic):** Daily OHLCV history for stock charts via `GET /stocks/:symbol/chart`. Finnhub’s candle endpoint requires a paid market-data subscription, so charts are sourced from FMP instead.

Both keys are required in `apps/stocked-gateway/.env`. See [gateway README](apps/stocked-gateway/README.md) for the chart endpoint and caching notes.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm build` | Build all packages (`@stocked/schema` generates Prisma client, then compiles) |
| `pnpm dev` | Run all `dev` tasks (persistent) |
| `pnpm dev:gateway` | Run gateway only (builds schema dependency first) |
| `pnpm check-types` | Typecheck all packages |

## Develop the gateway

```sh
pnpm dev:gateway
curl http://localhost:3000/health
```

Expected response when Postgres is reachable:

```json
{ "status": "ok", "database": "connected" }
```

## Module layout

Each domain module under `apps/stocked-gateway/src/modules/<name>/` follows:

- `*.routes.ts` — Express router
- `*.controller.ts` — HTTP handlers
- `*.service.ts` — business logic
- `*.repository.ts` — data access via `@stocked/schema` `prisma`
