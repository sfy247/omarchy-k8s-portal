---
tags: [kindell247, runbook]
updated: 2026-10-27
---

# Operations runbook

Back to [Home](index.md). Run `make` targets from `~/Documents/k8s-apps/omarchy-k8s-ansible`.

## Everyday commands

| I want to… | Run |
|---|---|
| Bring everything up / converge | `make deploy` |
| Rebuild everything from scratch | `make redeploy` |
| Ship app code changes | `make images` (or `ARGS="-e app_images_only=['hello-world/python']"`) |
| Check everything responds | `make verify` |
| Stop it all (free RAM) | `make teardown` |
| See what would change | `make check` |
| First run on a new machine | `make bootstrap` then `make deploy K=1` |
| Get the Argo CD password | `cat ~/.local/share/lab-secrets/kindell247/argocd-admin` |

kubectl contexts: `kind-mgmt` (hub), `kind-dev`, `kind-staging`, `kind-prod`.

## Common changes

### Add an app to an existing group

In `values.yaml` set `nameOverride`, `image.repository` (`hello-world-<app>`),
`image.tag`, and a **free** `service.nodePort` in 30001–30010. The playbook
fails early if two apps share a port.

### Add an app group

1. Create `apps/<group>/<app>/` folders.
2. Copy `environments/<env>/hello-world/` to `environments/<env>/<group>/` for
   each environment, and replace `hello-world` with the group name in both files.
3. Push, then `make images`.

### Turn on staging or prod

Edit `lab_enabled_environments` in `lab.yml`, e.g. `[dev, staging, prod]`, then
`make deploy`. The new cluster is created, registered, and Argo CD fills it in.

### Release a new app version

Bump `image.tag` in `apps/<group>/<app>/values.yaml`, push, then `make images`.
To change just one environment, set `image.tag` in `values-<env>.yaml` instead.

### Rotate the Argo CD password

Delete `~/.local/share/lab-secrets/kindell247/argocd-admin`, then `make deploy`.

### Change the domain

Change `lab_domain` in `lab.yml`, then `make redeploy`. See [05 DNS and TLS](05%20DNS%20and%20TLS.md).

## Troubleshooting

<figure style="margin:1.2em 0"><svg viewBox="0 0 900 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Troubleshooting decision tree for an app URL that does not work" style="width:100%;height:auto;max-width:900px;font-family:var(--font-interface, system-ui, sans-serif);color:var(--text-normal, #222)"><defs><marker id="ts-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity="0.8"/></marker><marker id="ts-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--interactive-accent, #3b82f6)"/></marker></defs><g><rect x="330" y="14" width="240" height="44" rx="7" style="stroke:var(--interactive-accent, #3b82f6);fill:var(--interactive-accent, #3b82f6);fill-opacity:0.10;stroke-width:2"/><text x="450.0" y="40.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">https://app.env.&lt;domain&gt; fails</text></g><g><rect x="330" y="92" width="240" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="450.0" y="114.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">resolves to 127.0.0.x?</text><text x="450.0" y="129.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">resolvectl query &lt;name&gt;</text></g><g><rect x="630" y="92" width="250" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="755.0" y="114.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">fix DNS</text><text x="755.0" y="129.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">systemctl status lab-dns · --tags dns</text></g><g><rect x="330" y="176" width="240" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="450.0" y="198.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">what does curl -v say?</text><text x="450.0" y="213.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">curl -v https://&lt;name&gt;</text></g><g><rect x="20" y="270" width="250" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="145.0" y="292.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">certificate error</text><text x="145.0" y="307.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">--tags ca · restart browser</text></g><g><rect x="330" y="270" width="240" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="450.0" y="292.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">connection refused</text><text x="450.0" y="307.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">docker ps: cluster running?</text></g><g><rect x="630" y="270" width="250" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="755.0" y="292.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">404 / no route</text><text x="755.0" y="307.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">kubectl get httproute · Argo CD</text></g><g><rect x="200" y="350" width="200" height="40" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="300.0" y="374.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">not running → make deploy</text></g><g><rect x="430" y="350" width="290" height="40" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="575.0" y="374.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">running → kubectl get gateway,cert</text></g><polyline points="450,58 450,90" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ts-arr)"/><polyline points="570,117 628,117" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ts-arr)"/><text x="599" y="109" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">no</text><polyline points="450,142 450,174" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ts-arr)"/><text x="466" y="162" text-anchor="start" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">yes</text><polyline points="450,226 450,248 145,248 145,268" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ts-arr)"/><polyline points="450,248 450,268" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ts-arr)"/><polyline points="450,248 755,248 755,268" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ts-arr)"/><polyline points="400,320 400,335 300,335 300,348" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ts-arr)"/><polyline points="500,320 500,335 575,335 575,348" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ts-arr)"/></svg><figcaption style="font-size:0.85em;color:var(--text-muted);margin-top:0.4em">Start at the top and follow the first check that fails. Each check is one command; the fix is in the box it leads to.</figcaption></figure>

| Symptom | Likely cause | Fix |
|---|---|---|
| `Sorry, try again` at the sudo prompt | Wrong password, or faillock after 3 tries | `sudo -v`; check `faillock --user $USER`; wait 10 min |
| `permission denied ... docker.sock` | New `docker` group not active in this login | Log out and back in (the playbook adds a temporary ACL) |
| Argo CD app stuck `OutOfSync` / `Progressing` | CRDs not ready yet, or a bad commit | Open the app in Argo CD; check events; `make gitops` |
| ApplicationSet error "missingkey" | Cluster registered without the annotations | `make deploy ARGS="--tags clusters"` |
| `make deploy` reports changes every run | Regression in an idempotency check | See [08 Decisions and Gotchas](08%20Decisions%20and%20Gotchas.md) |
| Changed code isn't live | Image not rebuilt | `make images` |
| Firefox shows a certificate warning | Firefox has its own trust store | Add its profile to `lab_ca_nss_dbs` |

## Useful inspection commands

```bash
# All Argo CD apps and their state
kubectl --context kind-mgmt -n argocd get applications

# Registered clusters and their annotations
kubectl --context kind-mgmt -n argocd get secret -l argocd.argoproj.io/secret-type=cluster \
  -o custom-columns=NAME:.metadata.name,ANNOTATIONS:.metadata.annotations

# Gateway, certificate and routes in dev
kubectl --context kind-dev -n gateway get gateway,certificate,httproute
kubectl --context kind-dev -n hello-world get pods,svc,httproute

# Which CA signed a site
echo | openssl s_client -connect python.dev.kindell247:443 -servername python.dev.kindell247 2>/dev/null \
  | openssl x509 -noout -issuer -ext subjectAltName
```
