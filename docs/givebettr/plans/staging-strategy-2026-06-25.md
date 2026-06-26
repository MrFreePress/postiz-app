# Postiz Givebettr Staging Strategy

> **For Hermes:** Treat this as the pre-implementation staging reference for the downstream Givebettr fork. Prefer isolated staging over direct experimentation on the live `post.givebettr.com` host/app. Do not turn this into live changes automatically.

**Goal:** define a safe staging posture for downstream Givebettr product work before any product code changes land.

**Architecture:** keep production and staging clearly separated at the DNS, compose, secrets, data, and provider-integration levels. Use staging to validate downstream product changes against a realistic self-hosted Postiz stack without touching the live operator prototype. Prefer a dedicated staging deployment or, at minimum, a separately namespaced compose project and hostname.

**Tech Stack:** Postiz monorepo (`pnpm` / Node 22), Docker Compose runtime, Postgres, Redis, Temporal, optional Stripe/OAuth/social provider integrations.

---

## 1. Why staging is required

The downstream repo now contains multiple change classes that are risky to test directly on the live Givebettr instance:
- branding and UX changes
- auth/onboarding changes
- organization/customer/group behavior changes
- billing and Stripe behavior changes
- OAuth/public API changes
- operator/admin workflow changes

The live `post.givebettr.com` instance should remain the operational prototype and reference environment, not the first place to trial downstream code edits.

---

## 2. Grounded inputs used for this strategy

### Repo/runtime facts verified
- repo path: `/home/mrfreepress/projects/postiz-givebettr`
- package manager: `pnpm@10.6.1`
- required Node: `>=22.12.0 <23.0.0`
- local dev helper exists: `pnpm run dev:docker`
- repo includes:
  - `docker-compose.dev.yaml` (explicitly marked not for production; dev only)
  - `docker-compose.yaml`
  - `.env.example`

### Important env/config facts verified
From `.env.example` and compose files:
- staging will need its own values for:
  - `FRONTEND_URL`
  - `NEXT_PUBLIC_BACKEND_URL`
  - `BACKEND_INTERNAL_URL`
  - `DATABASE_URL`
  - `REDIS_URL`
  - `JWT_SECRET`
  - `DISABLE_REGISTRATION`
  - `STORAGE_PROVIDER`
  - `API_LIMIT`
  - Stripe keys
  - OAuth/provider credentials
- if email provider is configured, local registration/activation behavior changes
- mobile OAuth callback currently defaults to `postiz://auth/callback` unless overridden via `MOBILE_APP_SCHEME`

### Upstream docs facts verified
Postiz docs state:
- Docker Compose configuration is driven by environment variables
- the canonical compose source is the dedicated `postiz-docker-compose` repository, not a stale copied snapshot
- variable changes require container recreation (`docker compose down` / `up`)

---

## 3. Recommended staging posture

## Primary recommendation
Use a **separate staging deployment** for downstream Givebettr work.

Preferred shape:
- separate hostname, e.g. `staging-post.givebettr.com` or `post-staging.givebettr.com`
- separate compose project
- separate environment file / secret set
- separate Postgres data
- separate Redis data
- separate Temporal data/services
- separate upload/storage path or bucket/prefix
- separate Stripe/OAuth/provider credentials where possible

## Why
This avoids the worst failure modes:
- production cookies/session collisions
- redirect/callback confusion
- accidental live billing/customer effects
- staging webhooks mutating production records
- provider reconnects or API keys contaminating production state

---

## 4. Environment isolation rules

### Required boundaries
Staging must have all of the following isolated from production:

#### Network / URL boundary
- unique public URL
- unique API URL
- no reuse of production callback URLs unless the provider explicitly supports separate staging callbacks

#### Secret boundary
- different `JWT_SECRET`
- different app/provider credentials whenever available
- different API keys for third-party systems whenever feasible

#### Data boundary
- separate Postgres database
- separate Redis instance/db or separate Redis container/service
- separate Temporal backing services/state
- separate uploads path / object bucket prefix

#### Identity boundary
- separate email sender identity if possible
- separate OAuth app registrations for staging callbacks
- separate mobile app scheme only if mobile staging is actually needed

#### Billing boundary
- never point staging at live production Stripe customer/subscription state
- prefer Stripe test mode for staging
- if that is not possible, disable billing flows in staging until explicitly needed

---

## 5. Deployment options ranked

## Option A — best: dedicated staging host

### Shape
- provision a separate VPS for staging
- deploy the downstream repo or current upstream runtime there
- attach only staging DNS and staging secrets

### Pros
- strongest isolation
- easiest mental model
- lowest risk of production contamination
- simpler rollback/rebuild story

### Cons
- extra infrastructure cost
- more setup time initially

### Recommendation
Choose this if Givebettr is likely to iterate on auth, billing, onboarding, or admin surfaces soon.

---

## Option B — acceptable: same host, fully separate compose namespace

### Shape
Run staging on the same host only if all of the following are true:
- unique subdomain
- unique reverse-proxy routes
- unique compose project name
- unique container names
- unique volumes
- unique Postgres/Redis/Temporal services
- unique env file
- no port collisions

### Required examples
Use clearly separate names like:
- compose project: `postiz-staging`
- containers: `postiz-staging-app`, `postiz-staging-postgres`, etc.
- env file: `postiz-staging.env`
- upload path: `/var/lib/postiz-staging/uploads`

