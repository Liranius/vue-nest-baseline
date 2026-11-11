import type { PlaywrightTestConfig } from '@playwright/test';
import { afterEach, expect, it, vi } from 'vitest';

const preview = 'http://127.0.0.1:4173';
const override = 'http://127.0.0.1:4999';

afterEach(() => {
  vi.unstubAllEnvs();
});

it.each([
  { mode: 'CI with BASE_URL', ci: 'true', baseURL: override, expected: preview },
  { mode: 'local with BASE_URL', ci: undefined, baseURL: override, expected: override },
  { mode: 'local by default', ci: undefined, baseURL: undefined, expected: preview },
])('selects the browser and preview addresses for $mode', async ({ ci, baseURL, expected }) => {
  vi.stubEnv('CI', ci);
  vi.stubEnv('BASE_URL', baseURL);
  vi.resetModules();
  const { default: config } = await vi.importActual<{ default: PlaywrightTestConfig }>(
    '../apps/web-e2e/playwright.config.mts',
  );

  expect(config.use?.baseURL).toBe(expected);
  expect(config.webServer).toMatchObject({ url: preview });
});
