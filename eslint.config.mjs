import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import pluginVitest from '@vitest/eslint-plugin';
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import skipFormatting from 'eslint-config-prettier/flat';
import pluginOxlint from 'eslint-plugin-oxlint';
import pluginPlaywright from 'eslint-plugin-playwright';
import pluginVue from 'eslint-plugin-vue';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';

const unitTests = [
  'apps/web/src/**/*.{test,spec}.{js,ts,jsx,tsx}',
  'apps/web/src/**/__tests__/**/*.{js,ts,jsx,tsx}',
  'apps/web/tests/**/*.{js,ts,jsx,tsx}',
];

export default withVueTs(
  { rootDir: import.meta.dirname },
  globalIgnores([
    '**/dist/**',
    '**/out-tsc/**',
    '**/coverage/**',
    '**/test-output/**',
    '**/playwright-report/**',
    '**/test-results/**',
    '.nx/**',
  ]),
  {
    files: ['**/*.{vue,ts,mts,cts,tsx,js,mjs,cjs,jsx}'],
    extends: [js.configs.recommended],
  },
  {
    files: ['apps/web/src/**/*.{vue,ts,tsx,js,jsx}'],
    ignores: unitTests,
    languageOptions: { globals: globals.browser },
  },
  {
    files: [
      '*.config.{js,mjs,cjs,ts,mts,cts}',
      'apps/*/*.config.{js,mjs,cjs,ts,mts,cts}',
      'apps/web-e2e/**/*.{js,mjs,cjs,ts,mts,cts}',
    ],
    languageOptions: { globals: globals.node },
  },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,mts,cts,tsx,vue}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        // The root Vitest workspace config is outside the app TS projects.
        projectService: { allowDefaultProject: ['vitest.config.mts'] },
      },
    },
  },
  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['apps/web-e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
  {
    ...pluginVitest.configs.recommended,
    files: unitTests,
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  { linterOptions: { reportUnusedDisableDirectives: 'error' } },
  ...(await pluginOxlint.buildFromConfigFile(
    fileURLToPath(new URL('./.oxlintrc.json', import.meta.url)),
  )),
  skipFormatting,
);
