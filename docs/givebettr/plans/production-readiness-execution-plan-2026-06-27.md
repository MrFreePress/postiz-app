# Givebettr Production-Readiness Execution Plan

> **For Hermes:** Treat this as the ranked follow-through plan for the production-readiness checklist. Execute top-down unless a later item is explicitly pulled forward for business reasons.

**Goal:** convert the production-readiness checklist into an ordered execution sequence that reduces launch risk fastest.

**Architecture:** front-load identity/deploy-path, environment safety, and onboarding posture decisions before billing/provider expansion. Keep production work repo-first and document-backed, then validate on an isolated lane before any production cutover.

**Tech Stack:** Postiz monorepo, Docker Compose, Postgres, Redis, Temporal, downstream fork on GitHub, Hetzner-hosted dev lane.

---

## Priority model

- **P0** = must complete before production launch
- **P1** = strongly recommended before production launch
- **P2** = useful polish / follow-up once P0-P1 are stable

Within each priority, tasks are ordered by dependency and blast-radius reduction.

---

## Rank 1 — Release identity and deploy path

**Why first:** if deployment identity is ambiguous, every later production check is built on sand.

### Task 1.1 — Audit current downstream deploy identity
**Deliverable:** one doc that maps every repo/runtime artifact still involved in shipping the app.

Verify at minimum:
- `.github/workflows/build-containers.yml`
- `docker-compose.yaml`
- any deploy scripts/docs that mention image names, registries, or release paths
- origin/upstream remote expectations for operators

### Task 1.2 — Write the canonical production deploy path
**Deliverable:** a single runbook describing:
- release candidate source (branch/tag/commit rule)
- build/publish step
- server update step
- runtime verification step
- rollback step

### Task 1.3 — Prove rollback path
**Deliverable:** documented rollback procedure with exact image/commit re-pin behavior and post-rollback verification steps.

**Exit condition for Rank 1:** no required production operator step depends on guessing which repo/image/path is authoritative.

---

## Rank 2 — Production runtime/environment safety

**Why second:** once deploy identity is clean, production safety boundaries become meaningful.

### Task 2.1 — Define production-vs-dev isolation matrix
**Deliverable:** table for hostname, compose/runtime path, env files, secrets, DB, Redis, Temporal, uploads, backups.

### Task 2.2 — Verify backup and restore posture
**Deliverable:** documented backup locations plus a restore procedure for the production-intended data stores.

### Task 2.3 — Document monitoring/log path
**Deliverable:** where to inspect app logs, container health, and operator-facing failure signals during/after launch.

**Exit condition for Rank 2:** production data and recovery story are explicit and separated from dev.

---

## Rank 3 — Auth and registration posture

**Why third:** launch posture is impossible to review without a settled onboarding model.

### Task 3.1 — Choose public signup policy
**Deliverable:** explicit decision note: open signup vs invite-only vs operator-created tenants.

### Task 3.2 — Finalize downstream-safe auth/legal/support endpoints
**Deliverable:** approved URLs or intentionally deferred safe placeholders for:
- terms
- privacy
- support/help/contact

### Task 3.3 — Production auth verification plan
**Deliverable:** smoke checklist for:
- `/auth`
- `/auth/login`
- `/auth/forgot`
- invite-only / activation / register behaviors as applicable

**Exit condition for Rank 3:** onboarding posture and user-facing auth/legal surfaces are no longer ambiguous.

---

## Rank 4 — Billing/commercial controls

**Why fourth:** billing should not be enabled until identity, isolation, and onboarding are already stable.

### Task 4.1 — Decide launch billing mode
**Deliverable:** explicit choice:
- disabled
- manual/off-platform
- live Stripe

### Task 4.2 — Document failure/support path
**Deliverable:** what operators do for failed payment, refund, mis-bill, and access mismatch cases.

### Task 4.3 — Verify no test-mode leakage risk
**Deliverable:** checklist proving launch candidate cannot accidentally point at test-mode or staging billing state.

**Exit condition for Rank 4:** billing posture is intentionally chosen and supportable.

---

## Rank 5 — Provider/OAuth rollout control

**Why fifth:** provider breadth should be constrained until core launch posture is stable.

### Task 5.1 — Define launch provider allowlist
**Deliverable:** approved provider list for launch vs deferred providers.

### Task 5.2 — Document callback strategy
**Deliverable:** production callback URLs and reconnect/recovery workflow for approved providers.

### Task 5.3 — Write provider validation matrix
**Deliverable:** exact tests for one approved provider flow and the OAuth/public API surfaces that matter at launch.

**Exit condition for Rank 5:** production launch is not relying on unbounded provider behavior.

---

## Rank 6 — Operator/admin readiness

**Why sixth:** by this point the core launch shape is known, so operator workflows can be documented concretely.

### Task 6.1 — Document primary operator workflows
Include:
- deploy
- rollback
- read logs
- verify auth posture
- inspect provider failures
- inspect billing state (if enabled)

### Task 6.2 — Document onboarding/support workflow
Include first-customer / first-tenant path and escalation steps.

**Exit condition for Rank 6:** operators can support the first real users without improvising core flows.

---

## Rank 7 — Production verification gate

**Why seventh:** this is the last step before any real launch signoff.

### Task 7.1 — Build the final production-candidate smoke pack
Must include:
- unauthenticated routes
- auth routes
- one approved provider flow
- one operator/admin path
- billing entry or explicit disabled behavior
- final on-host image/commit verification
- recent log review

### Task 7.2 — Run go/no-go review
Use the checklist plus smoke results to produce a launch recommendation.

**Exit condition for Rank 7:** final production recommendation is based on real candidate evidence.

---

## Recommended immediate next actions

1. **Start with Rank 1 / Task 1.1** — audit current downstream deploy identity and shipping artifacts.
2. **Then Rank 1 / Task 1.2** — write the canonical production deploy path and rollback.
3. **Then Rank 3 / Task 3.1** if onboarding is still undecided, because that decision shapes auth/legal/billing work.

---

## Explicitly deferred until after Rank 1-3

Do not expand these first unless the user reprioritizes them:
- broad provider rollout
- production billing enablement
- cosmetic branding polish that does not change launch risk
- deeper live-host restructuring beyond what launch safety requires

---

## Current grounding notes

- Current repo head before this plan: `61e98f92`
- Verified dev lane exists and behaves correctly for the current unauthenticated posture
- Dev compose project has been normalized on-host to `postiz-dev-live`
- Compose image selection is now split correctly between:
  - `/opt/postiz-dev/live/.env` for Compose interpolation
  - `/opt/postiz-dev/live/postiz-dev.env` for app runtime env
