---
tags: [kindell247, ansible]
updated: 2026-10-27
---

# Ansible layout and best practices

Repo: `omarchy-k8s-ansible` (private). Back to [Home](index.md).

The playbook builds the whole lab from nothing and can be re-run any time. It
only changes what has drifted, and a second run reports `changed=0`.

## Repository layout

```
omarchy-k8s-ansible/
├── ansible.cfg                  project-local config (roles, collections, inventory)
├── bootstrap.sh                 creates .venv + installs collections (run once)
├── Makefile                     make deploy / redeploy / images / verify / teardown / lint
├── requirements.txt             pinned Python deps (ansible-core, kubernetes, bcrypt, ...)
├── requirements.yml             pinned collections (kubernetes.core, community.docker, ...)
├── inventories/local/
│   ├── hosts.yml                localhost, venv Python interpreter
│   └── group_vars/all/
│       ├── lab.yml              ★ THE settings file — every lab-specific value
│       └── roles.yml            wiring: derives values from lab.yml → role variables
├── playbooks/
│   ├── site.yml                 full converge
│   ├── images.yml               rebuild + reload images only
│   ├── teardown.yml             delete all clusters
│   └── tasks/discover.yml       builds runtime facts from lab.yml + platform repo
└── roles/                       one job each (below)
```

## How a run flows

<figure style="margin:1.2em 0"><svg viewBox="0 0 780 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Order of a deploy run; only the system stage may use sudo" style="width:100%;height:auto;max-width:780px;font-family:var(--font-interface, system-ui, sans-serif);color:var(--text-normal, #222)"><defs><marker id="ar-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity="0.8"/></marker><marker id="ar-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--interactive-accent, #3b82f6)"/></marker></defs><g><rect x="20" y="44" width="128" height="54" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="84.0" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">prepare</text><text x="84.0" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">clone · discover</text></g><text x="84.0" y="114" text-anchor="middle" font-size="10.5" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">tag: always</text><polyline points="148,71.0 170,71.0" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ar-arr)"/><g><rect x="172" y="44" width="128" height="54" rx="7" style="stroke:var(--interactive-accent, #3b82f6);fill:var(--interactive-accent, #3b82f6);fill-opacity:0.10;stroke-width:2"/><text x="236.0" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">system</text><text x="236.0" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">docker · CA · DNS</text></g><text x="236.0" y="114" text-anchor="middle" font-size="10.5" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">tag: system</text><polyline points="300,71.0 322,71.0" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ar-arr)"/><g><rect x="324" y="44" width="128" height="54" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="388.0" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">tools</text><text x="388.0" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">kubectl kind helm</text></g><text x="388.0" y="114" text-anchor="middle" font-size="10.5" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">tag: tools</text><polyline points="452,71.0 474,71.0" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ar-arr)"/><g><rect x="476" y="44" width="128" height="54" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="540.0" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">clusters</text><text x="540.0" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">hub + dev (kind)</text></g><text x="540.0" y="114" text-anchor="middle" font-size="10.5" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">tag: cluster</text><polyline points="604,71.0 626,71.0" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ar-arr)"/><g><rect x="628" y="44" width="128" height="54" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="692.0" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">CA → clusters</text><text x="692.0" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">lab-ca secret</text></g><text x="692.0" y="114" text-anchor="middle" font-size="10.5" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">tag: ca</text><g><rect x="20" y="170" width="128" height="54" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="84.0" y="194.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">images</text><text x="84.0" y="209.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">build · kind load</text></g><text x="84.0" y="240" text-anchor="middle" font-size="10.5" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">tag: images</text><polyline points="148,197.0 170,197.0" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ar-arr)"/><g><rect x="172" y="170" width="128" height="54" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="236.0" y="194.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">argocd</text><text x="236.0" y="209.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">Helm on hub</text></g><text x="236.0" y="240" text-anchor="middle" font-size="10.5" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">tag: argocd</text><polyline points="300,197.0 322,197.0" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ar-arr)"/><g><rect x="324" y="170" width="128" height="54" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="388.0" y="194.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">register</text><text x="388.0" y="209.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">cluster secrets</text></g><text x="388.0" y="240" text-anchor="middle" font-size="10.5" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">tag: clusters</text><polyline points="452,197.0 474,197.0" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ar-arr)"/><g><rect x="476" y="170" width="128" height="54" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="540.0" y="194.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">gitops</text><text x="540.0" y="209.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">root app · wait</text></g><text x="540.0" y="240" text-anchor="middle" font-size="10.5" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">tag: gitops</text><polyline points="604,197.0 626,197.0" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ar-arr)"/><g><rect x="628" y="170" width="128" height="54" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="692.0" y="194.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">verify</text><text x="692.0" y="209.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">HTTPS smoke tests</text></g><text x="692.0" y="240" text-anchor="middle" font-size="10.5" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">tag: verify</text><text x="236.0" y="34" text-anchor="middle" font-size="11" font-weight="600" style="fill:var(--interactive-accent, #3b82f6);paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">sudo only on drift</text><polyline points="692,120 692,132 84,132 84,168" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ar-arr)"/></svg><figcaption style="font-size:0.85em;color:var(--text-muted);margin-top:0.4em">One make deploy, in order. Only the highlighted system layer can ask for sudo, and only when a non-root check finds drift. Tags let you run a single stage.</figcaption></figure>

