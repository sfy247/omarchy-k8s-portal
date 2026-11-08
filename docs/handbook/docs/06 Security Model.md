---
tags: [kindell247, security, appsec]
updated: 2026-11-08
---

# Security model

Back to [Home](index.md).

"Appsec" here means two things: **ApplicationSets** generate every app, and
every layer is **hardened** by default. This note lists each control, from the
outside in.

<figure style="margin:1.2em 0;display:block;width:100%;max-width:860px"><svg viewBox="0 0 860 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nested security layers from machine to pod" style="display:block;width:100%;height:auto;max-width:860px;font-family:var(--font-interface, system-ui, sans-serif);color:var(--text-normal, var(--md-default-fg-color, #222))"><defs><marker id="sc-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity="0.8"/></marker><marker id="sc-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))"/></marker></defs><rect x="10" y="10" width="840" height="310" rx="9" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="6 4"/><text x="22" y="27" font-size="10.5" font-weight="600" letter-spacing="0.06em" fill="currentColor" fill-opacity="0.65">MACHINE</text><text x="24" y="48" text-anchor="start" font-size="11.5" fill-opacity="0.75" style="fill:currentColor">CA name-constrained · DNS answers lab domain only · sudo only on drift · secrets 0600, never in Git</text><rect x="40" y="66" width="780" height="244" rx="9" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="6 4"/><text x="52" y="83" font-size="10.5" font-weight="600" letter-spacing="0.06em" fill="currentColor" fill-opacity="0.65">ARGO CD PROJECTS</text><text x="54" y="104" text-anchor="start" font-size="11.5" fill-opacity="0.75" style="fill:currentColor">default emptied · platform: projects + appsets only · &lt;group&gt;-&lt;env&gt;: 1 repo, 1 ns, 1 cluster, 5 kinds</text><rect x="70" y="122" width="720" height="178" rx="9" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="6 4"/><text x="82" y="139" font-size="10.5" font-weight="600" letter-spacing="0.06em" fill="currentColor" fill-opacity="0.65">NAMESPACE</text><text x="84" y="160" text-anchor="start" font-size="11.5" fill-opacity="0.75" style="fill:currentColor">Pod Security restricted · NetworkPolicy: HTTP in, DNS out · HTTPS only, HTTP redirects</text><g><rect x="100" y="190" width="660" height="96" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="430.0" y="228.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Pod</text><text x="430.0" y="243.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">non-root UID 10001 · read-only root FS · all capabilities dropped</text><text x="430.0" y="258.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">no privilege escalation · seccomp RuntimeDefault · no ServiceAccount token</text></g></svg><figcaption style="font-size:0.85em;color:var(--text-muted, var(--md-default-fg-color--light, #666));margin-top:0.4em">Defence in depth. Each layer stops something the one outside it doesn't: the machine limits what the CA and DNS can touch, Argo CD projects limit what Git can deploy, the namespace rejects unhardened pods, and the pod itself runs with nothing it doesn't need.</figcaption></figure>

## Machine

| Control | Why |
|---|---|
| CA has a **name constraint** to the lab domain, `pathlen:0` | Your machine trusts it, so it must not be able to vouch for anything else |
| CA key and Argo CD password in `0600` files under `~/.local/share/` | Not in Git, readable only by you |
| `lab-dns` answers only the lab domain, never forwards | Can't intercept or leak other lookups |
| `lab-dns.service` runs with systemd sandboxing (`ProtectSystem=strict`, `ProtectHome`, `NoNewPrivileges`, ...) | Limits damage if dnsmasq were compromised |
| Ansible `become` only after an unprivileged drift check | sudo is used rarely and only for a reason |
| Pinned tool versions, SHA-256-verified downloads | Supply-chain integrity |
| Kubernetes NodePorts bound to loopback only | Nothing is exposed to your network |

## GitOps / Argo CD

