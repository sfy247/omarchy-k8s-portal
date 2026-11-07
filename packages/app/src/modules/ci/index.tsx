import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

// CI/CD tab on every catalog component that has a GitHub repository
const ciContent = EntityContentBlueprint.make({
  name: 'ci',
  params: {
    path: '/ci',
    title: 'CI/CD',
    group: 'development',
    filter: {
      kind: 'component',
      'metadata.annotations.github.com/project-slug': { $exists: true },
    },
    loader: () => import('./CiTab').then(m => <m.CiTab />),
  },
});

export const ciModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [ciContent],
});
