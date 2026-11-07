# ${{ values.name }}

${{ values.description }}

A container service on the platform: any language, as long as the image keeps
the **Service Contract** (platform handbook → Service Contract).

## How it ships

1. Push to `main`. CI builds your `Dockerfile`, runs the **Service Contract
   check** (it starts the image the way the platform runs it), scans it, and
   pushes `ghcr.io/<owner>/<repo>:sha-<commit>`.
2. CI's `deploy-dev` job commits that tag to this service's values in the
   platform repo; Argo CD rolls it out.

Watch it in the portal: **Discover → ${{ values.name }} → CI/CD**, then
**Operate** for deployments, health and logs.

## The contract, in short

| Rule | Why |
|---|---|
| Listen on port 8080 | Service and route |
| `GET /healthz` returns 200 (and `/readyz` when ready) | Kubernetes probes |
| `GET /metrics`: `http_requests_total`, `http_request_duration_seconds` by route | Dashboards, alerts, Operate |
| One JSON object per line on stdout, with `level` and `msg` | Log search and level filters |
| Runs as a non-root user with a read-only filesystem; writes only to `/tmp` | Pod security |

If the CI check fails, its summary lists exactly which rule.
