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
        // Without operate.* config (e.g. plain local development) the page
        // explains what's missing instead of the backend failing to start
        if (!config.has('operate.argocd.url')) {
          logger.warn('operate.* is not configured; Operate is disabled');
          httpRouter.use((_req, res) => {
            res.status(503).json({
              error: {
                message:
                  'Operate is not configured on this portal (operate.* in app-config)',
              },
            });
          });
          return;
        }
        httpRouter.use(
          await createRouter({ config, logger, httpAuth, auth, catalog }),
        );
      },
    });
  },
});
