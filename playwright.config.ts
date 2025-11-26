import { defineConfig, devices } from '@playwright/test';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
const UI_BASE_URL = process.env.UI_URL || 'http://localhost:5173';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  
  ['@playwright-mcp/automation/reporters/error-reporter'],
  ['@playwright-mcp/automation/reporters/test-reporter'],],
  use: {
    baseURL: UI_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_BASE_URL,
      },
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: UI_BASE_URL,
      },
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: UI_BASE_URL,
      },
    },
  ],
});
