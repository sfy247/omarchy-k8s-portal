import {
  Sidebar,
  SidebarDivider,
  SidebarItem,
  SidebarSpace,
} from '@backstage/core-components';
import { NavContentBlueprint } from '@backstage/plugin-app-react';
import { SidebarLogo } from './SidebarLogo';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ExploreIcon from '@material-ui/icons/Explore';
import SchoolIcon from '@material-ui/icons/School';
import SearchIcon from '@material-ui/icons/Search';
import { UserSettingsSignInAvatar } from '@backstage/plugin-user-settings';

// The developer experiences: Create, Discover, Learn (Operate comes next),
// plus search across all of them
export const SidebarContent = NavContentBlueprint.make({
  params: {
    component: () => (
      <Sidebar>
        <SidebarLogo />
        <SidebarDivider />
        <SidebarItem icon={AddCircleOutlineIcon} to="/create" text="Create" />
        <SidebarItem icon={ExploreIcon} to="/catalog" text="Discover" />
        <SidebarItem icon={SchoolIcon} to="/docs" text="Learn" />
        <SidebarDivider />
        <SidebarItem icon={SearchIcon} to="/search" text="Search" />
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