## Roles

| Role | Tag | Job | Needs sudo? |
|---|---|---|---|
| `platform_repo` | always | Clone the platform repo next to this one; warn about unpushed work | No |
| `docker` | `system`, `docker` | Install Docker, start the daemon, add you to the `docker` group | Only on change |
| `local_ca` | `system`, `ca` | Create a name-constrained root CA; trust it in the OS store and Chromium | Only on change |
| `local_dns` | `system`, `dns` | Dedicated dnsmasq for the lab domain + systemd-resolved routing | Only on change |
| `k8s_tools` | `tools` | kubectl, kind, helm, argocd at pinned versions; reuses mise installs | No |
| `kind_cluster` | `cluster` | Create/delete a kind cluster from a templated config | No |
| `app_images` | `images` | Build each `apps/<group>/<app>` image and side-load it into workers | No |
| `argocd` | `argocd` | Install Argo CD on the hub; manage the stable admin password | No |
| `argocd_clusters` | `clusters` | Register clusters in Argo CD with labels and annotations | No |
| `gitops_bootstrap` | `gitops` | Apply the `platform` project and root app; wait for all apps Healthy | No |
| `smoke_test` | `verify` | Probe every endpoint, with retries | No |

Every role has the same internal shape:

```
roles/<name>/
├── defaults/main.yml         generic defaults, all prefixed <name>_
├── meta/argument_specs.yml   typed inputs — Ansible validates them before the role runs
├── meta/main.yml             galaxy metadata
├── tasks/main.yml            entry point (some roles have extra entry points)
├── templates/  vars/  handlers/  filter_plugins/   as needed
```

## Where values live

