import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'source',
          environment: 'node',
          include: ['tests/**/*.test.ts'],
        },
      },
      'apps/*/vite.config.{mjs,js,ts,mts}',
      'apps/*/vitest.config.{mjs,js,ts,mts}',
    ],
  },
});
