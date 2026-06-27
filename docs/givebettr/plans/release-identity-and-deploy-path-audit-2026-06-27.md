# Givebettr Release Identity and Deploy-Path Audit

> Date: 2026-06-27
> Purpose: first-pass P0 audit of the downstream shipping path before any production launch claim.

## Executive summary
The downstream fork now has a verified downstream production path: the live production lane is normalized to the canonical `.env` + app `env_file` shape, production is running the downstream GHCR image `ghcr.io/mrfreepress/postiz-app:givebettr-prod-2026-06-27-fa1741d7`, and the public smoke pack is passing. The remaining gap is no longer release-source repeatability; it is mostly operator polish, especially documenting the warmup window before early `/` or `/auth` failures should be treated as a bad deploy.

### What is already good
- The downstream GitHub fork is authoritative for current work:
  - `origin = https://github.com/MrFreePress/postiz-app.git`
- The repo's main compose default already points at downstream GHCR identity:
  - `ghcr.io/mrfreepress/postiz-app:latest`
- The container build workflow derives the GHCR repo from `github.repository_owner`, so tags pushed from Derek's fork publish to the downstream namespace automatically.
- The current dev lane is running a locally built host image (`postiz-givebettr-dev:5ce513f6`) and no longer depends on the stale hardcoded compose image tag pattern.
- The live production lane is now normalized on-host to the canonical split:
  - compose interpolation: `/opt/postiz/live/.env`
  - app runtime env: `/opt/postiz/live/postiz.env`
  - current verified live image: `ghcr.io/mrfreepress/postiz-app:givebettr-prod-2026-06-27-fa1741d7`
- Canonical downstream deploy and rollback runbooks now exist:
  - `docs/givebettr/plans/production-deploy-runbook-2026-06-27.md`
  - `docs/givebettr/plans/production-rollback-procedure-2026-06-27.md`

### What is still missing for production readiness
- Live production is now running the registry-backed downstream image:
  - `ghcr.io/mrfreepress/postiz-app:givebettr-prod-2026-06-27-fa1741d7`
- The important operator nuance discovered during cutover is startup timing, not image invalidity:
  - early checks saw transient `502`/`500` responses while frontend was up before backend finished booting
  - isolated timed repro showed `/auth` becoming healthy at roughly the 30-second mark
  - deploy/rollback runbooks should therefore treat the first ~45 seconds as warmup, not as final release verdict
- Local helper scripts under `var/docker/` still describe localhost/devcontainer behavior only and are not a production operator story.
- Some repo docs still contain upstream/non-downstream references, but they are not currently the canonical shipping path.

## Audited artifacts

### 1. GitHub Actions container publishing
**File:** `.github/workflows/build-containers.yml`

#### Verified behavior
- Workflow triggers on tag push or manual dispatch.
- Image repo is computed dynamically:
  - `ghcr.io/${OWNER_LOWER}/postiz-app`
- For Derek's fork, this resolves to:
  - `ghcr.io/mrfreepress/postiz-app`
- Manifest publishing also uses the same computed downstream repo.

#### Assessment
- **Good for downstream identity**
- This removes the earlier upstream-namespace blocker for tagged container publishing from the fork.

### 2. Main compose file
**File:** `docker-compose.yaml`

#### Verified behavior
- App image default is:
  - `${POSTIZ_IMAGE:-ghcr.io/mrfreepress/postiz-app:latest}`

#### Assessment
- **Good for downstream default identity**
- This is appropriate as a generic downstream compose default.

### 3. Host-side dev deployment pattern
**Observed live host pattern**
- Current dev lane compose file uses env-driven app image selection.
- Compose interpolation now comes from:
  - `/opt/postiz-dev/live/.env`
- App runtime env comes from:
  - `/opt/postiz-dev/live/postiz-dev.env`
- Current compose project is normalized on-host as:
  - `postiz-dev-live`

#### Assessment
- **Operationally improved**, but still host-specific.
- This should be written up as a canonical deploy procedure before production launch.

### 4. Local helper scripts
**Files:**
- `var/docker/docker-build.sh`
- `var/docker/docker-create.sh`

#### Verified behavior
- These use localhost/dev helper image names such as:
  - `localhost/postiz`
  - `localhost/postiz-devcontainer`
- They create a local container named `postiz` and expose dev ports.

#### Assessment
- **Not production deploy artifacts**
- Acceptable as local helper scripts, but they do not satisfy the canonical production deploy-path requirement.

## Current conclusion by P0 checklist item

### P0: Release identity and deployment path
- **Production deployment artifacts reference downstream identity only**
  - **Yes**
  - Repo defaults point downstream, the live compose shape is normalized, and the verified production runtime is now on the downstream GHCR tag `ghcr.io/mrfreepress/postiz-app:givebettr-prod-2026-06-27-fa1741d7`.

- **No required production operator step depends on upstream image namespaces or upstream repo ownership**
  - **Yes**
  - The verified publish/deploy path now runs through Derek's fork, downstream GHCR namespace, and the normalized `/opt/postiz/live` runtime.

- **Canonical deploy path is documented end-to-end**
  - **Yes**
  - Deploy and rollback runbooks exist and the live production lane now uses the documented `.env` + `postiz.env` split.

- **Rollback path is documented and tested**
  - **Documented yes, lightly exercised**

- **Release candidate commit/tag selection process is explicit**
  - **Yes**

## Recommended next P0 actions
1. Add explicit warmup timing guidance to all deploy checklists so operators do not misclassify the first ~45 seconds of a healthy cutover as a bad release.
2. Capture one clean rollback rehearsal that changes only `POSTIZ_IMAGE=` in `/opt/postiz/live/.env`, waits through the warmup window, and verifies the smoke pack.
3. Continue pruning stale upstream/non-downstream references in non-canonical docs as time allows.
4. Link future tagged release worksheets back into these production-readiness docs.

## Bottom line
The downstream fork now has a verified downstream production path: the live host is normalized to the documented `.env` + `postiz.env` pattern, the production runtime is on the downstream GHCR image `ghcr.io/mrfreepress/postiz-app:givebettr-prod-2026-06-27-fa1741d7`, and the public smoke pack is passing. The main remaining work is operator hardening — especially codifying warmup-aware verification and rehearsing rollback using only `POSTIZ_IMAGE=` rotation.
