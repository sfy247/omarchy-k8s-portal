import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import catalogGraphPlugin from '@backstage/plugin-catalog-graph/alpha';
import kubernetesPlugin from '@backstage/plugin-kubernetes/alpha';
import orgPlugin from '@backstage/plugin-org/alpha';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import signalsPlugin from '@backstage/plugin-signals/alpha';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import { navModule } from './modules/nav';
import { landingModule } from './modules/landing';

// Exactly what the portal offers, listed explicitly (no auto-discovery):
//   Create       scaffolder (/ redirects here)
//   My services  catalog, with Kubernetes, ownership and relation graphs
//   Docs         TechDocs
export default createApp({
  features: [
    scaffolderPlugin,
    catalogPlugin,
    catalogGraphPlugin,
    kubernetesPlugin,
    orgPlugin,
    techdocsPlugin,
    userSettingsPlugin,
    signalsPlugin,
    navModule,
    landingModule,
  ],
});
