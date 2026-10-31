import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { SignInPage } from '@backstage/core-components';
import { githubAuthApiRef } from '@backstage/core-plugin-api';

const github = {
  id: 'github-auth-provider',
  title: 'GitHub',
  message: 'Sign in with your GitHub account',
  apiRef: githubAuthApiRef,
};

// Replaces the default guest-only sign-in page. The deployed portal offers
// GitHub; local `yarn start` keeps guest so it works without OAuth credentials.
const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => props => (
      <SignInPage
        {...props}
        auto
        providers={
          process.env.NODE_ENV === 'development' ? ['guest', github] : [github]
        }
      />
    ),
  },
});

export const signInModule = createFrontendModule({
  pluginId: 'app',
  extensions: [signInPage],
});
