import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import catalogGraphPlugin from '@backstage/plugin-catalog-graph/alpha';
import kubernetesPlugin from '@backstage/plugin-kubernetes/alpha';
import orgPlugin from '@backstage/plugin-org/alpha';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import searchPlugin from '@backstage/plugin-search/alpha';
import signalsPlugin from '@backstage/plugin-signals/alpha';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import { navModule } from './modules/nav';
import { landingModule } from './modules/landing';
import { operateModule } from './modules/operate';
import { themeModule } from './modules/theme';
import { ciModule } from './modules/ci';
import { signInModule } from './modules/signIn';

// Exactly what the portal offers, listed explicitly (no auto-discovery):
//   Create    scaffolder (/ redirects here)
//   Discover  catalog, with Kubernetes, CI/CD (GitHub Actions), ownership and graphs
//   Operate   deployments, health and logs of running applications; actions
//   Learn     TechDocs: the platform handbook and every service's docs
//   Search    one search over the catalog and all docs
export default createApp({
  features: [
    scaffolderPlugin,
    catalogPlugin,
    catalogGraphPlugin,
    kubernetesPlugin,
    orgPlugin,
    techdocsPlugin,
    searchPlugin,
    userSettingsPlugin,
    signalsPlugin,
    navModule,
    landingModule,
    operateModule,
    themeModule,
    ciModule,
    signInModule,
  ],
});
