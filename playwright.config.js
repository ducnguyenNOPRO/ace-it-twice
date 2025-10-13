// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  projects: [
    // 🧩 1️⃣ Setup project — creates storageState.json
    {
      name: 'setup',
      testMatch: /.*login-setup\.spec\.js/,
      use: {
        baseURL: 'http://localhost:5173',
        headless: false,
      },
    },

    // 🧪 2️⃣ Main test projects (reuse the session)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
        storageState: './storageState.json', // ✅ only after setup runs
        headless: false,
      },
      // dependencies: ['setup'],
      testMatch: /.*\.spec\.js/,
    },

    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     baseURL: 'http://localhost:5173',
    //     storageState: './storageState.json',
    //     headless: false,
    //   },
    //   dependencies: ['setup'],
    //   testMatch: /.*\.spec\.js/,
    // },

    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     baseURL: 'http://localhost:5173',
    //     storageState: './storageState.json',
    //     headless: false,
    //   },
    //   dependencies: ['setup'],
    //   testMatch: /.*\.spec\.js/,
    // },
  ],
});