| Control | Why |
|---|---|
| `default` AppProject emptied | Argo CD's built-in project allows any repo, cluster and resource |
| `platform` project: only AppProjects + ApplicationSets in `argocd` | The root and env apps can't deploy workloads |
| `hello-world-<env>` projects: one repo, one namespace, one cluster, five kinds | An app can't create anything else, or anywhere else |
| `cluster-addons` project: cluster-scoped kinds, but only add-on namespaces | Add-ons need CRDs and webhooks; that's contained to one project |
| Workers registered with a dedicated `argocd-manager` ServiceAccount | Auditable and revocable per cluster |
| Automated sync with self-heal | Manual drift in a cluster is reverted |
| Stable admin password, generated randomly, stored outside Git | No default or shared credential |
| The portal's Argo CD account (`portal`): read applications, restart Deployments only | Operate can't sync, delete or change anything else |
| CI deploys as the GitOps GitHub App: Contents write on the platform repo only, a short-lived token per run | No long-lived write credential in CI; every deploy is an attributed commit |

> [!warning] Known trade-off
> `argocd-manager` is bound to `cluster-admin` on each worker, which is what
> Argo CD needs to create namespaces and arbitrary kinds. The AppProjects are
> what actually restrict each app.

## Cluster / namespace

| Control | Where | Why |
|---|---|---|
| Pod Security Admission `restricted` (enforce + warn) | `hello-world` ns, set by the ApplicationSet | The API server rejects any pod that isn't fully hardened |
| NetworkPolicy per app: in on HTTP only; out to DNS only | `web-service` chart | A compromised app can't reach the internet or other pods |
| HTTPS everywhere; HTTP only redirects | gateway chart | No plaintext traffic to apps |
| Certificates rotate their private key on renewal | gateway chart | Limits exposure of a leaked key |

## Developer portal

| Control | Why |
|---|---|
| GitHub sign-in; users must exist in `org/org.yaml` | Only known people get in |
| Ownership-based permission policy | Owners operate their services; others read and request help ([Who can do what](guides/permissions.md)) |
| `platform:authorize` step in every template that changes a service | A hand-edited form can't skip the ownership check |
| Templates only from `templates/` in the portal repo | Every template is reviewed before it can run |
| Network policy: only the gateway in; out to its database, DNS, HTTPS and the Operate APIs | A compromised portal can't wander the cluster |
| Credentials only in the Secret Ansible writes | Nothing secret in Git or the image |

## Observability

| Control | Why |
|---|---|
| Agents push over **mutual TLS**; the ingest listener accepts only lab-CA client certificates | Nothing else can write metrics or logs |
| The Postgres exporter port is open only to the monitoring namespace | Metrics without opening the database |

## Pod / container

Set by the `web-service` chart and the Dockerfiles:

| Control | Setting |
|---|---|
| Non-root | `runAsNonRoot: true`, `runAsUser: 10001` (and `USER 10001` in every image) |
| Read-only filesystem | `readOnlyRootFilesystem: true`, plus a 64Mi `emptyDir` at `/tmp` |
| No privilege escalation | `allowPrivilegeEscalation: false`, `privileged: false` |
| No capabilities | `capabilities.drop: [ALL]` |
| Syscall filtering | `seccompProfile: RuntimeDefault` |
| No Kubernetes API access | `automountServiceAccountToken: false` |
| Resource limits | memory limits on every container |
| Minimal images | .NET uses a **chiseled** image (no shell, no package manager) |
| Checked before release | CI's **Service Contract** check runs every image under these settings; Trivy blocks fixable critical CVEs |

## Ideas for later

- Admission policies (Kyverno) to enforce the chart's defaults on any workload
- Signed images and verification
- SSO for Argo CD instead of the admin account
- Branch protection and CODEOWNERS on the platform repo, so CI's deploy commits and humans' changes are reviewed differently
- Egress allow-lists if an app ever needs outbound access
