# Troubleshooting

Start with your service's page in **Discover** → **Kubernetes** tab, then the
table below.

| You see | Likely cause | What to do |
|---|---|---|
| CI failed at **Scan image** | A fixable critical vulnerability in a dependency or base image | Update the package named in the CI log, push again |
| Pod `ImagePullBackOff` | The image doesn't exist yet, or the GHCR package is private | Check CI finished; make the package public in GitHub (Package settings) |
| Pod `CrashLoopBackOff` | The app fails at startup | Read its logs in the Kubernetes tab |
| `https://<name>.dev…` gives 404 | The platform PR isn't merged, or the app isn't synced yet | Merge the PR; check the app in Argo CD |
| Browser certificate warning | The lab CA isn't trusted by this browser | Restart Chromium; Firefox needs the CA added |
| Database connection refused | `database.enabled` isn't set, or the database wasn't created | See [Add a database](add-a-database.md) |
| New version isn't rolling out | The image tag hasn't been picked up yet | Wait two minutes; look for an `argocd-image-updater` commit in the platform repo |

Still stuck? Ask in the platform team's channel with your service name and
what you tried.
