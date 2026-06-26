# Postiz Givebettr Branding Inventory

> **Status:** inventory only — **no change action taken**.
>
> Derek has not yet decided whether the downstream product should be **rebranded** or have **branding removed/minimized**. This document is a reference inventory to support that later decision.

## Purpose
Capture where upstream Postiz/Gitroom branding and related external references appear in the forked repo so future work can be deliberate.

## Decision boundary
This inventory does **not** recommend immediate replacement values.

For later, there are at least two valid downstream strategies:
1. **Full rebrand** — replace Postiz/Gitroom with Givebettr-specific branding
2. **Brand removal / neutralization** — remove most upstream branding and keep the product more generic/white-label

Because that decision is still open, this document only records the surface area.

---

## 1. High-level findings

### Verified repo facts
- Fork repo: `https://github.com/MrFreePress/postiz-app`
- Local path: `/home/mrfreepress/projects/postiz-givebettr`
- Upstream product names present in code/content:
  - `Postiz`
  - `postiz`
  - `Gitroom`
  - `gitroomhq`

### Inventory scale
A broad content search found **hundreds** of branding-related references across the repo.

Notable concentrations:
- root docs and compose files
- frontend UI/components
- extension manifests
- SDK/package names
- localized translation files
- API/CLI/MCP help text
- external service/domain links

### Important conclusion
This is **not** a one-file or one-pass rename job.

A future branding decision will likely need to treat at least these as separate workstreams:
- developer-facing identity
- end-user visible product identity
- external links/domains
- mobile/extension integration identity
- localized string packs

---

## 2. Major branding buckets

## A. Root repo / public-facing project identity
These are the most obvious top-level identity surfaces.

### Confirmed files
- `README.md`
- `package.json`
- `apps/backend/package.json`
- `apps/frontend/package.json`
- `apps/orchestrator/package.json`
- `apps/commands/package.json`
- `apps/sdk/package.json`

### Examples observed
- `README.md`
  - product name: `Postiz`
  - domains: `postiz.com`, `platform.postiz.com`, `docs.postiz.com`, `discord.postiz.com`
  - social/tutorial links such as `youtube.com/@postizofficial`
  - upstream repo link: `gitroomhq/postiz-app`
- package names:
  - `postiz-backend`
  - `postiz-frontend`
  - `postiz-orchestrator`
  - `postiz-command`
  - `@postiz/node`

### Implication
Some of these may be safe to leave temporarily for internal development, while others are direct customer-facing/public identity.

---

## B. End-user UI copy in frontend code
These are direct product-facing strings embedded in components/pages.

### Confirmed examples
- `apps/frontend/src/app/(app)/auth/page.tsx`
  - metadata title includes `Postiz` / `Gitroom`
- `apps/frontend/src/components/layout/logout.component.tsx`
  - logout label toggles between `Postiz` and `Gitroom`
- `apps/frontend/src/components/layout/pre-condition.component.tsx`
  - "connected previously to another Postiz account"
- `apps/frontend/src/components/onboarding/onboarding.tsx`
  - welcome/onboarding references to Postiz
- `apps/frontend/src/components/onboarding/onboarding.modal.tsx`
  - tutorial title/description references Postiz
- `apps/frontend/src/components/new-layout/billing.after.tsx`
  - marketing line: "Join 10,000+ Entrepreneurs Who Use Postiz"
- `apps/frontend/src/components/webhooks/webhooks.tsx`
  - explanatory text mentions Postiz
- `apps/frontend/src/app/(app)/oauth/authorize/page.tsx`
  - app-access prompt references Postiz account

### Implication
This is the most visible customer-facing layer and should probably be handled separately from package/module naming.

---

## C. Translation / localization blast radius
The largest structured rename surface appears to be the locale files.

### Confirmed location
- `libraries/react-shared-libraries/src/translation/locales/*/translation.json`

### Observed scope
Content search found repeated Postiz/Gitroom references across many locale files, including:
- `en`
- `ja`
- `it`
- `vi`
- `tr`
- `es`
- `ru`
- `pt`
- `zh`
- `ar`
- `fr`
- `de`
- `bn`
- `ko`
- `he`
- `ka_ge`

### Typical branded strings found
- `Check out our N8N custom node for Postiz.`
- `Use Postiz API to integrate with your tools.`
- `Connect Postiz MCP server...`
- `Join 10,000+ Entrepreneurs Who Use Postiz`
- FAQ entries like `Can I trust Postiz?`
- open-source repo references to `https://github.com/gitroomhq/postiz-app`
- assistant/tutorial copy like `I am your Postiz agent`

### Implication
A future branding pass will need a translation-aware strategy, not just English-only replacement.

---

## D. External domains / URLs / third-party references
These are likely to matter a lot if the end state becomes customer-facing.

