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

Generated client is written to `generated/prisma/` (gitignored).

## Scripts

| Script | Description |
| --- | --- |
| `pnpm db:migrate` | Create/apply migrations in dev |
| `pnpm db:deploy` | Apply migrations in CI/production |
| `pnpm db:generate` | Regenerate Prisma Client |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:validate` | Validate `schema.prisma` |
