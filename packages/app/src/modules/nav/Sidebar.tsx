import {
  Sidebar,
  SidebarDivider,
  SidebarItem,
  SidebarSpace,
} from '@backstage/core-components';
import { NavContentBlueprint } from '@backstage/plugin-app-react';
import { SidebarLogo } from './SidebarLogo';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import AppsIcon from '@material-ui/icons/Apps';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import { UserSettingsSignInAvatar } from '@backstage/plugin-user-settings';

// A short, task-focused sidebar: create something, find your services, read
// docs. Other pages are disabled in app-config.yaml.
export const SidebarContent = NavContentBlueprint.make({
  params: {
    component: () => (
      <Sidebar>
        <SidebarLogo />
        <SidebarDivider />
        <SidebarItem icon={AddCircleOutlineIcon} to="/" text="Create" />
        <SidebarItem icon={AppsIcon} to="/catalog" text="My services" />
        <SidebarItem icon={LibraryBooksIcon} to="/docs" text="Docs" />
        <SidebarSpace />
        <SidebarDivider />
        <SidebarItem
          icon={() => <UserSettingsSignInAvatar />}
          to="/settings"
          text="Settings"
        />
      </Sidebar>
    ),
  },
});
