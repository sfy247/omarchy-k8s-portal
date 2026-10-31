# Getting started

Welcome. This platform takes you from an idea to a running, secured service
without filing tickets or touching Kubernetes directly.

## The portal in four parts

| Section | Use it to |
|---|---|
| **Create** | Start a new service from a template. You land here when you open the portal. |
| **Discover** | Find every service, who owns it, where it runs, and what it depends on. |
| **Operate** | See how your service is doing and change it safely *(coming next)*. |
| **Learn** | Read these guides and every service's own docs. |

## How things get deployed

You never deploy by hand. Everything goes through Git:

1. **Your code** lives in your service's own GitHub repo. Pushing to `main`
   builds, tests and scans a container image.
2. **Your deployment settings** live in the platform repo
   (`omarchy-k8s-platform`, under `apps/<group>/<name>/`). Changes there are
   pull requests.
3. **Argo CD** watches the platform repo and keeps the clusters matching it.
   New images roll out automatically in dev.

## Where services run

| Environment | URL of a service | Status |
|---|---|---|
| dev | `https://<name>.dev.kindell247` | Running |
| staging | `https://<name>.staging.kindell247` | Not enabled yet |
| prod | `https://<name>.prod.kindell247` | Not enabled yet |

Every service gets HTTPS automatically. Plain `http://` redirects to it.

## Your first service

Follow [Create a service](create-a-service.md). It takes about five minutes,
most of it waiting for the first build.
