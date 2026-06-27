# Givebettr Interactive QA Findings

> Date: 2026-06-27
> Scope: unauthenticated interactive browser testing on the live production lane at `https://post.givebettr.com`
> Status: first-pass findings log for production auth-surface and unauthenticated provider-entry behavior.

## Executive summary
A focused unauthenticated browser pass on live production found the core auth screens rendering correctly and validating inputs without browser-console errors. The main user-facing issue is that the unauthenticated `/provider/add` redirect target (`/auth/login-required`) is a dead-end overlay page with no clickable recovery path back to login.

## Environment verified during this pass
- live host: `post.givebettr.com`
- runtime image: `ghcr.io/mrfreepress/postiz-app:givebettr-prod-2026-06-27-fa1741d7`
- app container: `postiz`
- container health: `healthy`

## Flows tested
- `/auth/login` page render
- empty submit on `/auth/login`
- `/auth/forgot` page render
- empty submit on `/auth/forgot`
- unauthenticated redirect from `/provider/add`
- browser console checks during tested flows

## Verified good behavior
- `/auth/login` renders the downstream `givebettr` branding and invite-only copy.
- Empty login submit shows field validation messages:
  - `email must be an email`
  - `password must be longer than or equal to 3 characters`
- `/auth/forgot` renders correctly.
- Empty forgot-password submit shows field validation:
  - `email must be an email`
- Unauthenticated `/provider/add` no longer exposes the earlier broken provider grid and instead redirects to `/auth/login-required`.
- No browser-console JavaScript errors surfaced during the tested unauthenticated flows.

## Findings

### 1. `/auth/login-required` is a dead-end page
- **Severity:** Medium
- **Category:** UX / functional polish
- **URL:** `https://post.givebettr.com/auth/login-required`

#### Observed behavior
After redirecting from unauthenticated `/provider/add`, the user sees an overlay message:
- `Login to use the wizard to generate API code`

However, the page exposes no interactive recovery path:
- no login button
- no link back to `/auth/login`
- no dismiss/back action
- browser accessibility snapshot reported `element_count: 0`

#### Expected behavior
The page should provide at least one clear next action, such as:
- `Log in`
- `Go back to login`
- `Back`

#### Actual behavior
The page is visually rendered but functionally stranded; the user is told to log in without being given a direct way to do so.

#### Suggested fix
Add at least one prominent CTA linking to `/auth/login`, and optionally a secondary action back to a safer public route.

### 2. `/auth/login-required` has no document title
- **Severity:** Low
- **Category:** Content / UX polish
- **URL:** `https://post.givebettr.com/auth/login-required`

#### Observed behavior
The page renders content, but `document.title` is blank.

#### Expected behavior
The page should set an explicit title, for example:
- `Login required`
- `Sign in required`

#### Actual behavior
Browser title/tab context is empty, which is a minor polish/usability issue.

## Testing notes
- This pass covered only unauthenticated interactive behavior.
- No authenticated flows were exercised in this pass.
- No provider OAuth handshake was exercised from an authenticated session.
- No billing/admin paths were tested here.

## Recommended next actions
1. Fix `/auth/login-required` so it includes a clear login CTA.
2. Add a document title for `/auth/login-required`.
3. Re-run this unauthenticated pass after the page is fixed.
4. Follow with an authenticated interactive pass covering one provider connect flow and one operator-critical path.
