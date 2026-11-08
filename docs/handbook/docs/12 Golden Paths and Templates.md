---
tags: [kindell247, templates]
updated: 2026-11-08
---

# Golden paths and templates

Back to [Home](index.md). How the portal's templates are built, and how to add
one.

<figure style="margin:1.2em 0;display:block;width:100%;max-width:900px"><svg viewBox="0 0 900 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Language templates provide a skeleton and a build workflow; shared blocks provide CI/CD, infrastructure and deployment" style="display:block;width:100%;height:auto;max-width:900px;font-family:var(--font-interface, system-ui, sans-serif);color:var(--text-normal, var(--md-default-fg-color, #222))"><defs><marker id="gp-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity="0.8"/></marker><marker id="gp-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))"/></marker></defs><text x="20" y="30" text-anchor="start" font-size="10.5" font-weight="600" fill-opacity="0.75" style="fill:currentColor">PER LANGUAGE</text><g><rect x="20" y="44" width="190" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="115.0" y="69.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">.NET web service</text><text x="115.0" y="84.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">skeleton + .NET CI</text></g><g><rect x="230" y="44" width="190" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="325.0" y="69.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Bring your own container</text><text x="325.0" y="84.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">starter/ or your repo</text></g><g><rect x="440" y="44" width="190" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05" stroke-dasharray="5 4"/><text x="535.0" y="69.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">next: Python, Node…</text><text x="535.0" y="84.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">skeleton + &lt;lang&gt; CI</text></g><text x="20" y="140" text-anchor="start" font-size="10.5" font-weight="600" fill-opacity="0.75" style="fill:currentColor">SHARED (templates/_shared, .github/)</text><g><rect x="20" y="154" width="160" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="100.0" y="179.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">cicd/repo</text><text x="100.0" y="194.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">ci.yaml caller</text></g><g><rect x="200" y="154" width="190" height="56" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="295.0" y="179.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">container-service.yaml</text><text x="295.0" y="194.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">contract · scan · deploy</text></g><g><rect x="410" y="154" width="140" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="480.0" y="179.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">infra/</text><text x="480.0" y="194.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">values.yaml</text></g><g><rect x="570" y="154" width="140" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="640.0" y="179.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">deploy/</text><text x="640.0" y="194.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">values-&lt;env&gt;.yaml</text></g><g><rect x="730" y="154" width="150" height="56" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="805.0" y="179.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Service Contract</text><text x="805.0" y="194.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">check.sh</text></g><polyline points="115,100 115,152" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#gp-arr)"/><polyline points="325,100 325,128 295,128 295,152" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#gp-arr)"/><polyline points="535,100 535,128 480,128 480,152" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#gp-arr)"/><polyline points="390,182 408,182" fill="none" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.5"/><polyline points="390,200 740,230 805,212" fill="none" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.5" stroke-dasharray="5 4"/></svg><figcaption style="font-size:0.85em;color:var(--text-muted, var(--md-default-fg-color--light, #666));margin-top:0.4em">A template owns only its code. Every stage after it comes from shared building blocks, so a new language is a skeleton plus a build-and-test workflow.</figcaption></figure>

## Create vs Operate

**Create** lists templates that start something new: service templates
(`spec.type: service`), a first deployment (`deployment`) and platform-team
tools (`template`). Day-2 templates (`operation`: scale, resources, database,
help) aren't listed; **Operate** opens them pre-filled. The filter and groups
are in `app-config.yaml` (`sub-page:scaffolder/templates`).

## The Create flow

Every service template runs the same stages, using the shared blocks in
`templates/_shared`:

| Stage | Step | Shared block |
|---|---|---|
| Configure application | the form | |
| Check ownership | `platform:authorize` | |
| Create GitHub repo | `github:repo:create` | |
| CI credentials | `platform:ci-credentials` | |
| Generate code | `fetch:template ./skeleton` | (the template's own) |
| Generate CI/CD | `fetch:template` | `cicd/repo` (`ci.yaml` → `<language>-service.yaml`) |
| Push | `github:repo:push` | |
| Provision infrastructure | `fetch:template` | `infra/` (`values.yaml`) |
| Deploy application | `fetch:template` | `deploy/` (`values-dev.yaml`, tag = the pushed commit) |
| Platform pull request | `publish:github:pull-request` | |
| Register | `catalog:register` | |

Templates find the shared blocks through the `platform.lab/building-blocks`
annotation on the `platform-gitops-repo` catalog resource, never a `../` path.

## Tiers

| Tier | Example | Maintained by |
|---|---|---|
| Golden path | .NET web service | platform team |
| Bring your own container | any language | platform owns CI; the team owns its code |
| Community | contributed with **New golden-path template** | the contributing team, reviewed by the platform team |

## Adding a language

1. **New golden-path template** in the portal (platform team) scaffolds
   `templates/<id>/` and opens a pull request.
2. Write `skeleton/`: a minimal service that keeps the
   [Service Contract](guides/service-contract.md) (health, metrics by route
   template, JSON logs), with tests and a non-root Dockerfile.
3. Add `.github/workflows/<language>-service.yaml`: build and test, then call
   `container-service.yaml` exactly like `dotnet-service.yaml`.
4. In `template.yaml`, copy the steps from `dotnet-service` and change only the
   skeleton values and `language`.
5. Run `check.sh` on the built skeleton, dry-run the template, then
   `make portal-e2e`.

Add a golden path when several teams ask for a language; until then, Bring
your own container covers it.
