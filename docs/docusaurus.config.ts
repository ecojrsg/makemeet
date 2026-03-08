import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const repository = process.env.GITHUB_REPOSITORY ?? 'unknown/makemeet';
const [organizationName = 'unknown', projectName = 'makemeet'] = repository.split('/');
const githubUrl = `https://github.com/${repository}`;

const config: Config = {
  title: 'MakeMeEt Docs',
  tagline: 'Guí­as de implementación y manual de usuario',
  url: process.env.DOCS_SITE_URL ?? `https://${organizationName}.github.io`,
  baseUrl: '/makemeet/',
  organizationName,
  projectName,
  trailingSlash: false,
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },
  presets: [
    [
      'classic',
      {
        docs: false,
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'implementacion',
        path: 'docs-implementacion',
        routeBasePath: 'implementacion',
        sidebarPath: './sidebarsImplementacion.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'manual',
        path: 'docs-manual',
        routeBasePath: 'manual',
        sidebarPath: './sidebarsManual.ts',
      },
    ],
  ],
  themeConfig: {
    navbar: {
      title: 'MakeMeEt',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'implementacionSidebar',
          docsPluginId: 'implementacion',
          label: 'Implementación',
          position: 'left',
        },
        {
          type: 'docSidebar',
          sidebarId: 'manualSidebar',
          docsPluginId: 'manual',
          label: 'Manual de usuario',
          position: 'left',
        },
        {
          href: githubUrl,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentación',
          items: [
            {
              label: 'Implementación',
              to: '/implementacion/intro',
            },
            {
              label: 'Manual de usuario',
              to: '/manual/intro',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} MakeMeEt.`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;