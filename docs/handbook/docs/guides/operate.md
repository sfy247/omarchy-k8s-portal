# Operate a service

**Operate** is where you run what you've built. It follows four steps:

| # | Step | What you do |
|---|---|---|
| 1 | Application operations | Open **Operate**: every service in the catalog, per environment, with its health and sync status |
| 2 | Select application and environment | Pick the service and environment (or click its status in the table) |
| 3 | View deployments, health and logs | Three tabs, refreshed every 30 seconds |
| 4 | Investigate or request action | Jump to the right dashboard, or ask for a change |

Links are shareable: the URL keeps the service, environment and tab
(`/operate?app=component:default/<name>&env=dev&view=logs`).

## View deployments, health and logs

| Tab | Shows | Comes from |
|---|---|---|
| **Deployments** | The **delivery pipeline** (commit → CI → image → platform Git → Argo CD sync → rollout, each step's status, linked by commit), your **GitHub Actions runs** (status, duration, which one is running), the current deployment, and **Argo CD deploys** with what changed in each | GitHub Actions, Argo CD |
| **Health** | Overall health, firing alerts, request rate, 5xx error ratio, p95 latency, each pod's readiness, restarts and last termination reason (e.g. `OOMKilled`), and Kubernetes events from the last 6 hours | Argo CD, Prometheus, Alertmanager, Loki |
| **Logs** | Your service's log lines, filtered by level, time range and text. JSON fields are shown next to the message. | Loki |

## Databases

The shared PostgreSQL appears in Operate too (marked *database*). Its
**Health** tab shows what matters to the apps using it: whether it's up,
connections used against the limit, transactions per second, cache hit ratio,
storage against the volume, deadlocks, the longest open transaction and
replication lag, plus **one row per database**: find your app's database by
name to see its size, connections and load. Grafana's **Data → PostgreSQL**
dashboard has the history, and alerts fire when connections pass 80%, the
volume fills past 80%, deadlocks happen or a transaction stays open for 5
minutes. The platform team operates the database itself; ask through
**Request help**.

## Investigate

Each link opens already filtered to this service and environment:

| Link | Use it to |
|---|---|
| Service Health dashboard | See golden signals, error logs and events side by side over time |
| Pod troubleshooting | Find out why a pod restarts: OOM kills, CPU throttling, memory vs limit |
| Logs Explorer | Search all logs, across services |
| Argo CD | Compare desired and live state, see diffs and sync errors |
| Catalog page | Ownership, docs, the Kubernetes tab |

See [Observe and troubleshoot](observability.md) for a worked example.

## Request action

| Action | How it happens |
|---|---|
| **Restart now** | Immediate rolling restart through Argo CD (recorded there). Pods are replaced one at a time. |
| **Scale** | Pull request setting `replicaCount` in `values-<env>.yaml` |
| **Change resources** | Pull request setting CPU request and memory request/limit in `values-<env>.yaml` |
| **Add a database** | Pull request setting `database.enabled`; a platform engineer then creates the database |
| **Deploy to another environment** | The [Deploy a service](deploy-a-service.md) action |
| **Request help** | An issue in the platform repo, with the service, environment and links filled in |

These actions live here, not in **Create**: Create is only for starting
something new (a service, or a service's first deployment).

Restart and the pull-request actions are for the service's owning team and
the platform team ([Who can do what](permissions.md)); anyone can request help.

Everything except a restart changes Git: you get a pull request, someone
reviews it, and Argo CD applies it after merge. Only the keys you changed are
edited; the rest of the file, comments included, stays as it was.

## Why a service is missing

Operate lists catalog services (`spec.type: service`) that run in an
environment. A service appears once its deployment pull request is merged and
Argo CD has created it, usually within three minutes.
