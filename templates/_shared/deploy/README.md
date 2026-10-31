# Deploy building block

The one definition of how a service is deployed by GitOps. It is not a
template by itself: templates render it with `fetch:template` and open a pull
request in the platform repo with the result.

| Folder | Renders | When |
|---|---|---|
| `base/` | `apps/<group>/<name>/values.yaml`: the web-service chart values every environment shares (image, port, resources, metrics, database) | The service's first deployment |
| `environment/` | `apps/<group>/<name>/values-<env>.yaml` and the environment's Image Updater rule | Every environment the service is deployed to |

Values: `name`, `group`, `environment`, `image` (`ghcr.io/<owner>/<repo>`),
`database` (boolean).

Used by:

- `deploy-service`: deploy any service in the catalog (the standalone action)
- `dotnet-service`: its optional "Deploy to dev" final step

Templates find it through the `platform.lab/deploy-template` annotation on the
`platform-gitops-repo` catalog resource (not a relative `../` path, which
Backstage refuses for templates loaded from local files). Change deployments
here once; every template picks it up.
