# Observe and troubleshoot

Every cluster sends its metrics, logs and Kubernetes events to one place:
**Grafana at `https://grafana.kindell247`**. You don't install anything;
your service is picked up automatically.

## What you get for free

| Signal | Where it comes from | Where to look |
|---|---|---|
| Request rate, errors, latency | Your app's `/metrics` (services from the templates and hello-world apps expose them) | **Applications → Service Health** |
| Logs | Everything your container writes to stdout/stderr | **Logs → Logs Explorer**, or Grafana's *Drilldown → Logs* |
| Kubernetes events | Restarts, OOM kills, failed probes, image pulls, scheduling | Service Health and Pod Troubleshooting |
| Pod resources | CPU, memory, throttling vs requests and limits | **Troubleshooting → Pod Troubleshooting** |
| Alerts | Error rate, latency, pods down, crash loops, telemetry gaps | Grafana *Alerting*; each alert links to its dashboard |

## Where to start

1. **Platform → Platform Overview.** Is anything red? Firing alerts, problem
   pods, restarts, error logs. Panels link to the next dashboard.
2. **Applications → Service Health.** Pick cluster, namespace and app. The top
   row is the service's golden signals; below are its error logs, Kubernetes
   events and resources, side by side.
3. **Troubleshooting → Pod Troubleshooting** when one pod misbehaves: why it
   restarted (OOMKilled, Error), whether it's starved of CPU or memory.
4. **Logs → Logs Explorer** to search everything: filter by app and level, or
   type a regex.

## Make your logs useful

Write **one JSON object per line** to stdout. The platform reads `level` (or
`severity`, `LogLevel`) so you can filter by level across languages, and every
other field is searchable:

```json
{"ts": "2026-10-31T17:16:17.501Z", "level": "error", "msg": "request",
 "service": "orders-api", "method": "GET", "path": "/fail", "status": 500, "duration_ms": 0.3}
```

Plain-text logs still arrive; you just can't filter them by level.

## Worked example: an error spike

The hello-world apps can fail on purpose: `/fail` returns a 500 and `/slow?ms=N`
adds latency. Here is the trail from alert to cause, as it happened in the lab.

1. **Alert.** `AppHighErrorRate` fires: *"python (dev) is failing 16.21% of
   requests"*. Its link opens Service Health with cluster, namespace and app
   already selected.
2. **Golden signals.** Error ratio is red at 16%; *Responses by status* shows a
   new 500 series; *Requests by route* shows `/fail` getting traffic. Latency
   p99 is 2s while p50 is a few milliseconds: a few slow requests, not a
   slow service.
3. **Error logs** (same dashboard) say exactly why:
   `"msg": "simulated failure", "path": "/fail", "reason": "requested via /fail"`.
   The `/slow` calls show as `warn` with `duration_ms: 1500`.
4. **Kubernetes events** show no restarts or OOM kills, and *Ready pods* is 1:
   the pod is healthy, the failures come from the code path. Root cause: the
   `/fail` route.

For a crash-looping or OOM-killed pod, the same path leads to Pod
Troubleshooting instead, where *Last termination reason* and *Memory vs limit*
show it.

## Signing in

Sign in to Grafana with GitHub. Only accounts on the platform team's list get
in. Ask the platform team if you're refused.
