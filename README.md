# omarchy-k8s-portal

Backstage developer portal for the omarchy Kubernetes lab. Developers create
services from golden-path templates; the portal only opens pull requests and
never touches a cluster directly.

```
Create: select approved template ─> configure ─> create GitHub repo ─> generate CI/CD
        ─> provision infrastructure ─> deploy application
          service repo:   code, Dockerfile, CI caller, catalog-info
          platform PR:    infra values, env values, image roll-out rule
Deploy a service: provision + deploy for any catalog service (same blocks)

Operate: select application + environment ─> deployments, health, logs
        ─> investigate (Grafana, Argo CD) or request action (restart, or a PR / issue)
                       │ merge
                       ▼
Service CI ──> ghcr.io/<owner>/<repo>:sha-<commit>
          └──> commits the new tag to the platform repo (GitOps GitHub App) ──> Argo CD deploys to dev
```

## What's here

| Path | Purpose |
|---|---|
| `packages/app`, `packages/backend` | The Backstage app (new frontend and backend systems) |
| `packages/app/src/modules/operate`, `packages/backend/src/operate` | Operate page and its API (`/api/operate`): Argo CD, Prometheus, Alertmanager and Loki, read-only except a rolling restart |
| `packages/backend/src/scaffolder` | `platform:values:set`: edits only the given keys of a platform values file |
| `packages/backend/Dockerfile` | Production image: non-root, no SQLite, mkdocs for TechDocs |
| `app-config.production.yaml` | Generic production config (Postgres over verified TLS, schema per plugin) |
| `templates/<id>/` | Golden-path templates. **Merge a folder and it appears in the portal.** |
| `templates/_shared/` | Building blocks for the Create stages: `cicd/`, `infra/`, `deploy/` (not templates themselves) |
| `org/org.yaml` | Teams and users |
| `catalog-info.yaml` | The portal itself, and `platform-gitops-repo` (where templates send PRs) |
| `.github/workflows/build-image.yaml` | Build, test, Trivy scan, push the portal image |
| `.github/workflows/container-service.yaml` | Reusable CI for any container: build, Service Contract check, scan, push, deploy-dev |
| `.github/workflows/dotnet-service.yaml` | .NET build and tests, then `container-service.yaml` |
| `.github/actions/service-contract/` | The Service Contract check (`check.sh` also runs locally) |
| `.github/actions/gitops-update/` | Deploy by Git: commit an image tag to the platform repo |

## Templates

Application creation and deployment are separate building blocks:

Only templates under `templates/` are accepted by the catalog (approved
through review). Language templates own their code only; CI/CD,
infrastructure and deployment come from `templates/_shared`:

- **container-service** ("Bring your own container"): any language. A new
  repo from a minimal example that keeps the Service Contract, or a PR adding
  the platform CI and catalog entry to an existing repo.
- **dotnet-service**: C# minimal API (health checks, metrics, JSON logs,
  chiseled image running as UID 10001) and TechDocs, through all Create
  stages: repo, CI/CD, infrastructure, deployment to dev.
- **deploy-service**: provisions and deploys any catalog service to an
  environment with one PR to the platform repo, at
  `https://<name>.<env>.<lab domain>`. Optional Postgres access (then
  `make database APP=services/<name>` in omarchy-k8s-ansible).
- **scale-service**, **change-resources**, **add-database**, **request-help**
  (type `operation`): Operate's request actions. The first three open a PR
  that edits the service's platform values; request-help opens an issue.
- **new-template**: scaffolds a new template folder here and opens a PR.

## How it is deployed

Nothing lab-specific is in this repo. omarchy-k8s-ansible writes
`app-config.lab.yaml` (base URL, GitHub integration, catalog locations,
Kubernetes clusters, sign-in, Operate endpoints) and the secrets it references,
including a token for a dedicated Argo CD account (read-only plus Deployment
restart); omarchy-k8s-platform
deploys the image to the hub cluster with the official Backstage Helm chart,
its own CloudNativePG database, and an HTTPS route at `https://backstage.<lab domain>`.

## Local development

```bash
mise install                    # Node 24 LTS (see mise.toml)
corepack enable && yarn install
GITHUB_TOKEN=$(gh auth token) yarn start   # http://localhost:3000, catalog read from this checkout
```

## Conventions

- Third-party GitHub Actions are pinned to commit SHAs.
- Org-specific values live in `catalog-info.yaml` and `org/org.yaml`;
  templates read them with `catalog:fetch` instead of hard-coding them.
- Template skeletons escape GitHub Actions expressions with `{% raw %}`.
