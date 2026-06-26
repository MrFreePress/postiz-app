# Postiz Givebettr Registration Posture Decision

> **Status:** decision memo / reference only — no live or repo config changes made.
>
> This memo compares open signup, invite-only onboarding, and operator-created tenants for Givebettr's current phase, then records the recommended posture.

## Executive decision

**Recommended now:**
- **close public self-service registration**
- move to **invite-only / operator-assisted onboarding**
- keep organization creation intentional rather than automatic for unknown public users

## Why this is the best current fit

Because Givebettr is still in a pre-product-hardening phase with unresolved:
- branding direction
- commercialization scope
- staging rollout
- operator-control maturity
- billing posture
- customer support workflow design

Open signup would create risk faster than it creates useful learning.

---

## 1. Grounded facts used for this decision

### Live environment facts verified
Current live host/runtime state:
- `DISABLE_REGISTRATION=false`
- `FRONTEND_URL=https://post.givebettr.com`
- `NEXT_PUBLIC_BACKEND_URL=https://post.givebettr.com/api`
- the public auth page is still functioning as an open registration surface rather than a closed operator-only surface

### Repo/code facts verified
#### `apps/backend/src/api/routes/auth.controller.ts`
- `GET /auth/can-register` exposes whether local registration is allowed
- `POST /auth/register` performs direct registration
- successful registration can immediately create logged-in/onboarding state
- if email is configured, local registration triggers activation flow

#### `apps/backend/src/services/auth/auth.service.ts`
- `canRegister(provider)` returns allowed unless `DISABLE_REGISTRATION === 'true'` for local auth
- registration attempts throw `Registration is disabled` when blocked

#### `libraries/nestjs-libraries/src/database/prisma/organizations/organization.repository.ts`
- `createOrgAndUser(...)` creates a new organization during registration
- it sets:
  - `allowTrial: true`
  - `isTrailing: true`
  - first membership role = `SUPERADMIN`
- `addUserToOrg(...)` supports invite-based org joining

#### Translation/UI facts
- the UI already includes strings for:
  - `registration_is_disabled`
  - `login_instead`
  - team-member invite flows
  - activation / registration messaging

### Practical implication
Open signup is not just "create a user".
It effectively creates a new org/account context with trial/commercial state implications.

---

## 2. Options compared

## Option A — keep open signup

### What it means
- leave `DISABLE_REGISTRATION=false`
- allow unknown public users to create accounts directly
- allow org creation to happen as part of self-service registration

### Pros
- lowest friction for signups
- easiest top-of-funnel experimentation
- no operator bottleneck for basic access

### Cons
- unknown users can create orgs immediately
- noisy/abusive signups become your problem early
- branding and commercialization ambiguity gets exposed to outsiders
- support burden rises before operator tooling is mature
- billing/trial logic may be exercised before policies are settled
- makes it harder to keep staging/production expectations controlled

### Verdict for current phase
**Not recommended now.**

---

## Option B — invite-only / operator-assisted onboarding

### What it means
- disable public self-service registration
- only onboard users/tenants intentionally
- use direct operator assistance, test-user creation, or invite-based org membership when needed

### Pros
- strongest control with relatively little product change
- fits controlled pilot posture
- reduces abuse/support noise
- lets you learn from a small set of intentional users
- keeps org creation aligned with operator awareness
- compatible with unresolved branding/commercialization decisions

### Cons
- slower onboarding
- some manual effort per pilot customer
- requires a simple intake/onboarding workflow outside or alongside the app

### Verdict for current phase
**Recommended now.**

---

## Option C — operator-created tenants only

### What it means
- disable public signup
- operators create every organization manually first
- users are then added/invited into pre-created orgs

### Pros
- maximum control over tenant quality and structure
- clearest fit for high-touch pilot customers
- easiest way to avoid accidental org sprawl

### Cons
- highest operator overhead
- less scalable than invite-only
- may require more manual/admin procedures than you want right now

### Verdict for current phase
Useful for a few pilot customers, but probably best treated as a **subset of operator-assisted onboarding**, not the only posture to formalize right now.

---

## 3. Why Option B wins right now

Invite-only / operator-assisted onboarding is the best balance because it:
- preserves control
- avoids premature public exposure
- does not require a fully custom tenant-provisioning system first
- can coexist with manual operator-created orgs for special cases
- maps cleanly to the staging strategy default of closed registration

In other words:
- **Option C** is the tightest control model
- **Option B** is the most practical current operating model

---

## 4. Recommended current policy

### Production / live Givebettr instance
- disable open registration
- onboard only intentional pilot users
- prefer operator-assisted onboarding
- create tenants manually when necessary
- keep onboarding volume small and supportable

### Staging
- default to `DISABLE_REGISTRATION=true`
- create only intentional test users/accounts
- do not expose staging as a public signup surface

### Local development
- registration can remain enabled locally when needed for specific test loops
- local convenience should not dictate production posture

---

## 5. What this means operationally

If Givebettr adopts this recommendation, the working model becomes:
1. interested pilot user/customer is screened outside the app
2. operator decides whether to onboard them
3. operator creates or prepares the appropriate org/user path
4. user is invited or otherwise intentionally activated
5. onboarding is observed closely

This keeps the app aligned with a controlled pilot rather than a public SaaS launch.

---

## 6. Risks avoided by closing signup now

This decision avoids or reduces:
- random tenant creation
- abuse/spam accounts
- unclear trial/billing expectations
- public exposure of mixed/upstream branding
- support load before admin tooling is mature
- premature dependency on unresolved commercialization choices

---

## 7. Conditions for reconsidering open signup later

Revisit this decision only after most of the following are true:
- branding decision is settled
- staging environment exists and is proven
- operator/admin workflows are explicitly documented
- commercialization/billing posture is settled
- onboarding/support playbook exists
- abuse/rate-limit posture is defined
- there is confidence in org/customer separation behavior

Until then, open signup is more liability than leverage.

---

## 8. Implementation note for later

This memo does **not** make the change.

But when/if executed later, the likely implementation path is straightforward:
- set `DISABLE_REGISTRATION=true` in the live runtime env
- recreate/restart the affected container(s)
- verify `/auth/can-register` returns false
- verify the auth page shows disabled-registration behavior

That execution should be done deliberately as a separate step.

---

## 9. Final recommendation

For Givebettr’s current phase, adopt:

> **Invite-only / operator-assisted onboarding with public signup disabled**

and treat manual operator-created tenants as an allowed special-case workflow inside that broader posture.

---

## 10. No-change action log

This memo is reference/decision documentation only.

Intentionally not done here:
- no env changes
- no restart/redeploy
- no auth flow edits
- no invitation flow edits
- no tenant creation changes
