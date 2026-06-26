# Givebettr Dev Server Plan

> Purpose: define the first safe downstream dev server for the Givebettr fork before wider production-readiness changes.

## Goal
Stand up a **dev-only public environment** for the downstream fork so branding/product changes can be exercised on a real URL without touching the live production-like app at `post.givebettr.com`.

## Working assumption
Use the **existing dedicated Hetzner Postiz server** as the first dev host target, but keep dev fully isolated from the current live stack.

Assumed public hostname:
- `post-dev.givebettr.com`

Assumed DNS step for Derek:
- create `A post-dev -> 204.168.233.104`

If the dev server ends up on a different box later, keep the same isolation rules and only swap the IP.

---

## Recommended posture
Use **same host, separate compose namespace** for the first dev server.

Why this is acceptable now:
- the dedicated host already exists
- the fork is still early-stage
- the immediate need is a realistic downstream test URL
- this is cheaper/faster than provisioning a second VM right now

Why this must still be isolated:
- avoid cookie/session collisions with `post.givebettr.com`
- avoid sharing database/Redis/Temporal state with live
- avoid accidental billing/provider contamination
- avoid confusing which code is live vs dev

---

## Required isolation boundaries

### URL boundary
- live: `post.givebettr.com`
- dev: `post-dev.givebettr.com`

### Compose/runtime boundary
Use a separate compose project such as:
- `postiz-dev`

Use separate container names such as:
- `postiz-dev-frontend`
- `postiz-dev-backend`
- `postiz-dev-orchestrator`
- `postiz-dev-postgres`
- `postiz-dev-redis`
- `postiz-dev-temporal`

### Data boundary
Use separate dev-only state:
- separate Postgres database/volume
- separate Redis instance/db/volume
- separate Temporal state
- separate uploads path, e.g. `/opt/postiz-dev/data/uploads`
- separate backup path, e.g. `/opt/postiz-dev/backups`

### Secret boundary
Use a separate env file such as:
- `/opt/postiz-dev/postiz-dev.env`

Must differ from live:
- `JWT_SECRET`
- `DATABASE_URL`
- `REDIS_URL`
- `FRONTEND_URL`
- `NEXT_PUBLIC_BACKEND_URL`
- `BACKEND_INTERNAL_URL`
- Stripe keys
- OAuth/provider credentials where applicable

### Registration/billing boundary
Dev defaults:
- `DISABLE_REGISTRATION=true`
- Stripe test mode only
- do not connect live customer/subscription state
- only enable provider integrations intentionally

---

## Suggested filesystem shape
- `/opt/postiz-dev/`
- `/opt/postiz-dev/docker-compose.yaml`
- `/opt/postiz-dev/postiz-dev.env`
- `/opt/postiz-dev/dynamicconfig/`
- `/opt/postiz-dev/data/uploads/`
- `/opt/postiz-dev/backups/`

Keep this entirely separate from the live stack paths.

---

## Reverse proxy / TLS plan
Host Nginx should get a second vhost for:
- `post-dev.givebettr.com`

Recommended proxy target style:
- dev app loopback port distinct from live
- for example `127.0.0.1:4017` for dev app traffic

Keep support services private:
- Postgres not public
- Redis not public
- Temporal gRPC/UI not public unless intentionally locked down

TLS:
- once `post-dev.givebettr.com` resolves correctly, issue a separate Let's Encrypt cert covering that hostname
- enforce HTTP -> HTTPS for dev just like live

---

## Rollout sequence

### Phase 1 — DNS and hostname
Derek action:
- create `A post-dev -> 204.168.233.104`

Verification:
- `dig +short post-dev.givebettr.com`
- current verified result on 2026-06-26: `post-dev.givebettr.com -> 204.168.233.104`
- current live behavior before dev vhost bootstrap:
  - HTTP redirects to `https://post-dev.givebettr.com/`
  - HTTPS currently serves the existing static site/default vhost, not a dev app
  - current certificate SANs cover `givebettr.com` and `post.givebettr.com`, so `post-dev` still needs its own Nginx/TLS setup

