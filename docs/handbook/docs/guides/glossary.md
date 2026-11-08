# Glossary

Words you'll meet in the portal and these guides.

| Term | Meaning |
|---|---|
| **Alert** | A rule in Prometheus that fires when something is wrong for a while (e.g. 5xx above 5% for 2 minutes). It links to the dashboard that explains it. |
| **App group** | A set of services that share a Kubernetes namespace and an Argo CD project, e.g. `services`, `hello-world`. |
| **Argo CD** | The tool that makes each cluster match the platform repo. It runs once, on the hub, and deploys to every environment. |
| **Bring your own container** | The template for any language: your Dockerfile, the platform's pipeline. |
| **Building blocks** | Shared pieces every template reuses (`templates/_shared`): CI/CD, infrastructure, deployment. |
| **Catalog** | Everything the portal knows about: services, teams, databases, docs. **Discover** browses it. Each repo describes itself in `catalog-info.yaml`. |
| **Client certificate** | How services log in to Postgres: a certificate named after their role, issued and renewed by the platform. No passwords. |
| **CI/CD tab** | A service's GitHub Actions runs, live, on its Discover page. |
| **Contract check** | The CI step that starts your image the way the platform runs it and checks the Service Contract. |
| **Delivery pipeline** | Operate's view of one change: commit → CI → image → platform Git → Argo CD sync → rollout. |
| **Deploy by Git** | How releases happen: CI commits the new image tag to the platform repo; Argo CD applies it. No one runs `kubectl apply`. |
| **Environment** | dev, staging, prod: each its own cluster. Only dev is enabled today. |
| **Gateway** | The HTTPS entry point of each cluster (Envoy Gateway). Routes `https://<name>.<env>.kindell247` to your service. |
| **GHCR** | GitHub Container Registry, where images are published as `ghcr.io/<owner>/<repo>:sha-<commit>`. |
| **GitOps** | The platform's rule that Git is the source of truth: the clusters follow the repos. |
| **GitOps app** | The GitHub App (`kindell247-gitops`) CI uses to commit image tags to the platform repo. It can write to that repo only. |
| **Golden path** | A supported template for one language (e.g. .NET web service): code that already keeps the contract, tests, a tuned Dockerfile. |
| **Hub** | The `mgmt` cluster: Argo CD, the portal, observability. Your services don't run here. |
| **Migration** | A versioned change to a service's database schema, kept in its repo and applied on deploy. |
| **Loki** | Where logs are stored (7 days). Search them in Grafana or Operate → Logs. |
| **Operate** | The portal section for running services: deployments, health, logs, actions. |
| **Owner** | The team (catalog Group) that owns a service. Owners can restart and change it. |
| **Platform repo** | `omarchy-k8s-platform`: what runs in the clusters. Your service's settings live in `apps/<group>/<name>/`. |
| **Prometheus** | Where metrics are stored (7 days) and alert rules run. |
| **Request action** | Operate's buttons that open a reviewed pull request (scale, resources, database) or an issue (help). |
| **Service Contract** | What every service must do to run here: non-root, port 8080, `/healthz`, `/metrics`, JSON logs. |
| **TechDocs** | The docs you're reading: Markdown in a repo, shown in Learn. |
| **values.yaml / values-dev.yaml** | Your service's settings: shared ones, and per environment (the running image tag lives in `values-<env>.yaml`). |
