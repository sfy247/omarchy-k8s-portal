---
tags: [kindell247, observability]
updated: 2026-11-08
---

# Observability platform

Back to [Home](index.md). Metrics, logs, events and alerts for every cluster,
in one place: Grafana at `https://grafana.<domain>`. Developers' view:
[Observe and troubleshoot](guides/observability.md).

<figure style="margin:1.2em 0;display:block;width:100%;max-width:960px"><svg viewBox="0 0 960 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Alloy agents in each cluster push over mTLS to the hub's Prometheus and Loki; Grafana, Alertmanager and the portal read them" style="display:block;width:100%;height:auto;max-width:960px;font-family:var(--font-interface, system-ui, sans-serif);color:var(--text-normal, var(--md-default-fg-color, #222))"><defs><marker id="ob-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity="0.8"/></marker><marker id="ob-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))"/></marker></defs><rect x="20" y="16" width="330" height="288" rx="9" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="6 4"/><text x="32" y="33" font-size="10.5" font-weight="600" letter-spacing="0.06em" fill="currentColor" fill-opacity="0.65">EACH CLUSTER (DEV, HUB)</text><g><rect x="40" y="46" width="140" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="110.0" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">your pods</text><text x="110.0" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">/metrics · stdout</text></g><g><rect x="40" y="120" width="140" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="110.0" y="142.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">exporters</text><text x="110.0" y="157.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">kube-state · node</text></g><g><rect x="40" y="194" width="140" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="110.0" y="216.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Kubernetes</text><text x="110.0" y="231.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">events</text></g><g><rect x="210" y="46" width="120" height="70" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="270.0" y="71.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">alloy-metrics</text><text x="270.0" y="86.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">scrapes</text><text x="270.0" y="101.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">PodMonitors</text></g><g><rect x="210" y="150" width="120" height="70" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="270.0" y="175.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">alloy-logs</text><text x="270.0" y="190.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">tails pods</text><text x="270.0" y="205.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">JSON level</text></g><polyline points="180,71 208,71" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ob-arr)"/><polyline points="180,145 195,145 195,90 208,90" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ob-arr)"/><polyline points="180,219 195,219 195,112 208,112" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#ob-arr)"/><polyline points="110,96 110,108 195,108 195,185 208,185" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#ob-arr)"/><g><rect x="400" y="100" width="140" height="70" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="470.0" y="125.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">ingest :9443</text><text x="470.0" y="140.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">gateway listener</text><text x="470.0" y="155.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">client certs only</text></g><polyline points="330,81 365,81 365,125 398,125" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ob-arr)"/><text x="365" y="70" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">metrics</text><polyline points="330,185 365,185 365,150 398,150" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ob-arr)"/><text x="365" y="204" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">logs</text><rect x="580" y="16" width="360" height="288" rx="9" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))" stroke-dasharray="6 4"/><text x="592" y="33" font-size="10.5" font-weight="600" letter-spacing="0.06em" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))">HUB: OBSERVABILITY NAMESPACE</text><g><rect x="600" y="46" width="150" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="675.0" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Prometheus</text><text x="675.0" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">7 days · rules</text></g><g><rect x="600" y="140" width="150" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="675.0" y="162.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Loki</text><text x="675.0" y="177.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">7 days · logs, events</text></g><g><rect x="780" y="46" width="140" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="850.0" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Alertmanager</text><text x="850.0" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">alerts</text></g><g><rect x="780" y="140" width="140" height="50" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="850.0" y="162.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Grafana</text><text x="850.0" y="177.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">dashboards</text></g><g><rect x="690" y="234" width="160" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="770.0" y="256.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">portal Operate</text><text x="770.0" y="271.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">health · logs</text></g><polyline points="540,120 570,120 570,71 598,71" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));stroke-width:2" marker-end="url(#ob-acc)"/><text x="570" y="60" text-anchor="middle" font-size="11" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">remote write</text><polyline points="540,150 570,150 570,165 598,165" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));stroke-width:2" marker-end="url(#ob-acc)"/><text x="575" y="182" text-anchor="middle" font-size="11" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">push</text><polyline points="750,71 778,71" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ob-arr)"/><polyline points="750,165 778,165" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#ob-arr)"/><polyline points="675,190 675,210 740,210 740,232" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#ob-arr)"/></svg><figcaption style="font-size:0.85em;color:var(--text-muted, var(--md-default-fg-color--light, #666));margin-top:0.4em">Every cluster runs the same agents; they push metrics, logs and events to the hub over mutual TLS. The hub stores and alerts; Grafana and the portal read from it.</figcaption></figure>

## Components

| Where | What | Chart / path |
|---|---|---|
| Hub | Prometheus (remote-write receiver, 7 days, rules), Alertmanager, Grafana | `charts/observability` (kube-prometheus-stack) |
| Hub | Loki (single binary, 7 days, filesystem) | `charts/observability` (loki) |
| Every cluster | `alloy-metrics` (Deployment): scrapes ServiceMonitors and PodMonitors, ships Kubernetes events | `charts/observability-agents` |
| Every cluster | `alloy-logs` (DaemonSet): tails pod logs, parses JSON `level` | `charts/observability-agents` |
| Workers | kube-state-metrics, node-exporter | `charts/observability-agents` |

Prometheus on the hub scrapes nothing itself: every series arrives by remote
write from an agent, labelled `cluster=<name>`.

## Ingest over mutual TLS

Agents push to the hub gateway's **ingest** listener (port 9443, NodePort
31090). Envoy only accepts client certificates signed by the lab CA; each
agent's certificate is `alloy.<cluster domain>`. The lab CA is
**name-constrained** to the lab domain, so every certificate name, client or
server, must sit under it (that's why the server name is `ingest.<domain>`).

## Labels everything relies on

| Signal | Labels |
|---|---|
| Metrics | `cluster`, `namespace`, `pod`, `container`; `app` for app metrics (PodMonitor relabel); `route`, `status`, `method` for HTTP |
| Logs | `cluster`, `namespace`, `app`, `pod`, `container`, `level` |
| Events | `job="integrations/kubernetes/eventhandler"`, JSON lines with `reason` and `name` |

The [Service Contract](guides/service-contract.md) is what makes these work for
every service.

## Dashboards and alerts as code

- Dashboards: `charts/observability/dashboards-src/generate.py` writes
  `dashboards/<Folder>/<uid>.json` (Platform, Applications, Logs,
  Troubleshooting, Data). A sidecar loads them; edit the generator, not Grafana.
- Alerts: `charts/observability/files/alert-rules.yaml` (groups: applications,
  databases, telemetry-pipeline), on top of kube-prometheus-stack's rules.
  Every alert carries a `dashboard_url`. Check with `promtool check rules`.
- Postgres: a PodMonitor in `charts/postgres` (app = cluster name), the
  **Data → PostgreSQL** dashboard, and the databases alert group.

## Access

Grafana's admin password is generated once by the `observability_access` role
(`lab-secrets/<domain>/grafana/grafana-admin`). GitHub sign-in turns on when
`grafana/github-oauth.yaml` exists; `lab_grafana_admins` and
`lab_grafana_viewers` list who gets in.

> [!tip] Adding a dashboard
> Add a function to `generate.py`, run it, commit the JSON. Argo CD syncs the
> ConfigMap and Grafana picks it up within a minute.
