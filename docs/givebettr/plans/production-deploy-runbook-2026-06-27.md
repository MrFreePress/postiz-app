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

> This section describes the intended production pattern. Replace placeholder production paths/hostnames only when the final production lane is chosen.

### Canonical compose rule
The production compose file should stay env-driven:

```yaml
image: ${POSTIZ_IMAGE:-ghcr.io/mrfreepress/postiz-app:latest}
```

### Canonical env split
Use the same split now proven on the dev lane:
- `.env` = **Compose interpolation** values, including `POSTIZ_IMAGE=`
- app env file (for example `postiz.env`) = **runtime container environment** loaded via `env_file:`

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
Run the minimum route checks for the candidate:
- [ ] `/`
- [ ] `/auth`
- [ ] `/auth/login`
- [ ] `/auth/forgot`
- [ ] registration policy behavior
- [ ] one approved provider or operator-critical path as appropriate

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

## 7. Open items still needed to finalize this runbook
This runbook still needs the final production-specific values filled in:
- production hostname
- production runtime directory
- production compose file path
- production app env filename
- production container name
- production smoke pack final scope

Until those are filled in, this runbook is the **canonical process shape**, but not the final production-instance worksheet.

---

## 8. Completion criterion for this P0 item
You can mark the deploy-path part of P0 substantially complete when:
- this runbook is accepted as canonical
- the production-specific placeholders are filled in
- one tagged deploy is executed using this exact flow
- the corresponding rollback procedure is documented and rehearsed
