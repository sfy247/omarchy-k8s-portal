import {
  useApi,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { useCallback } from 'react';

export type EnvSummary = {
  environment: string;
  argoApp: string;
  sync?: string;
  health?: string;
  revision?: string;
  deployedAt?: string;
};
export type AppSummary = {
  entityRef: string;
  title: string;
  description?: string;
  owner?: string;
  group: string;
  environments: EnvSummary[];
};
export type AppDetail = {
  entityRef?: string;
  title: string;
  target: {
    argoApp: string;
    environment: string;
    group: string;
    name: string;
    cluster: string;
    namespace: string;
    hostname?: string;
  };
  links: Record<
    'app' | 'argocd' | 'serviceHealth' | 'logs' | 'pods' | 'catalog',
    string | undefined
  >;
  deployment: {
    sync?: string;
    revision?: string;
    revisionUrl?: string;
    image?: string;
    replicas?: number;
    readyReplicas: number;
    lastOperation?: { phase?: string; message?: string; finishedAt?: string };
    conditions: { type: string; message: string }[];
    history: {
      id: number;
      revision: string;
      revisionUrl?: string;
      deployedAt: string;
      by: string;
    }[];
  };
  health: {
    status?: string;
    message?: string;
    since?: string;
    pods: {
      pod: string;
      ready: boolean;
      restarts: number;
      waiting?: string;
      lastTermination?: string;
    }[];
    signals: {
      requestsPerSecond: number | null;
      errorRatio: number | null;
      p95Seconds: number | null;
    };
    alerts: {
      name: string;
      severity?: string;
      summary?: string;
      since: string;
      dashboard?: string;
    }[];
    events: {
      ts: string;
      type?: string;
      reason?: string;
      object?: string;
      message?: string;
    }[];
  };
};
export type LogLine = { ts: string; level: string; pod?: string; line: string };

/** Calls the portal's /api/operate backend. */
export function useOperateApi() {
  const discovery = useApi(discoveryApiRef);
  const { fetch } = useApi(fetchApiRef);
  return useCallback(
    async <T>(path: string, init?: RequestInit): Promise<T> => {
      const base = await discovery.getBaseUrl('operate');
      const res = await fetch(`${base}${path}`, init);
      if (!res.ok)
        throw new Error(`${res.status}: ${(await res.text()).slice(0, 300)}`);
      return res.json();
    },
    [discovery, fetch],
  );
}
