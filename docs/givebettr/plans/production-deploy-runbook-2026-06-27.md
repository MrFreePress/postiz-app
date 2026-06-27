# Givebettr Canonical Production Deploy Runbook

> Date: 2026-06-27
> Scope: canonical downstream production deploy path for the Givebettr fork.
> Status: runbook drafted from verified repo/runtime state; use as the authoritative baseline for completing the P0 deploy-path requirement.

## Purpose
This runbook defines the **intended production deployment path** for the downstream Givebettr fork so operators do not have to infer behavior from ad hoc host history.

It is written to answer five questions explicitly:
1. What qualifies as a release candidate?
2. How is the release image built/published?
3. How is the host updated?
4. How is the deploy verified on-host and publicly?
5. How do we know the deploy is the intended one?

---

## 1. Preconditions

Before using this runbook, confirm all of the following:
- downstream repo checkout exists locally
- correct remotes are configured
  - `origin` = `https://github.com/MrFreePress/postiz-app.git`
  - `upstream` = `https://github.com/gitroomhq/postiz-app.git`
- the target release commit has already passed the required local validation for the affected surface
- the production host/runtime paths are known and intentionally separate from dev
- the operator has the required GitHub/registry and host access

---

## 2. Release candidate rule

### Canonical rule
Use a **specific tagged commit from `origin/main`** as the production release candidate.

### Why
This aligns with the verified container workflow:
- `.github/workflows/build-containers.yml` builds on tag push
- image repo is derived from the repo owner
- for Derek's fork, published images land under:
  - `ghcr.io/mrfreepress/postiz-app`

### Release candidate checklist
Before tagging:
- [ ] target commit is on `origin/main`
- [ ] required local builds/tests for touched surfaces passed
- [ ] release notes / operator notes are updated
- [ ] no unresolved P0 blocker remains for the intended launch scope

### Suggested tag format
Use a predictable production tag, for example:
- `v0.1.0`
- `v0.1.1`
- `v2026.06.27-1`

Pick one scheme and keep it consistent.

---

## 3. Build/publish path

### Source of truth
**File:** `.github/workflows/build-containers.yml`

### Verified behavior
When a tag is pushed:
- the workflow builds multi-arch images from `Dockerfile.dev`
- image repo resolves to:
  - `ghcr.io/${owner_lower}/postiz-app`
- for Derek's fork this becomes:
  - `ghcr.io/mrfreepress/postiz-app`
- versioned and `latest` manifests are pushed

### Operator steps
From the downstream repo checkout:

```bash
cd /home/mrfreepress/projects/postiz-givebettr
git checkout main
git pull --ff-only origin main
git tag <release-tag>
git push origin <release-tag>
```

### Expected result
GitHub Actions publishes:
- `ghcr.io/mrfreepress/postiz-app:<release-tag>`
- `ghcr.io/mrfreepress/postiz-app:latest`

### Post-publish verification
Verify the workflow finished successfully in GitHub Actions before touching the host.

---

## 4. Host update path

### Verified current live production lane (2026-06-27 audit)
- production hostname: `post.givebettr.com`
- production runtime directory: `/opt/postiz/live`
- production compose file path: `/opt/postiz/live/docker-compose.yaml`
- production app container name: `postiz`
- public proxy target: `127.0.0.1:4007`

### Verified current normalized production shape (2026-06-27 deploy)
The live production compose file is now normalized to the preferred downstream env-driven pattern.

Verified on-host:
- `/opt/postiz/live/docker-compose.yaml` now uses:
  - `image: ${POSTIZ_IMAGE:-ghcr.io/mrfreepress/postiz-app:latest}`
- compose interpolation now comes from:
  - `/opt/postiz/live/.env`
- runtime app variables now come from:
  - `/opt/postiz/live/postiz.env`
- the live container was redeployed on 2026-06-27 with:
  - `postiz-givebettr-prod:5ce513f6`

Important nuance:
- the current live runtime is normalized to the canonical *shape*, but the deployed image is still a host-local image tag rather than a GHCR-pulled downstream tag
- this was acceptable for the immediate production update because commits after `5ce513f6` on `main` were documentation-only and did not change application code

### Canonical compose rule
The production compose file should stay env-driven:

```yaml
image: ${POSTIZ_IMAGE:-ghcr.io/mrfreepress/postiz-app:latest}
```

### Canonical env split
Use the same split now proven on the dev lane:
- `.env` = **Compose interpolation** values, including `POSTIZ_IMAGE=`
- app env file (for example `postiz.env`) = **runtime container environment** loaded via `env_file:`

### One-time production normalization status
This normalization step is now complete on the live lane:
- runtime remains `/opt/postiz/live`
- compose file remains `/opt/postiz/live/docker-compose.yaml`
- image selection now lives in `/opt/postiz/live/.env`
- runtime app variables now live in `/opt/postiz/live/postiz.env`
- container identity remains `postiz`

