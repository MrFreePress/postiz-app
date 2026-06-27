# Givebettr Release Identity and Deploy-Path Audit

> Date: 2026-06-27
> Purpose: first-pass P0 audit of the downstream shipping path before any production launch claim.

## Executive summary
The downstream fork is now materially closer to a coherent production release story: the live production lane has been normalized to the canonical `.env` + app `env_file` shape and redeployed onto the current application code baseline. The remaining gap is making the image source fully repeatable through an exercised downstream GHCR-tag workflow rather than the currently working host-local production tag.

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
  - current verified live image: `postiz-givebettr-prod:5ce513f6`
- Canonical downstream deploy and rollback runbooks now exist:
  - `docs/givebettr/plans/production-deploy-runbook-2026-06-27.md`
  - `docs/givebettr/plans/production-rollback-procedure-2026-06-27.md`

### What is still missing for production readiness
- The current live production image is working and downstream-coded, but it is still a host-local tag:
  - `postiz-givebettr-prod:5ce513f6`
- The GHCR-backed downstream publish lane has now been exercised successfully, but the published image still failed when promoted to live production:
  - published tag: `ghcr.io/mrfreepress/postiz-app:givebettr-prod-2026-06-27-fa1741d7`
  - observed live failure after cutover: public `/` and `/auth` returned HTTP 500 with frontend logs showing `ECONNREFUSED 127.0.0.1:3000`
- The next release-path gap is therefore runtime validity of the published GHCR image on the production host, not package publication alone.
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
  - **Mostly yes, with one remaining runtime caveat**
  - Repo defaults and live compose shape now point downstream, but the current verified production image is still a host-local tag rather than a GHCR-pulled downstream tag.

- **No required production operator step depends on upstream image namespaces or upstream repo ownership**
  - **Now mostly yes**
  - The live compose no longer depends on upstream image namespaces; the remaining work is proving the downstream GHCR publish lane as the normal source of release images.

- **Canonical deploy path is documented end-to-end**
  - **Yes, and now matched by the live compose shape**
  - Deploy and rollback runbooks exist and the live production lane now uses the documented `.env` + `postiz.env` split.

- **Rollback path is documented and tested**
  - **Documented yes, partially exercised**

- **Release candidate commit/tag selection process is explicit**
  - **Yes**

## Recommended next P0 actions
1. Exercise the downstream GHCR publish lane end-to-end and verify a registry-backed production image can replace the current host-local production tag.
2. Capture one verified tagged downstream image deploy using the normalized `/opt/postiz/live` runbook path.
3. Rehearse rollback by changing only `POSTIZ_IMAGE=` in `/opt/postiz/live/.env` on a safe lane or maintenance window.
4. Link any resulting registry-backed release worksheet updates back into the production-readiness docs.

## Bottom line
The downstream fork is no longer blocked by upstream image identity on the live host, and the production compose shape is now normalized to the documented downstream pattern. P0 for deployment path is materially further along: the live lane has been updated and verified, but execution-complete release hardening still requires one fully exercised GHCR-backed tagged downstream release so the image source becomes as repeatable as the now-canonical host layout.
