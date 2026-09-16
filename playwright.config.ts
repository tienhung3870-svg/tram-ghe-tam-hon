import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: '**/._*',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  outputDir: '/tmp/pw-results-' + Date.now(),
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile_360',
      use: { viewport: { width: 360, height: 740 } },
    },
    {
      name: 'mobile_390',
      use: { viewport: { width: 390, height: 844 } },
    },
    {
      name: 'tablet_768',
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'desktop_1440',
      use: { viewport: { width: 1440, height: 900 } },
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
