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

### What is still missing for production readiness
- There is not yet one canonical production deploy runbook covering:
  - release candidate selection
  - build/publish path
  - server update path
  - on-host verification
  - rollback
- The production shipping path is still split across repo defaults, host-specific operator knowledge, and ad hoc session continuity.
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
  - **No**

- **Rollback path is documented and tested**
  - **No**

- **Release candidate commit/tag selection process is explicit**
  - **No**

## Recommended next P0 actions
1. Write the canonical deploy runbook for downstream production.
2. Define release candidate selection rules:
   - branch/tag source
   - image naming/tagging convention
   - verification steps after deploy
3. Add a rollback section that includes:
   - image re-pin/redeploy
   - post-rollback smoke checks
4. Link the final runbook from the production-readiness checklist and execution plan.

## Bottom line
The downstream fork is no longer obviously blocked by upstream image identity in the repo defaults, which is a real improvement. But the **production deploy path is still not explicit enough to call this P0 area complete**. The next concrete blocker to clear is the canonical production deploy/rollback runbook.
