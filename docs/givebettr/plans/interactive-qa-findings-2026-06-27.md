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

## Additional authenticated AI findings (reported after live operator validation)

### Verified by live operator
- Composer/chat assistant successfully converses in the live app.
- `/agents` successfully converses in the live app.

### New issues to validate

#### 3. Posts appear not to publish live after creation / `Post now`
- **Severity:** High
- **Category:** Core publishing verification / cross-platform delivery

**Observed behavior**
- A post was requested via `/agents`, but no corresponding post was observed appearing live.
- In another flow, an image was attached and `Post now` was clicked, but no matching live post was found on the destination platform.

**Why this matters**
- This is broader than the agents surface.
- The whole platform needs validation that a post transitions from app UI intent to real external-platform publication.

**Required follow-up**
- Validate publishing across the platform, not just from `/agents`.
- Trace post state from creation → queued/scheduled/immediate dispatch → external platform confirmation.
- Confirm whether the issue is dispatch failure, channel/provider failure, delayed publish, or user-surface confusion.

#### 4. AI image flow produced a white-box saved asset in one path
- **Severity:** Medium
- **Category:** Media pipeline / UX reliability

**Observed behavior**
- One AI image flow produced a white-box saved asset instead of the expected generated dog image.
- A separate AI image-generation path did transfer an image into the post successfully.
- The operator suspects there may also have been a process mistake during the failed attempt.

**Interpretation**
- This may be a user-process issue, a save/upload pipeline issue, or a generation-to-post transfer issue.
- It needs a controlled reproduction before concluding it is a platform defect.

**Required follow-up**
- Reproduce both the failing and successful image paths.
- Verify whether the bad artifact is generated upstream, corrupted during upload/save, or mishandled when inserted into the post.
- Pair this with live publish validation because the same session also failed to produce an observed live post.

#### 5. Video-generation UI is not visible even though video providers exist in code
- **Severity:** Medium
- **Category:** Feature discoverability / gating mismatch

**Observed behavior**
- The operator could not locate any create/generate video entry in the UI.
- `/agents` suggested menu items that are not present.
- When challenged, `/agents` guessed that permissions might be missing.

**Code-grounded findings**
- The frontend only renders `AiImage` and `AiVideo` controls when `user?.tier?.ai` is truthy in `apps/frontend/src/components/media/media.component.tsx`.
- The video control itself returns `null` if `/media/video-options` returns an empty list in `apps/frontend/src/components/launches/ai.video.tsx`.
- Backend video options come from `MediaService.getVideoOptions()` → `VideoManager.getAllVideos()` and are filtered to videos whose decorator metadata has `available: true`.
- Current code exposes two providers:
  - `veo3` — available only when `KIEAI_API_KEY` exists
  - `image-text-slides` — available only when `FAL_KEY` exists
- Self-hosting alone does **not** remove video generation from code. The more likely blockers are:
  1. the UI is only visible in the media toolbar context,
  2. the user tier / AI gating in the frontend,
  3. empty `/media/video-options` response at runtime,
  4. stale user/session/app state prior to the recent AI-key rollout.

**Current best hypothesis**
- The `/agents` explanation about “self-hosted usually doesn’t include it” is not supported by this codebase as the primary explanation.
- In this downstream self-hosted build, video is code-present but conditionally surfaced.

**Required follow-up**
- Inspect the live authenticated UI after the recent key rollout.
- Verify whether `user.tier.ai` is true in the live session.
- Verify whether `/media/video-options` returns `veo3` for the authenticated user.
- If the API returns a provider but the button is still absent, debug frontend rendering/state.

## Testing notes
- The initial documented pass covered only unauthenticated interactive behavior.
- Later operator validation confirmed authenticated assistant and `/agents` chat functionality.
- No end-to-end proof of successful live external-platform publication has yet been recorded.
- No controlled reproduction for the white-box image issue has yet been recorded.
- No authenticated browser evidence has yet been captured for the missing video UI after the latest key rollout.

## Recommended next actions
1. Fix `/auth/login-required` so it includes a clear login CTA.
2. Add a document title for `/auth/login-required`.
3. Validate live post delivery across the platform, especially `Post now` and agent-created posts.
4. Reproduce and isolate the white-box AI image path.
5. Run an authenticated browser/API check for video UI availability after the recent key rollout.
6. Re-run the earlier unauthenticated pass after the login-required page is fixed.
