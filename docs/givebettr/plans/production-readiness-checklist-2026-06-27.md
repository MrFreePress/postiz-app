# Givebettr Production-Readiness Checklist

> Date: 2026-06-27
> Scope: downstream-fork readiness for promoting Givebettr from controlled dev/pilot posture toward production.

## Current recommendation
**Do not treat the downstream fork as production-ready yet.**

Current verified baseline:
- downstream repo head: `cf4f62f6`
- live dev lane: `https://post-dev.givebettr.com`
- current dev app image: `postiz-givebettr-dev:5ce513f6`
- public self-signup on dev is closed
- unauthenticated routing posture is behaving as intended on the dev lane

Main reason this is not yet production-ready:
- the dev lane is now a good validation surface, but commercialization, operator controls, billing posture, provider rollout policy, and release/runbook discipline still need explicit production decisions and checks.

---

## Exit rule
Only call Givebettr production-ready when **all P0 items are complete**, **all required P1 items are either complete or consciously deferred with owner/risk noted**, and the final smoke/regression pass succeeds on the intended production release candidate.

---

## P0 — must be complete before production

### 1. Release identity and deployment path
- [ ] Production deployment artifacts reference downstream identity only
- [ ] No required production operator step depends on upstream image namespaces or upstream repo ownership
- [ ] Canonical deploy path is documented end-to-end
- [ ] Rollback path is documented and tested
- [ ] Release candidate commit/tag selection process is explicit

### 2. Runtime/environment safety
- [ ] Production hostname, app env, database, Redis, Temporal, uploads, and secrets are isolated from dev
- [ ] Production JWT/app secrets are distinct from all prior environments
- [ ] Backups exist for production data stores before launch
- [ ] Restore procedure is documented
- [ ] Monitoring/log access path is documented for operator use

### 3. Auth and registration posture
- [ ] Public registration policy is explicitly chosen
- [ ] If public signup is not intended, it is closed at runtime on the real production lane
- [ ] Login, forgot-password, invite-only, and any activation flows are tested on the real lane
- [ ] Terms/privacy/help/support links shown to users are downstream-approved
- [ ] No auth-surface copy still implies the wrong onboarding posture

### 4. Billing/commercial risk controls
- [ ] Billing mode is explicitly decided for launch (disabled, manual, or live)
- [ ] No live launch points at test-mode billing accidentally
- [ ] No test/staging customer state leaks into production
- [ ] Refund/failure/operator support procedure exists
- [ ] If billing is deferred, the product copy and operator flow reflect that clearly

### 5. Provider/OAuth rollout control
- [ ] Only intentionally approved provider integrations are enabled for launch
- [ ] Provider callback URLs are correct for production
- [ ] OAuth/public API surfaces are tested with real production URLs
- [ ] Low-confidence/high-risk providers are either disabled or explicitly launch-scoped
- [ ] Reconnect/recovery workflow exists for broken integrations

### 6. Operator/admin readiness
- [ ] Primary operator workflows are documented
- [ ] User/org/customer/group model is understood well enough for launch support
- [ ] Admin escalation path exists for auth, billing, and provider issues
- [ ] Error/log inspection path is documented
- [ ] Onboarding path is documented for the first real customers/users

### 7. Production verification gate
- [ ] End-to-end smoke pass succeeds on the production candidate
- [ ] Smoke pass includes unauthenticated routes, auth, one approved provider path, and operator-critical pages
- [ ] Final deployed image/commit is verified on-host after rollout
- [ ] A post-deploy validation checklist exists and is followed

---

## P1 — strongly recommended before production

### 8. Branding and legal cleanup
- [ ] Remaining visible upstream branding is inventoried and intentionally accepted or removed
- [ ] Downstream-safe legal/support endpoints are finalized
- [ ] Public docs/help text match actual downstream operations

### 9. Staging/dev operational hygiene
- [x] Dev compose image pin is env-driven again
- [x] Dev compose project name is normalized away from the shared `live` basename
- [ ] Operator docs fully reflect the new compose-project and `.env` workflow
- [ ] Repeated deploy/restart workflow is rehearsed without surprises

### 10. Release/process hygiene
- [ ] Production checklist doc is linked from canonical project docs
- [ ] Decision log exists for launch posture choices
- [ ] Known launch blockers vs post-launch follow-ups are clearly separated
- [ ] Origin/upstream remote rules remain documented for downstream work

---

## Known verified positives right now
- [x] Dedicated public dev lane exists at `post-dev.givebettr.com`
- [x] Dev auth posture is closed by default (`/api/auth/can-register -> {"register":false}`)
- [x] `/provider/add` no longer exposes the broken unauthenticated provider grid
- [x] Dev deploy image pin drift has been corrected
- [x] Dev compose project naming has been normalized on-host

## Known blockers / unresolved launch items right now
- [ ] Production billing posture is not finalized in this checklist
- [ ] Production operator runbook/rollback is not yet formalized here
- [ ] Final downstream legal/support endpoints are not declared here
- [ ] Provider-launch allowlist and production callback strategy are not yet formalized here
- [ ] Production-specific backup/restore verification is not yet recorded here
- [ ] Unauthenticated `/provider/add` currently lands on `/auth/login-required`, but that page is a dead-end overlay with no clickable login CTA (see `docs/givebettr/plans/interactive-qa-findings-2026-06-27.md`)

---

## Minimum production candidate smoke pack
Run this on the real production candidate before launch signoff:
- [ ] `/`
- [ ] `/auth`
- [ ] `/auth/login`
- [ ] `/auth/forgot`
- [ ] registration policy route behavior
- [ ] one approved provider connect flow
- [ ] one operator/admin path
- [ ] billing entry path (or explicit disabled behavior)
- [ ] final on-host image/commit verification
- [ ] recent logs checked for hard failures after deploy

---

## Launch decision template
Use this summary at go/no-go time:

- **Go** only if:
  - all P0 boxes are checked
  - no unresolved blocker risks remain in auth, billing, provider callbacks, or rollback
  - the final smoke pack passes on the real candidate

- **No-go** if any of these remain true:
  - onboarding posture is still ambiguous
  - billing mode is unclear
  - production deploy identity/runbook is incomplete
  - launch depends on unverified provider/OAuth behavior
  - rollback/restore is undocumented or untested
