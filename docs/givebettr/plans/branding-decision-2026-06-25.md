# Postiz Givebettr Branding Decision

> **Status:** decision memo / reference only — no repo changes made.
>
> This memo decides between the two branding paths previously left open for the downstream Givebettr fork:
>
> 1. **full rebrand**
> 2. **brand removal / minimization**

## Executive decision

**Recommended now:**

> **Do not do a full Givebettr rebrand yet.**
>
> For the current controlled-pilot phase, prefer **brand removal / minimization first**, with the option to do a later full rebrand once product direction, staging, and commercialization are more settled.

## Short rationale

This is the best current fit because:
- the repo contains **hundreds** of branding references across many buckets
- the product is still in a **controlled pilot** phase, not broad public SaaS launch
- registration/commercialization posture was intentionally moved toward **intentional, limited onboarding**
- staging is planned but not yet executed
- a full rebrand would force many decisions that are still strategically premature:
  - final product name
  - final support/docs URLs
  - extension identity
  - mobile deep-link identity
  - developer-facing SDK/API naming policy
  - translation-wide customer copy direction

A minimization-first approach reduces visible upstream-brand confusion without locking Givebettr into irreversible naming choices too early.

---

## 1. Grounded facts used for this decision

This memo is based on:
- `/home/mrfreepress/projects/postiz-givebettr/docs/givebettr/inventories/branding-inventory-2026-06-25.md`
- `/home/mrfreepress/projects/postiz-givebettr/docs/givebettr/plans/controlled-pilot-commercialization-memo-2026-06-25.md`
- `/home/mrfreepress/projects/postiz-givebettr/docs/givebettr/plans/registration-posture-decision-2026-06-25.md`

### Verified branding inventory conclusions
The inventory established that:
- upstream names present include:
  - `Postiz`
  - `postiz`
  - `Gitroom`
  - `gitroomhq`
- the repo contains **hundreds** of branding-related references
- branding is spread across multiple distinct buckets:
  - root docs/public identity
  - frontend UI strings
  - translation files
  - external domains/support links
  - API/CLI/SDK/MCP identity
  - mobile deep links
  - extension identity
  - email/notification copy
  - infra/internal naming

### Verified operating-posture conclusions
The controlled-pilot memo already established that Givebettr should currently operate as:
- a **controlled pilot**
- with **intentional onboarding**
- **not** as a broad public self-service SaaS

The registration decision also established that public exposure should be constrained rather than expanded.

### Practical implication
Because public exposure is intentionally limited right now, the immediate need is not to perfect a permanent market-facing brand system.

The immediate need is to:
- reduce confusing public-facing upstream branding where appropriate
- avoid overcommitting to a final brand architecture too early

---

## 2. Options compared

## Option A — full Givebettr rebrand now

### What it means
- replace `Postiz` / `Gitroom` with Givebettr-specific branding broadly
- choose final names/phrasing for customer-facing and developer-facing surfaces
- likely update many of the following at once:
  - product copy
  - docs links
  - support references
  - extension name
  - mobile scheme
  - API/SDK/CLI/MCP naming
  - translation strings

### Pros
- strongest brand ownership if final direction is already clear
- minimizes upstream identity leakage if done comprehensively
- gives a cleaner eventual external product story

### Cons
- forces premature decisions on many surfaces at once
- large blast radius across code, copy, docs, extension, mobile, and translations
- higher maintenance burden while upstream sync is still important
- risks choosing names/URLs/conventions before product positioning is stable
- creates more downstream divergence sooner

### Verdict for current phase
**Not recommended now.**

---

## Option B — remove / minimize upstream branding first

### What it means
- do not immediately invent the final downstream name everywhere
- instead, prioritize reducing the most confusing customer-visible upstream references
- keep some internal/developer-facing/upstream-compatible naming intact temporarily where it reduces churn
- defer final naming architecture until later

### Pros
- lower-risk path during controlled pilot phase
- fits the repo-first minimal-diff philosophy
- reduces needless early divergence from upstream
- avoids locking in final naming before the product direction is mature
- lets you focus first on the most visible/important customer-facing copy

### Cons
- interim state may be more neutral than strongly branded
- some internal/upstream naming may remain temporarily
- may require a second future pass if a full rebrand is eventually chosen

### Verdict for current phase
**Recommended now.**

---

## 3. Why Option B wins right now

Brand minimization/removal wins because it aligns best with the broader strategy already chosen:

### It matches the controlled-pilot posture
You are not trying to present a polished mass-market SaaS brand right now.
You are trying to operate carefully, learn deliberately, and avoid premature commitments.

### It matches the minimal-diff downstream strategy
The fork/product plan already favors staying close to upstream where possible.
A full immediate rebrand pushes harder in the opposite direction.

### It respects the inventory blast radius
The inventory showed this is not a simple rename.
A minimization-first pass lets later work be sequenced by importance instead of forcing one giant all-or-nothing branding rewrite.

### It avoids premature naming lock-in
You explicitly did not yet know whether you wanted:
- rebrand
- or remove/minimize branding

This memo resolves that ambiguity pragmatically for **now** without pretending the final long-term brand system must already be settled.

---

## 4. Recommended current policy

For the current phase, adopt:

> **Brand removal / minimization first, not a full Givebettr rebrand.**

### Practical meaning
When later implementation begins, prioritize these categories in this order:

#### Tier 1 — high-priority future minimization targets
These are the most likely to confuse pilot users if left untouched:
- obvious customer-facing marketing lines
- auth/onboarding UI copy that says `Postiz`/`Gitroom`
- public-facing docs/support/community links pointing to upstream-branded destinations
- email subject lines / welcome copy mentioning Postiz

#### Tier 2 — later decision surfaces
These should be changed only after more explicit product decisions:
- extension/store identity
- mobile deep-link scheme
- API/CLI/SDK/MCP naming
- translation-wide branded copy strategy

#### Tier 3 — internal/developer-facing names that may safely remain longer
These may be okay to leave temporarily if they do not create pilot-user confusion:
- some package names
- some internal service/container/module names
- upstream repo-derived technical naming where external users do not see it directly

---

## 5. What this does *not* mean

This decision does **not** mean:
- upstream branding should remain everywhere forever
- no future Givebettr rebrand is allowed
- developer-facing identity should permanently remain `postiz`
- customer-facing copy should never become Givebettr-specific

It only means:
- **the first downstream branding step should be minimization, not full replacement**

A later full rebrand can still happen once the product posture is more settled.

---

## 6. Conditions for revisiting a full rebrand later

Revisit a full downstream rebrand after most of the following are true:
- staging environment exists and is working
- pilot onboarding flow is stable
- branding-sensitive customer surfaces have been identified through real use
- commercialization posture is more mature
- final product naming is more confident
- support/docs destination strategy is defined
- decision is made on extension/mobile/developer-surface identity

Until then, a minimization-first path is the more disciplined choice.

---

## 7. Final recommendation

For `postiz-givebettr` right now:

> **Choose brand removal / minimization as the current downstream branding strategy.**
>
> Do **not** launch into a full Givebettr-wide rename yet.
>
> Reduce the most confusing customer-visible upstream branding first, preserve flexibility on deeper naming surfaces, and revisit full rebrand decisions later once staging and product direction are more mature.

---

## 8. No-change action log

This memo is decision/reference only.

Intentionally not done here:
- no search/replace
- no package renames
- no UI string changes
- no domain substitutions
- no extension/mobile naming changes
- no translation rewrite
