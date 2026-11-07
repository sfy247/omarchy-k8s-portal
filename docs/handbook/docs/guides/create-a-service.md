# Create a service

**Create** takes you from an idea to a running service in seven stages. You do
the first three; the portal does the rest.

| # | Stage | Who | What happens |
|---|---|---|---|
| 1 | Create application | You | Open **Create** in the portal |
| 2 | Select approved template | You | Pick a template, e.g. **.NET web service**. Only templates reviewed by the platform team are listed. |
| 3 | Configure application | You | Fill in the form (below) |
| 4 | Create GitHub repo | Portal | An empty repo under the owner you chose, with your application code |
| 5 | Generate CI/CD | Portal | A pipeline that builds, tests, scans and publishes the image, then deploys it by committing its tag to the platform repo |
| 6 | Provision infrastructure | Portal | Namespace, HTTPS route, network policy, resources, metrics and database access |
| 7 | Deploy application | Portal + Argo CD | Deployment to dev, applied when the platform pull request is merged |

## Configure application: the form

| Field | What to enter |
|---|---|
| Name | Lowercase, digits and dashes, e.g. `orders-api`. Used for the repo, image and URL. |
| Description | One sentence: what the service does. |
| Owning team | Your team. It owns the service in the catalog. |
| App group | Where it runs; `services` for new services. |
| Repository location | Owner and repo name on GitHub, usually the same as the service name. |
| PostgreSQL database | Tick if the service needs one (see [Add a database](add-a-database.md)). |
| Provision and deploy to dev now | Leave ticked. Untick to create only the repo and CI, and run stages 6 and 7 later with [Deploy a service](deploy-a-service.md). |

## Watch the stages run

After **Create**, the portal shows each stage as it runs, then links to the
GitHub repo, the platform pull request and the service's catalog page.

Stages 6 and 7 change the platform repo, so they arrive as **one pull request**:

| Stage | File in `omarchy-k8s-platform` |
|---|---|
| Provision infrastructure | `apps/<group>/<name>/values.yaml` |
| Deploy application | `apps/<group>/<name>/values-dev.yaml` (CI keeps its image tag current) |

## Merge the pull request

Nothing runs in the cluster until someone merges it. That review is where the
platform team sees what's being added.

## Wait for the first rollout

- Pushing the code starts the first CI run (about 3 minutes).
- When the image is published, the platform picks it up within about two
  minutes and Argo CD deploys it.

Then open `https://<name>.dev.kindell247`. Until the first image exists, the
service shows as not ready; that's expected.

## What your service gets for free

- HTTPS with a trusted certificate, and a hostname
- Health checks (`/healthz`, `/readyz`) wired to Kubernetes
- A container that runs as non-root with a read-only filesystem
- A network policy: only HTTP in; out only DNS (and Postgres if enabled)
- Image vulnerability scanning on every build
- Request metrics, JSON logs, a Grafana dashboard and alerts from the first
  deploy (see [Observe and troubleshoot](observability.md))
- A page in Discover, and its `docs/` folder in Learn
