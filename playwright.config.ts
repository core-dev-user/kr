import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:8090',
    viewport: { width: 390, height: 844 },
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
      args: ['--no-sandbox'],
    },
  },
  webServer: {
    command: 'python3 -m http.server 8090 --bind 127.0.0.1 --directory apps/mobile/dist',
    url: 'http://127.0.0.1:8090',
    reuseExistingServer: !process.env.CI,
  },
});
