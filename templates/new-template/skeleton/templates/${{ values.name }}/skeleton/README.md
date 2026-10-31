# ${{ values.name }}

Created from a developer portal template.

## Platform contract for services

Every service template must produce a service that:

- serves `GET /healthz` (liveness) and `GET /metrics` with
  `http_requests_total{method,route,status}` and
  `http_request_duration_seconds{method,route}` (route = route template, never
  the raw path)
- writes one JSON object per line to stdout with at least `ts`, `level`, `msg`
- sets `metrics.enabled: true` in its platform values

Then dashboards, logs and alerts work without any extra setup.

## Follow the Create flow

A service template only owns its application code (`skeleton/`). Every other
stage reuses the shared blocks in `templates/_shared` (see its README), in this
order, exactly as `dotnet-service/template.yaml` does:

1. Create GitHub repo (`github:repo:create`)
2. Generate CI/CD: `_shared/cicd/repo` (pipeline, with your `language`) and
   `_shared/cicd/platform` (image roll-out)
3. Push the code (`github:repo:push`)
4. Provision infrastructure: `_shared/infra`
5. Deploy application: `_shared/deploy`, then one platform pull request

Never copy CI or deployment files into a template. A new language also needs a
reusable `.github/workflows/<language>-service.yaml` in this repo.
