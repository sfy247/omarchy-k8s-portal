// The portal's look: near-black surfaces, gold accents, dark-to-amber page
// banners. One dark theme for every page (Material UI parts here, Backstage
// UI parts in theme.css).
import { createUnifiedTheme, palettes, PageTheme } from '@backstage/theme';

export const gold = {
  main: '#d4943a',
  light: '#e8b45f',
  dark: '#9c6a24',
  glow: 'rgba(212, 148, 58, 0.18)',
};

const ink = {
  app: '#0b0b0c',
  surface: '#141416',
  raised: '#1b1b1e',
  border: '#2a2a2e',
};

// Banner behind every page header: dark on the left (where the title is),
// warming to amber on the right, with a soft light arc
const banner: PageTheme = {
  colors: [ink.app, gold.dark],
  shape: 'none',
  backgroundImage: [
    'radial-gradient(ellipse at 85% 120%, rgba(232, 180, 95, 0.35) 0%, transparent 55%)',
    `linear-gradient(110deg, ${ink.app} 0%, #17110a 45%, #3a260d 75%, ${gold.dark} 100%)`,
  ].join(', '),
  fontColor: '#ffffff',
};

export const kindellTheme = createUnifiedTheme({
  palette: {
    ...palettes.dark,
    type: 'dark',
    mode: 'dark',
    primary: { main: gold.main, light: gold.light, dark: gold.dark },
    secondary: { main: gold.light },
    background: { default: ink.app, paper: ink.surface },
    border: ink.border,
    link: gold.light,
    linkHover: '#f3c983',
    navigation: {
      background: '#0d0d0f',
      indicator: gold.main,
      color: '#c9c9cc',
      selectedColor: '#ffffff',
      navItem: { hoverBackground: 'rgba(212, 148, 58, 0.12)' },
      submenu: { background: ink.raised },
    },
    tabbar: { indicator: gold.main },
    bursts: {
      fontColor: '#ffffff',
      slackChannelText: '#ddd',
      backgroundColor: { default: ink.app },
      gradient: { linear: banner.backgroundImage },
    },
    textSubtle: '#a8a8ad',
    textContrast: '#ffffff',
  },
  defaultPageTheme: 'home',
  pageTheme: {
    home: banner,
    tool: banner,
    documentation: banner,
    service: banner,
    website: banner,
    library: banner,
    other: banner,
    app: banner,
    apis: banner,
  },
  components: {
    BackstageHeader: {
      styleOverrides: {
        header: {
          borderBottom: `2px solid ${gold.main}`,
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.6)',
        },
        title: { fontWeight: 800, letterSpacing: '0.01em' },
        subtitle: { color: gold.light },
      },
    },
    BackstageSidebarItem: {
      styleOverrides: {
        selected: {
          // A filled gold pill instead of only the left indicator
          background: `linear-gradient(90deg, rgba(212, 148, 58, 0.55), rgba(156, 106, 36, 0.35)) !important`,
          borderRadius: 8,
          margin: '0 8px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${ink.border}`,
          borderRadius: 10,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 10 } } },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          color: '#141006',
          backgroundImage: `linear-gradient(180deg, ${gold.light}, ${gold.main})`,
        },
      },
    },
  } as any,
});
