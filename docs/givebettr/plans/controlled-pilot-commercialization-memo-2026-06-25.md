# Postiz Givebettr Controlled-Pilot Commercialization Memo

> **Status:** consolidation memo / operating recommendation only — no live or repo behavior changes made.
>
> This memo consolidates the current commercialization posture across the verified live deployment, downstream repo inventories, staging strategy, registration decision, and earlier operator/admin findings.

## Executive recommendation

For Givebettr’s current phase, operate as a:

> **controlled pilot, operator-assisted hosted product**

and **not** as an open public self-service SaaS.

That means:
- keep the live app as a controlled prototype/pilot surface
- use the downstream repo for product changes
- keep onboarding intentional
- keep registration closed by default
- use staging before product code changes reach live
- rely on manual/operator processes where native SaaS controls are not yet proven

---

## 1. Grounded inputs consolidated here

This memo is based on already-verified findings from:
- `/home/mrfreepress/projects/hetzner/docs/postiz-multi-tenant-commercialization-plan-2026-06-25.md`
- `/home/mrfreepress/projects/hetzner/docs/postiz-fork-product-plan-2026-06-25.md`
- `/home/mrfreepress/projects/postiz-givebettr/docs/givebettr/inventories/commercialization-touchpoints-inventory-2026-06-25.md`
- `/home/mrfreepress/projects/postiz-givebettr/docs/givebettr/plans/staging-strategy-2026-06-25.md`
- `/home/mrfreepress/projects/postiz-givebettr/docs/givebettr/plans/registration-posture-decision-2026-06-25.md`

### Core live facts already verified
- `https://post.givebettr.com` is live and serving Postiz
- the current runtime still has `DISABLE_REGISTRATION=false`
- only one user/org currently exists in practice
- current visible `SUPERADMIN` is organization-level, not proven server-wide operator control
- the data model supports organizations and customer/groups, but the current live deployment is single-tenant in practice today

### Core repo facts already verified
- the downstream repo already contains real product surfaces for:
  - organizations/customers/groups
  - auth/onboarding
  - invitation/team management
  - Stripe-backed billing primitives
  - OAuth/public API flows
  - partial admin/operator controls
- but those surfaces are not yet the same thing as a fully proven hosted-product operating model

---

## 2. What “controlled pilot” means here

## Included
A controlled pilot means:
- limited intentional onboarding
- operator awareness of every tenant/customer onboarded
- support handled manually or semi-manually
- no assumption that all commercial lifecycle behavior is already productized
- product changes flow through repo → staging → live, not direct live edits

## Excluded
A controlled pilot does **not** mean:
- open public self-service signup
- broad public marketing promises about self-service SaaS readiness
- assuming in-app operator tooling is complete
- assuming billing and support can be fully automated already

---

## 3. Why open public SaaS is not the right posture yet

Open public SaaS is premature because several critical layers are still unresolved or only partially proven:

### Operator/admin layer
- global server-wide operator control is not yet proven as a polished in-app surface
- dependable operator power is still primarily:
  - infrastructure access
  - database visibility
  - manual/admin workflows

### Registration/onboarding layer
- current signup creates organization/trial state, not just a user record
- open signup would allow uncontrolled org creation
- onboarding/support workflows are not yet locked down

### Staging/release layer
- staging strategy is defined, but not yet executed
- product changes should not be validated first on the live pilot app

### Billing/commercial layer
- code contains Stripe/subscription primitives, but the commercial operating model is not yet finalized
- plan boundaries, support scope, suspension behavior, and billing posture still need explicit decisions

### Branding layer
- branding decision is still unresolved:
  - rebrand downstream
  - or remove/minimize upstream branding
- public exposure before that decision increases confusion

---

## 4. Recommended operating posture right now

## Live production-like pilot instance
Treat `https://post.givebettr.com` as:
- a controlled pilot environment
- not public-ready SaaS
- suitable for operator-led onboarding and testing with intentional participants

### Recommended live rules
- close public registration
- use invite-only / operator-assisted onboarding
- keep tenant count intentionally small
- keep support high-touch
- avoid direct live product edits

