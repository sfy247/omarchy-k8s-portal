// Operate API: one place that joins what the platform knows about a running
// application. Read-only, except a rolling restart through Argo CD.
//
//   GET  /applications                      every catalog service x environment
//   GET  /applications/:app                 deployments, health, signals, alerts, events
//   GET  /applications/:app/logs            recent logs (level and text filters)
//   POST /applications/:app/restart         rolling restart (Argo CD resource action)
//
// :app is the Argo CD application (<group>-<name>-<env>), which also scopes
// every query: callers can't point it at arbitrary namespaces or clusters.
import Router from 'express-promise-router';
import express from 'express';
import { Config } from '@backstage/config';
import {
  HttpAuthService,
  LoggerService,
  AuthService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { NotFoundError, InputError, NotAllowedError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { operateRestartPermission } from './permissions';
import { Alertmanager, ArgoApp, ArgoCd, Loki, Prometheus } from './clients';

const SELECTOR = 'backstage.io/kubernetes-label-selector';
const NAME_LABEL = 'app.kubernetes.io/name=';

type Target = {
  argoApp: string;
  environment: string;
  group: string;
  name: string; // release / app label
  cluster: string;
  namespace: string;
  hostname?: string;
};

export function targetOf(app: ArgoApp): Target | undefined {
  const name = app.spec.source?.helm?.releaseName;
  const environment = app.metadata.labels?.environment;
  const group = app.metadata.labels?.['app.kubernetes.io/part-of'];
  if (!name || !environment || !group) return undefined;
  return {
    argoApp: app.metadata.name,
    environment,
    group,
    name,
    cluster: app.spec.destination.name ?? environment,
    namespace: app.spec.destination.namespace ?? group,
    hostname: app.spec.source?.helm?.parameters?.find(
      p => p.name === 'route.hostname',
    )?.value,
  };
}

// Label values come from Argo CD, but quote them defensively anyway
const q = (v: string) => JSON.stringify(v);

export async function createRouter(options: {
  config: Config;
  logger: LoggerService;
  httpAuth: HttpAuthService;
  auth: AuthService;
  catalog: CatalogService;
  permissions: PermissionsService;
}) {
  const { config, logger, httpAuth, auth, catalog, permissions } = options;
  const argo = ArgoCd.fromConfig(config);
  const prom = new Prometheus(config.getString('operate.prometheus.url'));
  const am = new Alertmanager(config.getString('operate.alertmanager.url'));
  const loki = new Loki(config.getString('operate.loki.url'), logger);
  const argoPublic = config.getOptionalString('operate.argocd.publicUrl');
  const grafana = config.getOptionalString('operate.grafana.publicUrl');

  const router = Router();
  router.use(express.json());

  async function services(): Promise<Entity[]> {
    const { items } = await catalog.getEntities(
      { filter: { kind: 'Component', 'spec.type': 'service' } },
      { credentials: await auth.getOwnServiceCredentials() },
    );
    return items;
  }

  const entityFor = (t: Target, entities: Entity[]) =>
    entities.find(
      e =>
        e.spec?.system === t.group &&
        e.metadata.annotations?.[SELECTOR] === `${NAME_LABEL}${t.name}`,
    );

  async function resolve(argoApp: string) {
    const app = await argo.getApp(argoApp).catch(() => undefined);
    const t = app && targetOf(app);
    if (!app || !t)
      throw new NotFoundError(`No application environment ${argoApp}`);
    return { app, t };
  }

  function links(t: Target, entity?: Entity) {
    const v = new URLSearchParams({
      'var-cluster': t.cluster,
      'var-namespace': t.namespace,
      'var-app': t.name,
    });
    return {
      app: t.hostname ? `https://${t.hostname}` : undefined,
      argocd: argoPublic
        ? `${argoPublic}/applications/argocd/${t.argoApp}`
        : undefined,
      serviceHealth: grafana ? `${grafana}/d/service-health?${v}` : undefined,
      logs: grafana ? `${grafana}/d/logs-explorer?${v}` : undefined,
      pods: grafana ? `${grafana}/d/pod-troubleshooting?${v}` : undefined,
      catalog: entity
        ? `/catalog/${entity.metadata.namespace ?? 'default'}/component/${
            entity.metadata.name
          }`
        : undefined,
    };
  }

  router.get('/applications', async (req, res) => {
    await httpAuth.credentials(req, { allow: ['user'] });
    const [apps, entities] = await Promise.all([
      argo.listEnvironmentApps(),
      services(),
    ]);
    const byEntity = new Map<string, any>();
    for (const app of apps) {
      const t = targetOf(app);
      const entity = t && entityFor(t, entities);
      if (!t || !entity) continue;
      const ref = stringifyEntityRef(entity);
      const row = byEntity.get(ref) ?? {
        entityRef: ref,
        title: entity.metadata.title ?? entity.metadata.name,
        description: entity.metadata.description,
        owner: entity.spec?.owner,
        group: t.group,
        environments: [],
      };
      row.environments.push({
        environment: t.environment,
        argoApp: t.argoApp,
        sync: app.status?.sync?.status,
        health: app.status?.health?.status,
        revision: app.status?.sync?.revision,
        deployedAt: app.status?.history?.at(-1)?.deployedAt,
      });
      byEntity.set(ref, row);
    }
    res.json({
      items: [...byEntity.values()].sort((a, b) =>
        a.title.localeCompare(b.title),
      ),
    });
  });

  router.get('/applications/:app', async (req, res) => {
    await httpAuth.credentials(req, { allow: ['user'] });
    const { app, t } = await resolve(req.params.app);
    const entity = entityFor(t, await services());
    const sel = `cluster=${q(t.cluster)}, namespace=${q(t.namespace)}`;
    const pods = `${sel}, pod=~${q(`${t.name}-[a-z0-9]+-[a-z0-9]+`)}`;
    const http = `${sel}, app=${q(t.name)}`;
    const repo = app.spec.source?.repoURL.replace(/\.git$/, '');

    const [
      deployment,
      ready,
      restarts,
      waiting,
      terminated,
      rps,
      errRatio,
      p95,
      alerts,
      events,
    ] = await Promise.all([
      argo.getDeployment(t.argoApp, t.namespace, t.name).catch(() => undefined),
      prom.query(
        `max by (pod) (kube_pod_status_ready{${pods}, condition="true"})`,
      ),
      prom.query(
        `sum by (pod) (kube_pod_container_status_restarts_total{${pods}})`,
      ),
      prom.query(
        `max by (pod, reason) (kube_pod_container_status_waiting_reason{${pods}}) > 0`,
      ),
      prom.query(
        `max by (pod, reason) (kube_pod_container_status_last_terminated_reason{${pods}}) > 0`,
      ),
      prom.scalar(`sum(rate(http_requests_total{${http}}[5m]))`),
      prom.scalar(
        `sum(rate(http_requests_total{${http}, status=~"5.."}[5m])) / sum(rate(http_requests_total{${http}}[5m]))`,
      ),
      prom.scalar(
        `histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket{${http}}[5m])))`,
      ),
      am
        .active([`cluster=${q(t.cluster)}`])
        .then(list =>
          list.filter(
            a =>
              a.labels.app === t.name ||
              (a.labels.namespace === t.namespace &&
                (a.labels.pod ?? a.labels.deployment ?? '').startsWith(t.name)),
          ),
        ),
      loki
        .lines(
          `{${sel}, job="integrations/kubernetes/eventhandler"} |= ${q(
            `"name":"${t.name}`,
          )}`,
          6 * 3600,
          30,
        )
        .catch(() => []),
    ]);

    const podNames = new Set([...ready, ...restarts].map(r => r.metric.pod));
    const podRows = [...podNames].sort().map(pod => ({
      pod,
      ready: ready.find(r => r.metric.pod === pod)?.value === 1,
      restarts: restarts.find(r => r.metric.pod === pod)?.value ?? 0,
      waiting: waiting.find(r => r.metric.pod === pod)?.metric.reason,
      lastTermination: terminated.find(r => r.metric.pod === pod)?.metric
        .reason,
    }));

    res.json({
      entityRef: entity ? stringifyEntityRef(entity) : undefined,
      title: entity?.metadata.title ?? t.name,
      target: t,
      links: links(t, entity),
      deployment: {
        sync: app.status?.sync?.status,
        revision: app.status?.sync?.revision,
        revisionUrl:
          repo && app.status?.sync?.revision
            ? `${repo}/commit/${app.status.sync.revision}`
            : undefined,
        image: deployment?.spec?.template?.spec?.containers?.[0]?.image,
        replicas: deployment?.spec?.replicas,
        readyReplicas: deployment?.status?.readyReplicas ?? 0,
        lastOperation: app.status?.operationState,
        conditions: app.status?.conditions ?? [],
        history: [...(app.status?.history ?? [])].reverse().map(h => ({
          id: h.id,
          revision: h.revision,
          revisionUrl: repo ? `${repo}/commit/${h.revision}` : undefined,
          deployedAt: h.deployedAt,
          by: h.initiatedBy?.automated
            ? 'Argo CD (automated)'
            : h.initiatedBy?.username ?? 'unknown',
        })),
      },
      health: {
        status: app.status?.health?.status,
        message: app.status?.health?.message,
        since: app.status?.health?.lastTransitionTime,
        pods: podRows,
        signals: {
          requestsPerSecond: rps,
          errorRatio: errRatio,
          p95Seconds: p95,
        },
        alerts: alerts.map(a => ({
          name: a.labels.alertname,
          severity: a.labels.severity,
          summary: a.annotations?.summary ?? a.annotations?.description,
          since: a.startsAt,
          dashboard: a.annotations?.dashboard_url,
        })),
        events: events.map(e => {
          try {
            const j = JSON.parse(e.line);
            return {
              ts: e.ts,
              type: j.type,
              reason: j.reason,
              object: `${j.kind}/${j.name}`,
              message: j.msg,
            };
          } catch {
            return { ts: e.ts, message: e.line };
          }
        }),
      },
    });
  });

  router.get('/applications/:app/logs', async (req, res) => {
    await httpAuth.credentials(req, { allow: ['user'] });
    const { t } = await resolve(req.params.app);
    const level = String(req.query.level ?? 'all');
    if (!['all', 'error', 'warn', 'info', 'debug'].includes(level))
      throw new InputError('bad level');
    const since = Math.min(Number(req.query.since ?? 3600), 7 * 24 * 3600);
    const text = String(req.query.q ?? '');
    let logql = `{cluster=${q(t.cluster)}, namespace=${q(t.namespace)}, app=${q(
      t.name,
    )}`;
    const levels: Record<string, string> = {
      all: '}',
      warn: ', level=~"warn|error"}',
    };
    logql += levels[level] ?? `, level=${q(level)}}`;
    if (text)
      logql += ` |~ ${q(`(?i)${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)}`;
    const lines = await loki.lines(logql, since, 200);
    res.json({
      query: logql,
      items: lines.map(l => ({
        ts: l.ts,
        level: l.labels.level ?? 'unknown',
        pod: l.labels.pod,
        line: l.line,
      })),
    });
  });

  router.post('/applications/:app/restart', async (req, res) => {
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const { t } = await resolve(req.params.app);
    // Only the service's owners (or the platform team): see the permission policy
    const entity = entityFor(t, await services());
    if (!entity)
      throw new NotFoundError(`${t.argoApp} isn't a catalog service`);
    const [decision] = await permissions.authorize(
      [
        {
          permission: operateRestartPermission,
          resourceRef: stringifyEntityRef(entity),
        },
      ],
      { credentials },
    );
    if (decision.result !== AuthorizeResult.ALLOW) {
      throw new NotAllowedError(
        `Only the owners of ${entity.metadata.name} can restart it`,
      );
    }
    await argo.restartDeployment(t.argoApp, t.namespace, t.name);
    logger.info(
      `Restart of ${t.argoApp} requested by ${credentials.principal.userEntityRef}`,
    );
    res.json({ ok: true });
  });

  return router;
}
