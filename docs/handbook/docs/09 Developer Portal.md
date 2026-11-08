---
tags: [kindell247, portal]
updated: 2026-11-08
---

# Developer portal

Back to [Home](index.md). Backstage on the hub at `https://backstage.<domain>`:
the developers' front door for Create, Discover, Operate and Learn.

<figure style="margin:1.2em 0;display:block;width:100%;max-width:960px"><svg viewBox="0 0 960 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Browser to gateway to Backstage; Backstage reads GitHub, Argo CD, Prometheus, Loki, Alertmanager and its Postgres" style="display:block;width:100%;height:auto;max-width:960px;font-family:var(--font-interface, system-ui, sans-serif);color:var(--text-normal, var(--md-default-fg-color, #222))"><defs><marker id="pt-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity="0.8"/></marker><marker id="pt-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))"/></marker></defs><g><rect x="20" y="140" width="100" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="70.0" y="162.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Browser</text><text x="70.0" y="177.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">GitHub sign-in</text></g><g><rect x="150" y="140" width="110" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="205.0" y="162.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Gateway</text><text x="205.0" y="177.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">HTTPS · hub</text></g><rect x="290" y="16" width="340" height="298" rx="9" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))" stroke-dasharray="6 4"/><text x="302" y="33" font-size="10.5" font-weight="600" letter-spacing="0.06em" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))">BACKSTAGE (DEVELOPER-PORTAL NAMESPACE)</text><g><rect x="310" y="46" width="145" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="382.5" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">catalog</text><text x="382.5" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">entities from Git</text></g><g><rect x="465" y="46" width="145" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="537.5" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">scaffolder</text><text x="537.5" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">templates · actions</text></g><g><rect x="310" y="108" width="145" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="382.5" y="130.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">techdocs</text><text x="382.5" y="145.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">Learn</text></g><g><rect x="465" y="108" width="145" height="50" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="537.5" y="130.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">operate</text><text x="537.5" y="145.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">/api/operate</text></g><g><rect x="310" y="170" width="145" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="382.5" y="192.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">permission</text><text x="382.5" y="207.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">ownership policy</text></g><g><rect x="465" y="170" width="145" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="537.5" y="192.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">auth</text><text x="537.5" y="207.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">GitHub · tokens</text></g><g><rect x="310" y="240" width="300" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="460.0" y="262.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Postgres (CloudNativePG)</text><text x="460.0" y="277.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">catalog · tasks · search</text></g><g><rect x="690" y="30" width="250" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="815.0" y="52.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">GitHub</text><text x="815.0" y="67.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">repos · PRs · Actions runs</text></g><g><rect x="690" y="100" width="250" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="815.0" y="122.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Argo CD API</text><text x="815.0" y="137.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">apps · history · restart only</text></g><g><rect x="690" y="170" width="250" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="815.0" y="192.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Prometheus · Loki · Alertmanager</text><text x="815.0" y="207.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">health · logs · alerts</text></g><g><rect x="690" y="250" width="250" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05" stroke-dasharray="5 4"/><text x="815.0" y="272.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Ansible</text><text x="815.0" y="287.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">config + secrets (ConfigMap, Secret)</text></g><polyline points="120,165 148,165" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#pt-arr)"/><polyline points="260,165 288,165" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#pt-arr)"/><polyline points="612,55 688,55" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#pt-arr)"/><text x="650" y="47" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">read · create</text><polyline points="612,125 688,125" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));stroke-width:2" marker-end="url(#pt-acc)"/><text x="650" y="117" text-anchor="middle" font-size="11" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">read · restart</text><polyline points="612,195 688,195" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#pt-arr)"/><text x="650" y="187" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">read</text><polyline points="688,275 612,275" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#pt-arr)"/><text x="650" y="267" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">at deploy</text></svg><figcaption style="font-size:0.85em;color:var(--text-muted, var(--md-default-fg-color--light, #666));margin-top:0.4em">The portal is one Backstage backend plus the app. It reads the catalog from Git, writes only through GitHub (repos, pull requests) and Argo CD's restart action, and reads everything else.</figcaption></figure>

## Where it lives

| Piece | Repo | Path |
|---|---|---|
| App and backend code, templates, org, this handbook | omarchy-k8s-portal | `packages/`, `templates/`, `org/`, `docs/handbook/` |
| How it's deployed (Helm, route, database, network policy) | omarchy-k8s-platform | `charts/developer-portal/`, `hub/developer-portal/` |
| Lab config and every secret | omarchy-k8s-ansible | role `developer_portal` |

Nothing lab-specific is in the image. Ansible writes the ConfigMap
`backstage-lab-config` (`app-config.lab.yaml`: URLs, title, GitHub, catalog
locations, clusters, Operate endpoints, sign-in) and the Secret
`backstage-secrets` (GitHub token, automation token, Argo CD token, GitOps app
key, cluster reader tokens). It restarts the portal when either changes.

## What's inside

| Feature | Plugin / code | Notes |
|---|---|---|
| Create | scaffolder | Templates from `templates/*/template.yaml` only (approved through review); custom actions in `packages/backend/src/scaffolder/` |
| Discover | catalog, catalog-graph, org, kubernetes | Catalog from the portal repo, the platform repo's `catalog/` and apps, and registered service repos |
| CI/CD tab | `packages/app/src/modules/ci` + `/api/operate/ci` | GitHub Actions runs, polled every 5 s while one is running |
| Operate | `packages/app/src/modules/operate` + `packages/backend/src/operate` | Argo CD, Prometheus, Loki, Alertmanager, GitHub; services and databases |
| Learn | techdocs (built in-process with mkdocs) | This handbook and every service's `docs/` |
| Permissions | `packages/backend/src/permissions/policy.ts` | Ownership-based; see [Who can do what](guides/permissions.md) |
| Look | `packages/app/src/modules/theme`, `nav` | One dark + gold theme; the logo reads the brand from `app.title` |

## Custom scaffolder actions

| Action | Used by | Does |
|---|---|---|
| `platform:authorize` | every template that changes a service | Fails unless the user is in the owning group (or the platform team) |
| `platform:values:set` | scale, resources, database | Edits only the given keys of a platform values file, keeping comments |
| `platform:ci-credentials` | Create (both service templates) | Gives the new repo the GitOps app credentials before the first push |
| `platform:head-commit` | Deploy a service, BYO (existing repo) | Latest commit and default branch of a repo |

## Operate's backend

`/api/operate` joins the catalog with Argo CD applications labelled with an
environment. Services match by group + app label; databases by their
`argocd/app-name` annotation. It **reads** Argo CD (a dedicated `portal`
account), Prometheus, Loki, Alertmanager and GitHub, and its only write is
Argo CD's Deployment **restart** action, after an ownership check. Everything
else goes through templates as pull requests.

## Credentials it holds

| Credential | Scope | Where it comes from |
|---|---|---|
| GitHub token | your `gh` login (repos, PRs, Actions) | read at deploy time, never stored |
| Argo CD token | account `portal`: read apps, restart Deployments | minted by Ansible, kept in the secret directory |
| Automation token | static, for `make portal-e2e` | generated by Ansible; an admin credential |
| GitOps app key | Contents write on the platform repo | your GitHub App, saved under `lab-secrets/<domain>/gitops-app` |

## Testing it

- `make portal-e2e` (Ansible): the golden path through the live portal: create, CI, deploy, observe, scale.
- Locally: `yarn start` (guest sign-in) against port-forwarded hub services; dry-run templates with
  `POST /api/scaffolder/v2/dry-run`.
- The portal's own CI builds, tests, scans and pushes, then deploys itself by Git (`values-image.yaml`).
