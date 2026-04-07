import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const backendDir = path.resolve(__dirname, '../booking-backend');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  globalTimeout: 15 * 60 * 1000,
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run prisma:deploy && npm run prisma:seed && npm run start:dev',
      cwd: backendDir,
      url: 'http://127.0.0.1:3001/v1/health',
      reuseExistingServer: !process.env.CI,
      timeout: 3 * 60 * 1000,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        PORT: '3001',
        FRONTEND_URL: 'http://127.0.0.1:3000',
        FRONTEND_URLS: 'http://127.0.0.1:3000,http://localhost:3000',
      },
    },
    {
      command: 'npm run dev -- --hostname 127.0.0.1 --port 3000',
      cwd: __dirname,
      url: 'http://127.0.0.1:3000/login',
      reuseExistingServer: !process.env.CI,
      timeout: 3 * 60 * 1000,
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL: 'http://127.0.0.1:3001/v1',
      },
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
