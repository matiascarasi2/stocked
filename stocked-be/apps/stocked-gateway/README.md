# @stocked/gateway

Express API gateway for stocked. All HTTP modules (auth, alerts, etc.) live here using a controllers → services → repositories layout.

## Setup

```sh
# From stocked-be root
pnpm install
cp apps/stocked-gateway/.env.example apps/stocked-gateway/.env

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

## Adding a module

Create `src/modules/<name>/` with:

1. `<name>.repository.ts` — Prisma queries via `import { prisma } from "@stocked/schema"`
2. `<name>.service.ts` — business rules
3. `<name>.controller.ts` — request/response mapping
4. `<name>.routes.ts` — Express `Router`

Register routes in `src/app.ts`.
