import { join } from 'node:path';

import { NxAppWebpackPlugin } from '@nx/webpack/app-plugin';

const config = {
  output: {
    path: join(import.meta.dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMap: true,
    }),
  ],
};

// Webpack imports the default export. Nx reads the same object with require().
export { config as default, config as 'module.exports' };