### Caveat
This is viable for early staging but easier to misconfigure than a dedicated host.

---

## Option C — limited/local only: developer-only local staging

### Shape
Use local Docker + repo checkout for initial feature work only.

### Good for
- UI exploration
- branding tests
- inventory-backed code discovery
- narrow auth/admin experiments

### Not good enough for
- realistic reverse-proxy/callback testing
- OAuth provider callback testing
- email deliverability/activation validation
- webhook-heavy billing/provider integration testing

### Recommendation
Keep local as a fast inner loop, not the only staging surface.

---

## 6. Recommended rollout sequence

### Phase 1 — local development baseline
Use the forked repo locally to:
- install dependencies
- confirm dev stack boots
- confirm `.env` mapping is understood
- inspect which provider integrations need explicit staging credentials

Suggested baseline commands:
```bash
cd /home/mrfreepress/projects/postiz-givebettr
pnpm install
pnpm run dev:docker
pnpm run dev-backend
```

### Phase 2 — create isolated staging runtime
Before product changes begin, define:
- staging hostname
- staging host location
- staging secrets source
- staging storage path/bucket
- staging Stripe mode
- staging email provider mode

### Phase 3 — first deployment target
Deploy the smallest safe runtime first:
- backend
- frontend
- orchestrator
- Postgres
- Redis
- Temporal
- uploads storage

Do **not** add optional third-party providers until the base environment is healthy.

### Phase 4 — connect only required integrations
Connect in this order:
1. auth basics
2. email/activation if needed
3. storage
4. one low-risk social/provider integration
5. billing test mode
6. OAuth/public API paths

---

## 7. Recommended default staging settings

These are strategy defaults, not yet-applied values.

### Registration/auth
- `DISABLE_REGISTRATION=true` by default in staging
- create test users intentionally rather than leaving public signup open
- enable email activation only if that specific flow is under test

### Billing
- use Stripe **test** keys only
- if no test keys are ready, leave billing disabled until needed
- do not import or point at production `paymentId`/subscription state

### Provider integrations
- use staging/dev app registrations where available
- otherwise delay provider hookup until the specific integration is being tested

### API / rate limits
- keep `API_LIMIT` conservative in staging
- do not treat staging as a public shared environment

### Storage
- use separate local upload root or separate object prefix/bucket
- never co-mingle staging uploads with production uploads

### Branding
- staging may temporarily expose mixed upstream/downstream branding during exploration
- that is acceptable as long as it is not public-facing to real users

---

## 8. Minimum preflight checklist before deploying staging

- [ ] choose hostname
- [ ] choose host model (dedicated VPS preferred vs same host isolated namespace)
- [ ] define env file location and secret source
- [ ] generate unique `JWT_SECRET`
- [ ] allocate isolated Postgres/Redis/Temporal state
- [ ] decide storage mode and path/prefix
- [ ] decide registration default (`DISABLE_REGISTRATION=true` recommended)
- [ ] decide billing mode (Stripe test or disabled)
- [ ] decide email/activation mode
- [ ] define reverse-proxy/TLS routing
- [ ] define smoke-test account(s)

---

## 9. Smoke tests staging must pass

Before any product branch is considered reasonably testable, staging should pass:

### Base runtime
- frontend loads at staging hostname
- backend API reachable through expected public path
- login page loads
- worker/orchestrator is healthy
- Temporal UI or workflow health is confirmable internally

### Auth/account
- intentional test user can log in
- if enabled, activation email flow works
- logout/login cycle works cleanly
- no cookie bleed from production hostname

### Data isolation
- staging database contains only test data
- production users/orgs/customers are not present in staging unless intentionally imported/redacted

### Optional billing
- Stripe test checkout/session flow works
- no live billing IDs appear

### Optional provider/OAuth
- one provider integration can connect in staging without affecting production
- OAuth app flow uses staging callback URL successfully

---

## 10. Explicit no-go conditions

Do **not** treat staging as ready if any of these are true:
- staging reuses production database or Redis state
- staging shares production JWT secret
- staging callback URLs point to production unintentionally
- staging sends real billing events to production Stripe context
- staging uploads mix with production uploads
- production cookies/sessions are accepted by staging hostname

---

## 11. Recommendation for Derek’s current phase

For the current Givebettr phase, the best default is:

1. keep using local repo work for inventories/planning
2. prepare a **dedicated staging deployment** before product code changes
3. set staging registration to closed by default
4. keep billing in Stripe test mode or disabled
5. connect provider integrations only when needed by a specific change

This best matches the current posture:
- controlled pilot thinking
- unresolved branding decision
- unresolved commercialization decision
- desire to avoid live-host product edits

---

## 12. Next reference docs that should follow this one

After this staging strategy, the next useful planning docs are:
1. a concrete `staging-bootstrap-plan` with exact paths/compose/env layout
2. a `registration-posture-decision` memo
3. a `commercialization-decision` memo revisiting pilot vs broader SaaS posture

---

## 13. No-change action log

This document is planning/reference only.

Intentionally not done here:
- no DNS changes
- no staging host provisioning
- no compose edits
- no env file creation
- no live deployment changes
- no provider credential changes
- no billing configuration changes
