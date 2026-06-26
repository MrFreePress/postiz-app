# Postiz Givebettr Commercialization Touchpoints Inventory

> **Status:** inventory only — **no product changes made**.
>
> This document maps the main code surfaces relevant to future commercialization decisions for the downstream Postiz/Givebettr product. It is intended as a reference for later design work around auth, onboarding, organizations/customers, billing, OAuth/public API, and operator/admin controls.

## Purpose
Record where the current codebase appears to implement the business/control surfaces most relevant to a hosted multi-tenant product.

## Important boundary
This is **not** an implementation plan and **not** a recommendation to change behavior yet.

It exists so later decisions can be made deliberately.

---

## 1. High-level findings

### Verified themes in the codebase
The fork already contains meaningful product surfaces for:
- organization-scoped tenancy
- customer/group segmentation inside organizations
- local auth and account lifecycle
- invitation/team membership workflows
- Stripe-backed billing/subscriptions
- org-scoped API keys
- public OAuth app / approved-app flows
- partial operator/admin capabilities

### Practical interpretation
This means Givebettr is **not** starting from zero for commercialization. The important question later is less "can this code support SaaS concepts at all?" and more:
- which of these surfaces are already good enough,
- which need downstream refinement,
- and which should remain external/manual in an early pilot.

---

## 2. Tenant / organization / customer model

## Core schema surfaces
### `libraries/nestjs-libraries/src/database/prisma/schema.prisma`
Confirmed key models/fields:
- `Organization`
  - `apiKey`
  - `paymentId`
  - `allowTrial`
  - `isTrailing`
  - relations to `subscription`, `users`, `customers`, `webhooks`, `oauthApp`, `oauthAuthorizations`, etc.
- `User`
  - `isSuperAdmin`
  - `inviteId`
  - `activated`
  - `connectedAccount`
- `UserOrganization`
  - `organizationId`
  - `userId`
  - `role`
  - `disabled`
- `Customer`
  - relation from `Organization.customers`
  - integration/customer linkage was already confirmed in live-db work

### Interpretation
The top-level model is:
- **organization** as the main tenant/account boundary
- **customer/group** as a sub-tenant segmentation layer within an organization
- **user membership** expressed through `UserOrganization`

This aligns with the earlier live-db conclusions.

---

## 3. Auth and account lifecycle touchpoints

## Backend auth controller
### `apps/backend/src/api/routes/auth.controller.ts`
Confirmed auth/account lifecycle endpoints include:
- `GET /auth/can-register`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot`
- `POST /auth/forgot-return`
- `POST /auth/activate`
- `POST /auth/resend-activation`
- OAuth redirect helpers including mobile callback behavior

### Relevant observations
- registration goes through `CreateOrgUserDto`
- auth flow can read an org from cookie context
- successful register/login can set a `showorg` cookie with `organizationId`
- local-email activation depends on email-provider availability
- mobile auth uses a `MOBILE_APP_SCHEME` fallback of `postiz://auth/callback`

### Commercialization relevance
This is a major surface for later decisions about:
- open signup vs invite-only
- operator-assisted tenant creation
- activation requirements
- mobile auth behavior
- whether org creation is coupled directly to registration

---

## 4. Organization creation, invitation, and team management

## Organization repository
### `libraries/nestjs-libraries/src/database/prisma/organizations/organization.repository.ts`
This is one of the most important commercialization files discovered so far.

### Confirmed behaviors
- `createOrgAndUser(...)`
  - creates an organization
  - sets `allowTrial: true`
  - sets `isTrailing: true`
  - creates the first membership with `Role.SUPERADMIN`
- `getOrgsByUserId(...)`
  - loads org memberships plus subscription data
- `addUserToOrg(...)`
  - invite-based joining flow
  - checks `inviteId`
  - blocks some additions when Stripe + STANDARD subscription constraints apply
- `getTeam(...)`
  - loads team members and email-preference flags
