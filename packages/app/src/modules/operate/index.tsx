import {
  createFrontendModule,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';

// Operate: the running side of every application (backend: /api/operate)
const operatePage = PageBlueprint.make({
  name: 'operate',
  params: {
    path: '/operate',
    loader: () => import('./OperatePage').then(m => <m.OperatePage />),
  },
});

export const operateModule = createFrontendModule({
  pluginId: 'app',
  extensions: [operatePage],
});
