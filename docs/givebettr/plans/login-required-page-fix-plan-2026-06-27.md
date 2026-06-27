# Login-Required Page Fix Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Replace the current dead-end `/auth/login-required` page with a usable downstream-branded recovery screen that gives unauthenticated users a clear path back to login and sets proper page metadata.

**Architecture:** Keep the existing proxy redirect behavior for unauthenticated `/provider/*` and `/modal/*` access, but make the destination page a first-class auth surface instead of a full-screen text overlay. Reuse existing auth-page patterns already present in the frontend so the new page matches the rest of the Givebettr experience and remains low-risk.

**Tech Stack:** Next.js app router, TypeScript, existing frontend auth components, existing `Button` and `Link` patterns, root-level `pnpm` validation.

---

## Repo/context snapshot
- Current redirect logic lives in: `apps/frontend/src/proxy.ts`
- Current dead-end page lives in: `apps/frontend/src/app/(app)/auth/login-required/page.tsx`
- Existing auth metadata examples:
  - `apps/frontend/src/app/(app)/auth/page.tsx`
  - `apps/frontend/src/app/(app)/auth/login/page.tsx`
  - `apps/frontend/src/app/(app)/auth/forgot/page.tsx`
- Existing auth CTA pattern example:
  - `apps/frontend/src/components/auth/forgot.tsx`
- QA findings source:
  - `docs/givebettr/plans/interactive-qa-findings-2026-06-27.md`

## Acceptance criteria
- `/auth/login-required` sets a non-empty document title.
- `/auth/login-required` contains at least one obvious CTA to `/auth/login`.
- The page remains readable and on-brand in the current auth layout.
- Unauthenticated `/provider/add` still redirects to `/auth/login-required`.
- Browser accessibility snapshot for `/auth/login-required` includes clickable elements.
- No new console errors appear on the page.

## Out of scope
- Changing the redirect rule away from `/auth/login-required`
- Auth flow redesign beyond this page
- Provider OAuth implementation changes
- Billing/admin/authenticated-path work

---

### Task 1: Record the exact intended user journey

**Objective:** Freeze the behavioral contract before touching code.

**Files:**
- Reference: `docs/givebettr/plans/interactive-qa-findings-2026-06-27.md`
- Reference: `apps/frontend/src/proxy.ts`
- Create/modify during implementation only if needed: `docs/givebettr/plans/login-required-page-fix-plan-2026-06-27.md`

**Step 1: Confirm the current redirect source**

Read and note the two current guards in `apps/frontend/src/proxy.ts`:
- `/modal/*` unauthenticated → `/auth/login-required`
- `/provider/*` unauthenticated → `/auth/login-required`

**Step 2: Freeze the desired page outcome**

The replacement page should provide:
- one primary CTA to `/auth/login`
- optional secondary text/action back to a safer public route
- contextual copy explaining why login is required
- a proper title such as `Login required`

**Step 3: Verify this task is complete**

Check that the implementer can answer all of these without guessing:
- what path redirects here?
- what must the user be able to do next?
- what is explicitly out of scope?

**Step 4: Commit**

No commit required for planning-only alignment.

---

### Task 2: Replace the dead-end overlay with a real auth recovery screen

**Objective:** Turn `page.tsx` from a bare overlay string into a usable, styled auth page.

**Files:**
- Modify: `apps/frontend/src/app/(app)/auth/login-required/page.tsx`
- Reference: `apps/frontend/src/components/auth/forgot.tsx`
- Reference: `apps/frontend/src/app/(app)/auth/page.tsx`

**Step 1: Write the intended page structure before coding**

Target structure:
- exported metadata with title
- heading like `Login required`
- short explanatory body copy
- primary CTA link/button to `/auth/login`
- optional secondary text link
- no full-screen fixed overlay trapping the user with no action

**Step 2: Implement the minimal server-page version**

Use the simplest safe approach:
- keep it as a page component in `page.tsx`
- import `Metadata` from `next`
- import `Link` from `next/link`
- optionally import `Button` from `@gitroom/react/form/button` only if it integrates cleanly in this page; otherwise use a styled `Link` matching nearby auth patterns

Recommended metadata:
```ts
export const metadata: Metadata = {
  title: 'Login required',
  description: '',
};
```

Recommended content shape:
- wrapper consistent with existing auth-page content width
- heading: `Login required`
- body: explain that login is required before using the wizard/provider flow
- CTA: `Go to login` or `Log in`
- secondary link: `Go back to access page` or direct `/auth`

**Step 3: Keep copy downstream-safe**

