---
tags: [kindell247, index]
updated: 2026-10-27
---

# kindell247 lab

A local, multi-environment Kubernetes lab on Omarchy. A single **hub** Argo CD
deploys apps to a **worker cluster per environment** (dev, staging, prod), using
the app-of-apps GitOps pattern. Everything is reachable over HTTPS at
`*.kindell247`.

<figure style="margin:1.2em 0"><svg viewBox="0 0 780 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ansible builds the clusters; Git changes flow through Argo CD on the hub to the worker clusters" style="width:100%;height:auto;max-width:780px;font-family:var(--font-interface, system-ui, sans-serif);color:var(--text-normal, #222)"><defs><marker id="ov-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity="0.8"/></marker><marker id="ov-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--interactive-accent, #3b82f6)"/></marker></defs><g><rect x="20" y="125" width="90" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="65.0" y="154.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">You</text></g><g><rect x="190" y="40" width="200" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="290.0" y="65.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">omarchy-k8s-ansible</text><text x="290.0" y="80.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">provisioning · private repo</text></g><g><rect x="190" y="204" width="200" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="290.0" y="229.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">omarchy-k8s-platform</text><text x="290.0" y="244.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">GitHub · public GitOps repo</text></g><rect x="470" y="16" width="290" height="268" rx="9" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="6 4"/><text x="482" y="33" font-size="10.5" font-weight="600" letter-spacing="0.06em" fill="currentColor" fill-opacity="0.65">DOCKER ON YOUR LAPTOP</text><g><rect x="490" y="46" width="250" height="82" rx="7" style="stroke:var(--interactive-accent, #3b82f6);fill:var(--interactive-accent, #3b82f6);fill-opacity:0.10;stroke-width:2"/><text x="615.0" y="77.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">mgmt  (hub)</text><text x="615.0" y="92.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">Argo CD — the only one</text><text x="615.0" y="107.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">+ cert-manager · gateway</text></g><g><rect x="490" y="200" width="110" height="62" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="545.0" y="228.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">dev</text><text x="545.0" y="243.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">4 apps + gateway</text></g><g opacity="0.55"><rect x="620" y="200" width="120" height="26" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05" stroke-dasharray="5 4"/><text x="680.0" y="217.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">staging (off)</text></g><g opacity="0.55"><rect x="620" y="236" width="120" height="26" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05" stroke-dasharray="5 4"/><text x="680.0" y="253.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">prod (off)</text></g><polyline points="110,140 150,140 150,68 188,68" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ov-arr)"/><text x="150" y="128" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">make deploy</text><polyline points="110,160 150,160 150,232 188,232" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ov-arr)"/><text x="150" y="178" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">git push</text><polyline points="390,62 488,62" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ov-arr)"/><text x="440" y="54" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">creates + bootstraps</text><polyline points="390,232 440,232 440,110 488,110" fill="none" style="stroke:var(--interactive-accent, #3b82f6);stroke-width:2" marker-end="url(#ov-acc)"/><text x="440" y="182" text-anchor="middle" font-size="11" style="fill:var(--interactive-accent, #3b82f6);paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">pulled every ~3 min</text><polyline points="545,128 545,198" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ov-arr)"/><text x="583" y="168" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">deploys apps</text><polyline points="680,128 680,198" fill="none" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#ov-arr)"/></svg><figcaption style="font-size:0.85em;color:var(--text-muted);margin-top:0.4em">Two ways into the clusters: Ansible builds and bootstraps them; after that, every change flows from Git through the one Argo CD on the hub.</figcaption></figure>

## Developer guides

New here? Start with these.

| Guide | When you need it |
|---|---|
| [Getting started](guides/getting-started.md) | First visit: how the platform works |
| [Create a service](guides/create-a-service.md) | Starting something new |
| [Deploy a service](guides/deploy-a-service.md) | Running an existing service in an environment |
| [Operate a service](guides/operate.md) | Deployments, health, logs; restart, scale, get help |
| [Who can do what](guides/permissions.md) | A button is greyed out, or a template says you're not allowed |
| [Ship a change](guides/ship-a-change.md) | Getting code and settings into dev |
| [Add a database](guides/add-a-database.md) | Your service needs Postgres |
| [Observe and troubleshoot](guides/observability.md) | Dashboards, logs, alerts, finding a root cause |
| [Troubleshooting](guides/troubleshooting.md) | Something isn't working |

## Platform internals

| # | Note | What it covers |
|---|---|---|
| 1 | [01 Ansible Layout and Best Practices](01%20Ansible%20Layout%20and%20Best%20Practices.md) | Repo layout, roles, settings file, the rules the playbook follows |
| 2 | [02 Kubernetes Setup and Structure](02%20Kubernetes%20Setup%20and%20Structure.md) | Clusters, namespaces, what runs where, the platform repo layout |
| 3 | [03 Kubernetes Networking and Gateway](03%20Kubernetes%20Networking%20and%20Gateway.md) | Request path from browser to pod, Gateway API, ports, cluster-to-cluster traffic |
| 4 | [04 GitOps and Argo CD](04%20GitOps%20and%20Argo%20CD.md) | App of apps, ApplicationSets, projects, how a change reaches a cluster |
| 5 | [05 DNS and TLS](05%20DNS%20and%20TLS.md) | Local DNS, the lab CA, certificate issuance |
| 6 | [06 Security Model](06%20Security%20Model.md) | Every security control and why it's there |
| 7 | [07 Operations Runbook](07%20Operations%20Runbook.md) | Day-to-day commands, adding apps/environments, troubleshooting |
| 8 | [08 Decisions and Gotchas](08%20Decisions%20and%20Gotchas.md) | Why things are built this way; problems already solved |

## Repositories

| Repo | Visibility | Purpose |
|---|---|---|
| [omarchy-k8s-platform](https://github.com/sfy247/omarchy-k8s-platform) | Public | What runs **in** the clusters. Argo CD syncs it. |
| [omarchy-k8s-ansible](https://github.com/sfy247/omarchy-k8s-ansible) | Private | How the machine and clusters are **built**. Points Argo CD at the platform repo. |

Both are checked out side by side in `~/Documents/k8s-apps/`.

## Quick access

| What | Where |
|---|---|
| Argo CD | https://argocd.kindell247 (user `admin`) |
| Admin password | `cat ~/.local/share/lab-secrets/kindell247/argocd-admin` |
| Apps (dev) | `https://<app>.dev.kindell247` for python, dotnet, node, java |
| Settings | `omarchy-k8s-ansible/inventories/local/group_vars/all/lab.yml` |

> [!note] The domain is a setting
> `kindell247` is the value of `lab_domain` in `lab.yml`. It isn't hard-coded
> anywhere else, so every hostname in these notes follows that setting.
