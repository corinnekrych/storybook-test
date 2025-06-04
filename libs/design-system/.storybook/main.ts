import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../../atoms/src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
    '../../molecules/src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
    '../../organisms/src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
    '../../templates/src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
    '../../pages/src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: 'vite.config.ts',
      },
    },
  },
};

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