<figure style="margin:1.2em 0"><svg viewBox="0 0 860 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="lab.yml feeds roles.yml and discovery; discovery writes cluster annotations that ApplicationSets read" style="width:100%;height:auto;max-width:860px;font-family:var(--font-interface, system-ui, sans-serif);color:var(--text-normal, #222)"><defs><marker id="sf-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity="0.8"/></marker><marker id="sf-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--interactive-accent, #3b82f6)"/></marker></defs><rect x="10" y="10" width="590" height="230" rx="9" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="6 4"/><text x="22" y="27" font-size="10.5" font-weight="600" letter-spacing="0.06em" fill="currentColor" fill-opacity="0.65">OMARCHY-K8S-ANSIBLE</text><rect x="620" y="10" width="230" height="230" rx="9" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="6 4"/><text x="632" y="27" font-size="10.5" font-weight="600" letter-spacing="0.06em" fill="currentColor" fill-opacity="0.65">HUB CLUSTER · PLATFORM REPO</text><g><rect x="28" y="98" width="150" height="60" rx="7" style="stroke:var(--interactive-accent, #3b82f6);fill:var(--interactive-accent, #3b82f6);fill-opacity:0.10;stroke-width:2"/><text x="103.0" y="125.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">lab.yml</text><text x="103.0" y="140.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">the one settings file</text></g><g><rect x="228" y="40" width="150" height="52" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="303.0" y="63.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">roles.yml</text><text x="303.0" y="78.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">derives + maps</text></g><g><rect x="228" y="164" width="150" height="52" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="303.0" y="187.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">discover.yml</text><text x="303.0" y="202.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">runtime facts</text></g><g><rect x="428" y="40" width="150" height="52" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="503.0" y="63.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">role tasks</text><text x="503.0" y="78.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">build everything</text></g><g opacity="0.55"><rect x="428" y="112" width="150" height="34" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05" stroke-dasharray="5 4"/><text x="503.0" y="133.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">role defaults</text></g><g><rect x="428" y="164" width="150" height="52" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="503.0" y="187.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">argocd_clusters</text><text x="503.0" y="202.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">registers clusters</text></g><g><rect x="640" y="164" width="190" height="52" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="735.0" y="187.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">cluster secret</text><text x="735.0" y="202.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">lab/domain: dev.&lt;domain&gt;</text></g><g><rect x="640" y="40" width="190" height="52" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="735.0" y="63.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">ApplicationSets</text><text x="735.0" y="78.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">&lt;app&gt;.&lt;lab/domain&gt;</text></g><polyline points="178,118 203,118 203,66 226,66" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#sf-arr)"/><text x="203" y="108" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">settings</text><polyline points="178,138 203,138 203,190 226,190" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#sf-arr)"/><polyline points="378,66 426,66" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#sf-arr)"/><text x="402" y="58" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">role vars</text><polyline points="503,112 503,94" fill="none" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#sf-arr)"/><text x="540" y="107" text-anchor="middle" font-size="10.5" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">fallback</text><polyline points="378,190 426,190" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#sf-arr)"/><text x="402" y="182" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">facts</text><polyline points="578,190 638,190" fill="none" style="stroke:var(--interactive-accent, #3b82f6);stroke-width:2" marker-end="url(#sf-acc)"/><text x="608" y="182" text-anchor="middle" font-size="11" style="fill:var(--interactive-accent, #3b82f6);paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">annotations</text><polyline points="735,164 735,94" fill="none" style="stroke:var(--interactive-accent, #3b82f6);stroke-width:2" marker-end="url(#sf-acc)"/><text x="735" y="134" text-anchor="middle" font-size="11" style="fill:var(--interactive-accent, #3b82f6);paint-order:stroke;stroke:var(--background-primary, #ffffff);stroke-width:4px;stroke-linejoin:round">read at render</text></svg><figcaption style="font-size:0.85em;color:var(--text-muted);margin-top:0.4em">Every lab-specific value starts in lab.yml. Ansible uses it directly, and passes per-cluster values to the platform repo as Argo CD cluster annotations, so Git never contains the domain.</figcaption></figure>

- **`lab.yml`** is the only file you normally edit. Domain, cluster names, IPs,
  ports, CA settings, versions, which environments are enabled.
- **`roles.yml`** never contains lab-specific literals. It only derives values
  (e.g. `lab_argocd_hostname: "argocd.{{ lab_domain }}"`) and maps them onto
  role variables.
- **`discover.yml`** builds lists at runtime: one entry per app found in the
  platform repo, one cluster registration per enabled environment, DNS records,
  smoke-test URLs.
- **Role defaults** are generic so each role could be reused in another project.

## Best practices this repo follows

> [!important] Keep these when you change anything
> `make lint` must pass the `production` profile, and a second `make deploy`
> must report `changed=0`.

1. **One settings file.** Lab-specific values live only in `lab.yml`. Changing
   `lab_domain` and re-running `make deploy` moves the whole lab.
2. **Generic, single-purpose roles.** Each role does one thing, prefixes its
   variables with its own name, and knows nothing about this lab.
3. **Validated inputs.** `meta/argument_specs.yml` declares every role input
   with a type; Ansible rejects bad values before the role runs.
4. **Idempotent and honest.** Every `command`/`shell` task has `changed_when`.
   Checks compare real state (image digests, file checksums, bcrypt hashes)
   instead of always reporting a change.
5. **Least privilege.** Only `system` roles use `become`, and only after a
   non-root check proves something must change. A machine that's already set
   up converges without a sudo password.
6. **Reuse what's installed.** `k8s_tools` reuses a binary on your PATH (e.g.
   mise) if it's the pinned version; otherwise it downloads the pinned release
   and verifies its SHA-256.
7. **Pinned everything.** Python deps, collections, CLIs, Helm charts. The
   toolchain lives in a project `.venv`, independent of the OS.
8. **Discover, don't list.** Apps and environments come from the platform repo
   and `lab.yml`; adding an app needs no playbook change.
9. **Secrets stay out of Git.** The CA key and Argo CD password live in `0600`
   files under `~/.local/share/`; tasks touching them use `no_log`.
10. **Tags per layer.** Run one layer with `make deploy ARGS="--tags images"`.

## Running it

| Command | What it does |
|---|---|
| `make bootstrap` | Create `.venv`, install pinned Python deps and collections |
| `make deploy` | Full converge (add `K=1` the first time, to allow sudo) |
| `make deploy ARGS="--tags system"` | Only the sudo-capable layer |
| `make redeploy` | Delete all clusters, rebuild from scratch |
| `make images` | Rebuild + reload images (`ARGS="-e app_images_only=['hello-world/java']"`) |
| `make gitops` | Re-register clusters, re-apply root app, wait, smoke test |
| `make verify` | Smoke tests only |
| `make teardown` | Delete all clusters (keeps Docker, CLIs, images) |
| `make check` | Dry run with diff |
| `make lint` | ansible-lint, production profile |

See [07 Operations Runbook](07%20Operations%20Runbook.md) for common tasks and troubleshooting.