## Downstream repo
Treat `/home/mrfreepress/projects/postiz-givebettr` as:
- the main surface for product/design evolution
- where branding, onboarding, admin, and commercialization work should be explored first

## Staging
Treat staging as:
- required before meaningful product changes hit live
- closed registration by default
- isolated from production at DNS, secrets, data, storage, and billing levels

---

## 5. Recommended auth/onboarding posture

This memo adopts the earlier registration decision:

> **Invite-only / operator-assisted onboarding with public signup disabled**

### Practical meaning
- do not allow unknown public users to create orgs freely
- approve or prepare each onboarding intentionally
- allow manual operator-created tenant/org flows when appropriate
- keep local dev flexible, but do not let local convenience define live posture

---

## 6. Recommended commercialization posture

## Current recommendation
Use a **pilot commercialization** model, not a polished self-service SaaS model.

### Characteristics
- high-touch onboarding
- manual qualification of pilot tenants
- manual or external billing first if needed
- careful observation of support pain points
- limited number of customers/users at a time

### Why this is strategically good
It lets Givebettr learn the right things first:
- what tenant setup actually needs
- what support/admin powers are missing
- which billing and plan boundaries matter in practice
- which branding/product direction is correct

without prematurely committing to a full public-SaaS surface area.

---

## 7. Recommended billing posture for the pilot

### Default
- prefer manual/external billing or tightly managed pilot billing first
- do not assume native in-app billing flows are ready to be the public commercial system

### Why
Even though the repo contains Stripe-backed subscription logic:
- the surrounding customer operations are not fully proven yet
- support and entitlement policies still need tightening
- billing mistakes are harder to unwind than product UI mistakes

### Upgrade path later
Revisit fuller product-integrated billing only after:
- staging is working
- onboarding is documented
- support/admin workflow is clear
- plan boundaries are explicit

---

## 8. Recommended branding posture for the pilot

Because branding is unresolved:
- do not rush public exposure as if branding were settled
- use the inventory to decide deliberately between:
  - downstream rebrand
  - or upstream-brand minimization/removal

For now, branding uncertainty is another reason to keep the app in controlled-pilot mode rather than broad public self-service mode.

---

## 9. Decision matrix

| Area | Recommended current posture | Why |
|---|---|---|
| Live app | Controlled pilot | Limits risk while learning |
| Signup | Closed | Prevents uncontrolled org creation |
| Onboarding | Invite-only / operator-assisted | Matches current support maturity |
| Tenant creation | Manual when needed | Keeps org growth intentional |
| Product changes | Repo-first | Avoids live-instance experimentation |
| Testing path | Local + isolated staging first | Reduces production contamination risk |
| Billing | Manual/external or tightly managed pilot billing | Commercial operations not fully productized yet |
| Branding | Decide later, do not force public exposure now | Branding direction unresolved |
| Operator controls | Manual/operator-supported workflows | Global in-app admin surface not yet proven |

---

## 10. What would need to become true before broader SaaS posture

Only reconsider broader public self-service SaaS after most of the following are true:
- branding direction is settled
- staging is deployed and proven
- registration/auth policy is implemented intentionally
- operator/admin workflow is documented and repeatable
- support playbook exists
- billing posture is explicit and tested
- abuse/rate-limit policy is defined
- confidence exists in org/customer/group boundaries and support tooling

Until then, the controlled pilot is the correct discipline.

---

## 11. Practical next-step implications

This memo implies the next execution work should focus on:
1. runbook capture for the live host
2. Windows PowerShell Bitwarden SSH workflow
3. eventual live registration change execution when you want to apply the decision
4. staging bootstrap planning/execution
5. later branding decision

It does **not** imply that public commercialization should accelerate before those foundations are in place.

---

## 12. Final recommendation

For Givebettr right now:

> **Operate as a controlled pilot, with operator-assisted onboarding, repo-first product development, isolated staging before live product changes, and manual/operator-supported commercial workflows where native SaaS controls are not yet proven.**

This is the strongest fit for the verified current state.

---

## 13. No-change action log

This memo is consolidation/reference only.

Intentionally not done here:
- no signup config changes
- no restart/redeploy
- no billing changes
- no staging deployment
- no branding changes
- no product code changes