Do not mention upstream product identity.
Use downstream wording like:
- `Login required`
- `Please sign in to continue using this workflow.`
- `Go to login`

**Step 4: Verify visually in code review**

Make sure the new markup includes:
- at least one anchor/link element
- no `fixed left-0 top-0 w-full h-full` full-screen dead-end overlay unless it still includes CTAs and is intentionally retained

**Step 5: Commit**

```bash
git add apps/frontend/src/app/(app)/auth/login-required/page.tsx
git commit -m "fix: add recovery CTA to login-required page"
```

---

### Task 3: Preserve redirect behavior while improving usability

**Objective:** Ensure the fix does not accidentally change the guarded-route behavior.

**Files:**
- Verify only: `apps/frontend/src/proxy.ts`

**Step 1: Confirm no redirect logic changes are needed**

Leave these behaviors intact unless a new product decision says otherwise:
- unauthenticated `/provider/*` → `/auth/login-required`
- unauthenticated `/modal/*` → `/auth/login-required`

**Step 2: Verify path compatibility**

The improved page must work correctly whether the source was:
- `/provider/add`
- some future `/provider/*` route
- `/modal/*`

**Step 3: If adding source-aware copy, keep it minimal**

If the implementer chooses to add source-sensitive text later, that should be a separate follow-up. Do not expand scope in this fix.

**Step 4: Commit**

No separate commit if no code changed.

---

### Task 4: Validate metadata, interactivity, and no-regression behavior

**Objective:** Prove the fix closes both QA findings.

**Files:**
- Verify: `apps/frontend/src/app/(app)/auth/login-required/page.tsx`
- Reference: `docs/givebettr/plans/interactive-qa-findings-2026-06-27.md`

**Step 1: Run project validation from repo root**

Run:
```bash
cd /home/mrfreepress/projects/postiz-givebettr
pnpm build
```

Expected:
- build completes successfully

**Step 2: Re-run targeted interactive checks**

Re-verify in browser:
- navigate to `/provider/add` while unauthenticated
- confirm redirect still lands on `/auth/login-required`
- confirm the page visibly contains a login CTA
- confirm the CTA navigates to `/auth/login`
- confirm `document.title` is no longer blank
- confirm no new browser console errors

**Step 3: Confirm acceptance criteria one by one**

Checklist:
- [ ] non-empty page title
- [ ] clickable login CTA exists
- [ ] page is not a dead-end
- [ ] redirect source still works
- [ ] no new console errors

**Step 4: Commit if validation required small polish changes**

```bash
git add apps/frontend/src/app/(app)/auth/login-required/page.tsx
git commit -m "test: verify login-required auth recovery flow"
```

---

### Task 5: Update QA/readiness docs after the fix lands

**Objective:** Keep the current findings docs truthful once the issue is resolved.

**Files:**
- Modify: `docs/givebettr/plans/interactive-qa-findings-2026-06-27.md`
- Modify: `docs/givebettr/plans/production-readiness-checklist-2026-06-27.md`

**Step 1: Update the findings doc**

Change the current issue status from open to resolved or add a follow-up note stating:
- the page now has a login CTA
- the page now has a title
- the issue was re-tested successfully

**Step 2: Update the readiness checklist**

If re-testing passes, remove or mark resolved the blocker:
- unauthenticated `/provider/add` landing page is a dead-end overlay

**Step 3: Push docs with the code change**

```bash
git add docs/givebettr/plans/interactive-qa-findings-2026-06-27.md docs/givebettr/plans/production-readiness-checklist-2026-06-27.md
git commit -m "docs: close login-required QA findings"
```

---

## Verification commands

Run from repo root:
```bash
cd /home/mrfreepress/projects/postiz-givebettr
pnpm build
```

Browser verification checklist:
- unauthenticated `/provider/add` redirects to `/auth/login-required`
- `/auth/login-required` shows usable copy and CTA
- CTA reaches `/auth/login`
- page title is set
- no console errors

## Risks / pitfalls
- Do not accidentally change proxy redirect rules while only fixing page UX.
- Do not introduce upstream-branded copy.
- Do not solve this by redirecting straight to `/auth/login` unless there is an explicit product decision to remove the intermediate page.
- Do not use a visually polished but non-clickable CTA; the key failure today is lack of actionability.

## Suggested implementation order
1. Fix `page.tsx`
2. Build locally
3. Re-test in browser
4. Update findings/readiness docs
5. Push

## Definition of done
The fix is complete when:
- `/auth/login-required` has a title
- `/auth/login-required` provides a direct login path
- the redirect from `/provider/add` still works
- browser retest shows no dead-end UX
- QA docs are updated to reflect the resolved state