- `deleteTeamMember(...)`
- `disableOrEnableNonSuperAdminUsers(...)`
  - org-wide enable/disable for non-superadmin users
- `getImpersonateUser(...)`
  - explicit lookup for impersonation candidates by org/user details

### Commercialization relevance
This file strongly suggests the repo already has primitives for:
- tenant creation on signup
- team membership within an org
- tier-sensitive collaboration limits
- partial support/admin workflows
- some impersonation-oriented operator tooling

### Important caveat
These are **code primitives**, not proof that the entire in-app operator experience is finished or safe for broad public SaaS rollout.

---

## 5. Billing and subscription touchpoints

## Schema signals
### `schema.prisma`
Confirmed organization/subscription-related fields:
- `Organization.paymentId`
- `Organization.allowTrial`
- `Organization.isTrailing`
- `Organization.subscription`

## Subscription repository
### `libraries/nestjs-libraries/src/database/prisma/subscriptions/subscription.repository.ts`
Confirmed billing/subscription logic around:
- lookup by `organizationId`
- lookup by Stripe/customer ID via `paymentId`
- create/update subscription lifecycle
- updating `paymentId`
- marking org trial state / trailing state
- coupon/code usage via `UsedCodes`
- credit consumption tracking for AI usage

### Notable methods/behaviors
- `getCustomerIdByOrgId(...)`
- `updateCustomerId(...)`
- `createOrUpdateSubscription(...)`
  - updates subscription tier, total channels, period, cancelAt
  - flips `allowTrial` false when subscription becomes real
  - records used codes
- `getSubscription(...)` and identifier/customer lookup helpers
- credit usage tracking tied to organization

## Frontend billing surfaces
### `apps/frontend/src/components/billing/billing.component.tsx`
- loads `/user/subscription/tiers`
- loads `/user/subscription`

### `apps/frontend/src/components/billing/first.billing.component.tsx`
- embeds Stripe checkout
- posts to `/billing/embedded`
- uses pricing and trial-oriented UI flows
- contains prominent hosted-product marketing copy

### Translation/UI surfaces
- `libraries/react-shared-libraries/src/translation/locales/en/translation.json`
  - many keys for billing, plans, cancellation, invoices, trials, couponing, team-member entitlements, etc.

### Commercialization relevance
Billing is already a first-class product area in the codebase, but it likely reflects upstream Postiz assumptions. Givebettr later needs to decide whether to:
- preserve the native billing model,
- simplify it for a controlled pilot,
- or partially externalize/complement it.

---

## 6. Public API and org-scoped API key touchpoints

## Schema / organization fields
- `Organization.apiKey`
- API key rotation/update behavior appears in organization repository via `updateApiKey(...)`
- API key lookup behavior appears via `getOrgByApiKey(...)`

## UI/API surfaces
### `libraries/react-shared-libraries/src/translation/locales/en/translation.json`
Contains public-API-related strings such as:
- `public_api`
- `use_postiz_api_to_integrate_with_your_tools`
- `label_api_key`
- `label_instance_url`

### `apps/frontend/src/components/public-api/public.component.tsx`
Confirmed this component handles:
- MCP connection instructions
- CLI setup instructions
- Public API docs links
- remote vs local auth modes
- skill installation guidance

### Commercialization relevance
This is directly relevant if Givebettr later wants:
- developer-facing product value
- tenant self-service automation
- white-labeled API access
- agent/CLI workflows for customers

---

## 7. OAuth app / approved-app / third-party authorization touchpoints

## OAuth controllers
### `apps/backend/src/api/routes/oauth.controller.ts`
Confirmed support for:
- `GET /oauth/authorize`
- `POST /oauth/token`
- authenticated `POST /oauth/authorize` approve/deny flow

This is for apps acting on behalf of users/orgs.

