# Givebettr Release Identity and Deploy-Path Audit

> Date: 2026-06-27
> Purpose: first-pass P0 audit of the downstream shipping path before any production launch claim.

## Executive summary
The downstream fork is **closer** to a coherent release identity than it was earlier, but production deployment is **not yet fully formalized**.

### What is already good
- The downstream GitHub fork is authoritative for current work:
  - `origin = https://github.com/MrFreePress/postiz-app.git`
- The repo's main compose default already points at downstream GHCR identity:
  - `ghcr.io/mrfreepress/postiz-app:latest`
- The container build workflow derives the GHCR repo from `github.repository_owner`, so tags pushed from Derek's fork publish to the downstream namespace automatically.
- The current dev lane is running a locally built host image (`postiz-givebettr-dev:5ce513f6`) and no longer depends on the stale hardcoded compose image tag pattern.
- Canonical downstream deploy and rollback runbooks now exist:
  - `docs/givebettr/plans/production-deploy-runbook-2026-06-27.md`
  - `docs/givebettr/plans/production-rollback-procedure-2026-06-27.md`

### What is still missing for production readiness
- The current live production runtime at `/opt/postiz/live/docker-compose.yaml` still hardcodes the upstream app image:
  - `ghcr.io/gitroomhq/postiz-app:latest`
- The live production lane is not yet normalized to the canonical downstream env-driven deploy shape:
  - there is no `/opt/postiz/live/.env`
  - there is no dedicated production app `env_file`
  - runtime variables are still inline in compose
- The production shipping path is still split between the newly written runbooks and a legacy live host shape that does not yet match them.
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
  - **Partial / mostly yes**
  - Repo defaults for shipping now point downstream, but the full production path is not yet consolidated.

- **No required production operator step depends on upstream image namespaces or upstream repo ownership**
  - **Not yet proven**
  - Likely true for the current repo defaults, but this still needs a formal operator runbook.

- **Canonical deploy path is documented end-to-end**
  - **Yes, at the process level**
  - Deploy and rollback runbooks now exist, but the live production lane still needs normalization to match them exactly.

- **Rollback path is documented and tested**
  - **Documented yes, tested no**

- **Release candidate commit/tag selection process is explicit**
  - **Yes**

## Recommended next P0 actions
1. Normalize the live production lane at `/opt/postiz/live` to the canonical downstream env-driven shape:
   - move image selection to `/opt/postiz/live/.env`
   - move runtime variables to a dedicated production app env file
   - replace the hardcoded upstream image reference with downstream `POSTIZ_IMAGE`
2. Rehearse the normalized production update/rollback flow on a safe lane or maintenance window.
3. Capture one verified tagged downstream image deploy using the new runbook.
4. Link any resulting host-specific worksheet updates back into the production-readiness docs.

## Bottom line
The downstream fork is no longer obviously blocked by downstream image identity or missing process documentation. The remaining blocker is that the **live production host still runs a legacy upstream/hardcoded compose shape**. P0 for deployment path is now mostly documentation-complete, but not execution-complete until the live lane is normalized and one tagged downstream release is actually rehearsed or deployed with verification.
