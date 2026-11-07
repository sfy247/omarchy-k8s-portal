import { databaseTargetOf, targetOf } from './router';
import { ArgoApp } from './clients';

const app = (
  labels: Record<string, string>,
  releaseName?: string,
): ArgoApp => ({
  metadata: { name: 'hello-world-python-dev', labels },
  spec: {
    destination: { name: 'dev', namespace: 'hello-world' },
    source: {
      repoURL: 'https://github.com/example/platform.git',
      helm: {
        releaseName,
        parameters: [{ name: 'route.hostname', value: 'python.dev.example' }],
      },
    },
  },
});

describe('targetOf', () => {
  it('maps an environment app to its cluster, namespace and app label', () => {
    expect(
      targetOf(
        app(
          { environment: 'dev', 'app.kubernetes.io/part-of': 'hello-world' },
          'python',
        ),
      ),
    ).toEqual({
      kind: 'service',
      argoApp: 'hello-world-python-dev',
      environment: 'dev',
      group: 'hello-world',
      name: 'python',
      cluster: 'dev',
      namespace: 'hello-world',
      hostname: 'python.dev.example',
    });
  });

  it('ignores platform apps (no environment or release)', () => {
    expect(
      targetOf(app({ 'app.kubernetes.io/part-of': 'cluster-addons' }, 'x')),
    ).toBeUndefined();
    expect(
      targetOf(
        app({ environment: 'dev', 'app.kubernetes.io/part-of': 'app-data' }),
      ),
    ).toBeUndefined();
  });
});

describe('databaseTargetOf', () => {
  it('maps a database resource to its CloudNativePG cluster', () => {
    const pgApp = {
      metadata: {
        name: 'postgres-dev',
        labels: { environment: 'dev', 'app.kubernetes.io/part-of': 'app-data' },
      },
      spec: {
        destination: { name: 'dev', namespace: 'postgres' },
        source: { repoURL: 'x' },
      },
    } as ArgoApp;
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Resource',
      metadata: {
        name: 'postgres-dev',
        annotations: {
          'backstage.io/kubernetes-label-selector': 'cnpg.io/cluster=postgres',
        },
      },
      spec: { type: 'database' },
    };
    expect(databaseTargetOf(pgApp, entity)).toMatchObject({
      kind: 'database',
      name: 'postgres',
      cluster: 'dev',
      namespace: 'postgres',
      group: 'app-data',
    });
  });
});
