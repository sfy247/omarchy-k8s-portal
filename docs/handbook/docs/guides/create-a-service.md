# Create a service

## 1. Fill in the form

Open **Create** and choose a template, for example **.NET web service**.

| Field | What to enter |
|---|---|
| Name | Lowercase, digits and dashes, e.g. `orders-api`. Used for the repo, image and URL. |
| Description | One sentence: what the service does. |
| Owning team | Your team. It owns the service in the catalog. |
| App group | Where it runs; `services` for new services. |
| PostgreSQL database | Tick if the service needs one (see [Add a database](add-a-database.md)). |
| Repository location | Owner and repo name on GitHub, usually the same as the service name. |

## 2. What the portal creates

When you click **Create**, the portal:

1. **Creates your repo** with working code, a hardened Dockerfile, CI, docs and
   a `catalog-info.yaml`.
2. **Opens one pull request** in the platform repo that deploys the service to
   dev: its settings in `apps/<group>/<name>/` and a rule that rolls out new
   images automatically.
3. **Registers it in Discover**, so others can find it.

The last screen links to all three.

## 3. Merge the pull request

The service is not deployed until someone merges the platform pull request.
That review is the point where the platform team sees what is being added.

## 4. Wait for the first rollout

- Creating the repo triggers its first CI run (about 3 minutes).
- When the image is published, the platform picks it up within about two
  minutes and Argo CD deploys it.

Then open `https://<name>.dev.kindell247`. Until the first image exists, the
service shows as not ready; that is expected.

## What your service gets for free

- HTTPS with a trusted certificate, and a hostname
- Health checks (`/healthz`, `/readyz`) wired to Kubernetes
- A container that runs as non-root with a read-only filesystem
- A network policy: only HTTP in; out only DNS (and Postgres if enabled)
- Image vulnerability scanning on every build
- Request metrics, JSON logs, a Grafana dashboard and alerts from the first
  deploy (see [Observe and troubleshoot](observability.md))
- A page in Discover, and its `docs/` folder in Learn
