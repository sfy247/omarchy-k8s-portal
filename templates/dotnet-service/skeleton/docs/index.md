# ${{ values.name }}

${{ values.description }}

## Endpoints

| Path | Purpose |
|---|---|
| `/` | Hello response |
| `/healthz` | Liveness probe |
| `/readyz` | Readiness probe |
{%- if values.database %}
| `/db` | Shows whether database settings are loaded |
{%- endif %}

## How it ships

1. Push to `main`. CI builds, tests, scans the image, and pushes
   `ghcr.io/<owner>/<repo>:sha-<commit>`.
2. Argo CD Image Updater sees the new tag and commits it to this service's
   `values-dev.yaml` in the platform repo.
3. Argo CD deploys it to the dev cluster.

## Run locally

```bash
dotnet run --project src/${{ values.name }}
curl localhost:5000/healthz
```
