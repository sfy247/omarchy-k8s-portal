# Shared building blocks

Every template that creates or deploys a service renders these, so each stage
of the Create flow is defined exactly once. They are not templates themselves.

| Block | Stage | Renders | Into |
|---|---|---|---|
| `cicd/repo/` | Generate CI/CD | `.github/workflows/ci.yaml`: calls the reusable `<language>-service.yaml` workflow (build, test, scan, publish to GHCR) | Service repo |
| `cicd/platform/` | Generate CI/CD | `environments/<env>/<group>/image-updates/<name>.yaml`: continuous delivery, rolls each new image out | Platform repo |
| `infra/` | Provision infrastructure | `apps/<group>/<name>/values.yaml`: what the service runs with in every environment (namespace/group, port, resources, HTTPS route, network policy, metrics, database access) | Platform repo |
| `deploy/` | Deploy application | `apps/<group>/<name>/values-<env>.yaml`: that environment's deployment | Platform repo |

Values: `name`, `group`, `environment`, `image` (`ghcr.io/<owner>/<repo>`),
`database`, and for `cicd/repo` also `language`, `projectPath`,
`workflowsRepo`.

Used by `dotnet-service` (the whole Create flow) and `deploy-service`
(provision and deploy only). Templates find this folder through the
`platform.lab/building-blocks` annotation on the `platform-gitops-repo` catalog
resource, not a relative `../` path (Backstage refuses those for templates
loaded from local files).
