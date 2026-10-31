import {
  createFrontendModule,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { Navigate } from 'react-router-dom';

// The portal's front door is Create: send / straight to the templates
const landingPage = PageBlueprint.make({
  name: 'landing',
  params: {
    path: '/',
    loader: async () => <Navigate to="/create" replace />,
  },
});

export const landingModule = createFrontendModule({
  pluginId: 'app',
  extensions: [landingPage],
});
