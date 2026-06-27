# Givebettr Production Rollback Procedure

> Date: 2026-06-27
> Scope: downstream production rollback procedure paired with the canonical deploy runbook.
> Status: template/procedure draft grounded in the verified downstream image and compose model.

## Purpose
This procedure defines how to roll back a bad production release quickly and verify that rollback actually succeeded.

Use it when any of the following happen after deploy:
- auth/onboarding posture is wrong on the live lane
- provider/OAuth flows regress
- billing or operator-critical routes fail
- app container starts but public behavior is clearly stale/broken
- logs show hard startup/runtime failures after a production candidate rollout

---

## 1. Rollback principle
Rollback is an **image re-pin + recreate + verification** operation.

Do not improvise by editing many settings at once.
The rollback target should be the **last known good release image tag**.

---

## 2. Prerequisites
Before any production deploy, record all of the following so rollback is possible under pressure:
- previous good image tag
- new candidate image tag
- production runtime path
- compose interpolation `.env` path
- app runtime env file path
- app container name
- minimum public smoke pack

If those are missing, stop and collect them before declaring the deployment process production-ready.

---

## 3. Canonical rollback target
The rollback target should be a **specific previously verified image tag**, for example:
- `ghcr.io/mrfreepress/postiz-app:v0.1.0`

Do not prefer `latest` for rollback unless there is no better audited target.
A rollback should be reproducible and audit-friendly.

---

## 4. Rollback sequence

### Step 1 — identify the last known good image
Record:
- bad/current image tag
- rollback target image tag
- time rollback started
- reason for rollback

### Step 2 — update only the compose-interpolation image tag
In the production runtime directory:

```bash
cd /path/to/production/runtime

cat > .env <<'EOF'
POSTIZ_IMAGE=ghcr.io/mrfreepress/postiz-app:<last-known-good-tag>
EOF
```

### Step 3 — inspect resolved config before restart
```bash
docker compose config | sed -n '1,40p'
```

Verify the app service resolves to the intended rollback image.

### Step 4 — recreate the runtime
```bash
docker compose up -d
```

### Step 5 — verify the running container image directly
```bash
docker inspect -f '{{.Config.Image}} {{.State.StartedAt}} {{.State.Health.Status}}' <app-container-name>
```

Expected outcome:
- running image matches the rollback target
- started-at timestamp reflects the rollback event
- health becomes healthy in the expected window

### Step 6 — inspect recent logs
```bash
docker logs --tail 120 <app-container-name>
```

Check for hard startup or runtime failures.

### Step 7 — run the minimum public rollback smoke pack
At minimum:
- `/`
- `/auth`
- `/auth/login`
- `/auth/forgot`
- registration policy route behavior
- one previously known-good provider or operator-critical route

### Step 8 — declare rollback outcome
A rollback is complete only if:
- running image is the rollback target
- app is healthy
- smoke checks pass
- the user-visible regression is gone

---

## 5. When rollback is mandatory
Rollback should be treated as mandatory if any of these are true after deploy:
- public auth posture is wrong
- registration unexpectedly opens/closes
- login or forgot-password fails on the live lane
- approved provider/OAuth flow regresses
- billing/customer-impacting path is broken
- app health or logs show hard failures that are not clearly transient

---

## 6. When to pause instead of rolling back immediately
Pause and diagnose first only if:
- failure is clearly isolated to a non-launch-critical deferred feature
- the public/customer-facing launch posture is unchanged
- logs show a harmless warning rather than a service failure
- there is strong evidence the issue is external and transient

If uncertain, prefer rollback.

---

## 7. Evidence to record after rollback
For every rollback, record:
- rollback timestamp
- bad image tag
- restored image tag
- reason for rollback
- host/container verification output
- smoke-check result
- whether a follow-up hotfix is required

---

## 8. Common rollback pitfalls

### Pitfall 1 — changing the wrong env file
If Compose interpolation uses `.env`, changing only the app runtime `env_file` will not move the image.

### Pitfall 2 — assuming `compose up -d` means success
Always inspect the running image directly.

### Pitfall 3 — rolling back to `latest`
A mutable tag is a poor rollback anchor. Prefer a specific audited image tag.

### Pitfall 4 — stopping after container health only
A healthy container is not enough. Public smoke checks must also pass.

---

## 9. Completion criterion for the rollback P0 item
You can mark rollback readiness substantially complete when:
- this procedure is accepted as canonical
- production-specific paths/container names are filled in
- one dry-run or real rollback rehearsal is executed against a safe lane
- the paired production deploy runbook and this rollback procedure are linked from the production-readiness docs
