import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { ThemeBlueprint } from '@backstage/plugin-app-react';
import { UnifiedThemeProvider } from '@backstage/theme';
import DarkIcon from '@material-ui/icons/Brightness2';
import { kindellTheme } from './theme';
import './theme.css';

// Replaces the built-in dark theme; the light one is disabled in app-config,
// so everyone gets this look
const darkTheme = ThemeBlueprint.make({
  name: 'dark',
  params: {
    theme: {
      id: 'dark',
      title: 'Dark',
      variant: 'dark',
      icon: <DarkIcon />,
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={kindellTheme} children={children} />
      ),
    },
  },
});

export const themeModule = createFrontendModule({
  pluginId: 'app',
  extensions: [darkTheme],
});