Future production deploys should preserve this split and rotate only `POSTIZ_IMAGE=` for normal image changes.

### Host update sequence
1. SSH to the host
2. change only `POSTIZ_IMAGE=` in the compose-interpolation `.env`
3. pull/recreate the app with Docker Compose
4. verify the running container image and start time
5. run public smoke checks

### Generic host commands
```bash
cd /path/to/production/runtime

# 1) point runtime at the intended image tag
cat > .env <<'EOF'
POSTIZ_IMAGE=ghcr.io/mrfreepress/postiz-app:<release-tag>
EOF

# 2) inspect resolved config before restart
docker compose config | sed -n '1,40p'

# 3) recreate runtime
docker compose up -d

# 4) verify running image
docker inspect -f '{{.Config.Image}} {{.State.StartedAt}}' <app-container-name>
```

### Important operator rule
Do **not** hand-edit the compose image line for normal deploys. Rotate only `POSTIZ_IMAGE=` in the compose-interpolation `.env`.

---

## 5. Required deploy verification

### On-host verification
After `docker compose up -d`, prove all of the following:
- [ ] resolved compose config points at the intended image tag
- [ ] running app container image matches the intended tag
- [ ] container start time changed during deploy
- [ ] container health is healthy (or becomes healthy within the expected window)
- [ ] recent logs show no hard startup failure

### Public verification
Run the minimum route checks for the candidate.

#### Final baseline public smoke pack for the current production lane
- [ ] `https://post.givebettr.com/`
- [ ] `https://post.givebettr.com/auth`
- [ ] `https://post.givebettr.com/auth/login`
- [ ] `https://post.givebettr.com/auth/forgot`
- [ ] `https://post.givebettr.com/terms`
- [ ] `https://post.givebettr.com/privacy`
- [ ] registration policy behavior matches intended posture

#### Current observed baseline after the 2026-06-27 production update
As of the verified redeploy to `postiz-givebettr-prod:5ce513f6`, these public routes were reachable and returned HTTP 200 with downstream-facing auth copy:
- `/` → `Access`
- `/auth` → `Access`
- `/auth/login` → `Log in`
- `/auth/forgot` → `Forgot password`
- `/terms` → `Access`
- `/privacy` → `Access`

Observed posture notes:
- unauthenticated `/auth` still shows public signup because live production currently has `DISABLE_REGISTRATION=false`
- `/auth/login` shows invite-only copy and renders the refreshed downstream branding/copy
- unauthenticated `/provider/add` now redirects to `/auth/login-required` rather than throwing the earlier client-side exception

### Evidence to record
For each production deploy, capture at least:
- release tag
- deployed image tag
- host/container verification output
- smoke-check outcome
- rollback image/tag if needed later

---

## 6. Known pitfalls

### Pitfall 1 — image tag changes in the wrong file
Changing the app runtime env file alone will not move the Docker image if Compose interpolation comes from `.env`.

### Pitfall 2 — successful build, stale runtime
A successful image build or publish does not prove the host is running it.
Always verify the running container image directly.

### Pitfall 3 — `latest` ambiguity
For production, prefer deploying a specific release tag first. Treat `latest` as a convenience tag, not the primary audit anchor.

### Pitfall 4 — repo docs vs host reality drift
If host paths, compose layout, or env split differ from this runbook, update the runbook after verifying the real change.

---

## 7. Production-specific values now verified
- production hostname: `post.givebettr.com`
- production runtime directory: `/opt/postiz/live`
- production compose file path: `/opt/postiz/live/docker-compose.yaml`
- production compose interpolation file: `/opt/postiz/live/.env`
- production app env filename: `/opt/postiz/live/postiz.env`
- production container name: `postiz`
- current verified live image after the 2026-06-27 update: `postiz-givebettr-prod:5ce513f6`
- production smoke pack final scope: `/`, `/auth`, `/auth/login`, `/auth/forgot`, `/terms`, `/privacy`, plus registration-policy verification and unauthenticated `/provider/add`

GHCR release-path note:
- the downstream GitHub Actions publish lane was successfully exercised for tag `givebettr-prod-2026-06-27-fa1741d7`
- the pushed GHCR image `ghcr.io/mrfreepress/postiz-app:givebettr-prod-2026-06-27-fa1741d7` built and published successfully
- however, promoting that image onto live production caused public `/` and `/auth` to return HTTP 500 while frontend logs showed `ECONNREFUSED 127.0.0.1:3000`
- production was rolled back immediately to the verified host-local image `postiz-givebettr-prod:5ce513f6`

The remaining open item is now narrower than simple GHCR publishing: diagnose why the successfully published GHCR image fails on the live host before using registry-backed images as the normal production source.

---

## 8. Completion criterion for this P0 item
You can mark the deploy-path part of P0 substantially complete when:
- this runbook is accepted as canonical
- the production-specific placeholders are filled in
- one tagged deploy is executed using this exact flow
- the corresponding rollback procedure is documented and rehearsed
