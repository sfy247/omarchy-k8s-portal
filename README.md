# omarchy-k8s-portal

Backstage developer portal for the omarchy Kubernetes lab. Developers create
services from golden-path templates; the portal only opens pull requests and
never touches a cluster directly.

```
Template form ──> new service repo (code, Dockerfile, CI caller, catalog-info)
             └──> pull request to omarchy-k8s-platform (values + image roll-forward)
                       │ merge
                       ▼
Service CI ──> ghcr.io/<owner>/<repo>:sha-<commit>
Argo CD Image Updater ──> commits the new tag ──> Argo CD deploys to dev
```

## What's here

| Path | Purpose |
|---|---|
| `packages/app`, `packages/backend` | The Backstage app (new frontend and backend systems) |
| `packages/backend/Dockerfile` | Production image: non-root, no SQLite, mkdocs for TechDocs |
| `app-config.production.yaml` | Generic production config (Postgres over verified TLS, schema per plugin) |
| `templates/<id>/` | Golden-path templates. **Merge a folder and it appears in the portal.** |
| `org/org.yaml` | Teams and users |
| `catalog-info.yaml` | The portal itself, and `platform-gitops-repo` (where templates send PRs) |
| `.github/workflows/build-image.yaml` | Build, test, Trivy scan, push the portal image |
| `.github/workflows/dotnet-service.yaml` | Reusable CI every generated .NET service calls |

## Templates

- **dotnet-service**: C# minimal API (health checks, JSON logs, chiseled image
  running as UID 10001), CI, TechDocs, and one PR to the platform repo that
  deploys it to dev at `https://<name>.dev.<lab domain>`. Optional Postgres
  access (then `make database APP=services/<name>` in omarchy-k8s-ansible).
- **new-template**: scaffolds a new template folder here and opens a PR.

## How it is deployed

Nothing lab-specific is in this repo. omarchy-k8s-ansible writes
`app-config.lab.yaml` (base URL, GitHub integration, catalog locations,
Kubernetes clusters, sign-in) and the secrets it references; omarchy-k8s-platform
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