### Confirmed domains/links observed
- `https://postiz.com`
- `https://platform.postiz.com`
- `https://docs.postiz.com`
- `https://discord.postiz.com`
- `https://affiliate.postiz.com`
- `https://chromewebstore.google.com/detail/postiz/...`
- `https://www.npmjs.com/package/@postiz/node`
- `https://www.npmjs.com/package/n8n-nodes-postiz`
- `https://github.com/gitroomhq/postiz-app`
- `https://github.com/gitroomhq/postiz-agent`
- `https://youtube.com/@postizofficial`
- `postiz.pro`

### Confirmed code locations using these
- `README.md`
- `apps/frontend/src/components/public-api/public.component.tsx`
- `apps/frontend/src/components/layout/top.menu.tsx`
- `apps/frontend/src/components/layout/chrome.extension.component.tsx`
- `apps/frontend/src/components/layout/dubAnalytics.tsx`
- translation files

### Implication
This bucket overlaps branding, docs, support, marketing, analytics, extension distribution, and developer onboarding.

---

## E. Developer-facing API / CLI / SDK / MCP identity
This is a distinct category from customer-visible branding.

### Confirmed examples
- `apps/sdk/package.json`
  - package name: `@postiz/node`
- `apps/sdk/src/index.ts`
  - default API path points to `https://api.postiz.com`
- `apps/frontend/src/components/public-api/public.component.tsx`
  - examples for `postiz` CLI
  - examples for `gitroomhq/postiz-agent`
  - docs links to Postiz CLI/MCP/Public API docs
- `libraries/nestjs-libraries/src/chat/start.mcp.ts`
  - server name: `Postiz MCP`
  - agent name/id: `postiz`
- `libraries/nestjs-libraries/src/chat/load.tools.service.ts`
  - agent id/name/description reference Postiz
- `libraries/helpers/src/swagger/load.swagger.ts`
  - Swagger title: `Postiz Swagger file`

### Implication
Even if customer-facing branding gets neutralized, you may or may not want to preserve upstream developer-facing names for compatibility. This should be a separate future decision.

---

## F. Mobile deep links / app-scheme identity
These are easy to miss and should not be blindly changed.

### Confirmed examples
- `apps/backend/src/api/routes/auth.controller.ts`
  - default mobile scheme: `postiz://auth/callback`
- `apps/frontend/src/components/launches/add.provider.component.tsx`
  - mobile redirect usage of `postiz://integrations`
  - comments describe app redirect behavior via `postiz://`

### Implication
If future work changes branding or removes it, the mobile scheme decision should be explicit. It can affect existing mobile-app assumptions and OAuth redirect flows.

---

## G. Browser extension identity
This is another separate surface with packaging and allowlist implications.

### Confirmed file
- `apps/extension/manifest.json`

### Confirmed examples
- manifest name: `Postiz`
- description: `Postiz browser extension for social media scheduling`
- externally connectable matches include:
  - `https://*.postiz.com/*`
- frontend links point to Chrome Web Store listing named `postiz`

### Implication
Extension naming and extension-store URLs are part of branding, but also part of integration behavior. Future changes here should be treated carefully.

---

## H. Email / notification / support copy
These are less central than UI strings but still user-visible.

### Confirmed examples
- `apps/orchestrator/src/workflows/digest.email.workflow.ts`
  - subject format: `[Postiz] Your latest notifications`
- `libraries/nestjs-libraries/src/newsletter/providers/listmonk.provider.ts`
  - subject: `Welcome to Postiz 🚀`
- translations / FAQ entries refer to Postiz trust, subscriptions, and support

### Implication
If branding changes later, outbound email subjects and support/help language need their own review.

---

## I. Infrastructure / compose / environment naming
Some naming may be internal-only and may not need immediate change.

### Confirmed files with branding references
- `docker-compose.yaml`
- `docker-compose.dev.yaml`
- package names / service names in repo metadata

### Implication
Internal service/container names may be lower priority than public-facing branding. They should be inventoried, not automatically renamed.

---

## 3. Suggested future decision framework

Because Derek has not yet chosen between **rebrand** and **debrand/minimize**, the future choice should probably be made bucket-by-bucket.

### If choosing full rebrand later
Prioritize in this order:
1. public UI text
2. external links/domains
3. email/support copy
4. extension/mobile identity
5. developer package/CLI/MCP identity
6. internal service names

### If choosing branding removal / neutralization later
Prioritize in this order:
1. customer-visible product name/copy
2. marketing claims and public links
3. FAQ/tutorial/support copy
4. visible logos/icons
5. leave technical package/internal names alone until there is a reason to change them

---

## 4. No-change action log

### What was done today
- inventoried branding surfaces in the forked repo
- logged the main buckets and examples
- recorded the decision that **no branding changes should be made yet**

### What was intentionally not done
- no search/replace
- no UI edits
- no package renames
- no domain substitution
- no removal of Postiz/Gitroom strings
- no mobile/extension identity changes

---

## 5. Recommended next reference docs
When ready, create separate follow-up inventories/specs for:
- `commercialization-touchpoints-inventory.md`
- `staging-strategy.md`
- `branding-decision-memo.md`

That last memo should explicitly answer:
- full Givebettr rebrand?
- neutral/white-label removal?
- preserve upstream developer ecosystem names or not?
