---
tags: [kindell247, index]
updated: 2026-11-08
---

# kindell247 platform handbook

A local, multi-environment Kubernetes platform on Omarchy, with a developer
portal on top. One **hub** cluster runs Argo CD, the portal and observability;
apps run in a **worker cluster per environment** (dev today; staging and prod
are one setting away). Everything is reachable over HTTPS at `*.kindell247`.

<figure style="margin:1.2em 0;display:block;width:100%;max-width:780px"><svg viewBox="0 0 780 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ansible builds the clusters; Git changes flow through Argo CD on the hub to the worker clusters" style="display:block;width:100%;height:auto;max-width:780px;font-family:var(--font-interface, system-ui, sans-serif);color:var(--text-normal, var(--md-default-fg-color, #222))"><defs><marker id="ov-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity="0.8"/></marker><marker id="ov-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))"/></marker></defs><g><rect x="20" y="125" width="90" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="65.0" y="154.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">You</text></g><g><rect x="190" y="40" width="200" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="290.0" y="65.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">omarchy-k8s-ansible</text><text x="290.0" y="80.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">provisioning · private repo</text></g><g><rect x="190" y="204" width="200" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="290.0" y="229.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">omarchy-k8s-platform</text><text x="290.0" y="244.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">GitHub · public GitOps repo</text></g><rect x="470" y="16" width="290" height="268" rx="9" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="6 4"/><text x="482" y="33" font-size="10.5" font-weight="600" letter-spacing="0.06em" fill="currentColor" fill-opacity="0.65">DOCKER ON YOUR LAPTOP</text><g><rect x="490" y="46" width="250" height="82" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="615.0" y="77.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">mgmt  (hub)</text><text x="615.0" y="92.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">Argo CD — the only one</text><text x="615.0" y="107.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">portal · observability · gateway</text></g><g><rect x="490" y="200" width="110" height="62" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="545.0" y="228.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">dev</text><text x="545.0" y="243.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">your services</text></g><g opacity="0.55"><rect x="620" y="200" width="120" height="26" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05" stroke-dasharray="5 4"/><text x="680.0" y="217.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">staging (off)</text></g><g opacity="0.55"><rect x="620" y="236" width="120" height="26" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05" stroke-dasharray="5 4"/><text x="680.0" y="253.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">prod (off)</text></g><polyline points="110,140 150,140 150,68 188,68" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ov-arr)"/><text x="150" y="128" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">make deploy</text><polyline points="110,160 150,160 150,232 188,232" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ov-arr)"/><text x="150" y="178" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">git push</text><polyline points="390,62 488,62" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ov-arr)"/><text x="440" y="54" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">creates + bootstraps</text><polyline points="390,232 440,232 440,110 488,110" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));stroke-width:2" marker-end="url(#ov-acc)"/><text x="440" y="182" text-anchor="middle" font-size="11" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">pulled every ~3 min</text><polyline points="545,128 545,198" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ov-arr)"/><text x="583" y="168" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">deploys apps</text><polyline points="680,128 680,198" fill="none" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#ov-arr)"/></svg><figcaption style="font-size:0.85em;color:var(--text-muted, var(--md-default-fg-color--light, #666));margin-top:0.4em">Two ways into the clusters: Ansible builds and bootstraps them; after that, every change flows from Git through the one Argo CD on the hub.</figcaption></figure>

## Where to start

| You want to… | Read |
|---|---|
| Understand the platform in five minutes | [Getting started](guides/getting-started.md) |
| Build a new service | [Service Contract](guides/service-contract.md), then [Create a service](guides/create-a-service.md) |
| Bring code you already have | [Bring your own container](guides/bring-your-own-container.md) |
| Ship a change | [Ship a change](guides/ship-a-change.md) |
| See how it's running, or fix it | [Operate a service](guides/operate.md), [Observe and troubleshoot](guides/observability.md) |
| Look up a term | [Glossary](guides/glossary.md) |
| Run or change the platform itself | **Platform internals** below |

## Developer guides

