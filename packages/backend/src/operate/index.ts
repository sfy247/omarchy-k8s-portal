import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { createRouter } from './router';

/** Operate: deployments, health and logs of running applications (/api/operate). */
export default createBackendPlugin({
  pluginId: 'operate',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        httpAuth: coreServices.httpAuth,
        auth: coreServices.auth,
        httpRouter: coreServices.httpRouter,
        catalog: catalogServiceRef,
      },
      async init({ config, logger, httpAuth, auth, httpRouter, catalog }) {
        httpRouter.use(
          await createRouter({ config, logger, httpAuth, auth, catalog }),
        );
      },
    });
  },
});