### Phase 2 — downstream deployment identity cleanup
Before the first dev rollout, fix the downstream delivery path so dev is not still shipping under upstream identity.

First patch-set targets:
- `.github/workflows/build-containers.yml`
- `docker-compose.yaml`
- any scripts/docs that still assume upstream image names or release paths

Primary issue to remove:
- repo still references upstream container namespace `ghcr.io/gitroomhq/postiz-app`

### Phase 3 — dev runtime bootstrap
On the host:
- create `/opt/postiz-dev`
- prepare dev compose and env files
- set distinct ports/volumes/project name
- start backend/frontend/orchestrator plus Postgres/Redis/Temporal

### Phase 4 — proxy and TLS
- add Nginx site for `post-dev.givebettr.com`
- request TLS cert
- verify HTTPS route works end-to-end

### Phase 5 — safe smoke tests
Validate:
- homepage loads
- auth pages load
- register remains disabled by default unless intentionally testing it
- login works for explicit dev users
- branding edits appear as expected
- no effect on live `post.givebettr.com`

---

## Minimal acceptance checklist
- [ ] `post-dev.givebettr.com` resolves to the intended server
- [ ] dev stack uses separate compose namespace
- [ ] dev stack uses separate env file
- [ ] dev stack uses separate DB/Redis/Temporal/uploads state
- [ ] HTTPS works on `post-dev.givebettr.com`
- [ ] live `post.givebettr.com` remains unchanged
- [ ] registration is closed by default
- [ ] billing is test-only or disabled
- [ ] at least one fork-specific UI change is verified on dev

---

## What this does *not* mean yet
This dev server plan does **not** mean:
- production is ready for rollout
- open registration is acceptable
- upstream deployment identity cleanup is finished
- billing/provider integrations should be enabled broadly

This is a **safe downstream test lane**, not the final production release posture.

---

## Current live status (2026-06-26)
- DNS verified: `post-dev.givebettr.com -> 204.168.233.104`
- Isolated dev runtime is now bootstrapped on the Hetzner host
- Public HTTPS for `https://post-dev.givebettr.com` is live
- Current external behavior:
  - `/` redirects to `/auth`
  - `/auth` shows `Login instead` (public self-signup closed)
  - `/auth/login` is live and shows `Registration is currently invite-only.`
  - auth-surface upstream legal links and testimonial branding were removed from the live dev lane
- TLS SANs now cover:
  - `givebettr.com`
  - `post.givebettr.com`
  - `post-dev.givebettr.com`
- Current dev host paths:
  - app checkout: `/opt/postiz-dev/app`
  - runtime compose: `/opt/postiz-dev/live/docker-compose.yaml`
  - app env: `/opt/postiz-dev/live/postiz-dev.env`
  - nginx site: `/etc/nginx/sites-available/post-dev`
- Current dev loopback ports:
  - app: `127.0.0.1:4017`
  - Temporal gRPC: `127.0.0.1:7243`
  - Temporal UI: `127.0.0.1:8081`

## Known follow-up
- The dev compose is healthy and isolated by container/volume names and ports, but because both live and dev compose directories are named `live`, Docker Compose reports orphan warnings during lifecycle commands. Before repeated operator workflows, normalize this with an explicit compose project name for dev.
- Latest repo-only follow-up pushed to origin: `94366941` — `Tier 1.5 minimize remaining visible branding`
- That Tier 1.5 repo pass is build-verified locally but not yet re-deployed to the live dev host.

## Immediate next actions
1. Run a broader live smoke test across onboarding, OAuth, provider-add, and other visible flows on `post-dev.givebettr.com`
2. Normalize the dev compose project naming to remove orphan-warning ambiguity
3. Decide whether to deploy repo commit `94366941` onto the live dev host for another verification pass
4. Only after dev validation, reassess production rollout readiness
