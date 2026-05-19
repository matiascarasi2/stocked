# @stocked/schema

Prisma schema and migrations for the [stocked](../README.md) domain model (`User`, `Device`, `Session`, `Alert`).

## Setup

```sh
cp .env.example .env
# Edit DATABASE_URL, then:
pnpm install
pnpm db:migrate
pnpm db:generate
```

Generated client is written to `src/generated/prisma/` (gitignored). The `build` script bundles the client with esbuild to `dist/index.js` for Node ESM runtime.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm build` | Generate Prisma client and bundle exports to `dist/` |
| `pnpm db:migrate` | Create/apply migrations in dev |
| `pnpm db:deploy` | Apply migrations in CI/production |
| `pnpm db:generate` | Regenerate Prisma Client |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:validate` | Validate `schema.prisma` |
