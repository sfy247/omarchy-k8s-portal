// Thin read-only clients for the systems Operate reads. URLs and the Argo CD
// token come from config (operate.*), so nothing lab-specific lives here.
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';

export type ArgoApp = {
  metadata: { name: string; labels?: Record<string, string> };
  spec: {
    destination: { name?: string; server?: string; namespace?: string };
    source?: {
      repoURL: string;
      path?: string;
      helm?: {
        releaseName?: string;
        parameters?: { name: string; value: string }[];
      };
    };
  };
  status?: {
    sync?: { status?: string; revision?: string };
    health?: { status?: string; message?: string; lastTransitionTime?: string };
    operationState?: {
      phase?: string;
      message?: string;
      startedAt?: string;
      finishedAt?: string;
    };
    history?: {
      id: number;
      revision: string;
      deployedAt: string;
      deployStartedAt?: string;
      initiatedBy?: { automated?: boolean; username?: string };
    }[];
    conditions?: { type: string; message: string }[];
    reconciledAt?: string;
  };
};

async function getJson(url: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(
      `${init.method ?? 'GET'} ${url.split('?')[0]}: ${res.status} ${(
        await res.text()
      ).slice(0, 200)}`,
    );
  }
  return res.json();
}

export class ArgoCd {
  constructor(private readonly url: string, private readonly token: string) {}

  static fromConfig(config: Config) {
    return new ArgoCd(
      config.getString('operate.argocd.url'),
      config.getString('operate.argocd.token'),
    );
  }

  private call(path: string, init: RequestInit = {}) {
    return getJson(`${this.url}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /** Applications that deploy an app to an environment (labelled by the ApplicationSets). */
  async listEnvironmentApps(): Promise<ArgoApp[]> {
    const res = await this.call('/api/v1/applications?selector=environment');
    return res.items ?? [];
  }

  getApp(name: string): Promise<ArgoApp> {
    return this.call(`/api/v1/applications/${encodeURIComponent(name)}`);
  }

  async getDeployment(app: string, namespace: string, name: string) {
    const q = new URLSearchParams({
      namespace,
      resourceName: name,
      version: 'v1',
      kind: 'Deployment',
      group: 'apps',
    });
    const res = await this.call(
      `/api/v1/applications/${encodeURIComponent(app)}/resource?${q}`,
    );
    return JSON.parse(res.manifest);
  }

  /** Argo CD's built-in "restart" resource action: a rolling restart, recorded in Argo CD. */
  async restartDeployment(app: string, namespace: string, name: string) {
    await this.call(
      `/api/v1/applications/${encodeURIComponent(app)}/resource/actions/v2`,
      {
        method: 'POST',
        body: JSON.stringify({
          name: app,
          namespace,
          resourceName: name,
          version: 'v1',
          kind: 'Deployment',
          group: 'apps',
          action: 'restart',
        }),
      },
    );
  }
}

export class Prometheus {
  constructor(private readonly url: string) {}

  /** Instant query; returns [labels, value] pairs. */
  async query(
    promql: string,
  ): Promise<{ metric: Record<string, string>; value: number }[]> {
    const res = await getJson(
      `${this.url}/api/v1/query?${new URLSearchParams({ query: promql })}`,
    );
    return res.data.result.map((r: any) => ({
      metric: r.metric,
      value: Number(r.value[1]),
    }));
  }

  async scalar(promql: string): Promise<number | null> {
    const [first] = await this.query(promql);
    return first && Number.isFinite(first.value) ? first.value : null;
  }
}

export class Alertmanager {
  constructor(private readonly url: string) {}

  async active(filters: string[]) {
    const q = new URLSearchParams({
      active: 'true',
      silenced: 'false',
      inhibited: 'false',
    });
    filters.forEach(f => q.append('filter', f));
    return getJson(`${this.url}/api/v2/alerts?${q}`) as Promise<any[]>;
  }
}

export class Loki {
  constructor(
    private readonly url: string,
    private readonly logger: LoggerService,
  ) {}

  /** Newest-first log lines for a LogQL query over the last `sinceSeconds`. */
  async lines(logql: string, sinceSeconds: number, limit: number) {
    const end = BigInt(Date.now()) * 1_000_000n;
    const start = end - BigInt(sinceSeconds) * 1_000_000_000n;
    const q = new URLSearchParams({
      query: logql,
      start: String(start),
      end: String(end),
      limit: String(limit),
      direction: 'backward',
    });
    try {
      const res = await getJson(`${this.url}/loki/api/v1/query_range?${q}`);
      const out: {
        ts: string;
        labels: Record<string, string>;
        line: string;
      }[] = [];
      for (const stream of res.data.result) {
        for (const [ns, line] of stream.values) {
          out.push({
            ts: new Date(Number(BigInt(ns) / 1_000_000n)).toISOString(),
            labels: stream.stream,
            line,
          });
        }
      }
      return out.sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, limit);
    } catch (e) {
      this.logger.warn(`Loki query failed: ${e}`);
      throw e;
    }
  }
}
