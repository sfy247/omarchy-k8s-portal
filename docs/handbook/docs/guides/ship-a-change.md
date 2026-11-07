# Ship a change

## Code changes

1. Open a pull request in your service repo. CI builds and tests it.
2. Merge to `main`. CI builds the image, scans it, and publishes
   `ghcr.io/<owner>/<repo>:sha-<commit>`.
3. Within about two minutes, **Image Updater** commits the new tag to your
   service's `values-dev.yaml` in the platform repo, and Argo CD rolls it out.

You'll see a commit by `argocd-image-updater` in the platform repo's history
for each rollout.

### Watch it in the portal

- **Discover → your service → CI/CD**: your GitHub Actions runs. While one is
  running the tab updates every 5 seconds, showing each job and step as it
  goes; click any run to see its jobs.
- **Operate → your service → Deployments**: the whole path, from commit and CI
  to image, Argo CD sync and rollout.

!!! note "Builds can be blocked"
    If the scan finds a *fixable critical* vulnerability, the image is not
    published and nothing is deployed. The CI log shows which package to update.

## Settings changes

Replicas, resources and environment-specific values live in the platform
repo, not in your code:

| File | Applies to |
|---|---|
| `apps/<group>/<name>/values.yaml` | Every environment |
| `apps/<group>/<name>/values-dev.yaml` | Dev only (also where the image tag lives) |

Change them with a pull request. After merge, Argo CD applies the change within
about three minutes.

## Checking a rollout

- **Discover** → your service → **Kubernetes** tab: pods, restarts, image.
- **Argo CD** (`https://argocd.kindell247`): sync status and history. Your
  app is named `<group>-<name>-dev`.
