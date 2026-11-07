# Deploy a service

Stages 6 and 7 of [Create](create-a-service.md) (provision infrastructure,
deploy application) as an action of their own. Use it for a service created
without *Provision and deploy to dev now*, or for any service in the catalog,
whatever language or template it came from.

## 1. Fill in the form

Open **Create** and choose **Deploy a service**.

| Field | What to enter |
|---|---|
| Service | Pick it from the catalog. Its name, group and image come from its catalog entry. |
| Environment | `dev` (the only environment enabled today). |
| Provision infrastructure (first deployment) | Leave ticked the first time. Untick when adding another environment, so the shared settings aren't overwritten. |
| PostgreSQL database | Tick if the service needs one (see [Add a database](add-a-database.md)). |

## 2. Merge the pull request

The portal opens one pull request in the platform repo:

| File | What it is |
|---|---|
| `apps/<group>/<name>/values.yaml` | Settings every environment shares: image, port, resources, metrics, database (first deployment only) |
| `apps/<group>/<name>/values-<env>.yaml` | That environment's overrides, starting with the image of the service's latest commit; CI updates the tag on every release |

Once merged, Argo CD deploys it to `https://<name>.<env>.kindell247` within a
few minutes.

## What the service must provide

The platform deploys any container that follows the platform contract:

- listens on port `8080`, with `GET /healthz` and `GET /readyz`
- serves `GET /metrics` (request count and latency); otherwise Grafana shows
  the service as down
- logs JSON lines to stdout
- publishes `ghcr.io/<owner>/<repo>:sha-<commit>` images from CI

Services created from a portal template already do all of this.
