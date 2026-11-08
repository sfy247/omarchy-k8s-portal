---
tags: [kindell247, cicd]
updated: 2026-11-08
---

# CI/CD and delivery

Back to [Home](index.md). Every service builds the same way and deploys by Git.

<figure style="margin:1.2em 0;display:block;width:100%;max-width:980px"><svg viewBox="0 0 980 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Push to main runs CI: build, Service Contract check, scan, push to GHCR, then deploy-dev commits the tag to the platform repo and Argo CD rolls it out" style="display:block;width:100%;height:auto;max-width:980px;font-family:var(--font-interface, system-ui, sans-serif);color:var(--text-normal, var(--md-default-fg-color, #222))"><defs><marker id="dl-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity="0.8"/></marker><marker id="dl-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))"/></marker></defs><g><rect x="20" y="90" width="110" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="75.0" y="115.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">push</text><text x="75.0" y="130.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">to main</text></g><rect x="160" y="16" width="470" height="218" rx="9" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="6 4"/><text x="172" y="33" font-size="10.5" font-weight="600" letter-spacing="0.06em" fill="currentColor" fill-opacity="0.65">CI: YOUR REPO'S WORKFLOW (SHARED PIPELINE)</text><g><rect x="180" y="46" width="130" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="245.0" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">build + test</text><text x="245.0" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">per language</text></g><g><rect x="330" y="46" width="130" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="395.0" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">image</text><text x="395.0" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">your Dockerfile</text></g><g><rect x="480" y="46" width="130" height="50" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="545.0" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">contract</text><text x="545.0" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">runs it like k8s</text></g><g><rect x="330" y="150" width="130" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="395.0" y="175.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">scan</text><text x="395.0" y="190.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">critical CVE = stop</text></g><g><rect x="480" y="150" width="130" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="545.0" y="175.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">push</text><text x="545.0" y="190.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">ghcr.io/…:sha-&lt;sha&gt;</text></g><g><rect x="660" y="150" width="140" height="56" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="730.0" y="175.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">deploy-dev</text><text x="730.0" y="190.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">GitOps app commits</text></g><g><rect x="660" y="46" width="140" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="730.0" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">platform repo</text><text x="730.0" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">values-dev.yaml tag</text></g><g><rect x="830" y="46" width="130" height="50" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="895.0" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Argo CD</text><text x="895.0" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">polls ~3 min</text></g><g><rect x="830" y="150" width="130" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="895.0" y="175.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">dev</text><text x="895.0" y="190.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">rolling update</text></g><polyline points="130,118 150,118 150,71 178,71" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#dl-arr)"/><polyline points="310,71 328,71" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#dl-arr)"/><polyline points="460,71 478,71" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#dl-arr)"/><polyline points="545,96 545,120 395,120 395,148" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#dl-arr)"/><text x="470" y="114" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">pass</text><polyline points="460,178 478,178" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#dl-arr)"/><polyline points="610,178 658,178" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#dl-arr)"/><polyline points="730,150 730,98" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));stroke-width:2" marker-end="url(#dl-acc)"/><text x="740" y="128" text-anchor="start" font-size="11" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">commit</text><polyline points="800,71 828,71" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));stroke-width:2" marker-end="url(#dl-acc)"/><polyline points="895,96 895,148" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));stroke-width:2" marker-end="url(#dl-acc)"/><text x="905" y="126" text-anchor="start" font-size="11" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">sync</text></svg><figcaption style="font-size:0.85em;color:var(--text-muted, var(--md-default-fg-color--light, #666));margin-top:0.4em">Deploy by Git. CI builds the image and checks it against the Service Contract; only then is it published and its tag committed to the platform repo, which Argo CD applies. Rolling back is reverting that commit.</figcaption></figure>

## Pipelines

All shared workflows live in the portal repo, so a fix reaches every service on
its next run.

| Workflow / action | What it does |
|---|---|
| `.github/workflows/container-service.yaml` | The language-neutral half: build the image → **Service Contract** check → Trivy scan (fixable critical CVEs stop it) → push `ghcr.io/<owner>/<repo>:sha-<commit>` → **deploy-dev** |
| `.github/workflows/<language>-service.yaml` | A golden path's build and tests, then calls `container-service.yaml` (e.g. `dotnet-service.yaml`) |
| `.github/actions/service-contract` | `check.sh`: runs the image as UID 10001, read-only, no capabilities; checks port 8080, `/healthz`, `/readyz`, `/metrics`, JSON logs |
| `.github/actions/gitops-update` | Commits one value (the image tag) to the platform repo, retrying on races |
| `.github/workflows/build-image.yaml` | The portal's own image; deploys itself to `charts/developer-portal/values-image.yaml` |

A service's repo only has a thin caller (`ci.yaml`, or `platform-ci.yaml` for
an adopted repo) that passes its build context and where its dev values live.

## Deploy by Git

After the image is pushed on `main`, **deploy-dev** sets `image.tag` in
`apps/<group>/<name>/values-dev.yaml` and commits:

```
gitops[bot]  deploy: <repo> sha-<commit>
             apps/<group>/<name>/values-dev.yaml: .image.tag = sha-<commit>
             From https://github.com/<owner>/<repo>/actions/runs/<id>
```

Argo CD notices within about three minutes and rolls it out. Deploys of one
service run one at a time, in push order. A service that isn't deployed yet is
skipped (its first deployment sets the tag).

**Rollback:** revert the `deploy:` commit in the platform repo.

## The GitOps app

CI writes as a GitHub App (`kindell247-gitops`) with **Contents: write**,
installed on the platform repo only. Each run gets a short-lived token scoped to
that one repo.

| Where its credentials are | Set by |
|---|---|
| `lab-secrets/<domain>/gitops-app/` (`app-id`, `private-key.pem`, 0600) | you, once |
| Repo variables `GITOPS_REPOSITORY`, `GITOPS_APP_ID`; secret `GITOPS_APP_PRIVATE_KEY` | Ansible `gitops_ci_access` (portal repo + every service in the catalog), and the portal at Create |

> [!warning] Who can deploy
> Anyone who can change a service repo's workflow can use the app to write to
> the platform repo. Protect the platform repo's `main` (CODEOWNERS, reviews)
> when more people join, and keep higher environments behind pull requests.

## Environments beyond dev

Dev updates itself on every push. Staging and prod (when enabled) should be
promotions: a pull request copying dev's tag, reviewed and merged, never an
automatic commit.

## Why not Argo CD Image Updater?

It was used first: it polled GHCR every two minutes and committed tags itself.
CI now does it, which removes a controller with Git write access, the registry
polling delay, and the per-service updater rules. See
[Decisions and gotchas](08%20Decisions%20and%20Gotchas.md).
