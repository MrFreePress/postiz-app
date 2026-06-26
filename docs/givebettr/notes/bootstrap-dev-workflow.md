# Postiz Givebettr Bootstrap Dev Workflow

## Repo shape
- Monorepo managed with **pnpm** only
- Important app roots:
  - `apps/backend` — NestJS API
  - `apps/orchestrator` — Temporal/NestJS background jobs
  - `apps/frontend` — frontend app
  - `libraries/` — shared services/components/helpers

## Repo-local rules discovered
- Use **only pnpm**
- Root package manager: `pnpm@10.6.1`
- Node engine: `>=22.12.0 <23.0.0`
- Linting should run from the repo root
- Backend changes should respect controller → service → repository layering
- Frontend data fetching should use SWR via the existing helper patterns

## Useful bootstrap commands
### Install
```bash
cd /home/mrfreepress/projects/postiz-givebettr
pnpm install
```

### Main dev modes
```bash
pnpm run dev
pnpm run dev-backend
pnpm run dev:frontend
pnpm run dev:backend
pnpm run dev:orchestrator
```

### Build / test
```bash
pnpm run build
pnpm run test
pnpm run prisma-generate
pnpm run prisma-db-push
```

### Dev docker helper
```bash
pnpm run dev:docker
```

## Immediate next repo-local planning docs
- `docs/givebettr/plans/` — downstream implementation plans
- `docs/givebettr/inventories/` — branding + commercialization inventories
- `docs/givebettr/notes/bootstrap-baseline.md` — exact fork baseline

## First recommended follow-up work
1. create branding inventory
2. create commercialization touchpoints inventory
3. define staging posture before product code changes
