import { fileURLToPath } from 'node:url';

import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

const webServerAddress = 'http://127.0.0.1:4173';
const baseURL = process.env['CI'] ? webServerAddress : process.env['BASE_URL'] || webServerAddress;

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
  timeout: 30_000,
  expect: { timeout: 5000 },
  reporter: [['list'], ['html', { outputFolder: 'test-output/playwright/report', open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // The Nx e2e target builds and type-checks first. Playwright owns this server.
  webServer: {
    command: 'pnpm exec vite preview --host 127.0.0.1 --port 4173 --strictPort',
    url: webServerAddress,
    reuseExistingServer: false,
    cwd: fileURLToPath(new URL('../web', import.meta.url)),
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