| Section | Guides |
|---|---|
| **Start here** | [Getting started](guides/getting-started.md) · [Glossary](guides/glossary.md) |
| **Build** | [Service Contract](guides/service-contract.md) · [Create a service](guides/create-a-service.md) · [Bring your own container](guides/bring-your-own-container.md) · [Add a database](guides/add-a-database.md) |
| **Ship** | [Ship a change](guides/ship-a-change.md) · [Deploy a service](guides/deploy-a-service.md) |
| **Run** | [Operate a service](guides/operate.md) · [Observe and troubleshoot](guides/observability.md) · [Troubleshooting](guides/troubleshooting.md) · [Who can do what](guides/permissions.md) |

## Platform internals

For the platform team: how it's built and how to run it.

| # | Note | What it covers |
|---|---|---|
| 1 | [Ansible layout and best practices](01%20Ansible%20Layout%20and%20Best%20Practices.md) | Repo layout, roles, the one settings file, rules the playbook follows |
| 2 | [Kubernetes setup and structure](02%20Kubernetes%20Setup%20and%20Structure.md) | Clusters, namespaces, what runs where, the platform repo layout |
| 3 | [Networking and the gateway](03%20Kubernetes%20Networking%20and%20Gateway.md) | Request path from browser to pod, Gateway API, ports |
| 4 | [GitOps and Argo CD](04%20GitOps%20and%20Argo%20CD.md) | App of apps, ApplicationSets, projects, how a change reaches a cluster |
| 5 | [DNS and TLS](05%20DNS%20and%20TLS.md) | Local DNS, the lab CA, certificates |
| 6 | [Security model](06%20Security%20Model.md) | Every security control and why it's there |
| 7 | [Operations runbook](07%20Operations%20Runbook.md) | Day-to-day commands, common changes, troubleshooting |
| 8 | [Decisions and gotchas](08%20Decisions%20and%20Gotchas.md) | Why it's built this way; problems already solved |
| 9 | [Developer portal](09%20Developer%20Portal.md) | Backstage on the hub: plugins, Operate, permissions, config |
| 10 | [Observability platform](10%20Observability%20Platform.md) | Prometheus, Loki, Grafana, Alloy; mTLS ingest; dashboards and alerts as code |
| 11 | [CI/CD and delivery](11%20CI-CD%20and%20Delivery.md) | Shared pipelines, the contract check, deploy by Git, rollback, credentials |
| 12 | [Golden paths and templates](12%20Golden%20Paths%20and%20Templates.md) | How templates are built, the shared blocks, adding a language |
| 13 | [Databases](13%20Databases.md) | Postgres per environment, certificate logins, self-service databases, operations |

## Repositories

| Repo | Visibility | Purpose |
|---|---|---|
| [omarchy-k8s-platform](https://github.com/sfy247/omarchy-k8s-platform) | Public | What runs **in** the clusters. Argo CD syncs it; CI commits image tags to it. |
| [omarchy-k8s-ansible](https://github.com/sfy247/omarchy-k8s-ansible) | Private | How the machine and clusters are **built**, plus every credential. |
| [omarchy-k8s-portal](https://github.com/sfy247/omarchy-k8s-portal) | Public | The portal's code, templates, shared CI, and this handbook. |

All three are checked out side by side in `~/Documents/k8s-apps/`.

## Quick access

| What | Where |
|---|---|
| Developer portal | https://backstage.kindell247 (GitHub sign-in) |
| Argo CD | https://argocd.kindell247 (user `admin`; `cat ~/.local/share/lab-secrets/kindell247/argocd-admin`) |
| Grafana | https://grafana.kindell247 (user `admin`; `cat ~/.local/share/lab-secrets/kindell247/grafana/grafana-admin`) |
| Services in dev | `https://<name>.dev.kindell247` |
| Settings | `omarchy-k8s-ansible/inventories/local/group_vars/all/lab.yml` |

> [!note] The domain is a setting
> `kindell247` is the value of `lab_domain` in `lab.yml`. It isn't hard-coded
> anywhere else, so every hostname in these notes follows that setting.
