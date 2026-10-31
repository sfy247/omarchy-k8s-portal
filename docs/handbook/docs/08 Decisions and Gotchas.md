---
tags: [kindell247, decisions]
updated: 2026-10-27
---

# Decisions and gotchas

Back to [Home](index.md). Why the lab is built the way it is, and problems that were
already solved, so they aren't re-solved or accidentally undone.

## Design decisions

| Decision | Alternatives considered | Why |
|---|---|---|
| **Two repos**: platform (public) + ansible (private) | One repo | They change at different rates; Argo CD needs the platform repo public; provisioning details stay private |
| **Hub and spoke**: one Argo CD, a cluster per environment | Argo CD per cluster; namespaces per env | Real isolation between environments, with every app visible in one Argo CD UI |
| **Folders named by content** (`bootstrap/`, `environments/`, `apps/`) | An `argocd/` folder | Folders describe what's in them, not the tool that applies them |
| **Group folders** `apps/<group>/<app>` | Flat `apps/` | Scales to many app groups, each with its own project and namespace |
| **One shared chart** (`web-service`) | A chart per app | Security defaults are written once and every app gets them |
| **Gateway API + Envoy Gateway** | ingress-nginx, Traefik | ingress-nginx was retired in 2026; Envoy Gateway is fully conformant |
| **A loopback IP per cluster** | Different ports per env | Every cluster can serve real :80/:443, so URLs need no port |
| **Local CA + cert-manager** | Self-signed per app; HTTP only | One CA your machine trusts; certs issued and renewed automatically |
| **Settings in cluster annotations** | Domain in Git | The platform repo stays domain-free; `lab.yml` is the single source |
| **Images side-loaded with `kind load`** | Local registry | Simpler for a laptop lab. A registry would be the next step for CI. |
| **dev only by default** | All three | Each kind cluster costs RAM; staging and prod are one setting away |

## Gotchas already solved

> [!bug] BuildKit provenance makes every build "new"
> Docker's BuildKit attaches a provenance attestation with build timestamps, so
> rebuilding unchanged code produced a new image ID. That made every run
> restart pods.
> **Fix:** `app_images` sets `BUILDX_NO_DEFAULT_ATTESTATIONS=1` (setting
> `app_images_attestations: false`).

> [!bug] `kind load` always reloads with Docker's containerd image store
> kind compares Docker's image ID (a manifest digest) with the node's config
> digest; they never match, so kind reloads every time.
> **Fix:** `app_images` reads each node's digest with `ctr` and loads only on a
> mismatch.

> [!bug] bcrypt hashes are salted
> Hashing the Argo CD password each run produced different Helm values, so Argo
> CD would be upgraded every time. The chart also stamps the password mtime
> with "now" by default.
> **Fix:** keep the existing hash when it still matches the password; pin the
> mtime to the password file's timestamp.

> [!bug] `*.kindell247` wildcard is rejected by browsers
> An unknown top-level name counts as a public suffix, so a wildcard directly
> under it is invalid.
> **Fix:** workers use `*.<env>.<domain>`; the hub uses exact `argocd.<domain>`.

> [!bug] certutil can't create a missing directory
> `~/.pki/nssdb` doesn't exist until Chromium first runs.
> **Fix:** `local_ca` creates the directory first. It also strips CRLF from
> `certutil -a` output before comparing.

> [!bug] Strict role argument specs reject extra fields
> Passing discovery facts with extra keys to `app_images` failed validation.
> **Fix:** discovery builds a separate list shaped exactly for that role.

> [!bug] `!` commands in Claude Code have no TTY
> `gh auth login` and sudo prompts can't run there.
> **Fix:** run interactive commands in your own terminal.

## Rules to keep

1. No lab-specific literal outside `lab.yml`, in either repo. Before
   committing, grep both repos for the domain.
2. `make lint` passes the production profile.
3. A second `make deploy` reports `changed=0`.
4. Anything that runs *in* a cluster goes in the platform repo; anything that
   builds the machine or clusters goes in the Ansible repo.
5. Only `system` roles may use `become`.