## OAuth repository
### `libraries/nestjs-libraries/src/database/prisma/oauth/oauth.repository.ts`
Confirmed support for:
- per-org OAuth app creation
- app lookup by org/client ID
- update/delete app
- rotate client secret
- create auth codes
- exchange auth code for access token
- approved-app listing and revocation
- revoke all for app

### Important structural implication
OAuth applications are tied to an **organization**, not to a global server-wide app registry only.

### Frontend developer surfaces
#### `apps/frontend/src/components/developer/developer.component.tsx`
Confirmed functionality for:
- creating an OAuth app
- editing it
- rotating client secret
- deleting it
- docs link to `docs.postiz.com/public-api/oauth`
- explanatory copy about other Postiz users authorizing your app

#### `apps/frontend/src/components/approved-apps/approved-apps.component.tsx`
Confirmed user-facing management for:
- listing approved apps
- revoking authorization per app

### Commercialization relevance
This is a major asset if Givebettr later wants:
- customer-developer integrations
- partner integrations
- org-scoped delegated access
- customer-approved third-party automation

---

## 8. Admin/operator control touchpoints

## Schema signals
### `schema.prisma`
Confirmed important admin/operator fields:
- `User.isSuperAdmin`
- `UserOrganization.role`
- `UserOrganization.disabled`

## Organization repository signals
### `organization.repository.ts`
Relevant methods already identified:
- `getImpersonateUser(...)`
- `disableOrEnableNonSuperAdminUsers(...)`
- `getTeam(...)`
- `deleteTeamMember(...)`

## Translation/UI signals
### `libraries/react-shared-libraries/src/translation/locales/en/translation.json`
Relevant strings include:
- `currently_impersonating`
- `label_select_organization`
- `team_members`
- `approved_apps`
- `billing`
- `affiliate`
- `registration_is_disabled`

### Interpretation
The codebase appears to have at least partial support for:
- org role management
- user disabling within orgs
- impersonation-oriented flows
- admin sections and advanced account controls

### Caveat
This inventory does **not** prove a polished global operator console exists. It only shows where the underlying control surfaces likely live.

---

## 9. Onboarding / invitation / collaboration touchpoints

### Confirmed signals
- registration creates org + superadmin membership
- invite-based org joining exists in `addUserToOrg(...)`
- translation strings explicitly talk about:
  - team members
  - inviting assistants/team members
  - collaboration in a workspace
- `getTeam(...)` and org membership loading support in-code collaboration model

### Commercialization relevance
This is central to deciding later whether Givebettr should prefer:
- self-service onboarding,
- invite-only organization creation,
- or operator-created tenants with invited owners.

---

## 10. Decision-relevant observations for later

## Strong existing surfaces
The current codebase already contains meaningful primitives for:
- org-based tenancy
- sub-tenant customer/group segmentation
- billing/subscription state
- API keys and public API
- OAuth apps and approved-app revocation
- team membership and invitation flows
- partial admin/operator controls

## Areas likely needing deeper downstream review later
- exact global-operator vs org-operator separation
- safe use of impersonation features
- whether upstream billing assumptions fit Givebettr’s commercial posture
- whether signup-created organizations are the right model
- whether Stripe/native billing should be kept, simplified, or partially bypassed for a pilot
- whether the OAuth/public API surfaces should be customer-facing from day one

---

## 11. No-change action log

### What was done today
- inventoried commercialization-relevant code surfaces
- recorded file paths and key behaviors
- preserved this as a reference document for later design work

### What was intentionally not done
- no code changes
- no auth changes
- no billing changes
- no org/onboarding changes
- no operator/admin changes
- no Stripe/OAuth configuration changes

---

## 12. Best follow-up reference docs

The next useful reference/spec docs would be:
1. `staging-strategy.md`
2. `branding-decision-memo.md`
3. `commercialization-decision-memo.md`

A later commercialization memo should explicitly decide:
- keep native billing vs manual/external pilot billing?
- org-created-on-signup vs operator-created tenant?
- expose OAuth/public API immediately or later?
- what operator controls are required before any paid rollout?
