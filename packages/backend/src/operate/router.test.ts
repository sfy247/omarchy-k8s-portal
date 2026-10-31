import { targetOf } from './router';
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
